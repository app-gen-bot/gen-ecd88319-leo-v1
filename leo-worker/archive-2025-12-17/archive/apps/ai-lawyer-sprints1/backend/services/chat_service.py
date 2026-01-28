"""
Chat service for AI-powered legal assistance
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI
import json

from config import settings
from models.chat import ChatMessage, Citation, ChatConversation
from db.operations import DynamoDBOperations


class ChatService:
    """Service for handling chat operations"""
    
    def __init__(self):
        self.db = DynamoDBOperations()
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def send_message(
        self, 
        user_id: str, 
        message: str, 
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a chat message and return AI response"""
        
        # Create or get conversation
        if not conversation_id:
            conversation_id = f"CONV#{datetime.utcnow().timestamp()}"
            conversation = {
                'PK': f'USER#{user_id}',
                'SK': conversation_id,
                'id': conversation_id,
                'user_id': user_id,
                'title': message[:50] + ('...' if len(message) > 50 else ''),
                'message_count': 0,
                'entity_type': 'conversation'
            }
            self.db.put_item(conversation)
        
        # Save user message
        user_message_id = f"MSG#{datetime.utcnow().timestamp()}_user"
        user_msg = {
            'PK': conversation_id,
            'SK': user_message_id,
            'id': user_message_id,
            'conversation_id': conversation_id,
            'user_id': user_id,
            'role': 'user',
            'content': message,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'entity_type': 'message'
        }
        self.db.put_item(user_msg)
        
        # Get conversation history for context
        messages = self._get_conversation_messages(conversation_id)
        
        # Generate AI response
        ai_response, citations = await self._generate_ai_response(message, messages)
        
        # Save AI message
        ai_message_id = f"MSG#{datetime.utcnow().timestamp()}_assistant"
        ai_msg = {
            'PK': conversation_id,
            'SK': ai_message_id,
            'id': ai_message_id,
            'conversation_id': conversation_id,
            'user_id': 'system',
            'role': 'assistant',
            'content': ai_response,
            'citations': [c.dict() for c in citations] if citations else None,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'entity_type': 'message'
        }
        self.db.put_item(ai_msg)
        
        # Update conversation
        self.db.update_item(
            f'USER#{user_id}',
            conversation_id,
            {
                'last_message': message,
                'message_count': len(messages) + 2
            }
        )
        
        return {
            'conversation_id': conversation_id,
            'message': ChatMessage(
                id=ai_message_id,
                conversation_id=conversation_id,
                user_id='system',
                role='assistant',
                content=ai_response,
                citations=citations,
                timestamp=datetime.utcnow()
            ),
            'citations': citations
        }
    
    def _get_conversation_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get all messages in a conversation"""
        return self.db.query_items(conversation_id, 'MSG#')
    
    async def _generate_ai_response(
        self, 
        message: str, 
        history: List[Dict[str, Any]]
    ) -> tuple[str, List[Citation]]:
        """Generate AI response using OpenAI"""
        
        # Build conversation history for context
        messages = [
            {
                "role": "system",
                "content": """You are an AI legal assistant specializing in California tenant law. 
                You provide accurate, helpful information based on California Civil Code, particularly sections 1940-1954.1.
                
                Important guidelines:
                1. Always cite specific laws when applicable
                2. Provide clear, plain English explanations
                3. Include practical examples when helpful
                4. Always remind users that this is legal information, not legal advice
                5. Suggest consulting with an attorney for specific legal matters
                
                When providing citations, format them as JSON in your response like:
                [CITATION: {"law_code": "California Civil Code", "section": "§ 1950.5", "title": "Security Deposits"}]
                """
            }
        ]
        
        # Add conversation history
        for msg in history[-10:]:  # Last 10 messages for context
            messages.append({
                "role": msg.get('role', 'user'),
                "content": msg.get('content', '')
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                temperature=settings.openai_temperature,
                max_tokens=settings.openai_max_tokens
            )
            
            ai_content = response.choices[0].message.content
            
            # Extract citations from response
            citations = self._extract_citations(ai_content)
            
            # Remove citation markers from content
            clean_content = ai_content
            for citation in citations:
                citation_text = f"[CITATION: {json.dumps(citation.dict())}]"
                clean_content = clean_content.replace(citation_text, '')
            
            return clean_content.strip(), citations
            
        except Exception as e:
            print(f"Error generating AI response: {e}")
            # Fallback response
            return (
                "I apologize, but I'm having trouble processing your request right now. "
                "Please try again in a moment. If you need immediate assistance, "
                "consider contacting a local tenant rights organization or attorney.",
                []
            )
    
    def _extract_citations(self, content: str) -> List[Citation]:
        """Extract citations from AI response"""
        citations = []
        
        # Look for citation markers in the content
        import re
        citation_pattern = r'\[CITATION: ({[^}]+})\]'
        matches = re.findall(citation_pattern, content)
        
        for match in matches:
            try:
                citation_data = json.loads(match)
                citations.append(Citation(**citation_data))
            except:
                continue
        
        return citations
    
    def get_user_conversations(
        self, 
        user_id: str, 
        limit: int = 20
    ) -> List[ChatConversation]:
        """Get user's conversations"""
        items = self.db.query_items(f'USER#{user_id}', 'CONV#', limit=limit)
        
        conversations = []
        for item in items:
            conversations.append(ChatConversation(
                id=item['id'],
                user_id=item['user_id'],
                title=item['title'],
                created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00')),
                last_message=item.get('last_message'),
                message_count=item.get('message_count', 0)
            ))
        
        return sorted(conversations, key=lambda x: x.updated_at, reverse=True)
    
    def get_conversation_messages(
        self, 
        conversation_id: str, 
        user_id: str
    ) -> Optional[tuple[ChatConversation, List[ChatMessage]]]:
        """Get conversation with messages"""
        
        # Get conversation
        conv_items = self.db.query_items(f'USER#{user_id}', conversation_id)
        if not conv_items:
            return None
        
        conv_item = conv_items[0]
        conversation = ChatConversation(
            id=conv_item['id'],
            user_id=conv_item['user_id'],
            title=conv_item['title'],
            created_at=datetime.fromisoformat(conv_item['created_at'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(conv_item['updated_at'].replace('Z', '+00:00')),
            last_message=conv_item.get('last_message'),
            message_count=conv_item.get('message_count', 0)
        )
        
        # Get messages
        msg_items = self._get_conversation_messages(conversation_id)
        messages = []
        for item in msg_items:
            citations = None
            if item.get('citations'):
                citations = [Citation(**c) for c in item['citations']]
            
            messages.append(ChatMessage(
                id=item['id'],
                conversation_id=item['conversation_id'],
                user_id=item['user_id'],
                role=item['role'],
                content=item['content'],
                citations=citations,
                timestamp=datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
            ))
        
        return conversation, sorted(messages, key=lambda x: x.timestamp)
    
    def get_suggestions(self) -> List[str]:
        """Get chat suggestions"""
        return [
            "What are my rights if my landlord refuses to return my security deposit?",
            "Can my landlord enter my apartment without permission?",
            "How much notice does my landlord need to give before raising rent?",
            "What should I do if I receive an eviction notice?",
        ]
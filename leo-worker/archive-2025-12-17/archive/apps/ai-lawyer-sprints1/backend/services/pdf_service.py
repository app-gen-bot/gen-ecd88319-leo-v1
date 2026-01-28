"""PDF generation service for conversation exports"""
from typing import List
from datetime import datetime
import base64
from io import BytesIO
from jinja2 import Template
# from weasyprint import HTML  # Commented out due to system dependency issues
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import boto3
from botocore.exceptions import ClientError

from models.chat import ChatMessage, ChatConversation
from models.user import User
from config import settings


class PDFService:
    """Service for generating PDF documents"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key
        )
        self.bucket_name = settings.s3_bucket_name
        
    def generate_conversation_pdf(
        self,
        conversation: ChatConversation,
        messages: List[ChatMessage],
        user: User
    ) -> tuple[str, str]:
        """
        Generate PDF for a conversation
        
        Returns:
            tuple: (pdf_url, filename)
        """
        # HTML template for the PDF
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Legal Consultation - {{ conversation.title }}</title>
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2563eb;
                    margin: 0;
                }
                .meta {
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .disclaimer {
                    background-color: #fffbeb;
                    border: 1px solid #fbbf24;
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .message {
                    margin-bottom: 20px;
                    padding: 15px;
                    border-radius: 8px;
                }
                .message.user {
                    background-color: #eff6ff;
                    border-left: 4px solid #2563eb;
                }
                .message.assistant {
                    background-color: #f3f4f6;
                    border-left: 4px solid #6b7280;
                }
                .message-header {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #374151;
                }
                .message-time {
                    font-size: 12px;
                    color: #6b7280;
                }
                .citations {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #e0e7ff;
                    border-radius: 4px;
                    font-size: 13px;
                }
                .citation {
                    margin-bottom: 5px;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AI Tenant Rights Advisor</h1>
                <div class="meta">
                    <p><strong>Legal Consultation Record</strong></p>
                    <p>Date: {{ export_date }}</p>
                    <p>User: {{ user.name }} ({{ user.email }})</p>
                    <p>Conversation ID: {{ conversation.id }}</p>
                </div>
            </div>
            
            <div class="disclaimer">
                <strong>Important Legal Disclaimer:</strong> This document contains AI-generated legal information based on California tenant law. 
                It is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal matters.
            </div>
            
            <h2>Conversation: {{ conversation.title }}</h2>
            <p class="meta">Started: {{ conversation.created_at }}</p>
            
            {% for message in messages %}
            <div class="message {{ message.role }}">
                <div class="message-header">
                    {% if message.role == 'user' %}
                        You
                    {% else %}
                        AI Legal Advisor
                    {% endif %}
                    <span class="message-time">{{ message.timestamp }}</span>
                </div>
                <div class="message-content">
                    {{ message.content | replace('\n', '<br>') | safe }}
                </div>
                
                {% if message.citations %}
                <div class="citations">
                    <strong>Legal References:</strong>
                    {% for citation in message.citations %}
                    <div class="citation">
                        • {{ citation.law_code }} {{ citation.section }} - {{ citation.title }}
                    </div>
                    {% endfor %}
                </div>
                {% endif %}
            </div>
            {% endfor %}
            
            <div class="footer">
                <p>Generated by AI Tenant Rights Advisor on {{ export_date }}</p>
                <p>This document is confidential and intended solely for the use of {{ user.name }}.</p>
                <p>Powered by PlanetScale</p>
            </div>
        </body>
        </html>
        """
        
        # Prepare template data
        template_data = {
            'conversation': conversation,
            'messages': messages,
            'user': user,
            'export_date': datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')
        }
        
        # Render HTML
        template = Template(html_template)
        html_content = template.render(**template_data)
        
        # Generate PDF using ReportLab
        pdf_buffer = BytesIO()
        
        # Create PDF document  
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Add content as HTML-like structure
        # For now, let's create a simple text version
        # In production, you'd want to parse the HTML and convert to ReportLab elements
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("AI Tenant Rights Advisor", title_style))
        elements.append(Spacer(1, 20))
        
        # Metadata
        meta_text = f"""
        <b>Legal Consultation Record</b><br/>
        Date: {template_data['export_date']}<br/>
        User: {user.name} ({user.email})<br/>
        Conversation ID: {conversation.id}
        """
        elements.append(Paragraph(meta_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Disclaimer
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontSize=12,
            backColor=colors.HexColor('#fffbeb'),
            borderColor=colors.HexColor('#fbbf24'),
            borderWidth=1,
            borderPadding=10,
            spaceAfter=20
        )
        disclaimer_text = """<b>Important Legal Disclaimer:</b> This document contains AI-generated legal information based on California tenant law. 
        It is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal matters."""
        elements.append(Paragraph(disclaimer_text, disclaimer_style))
        
        # Messages
        for msg in messages:
            # Message header
            speaker = "You" if msg.role == 'user' else "AI Legal Advisor"
            timestamp = msg.timestamp.strftime('%I:%M %p') if hasattr(msg, 'timestamp') else ''
            header_text = f"<b>{speaker}</b> {timestamp}"
            elements.append(Paragraph(header_text, styles['Heading3']))
            
            # Message content
            msg_style = ParagraphStyle(
                'Message',
                parent=styles['Normal'],
                fontSize=11,
                leftIndent=20,
                rightIndent=20,
                spaceAfter=12,
                backColor=colors.HexColor('#eff6ff') if msg.role == 'user' else colors.HexColor('#f3f4f6')
            )
            # Escape HTML characters
            content = msg.content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
            elements.append(Paragraph(content, msg_style))
            
            # Citations if any
            if hasattr(msg, 'citations') and msg.citations:
                citation_text = "<b>Legal References:</b><br/>"
                for citation in msg.citations:
                    if isinstance(citation, dict):
                        citation_text += f"• {citation.get('law_code', '')} {citation.get('section', '')} - {citation.get('title', '')}<br/>"
                    else:
                        citation_text += f"• {citation}<br/>"
                citation_style = ParagraphStyle(
                    'Citation',
                    parent=styles['Normal'],
                    fontSize=10,
                    leftIndent=40,
                    textColor=colors.HexColor('#666666'),
                    spaceAfter=10
                )
                elements.append(Paragraph(citation_text, citation_style))
            
            elements.append(Spacer(1, 10))
        
        # Footer
        footer_text = f"""
        <center>
        Generated by AI Tenant Rights Advisor on {template_data['export_date']}<br/>
        This document is confidential and intended solely for the use of {user.name}.<br/>
        Powered by PlanetScale
        </center>
        """
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_CENTER,
            spaceBefore=50
        )
        elements.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        
        # Generate filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"legal_consultation_{conversation.id}_{timestamp}.pdf"
        
        # Upload to S3
        try:
            s3_key = f"exports/{user.id}/{filename}"
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=pdf_buffer.getvalue(),
                ContentType='application/pdf',
                ContentDisposition=f'attachment; filename="{filename}"'
            )
            
            # Generate presigned URL (valid for 1 hour)
            pdf_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=3600
            )
            
            return pdf_url, filename
            
        except ClientError:
            # If S3 fails, return base64 encoded PDF as fallback
            pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
            return f"data:application/pdf;base64,{pdf_base64}", filename
    
    def generate_dispute_report_pdf(
        self,
        dispute_data: dict,
        user: User
    ) -> tuple[str, str]:
        """
        Generate PDF for a dispute report
        
        Returns:
            tuple: (pdf_url, filename)
        """
        # HTML template for dispute report
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Dispute Documentation - {{ dispute.type }}</title>
            <style>
                /* Similar styles as conversation PDF */
                @page { size: A4; margin: 2cm; }
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #2563eb; margin: 0; }
                .section { margin-bottom: 30px; }
                .section h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                .evidence-item { margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 4px; }
                .timeline-item { margin-bottom: 10px; padding-left: 20px; border-left: 3px solid #2563eb; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Dispute Documentation</h1>
                <p><strong>{{ dispute.type | title }} Dispute</strong></p>
                <p>Date: {{ export_date }}</p>
                <p>Prepared for: {{ user.name }}</p>
            </div>
            
            <div class="section">
                <h2>Dispute Overview</h2>
                <p><strong>Type:</strong> {{ dispute.type }}</p>
                <p><strong>Status:</strong> {{ dispute.status }}</p>
                <p><strong>Description:</strong> {{ dispute.description }}</p>
                <p><strong>Created:</strong> {{ dispute.created_at }}</p>
            </div>
            
            <div class="section">
                <h2>Timeline of Events</h2>
                {% for event in dispute.timeline %}
                <div class="timeline-item">
                    <strong>{{ event.date }}</strong><br>
                    {{ event.description }}
                </div>
                {% endfor %}
            </div>
            
            <div class="section">
                <h2>Evidence</h2>
                {% for evidence in dispute.evidence %}
                <div class="evidence-item">
                    <strong>{{ evidence.type | title }}:</strong> {{ evidence.filename }}<br>
                    <em>Description:</em> {{ evidence.description }}<br>
                    <em>Added:</em> {{ evidence.added_date }}
                </div>
                {% endfor %}
            </div>
            
            <div class="footer">
                <p>Generated by AI Tenant Rights Advisor on {{ export_date }}</p>
                <p>This document is for informational purposes only and does not constitute legal advice.</p>
                <p>Powered by PlanetScale</p>
            </div>
        </body>
        </html>
        """
        
        # Similar implementation as conversation PDF
        # ... (implementation details)
        
        # For now, return mock data
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"dispute_report_{timestamp}.pdf"
        return f"https://example.com/dispute_{timestamp}.pdf", filename


# Create singleton instance
pdf_service = PDFService()
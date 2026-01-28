"""
Seed demo data for the application
"""

from datetime import datetime, timedelta
from db.operations import DynamoDBOperations
from config import settings


async def seed_demo_data():
    """Seed demo data for demo@example.com"""
    db = DynamoDBOperations()
    demo_user_id = settings.demo_user_id
    
    # Check if demo data already exists
    existing = db.query_items(f'USER#{demo_user_id}', 'CONV#', limit=1)
    if existing:
        print("Demo data already exists")
        return
    
    print("Seeding demo data...")
    
    # Create demo conversations
    conversations = [
        {
            'id': 'conv_security_deposit_001',
            'title': 'Security deposit return rights',
            'created_at': (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z',
            'last_message': 'What are my rights if my landlord refuses to return my security deposit?',
            'message_count': 4
        },
        {
            'id': 'conv_eviction_002',
            'title': 'Eviction notice procedures',
            'created_at': (datetime.utcnow() - timedelta(days=10)).isoformat() + 'Z',
            'last_message': 'I received a 3-day notice to pay or quit. What should I do?',
            'message_count': 6
        },
        {
            'id': 'conv_repairs_003',
            'title': 'Emergency repairs and habitability',
            'created_at': (datetime.utcnow() - timedelta(days=15)).isoformat() + 'Z',
            'last_message': 'My heater broke in the middle of winter. Can I withhold rent?',
            'message_count': 5
        }
    ]
    
    # Create conversations
    for conv in conversations:
        conv_item = {
            'PK': f'USER#{demo_user_id}',
            'SK': f"CONV#{conv['id']}",
            'id': conv['id'],
            'user_id': demo_user_id,
            'title': conv['title'],
            'created_at': conv['created_at'],
            'updated_at': conv['created_at'],
            'last_message': conv['last_message'],
            'message_count': conv['message_count'],
            'entity_type': 'conversation'
        }
        db.put_item(conv_item)
    
    # Create demo messages for first conversation
    messages = [
        {
            'id': 'msg_001_1',
            'conversation_id': 'conv_security_deposit_001',
            'user_id': demo_user_id,
            'role': 'user',
            'content': 'What are my rights if my landlord refuses to return my security deposit?',
            'timestamp': (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z'
        },
        {
            'id': 'msg_001_2',
            'conversation_id': 'conv_security_deposit_001',
            'user_id': 'system',
            'role': 'assistant',
            'content': """Under California Civil Code § 1950.5, your landlord must return your security deposit within 21 days after you move out. Here are your key rights:

1. **Itemized Statement**: If any deductions are made, the landlord must provide an itemized written statement describing each deduction.

2. **Legitimate Deductions Only**: Landlords can only deduct for:
   - Unpaid rent
   - Cleaning to return the unit to the same level of cleanliness as at the start
   - Repair of damages beyond normal wear and tear
   - Restoration of furniture or other items (if stated in the lease)

3. **Normal Wear and Tear**: Your landlord cannot charge you for normal wear and tear, such as:
   - Minor scuffs on walls
   - Worn carpet from normal use
   - Faded paint

4. **Receipts Required**: For repairs over $126, landlords must include copies of receipts or invoices.

5. **Legal Remedies**: If your landlord wrongfully withholds your deposit, you can:
   - Sue in small claims court for up to $10,000
   - Potentially recover up to twice the deposit amount as damages
   - Recover court costs and attorney fees

**Important**: Document everything with photos and keep all correspondence in writing.""",
            'citations': [
                {
                    'law_code': 'California Civil Code',
                    'section': '§ 1950.5',
                    'title': 'Security Deposits',
                    'url': 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1950.5&lawCode=CIV'
                }
            ],
            'timestamp': (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z'
        },
        {
            'id': 'msg_001_3',
            'conversation_id': 'conv_security_deposit_001',
            'user_id': demo_user_id,
            'role': 'user',
            'content': 'How much interest should I receive on my deposit?',
            'timestamp': (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z'
        },
        {
            'id': 'msg_001_4',
            'conversation_id': 'conv_security_deposit_001',
            'user_id': 'system',
            'role': 'assistant',
            'content': """California law does not require landlords to pay interest on security deposits at the state level. However, some cities have local ordinances that do require interest payments:

**Cities Requiring Interest on Security Deposits:**
- **San Francisco**: Landlords must pay annual interest on deposits
- **Los Angeles**: Interest required for rent-controlled units
- **Berkeley**: Annual interest payment required
- **Santa Monica**: Interest required for certain properties
- **West Hollywood**: Interest required with specific rates

The interest rate varies by city and is typically tied to savings account rates. For example, San Francisco sets the rate annually based on the Federal Reserve discount rate.

**To check if you're entitled to interest:**
1. Verify if your rental property is in a city with such requirements
2. Check if your unit is covered (some ordinances only apply to rent-controlled units)
3. Review your local rent board or housing department website for current rates

If your city doesn't require interest, you're not entitled to any unless your lease specifically provides for it.""",
            'citations': [
                {
                    'law_code': 'San Francisco Admin Code',
                    'section': '§ 49.2',
                    'title': 'Interest on Security Deposits'
                }
            ],
            'timestamp': (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z'
        }
    ]
    
    # Save messages
    for msg in messages:
        msg_item = {
            'PK': msg['conversation_id'],
            'SK': f"MSG#{msg['id']}",
            'id': msg['id'],
            'conversation_id': msg['conversation_id'],
            'user_id': msg['user_id'],
            'role': msg['role'],
            'content': msg['content'],
            'timestamp': msg['timestamp'],
            'entity_type': 'message'
        }
        
        if 'citations' in msg:
            msg_item['citations'] = msg['citations']
        
        db.put_item(msg_item)
    
    print("Demo data seeded successfully")
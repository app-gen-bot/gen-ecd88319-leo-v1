// Demo data for MSW handlers

import type { User, Conversation, ChatMessage, Citation } from '@/shared/types/api';

export const demoUser: User = {
  id: 'demo_user_123',
  email: 'demo@example.com',
  name: 'Demo User',
  userType: 'tenant',
  phone: '(555) 123-4567',
  address: '123 Demo Street, San Francisco, CA 94105',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  emailVerified: true,
  mfaEnabled: false,
};

export const demoConversations: Conversation[] = [
  {
    id: 'conv_security_deposit_001',
    userId: 'demo_user_123',
    title: 'Security deposit return rights',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:15:00Z',
    lastMessage: 'What are my rights if my landlord refuses to return my security deposit?',
    lastMessageAt: '2024-01-15T10:15:00Z',
    messageCount: 4,
  },
  {
    id: 'conv_eviction_002',
    userId: 'demo_user_123',
    title: 'Eviction notice procedures',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T15:00:00Z',
    lastMessage: 'I received a 3-day notice to pay or quit. What should I do?',
    lastMessageAt: '2024-01-10T15:00:00Z',
    messageCount: 6,
  },
  {
    id: 'conv_repairs_003',
    userId: 'demo_user_123',
    title: 'Emergency repairs and habitability',
    createdAt: '2024-01-05T02:00:00Z',
    updatedAt: '2024-01-05T02:30:00Z',
    lastMessage: 'My heater broke in the middle of winter. Can I withhold rent?',
    lastMessageAt: '2024-01-05T02:30:00Z',
    messageCount: 5,
  },
];

export const demoMessages: Record<string, ChatMessage[]> = {
  conv_security_deposit_001: [
    {
      id: 'msg_001_1',
      conversationId: 'conv_security_deposit_001',
      role: 'user',
      content: 'What are my rights if my landlord refuses to return my security deposit?',
      timestamp: '2024-01-15T10:00:00Z',
    },
    {
      id: 'msg_001_2',
      conversationId: 'conv_security_deposit_001',
      role: 'assistant',
      content: `Under California Civil Code § 1950.5, your landlord must return your security deposit within 21 days after you move out. Here are your key rights:

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

**Important**: Document everything with photos and keep all correspondence in writing.`,
      citations: [
        {
          law: 'California Civil Code',
          section: '§ 1950.5',
          text: 'Security Deposits',
          url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1950.5&lawCode=CIV',
        },
      ],
      timestamp: '2024-01-15T10:02:00Z',
    },
    {
      id: 'msg_001_3',
      conversationId: 'conv_security_deposit_001',
      role: 'user',
      content: 'How much interest should I receive on my deposit?',
      timestamp: '2024-01-15T10:10:00Z',
    },
    {
      id: 'msg_001_4',
      conversationId: 'conv_security_deposit_001',
      role: 'assistant',
      content: `California law does not require landlords to pay interest on security deposits at the state level. However, some cities have local ordinances that do require interest payments:

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

If your city doesn't require interest, you're not entitled to any unless your lease specifically provides for it.`,
      citations: [
        {
          law: 'San Francisco Admin Code',
          section: '§ 49.2',
          text: 'Interest on Security Deposits',
        },
      ],
      timestamp: '2024-01-15T10:15:00Z',
    },
  ],
  conv_eviction_002: [
    {
      id: 'msg_002_1',
      conversationId: 'conv_eviction_002',
      role: 'user',
      content: 'I received a 3-day notice to pay or quit. What should I do?',
      timestamp: '2024-01-10T14:30:00Z',
    },
    {
      id: 'msg_002_2',
      conversationId: 'conv_eviction_002',
      role: 'assistant',
      content: `A 3-day notice to pay or quit is serious, but you have rights and options. Here's what you should do immediately:

**1. Verify the Notice is Proper**
The notice must:
- State the exact amount of rent owed
- Include only rent (not late fees, utilities, or other charges)
- Be properly served (personal delivery, substitute service, or posting)
- Give you 3 full court days (excluding weekends and holidays)

**2. Your Options Within 3 Days:**
- **Pay the Full Amount**: Pay only the amount stated in the notice
- **Vacate**: Move out by the deadline
- **Contest if Invalid**: If the notice is improper, you may have defenses

**3. Payment Guidelines:**
- Get a receipt for any payment
- Pay by check or money order (creates a paper trail)
- Pay the exact amount listed
- Landlord must accept payment if offered within the 3 days

**4. If You Can't Pay in Full:**
- Contact local rental assistance programs immediately
- Negotiate a payment plan with your landlord (get it in writing)
- Seek help from tenant rights organizations

**5. After 3 Days:**
If you haven't paid or moved, the landlord can file an unlawful detainer (eviction) lawsuit. You'll then have 5 days to respond in court.

**Emergency Resources:**
- Call 211 for local emergency rental assistance
- Contact legal aid for free representation
- Document all communications with your landlord

⚠️ **Legal Disclaimer**: This is general information, not legal advice. Consider consulting with a tenant attorney for your specific situation.`,
      citations: [
        {
          law: 'California Code of Civil Procedure',
          section: '§ 1161',
          text: 'Unlawful Detainer',
        },
        {
          law: 'California Civil Code',
          section: '§ 1946.2',
          text: 'Tenant Protection Act',
        },
      ],
      timestamp: '2024-01-10T14:35:00Z',
    },
  ],
  conv_repairs_003: [
    {
      id: 'msg_003_1',
      conversationId: 'conv_repairs_003',
      role: 'user',
      content: 'My heater broke in the middle of winter. Can I withhold rent?',
      timestamp: '2024-01-05T02:00:00Z',
    },
    {
      id: 'msg_003_2',
      conversationId: 'conv_repairs_003',
      role: 'assistant',
      content: `A broken heater in winter is a serious habitability issue. California law provides you with several remedies, including the possibility of withholding rent, but you must follow specific procedures:

**Immediate Steps:**
1. **Notify Your Landlord in Writing** - Send written notice (email/text + certified mail)
2. **Document Everything** - Photos, temperatures, dates, all communications
3. **Give Reasonable Time** - Generally 30 days, but less for emergencies like heat

**Your Legal Options:**

**1. Repair and Deduct (Best for Emergencies)**
Under Civil Code § 1942, you can:
- Hire someone to fix the heater
- Deduct up to one month's rent
- Can use twice per year
- Must give landlord reasonable time first (24-72 hours for heat)

**2. Withhold Rent (Risky but Possible)**
You may withhold rent if:
- The problem substantially affects habitability
- You've given proper notice
- Landlord hasn't fixed it in reasonable time
- You should escrow the rent (save it) in case of dispute

**3. Contact Local Authorities**
- Call city/county building inspector
- Request habitability inspection
- Violations can pressure landlord to act

**4. Temporary Relocation**
- Landlord may need to pay for temporary housing
- Or provide space heaters as temporary solution

**Emergency Heat Solutions:**
- You can buy space heaters and deduct cost
- Keep all receipts
- Only deduct reasonable costs

⚠️ **Important**: Withholding rent can lead to eviction proceedings if done incorrectly. Document everything and consider consulting a tenant attorney first.`,
      citations: [
        {
          law: 'California Civil Code',
          section: '§ 1941.1',
          text: 'Habitability Requirements',
        },
        {
          law: 'California Civil Code',
          section: '§ 1942',
          text: 'Repair and Deduct Remedy',
        },
      ],
      timestamp: '2024-01-05T02:05:00Z',
    },
  ],
};

export const commonLegalQuestions = [
  'What are my rights if my landlord refuses to return my security deposit?',
  'Can my landlord enter my apartment without permission?',
  'How much notice does my landlord need to give before raising rent?',
  'What constitutes an illegal eviction?',
  'Can I withhold rent for repairs?',
  'What is considered normal wear and tear?',
  'How do I break my lease legally?',
  'What are my rights during a pandemic?',
  'Can my landlord charge me for painting?',
  'What should I do if I receive an eviction notice?',
];
import { http, HttpResponse } from 'msw'
import type { 
  SendMessageRequest, 
  SendMessageResponse,
  GetConversationsResponse,
  GetConversationMessagesResponse,
  User,
  Conversation,
  ChatMessage
} from '@/shared/types/api'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/sign-in/email', async ({ request }) => {
    const body = await request.json() as any
    
    // Mock demo user authentication
    if (body.email === 'demo@example.com' && body.password === 'DemoRocks2025!') {
      return HttpResponse.json({
        user: {
          id: 'demo_user_123',
          email: 'demo@example.com',
          name: 'Demo User',
          userType: 'tenant',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        },
        session: {
          id: `session_${Date.now()}`,
          userId: 'demo_user_123',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        },
        token: 'mock_jwt_token_' + Date.now(),
      })
    }
    
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/auth/sign-up/email', async ({ request }) => {
    const body = await request.json() as any
    
    return HttpResponse.json({
      user: {
        id: `user_${Date.now()}`,
        email: body.email,
        name: body.name,
        userType: body.userType || 'tenant',
        emailVerified: false,
        createdAt: new Date().toISOString(),
      },
      session: {
        id: `session_${Date.now()}`,
        userId: `user_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      token: 'mock_jwt_token_' + Date.now(),
    })
  }),

  http.get('/api/auth/session', ({ request }) => {
    // Check for auth header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token || authHeader) {
      return HttpResponse.json({
        user: {
          id: 'demo_user_123',
          email: 'demo@example.com',
          name: 'Demo User',
          userType: 'tenant',
          emailVerified: true,
        },
        session: {
          id: `session_${Date.now()}`,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      })
    }
    
    return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }),

  http.post('/api/auth/sign-out', () => {
    return HttpResponse.json({ success: true })
  }),

  // Chat endpoints
  http.post('/api/v1/chat/message', async ({ request }) => {
    const body = await request.json() as SendMessageRequest
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const conversationId = body.conversationId || `conv_${Date.now()}`
    const timestamp = new Date().toISOString()
    
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      conversationId,
      role: 'user',
      content: body.message,
      timestamp,
    }
    
    const assistantMessage: ChatMessage = {
      id: `msg_assistant_${Date.now()}`,
      conversationId,
      role: 'assistant',
      content: `Based on California law, regarding "${body.message}": Under California Civil Code § 1950.5, landlords must return security deposits within 21 days after tenancy ends. They can only deduct for: unpaid rent, cleaning to return the unit to its original condition, and repair of damages beyond normal wear and tear. Landlords must provide an itemized statement of deductions.`,
      citations: [
        {
          law: 'California Civil Code',
          section: '§ 1950.5',
          text: 'Security Deposits',
          url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5'
        }
      ],
      timestamp: new Date(Date.now() + 1000).toISOString(),
    }
    
    const response: SendMessageResponse = {
      conversationId,
      message: assistantMessage,
      userMessage,
    }
    
    return HttpResponse.json(response)
  }),

  http.get('/api/v1/chat/suggestions', () => {
    return HttpResponse.json({
      suggestions: [
        "What are my rights if my landlord refuses to return my security deposit?",
        "Can my landlord enter my apartment without permission?",
        "How much notice does my landlord need to give before raising rent?",
        "What should I do if I receive an eviction notice?",
      ]
    })
  }),

  // Conversation endpoints
  http.get('/api/v1/conversations', () => {
    const conversations: Conversation[] = [
      {
        id: 'conv_1',
        userId: 'demo_user_123',
        title: 'Security deposit question',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastMessage: 'What are my rights regarding security deposits?',
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageCount: 2,
      },
      {
        id: 'conv_2',
        userId: 'demo_user_123',
        title: 'Lease agreement review',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastMessage: 'Is this clause in my lease legal?',
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 4,
      },
    ]
    
    const response: GetConversationsResponse = {
      conversations,
      total: 2,
      page: 1,
      pageSize: 20,
    }
    
    return HttpResponse.json(response)
  }),

  http.get('/api/v1/conversations/:conversationId/messages', ({ params }) => {
    const { conversationId } = params
    
    const conversation: Conversation = {
      id: conversationId as string,
      userId: 'demo_user_123',
      title: 'Security deposit question',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastMessage: 'Under California Civil Code § 1950.5, your landlord must return your security deposit within 21 days...',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      messageCount: 2,
    }
    
    const messages: ChatMessage[] = [
      {
        id: 'msg_1',
        conversationId: conversationId as string,
        role: 'user',
        content: 'What are my rights if my landlord refuses to return my security deposit?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_2',
        conversationId: conversationId as string,
        role: 'assistant',
        content: 'Under California Civil Code § 1950.5, your landlord must return your security deposit within 21 days after you move out. They can only deduct for: unpaid rent, cleaning to return the unit to its original condition, and repair of damages beyond normal wear and tear. Landlords must provide an itemized statement of deductions with receipts for any repairs over $126.',
        citations: [
          {
            law: 'California Civil Code',
            section: '§ 1950.5',
            text: 'Security Deposits',
            url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5'
          }
        ],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      },
    ]
    
    const response: GetConversationMessagesResponse = {
      messages,
      conversation,
      total: 2,
      page: 1,
      pageSize: 20,
    }
    
    return HttpResponse.json(response)
  }),

  http.post('/api/v1/conversations/:conversationId/export', ({ params }) => {
    const pdfBase64 = 'JVBERi0xLjQKJeLjz9MKCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKCjIgMCBvYmoKPDwvVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMT4+CmVuZG9iagoKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDQgMCBSPj4+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFI+PgplbmRvYmoKCjQgMCBvYmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKCjUgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihNb2NrIFBERiBDb250ZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDAwNTggMDAwMDAgbgowMDAwMDAwMTE1IDAwMDAwIG4KMDAwMDAwMDIwMyAwMDAwMCBuCjAwMDAwMDAyODEgMDAwMDAgbgp0cmFpbGVyCjw8L1NpemUgNgovUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozODAKJSVFT0Y='
    
    return HttpResponse.json({
      pdf_url: `data:application/pdf;base64,${pdfBase64}`,
      filename: `legal_consultation_${params.conversationId}_${Date.now()}.pdf`,
    })
  }),

  // User endpoints
  http.get('/api/v1/users/me', () => {
    const user: User = {
      id: 'demo_user_123',
      email: 'demo@example.com',
      name: 'Demo User',
      userType: 'tenant',
      emailVerified: true,
      mfaEnabled: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      phone: '+1 (555) 123-4567',
      address: '123 Demo St, San Francisco, CA 94105',
    }
    
    return HttpResponse.json(user)
  }),

  http.put('/api/v1/users/me', async ({ request }) => {
    const body = await request.json() as any
    
    const updatedUser: User = {
      id: 'demo_user_123',
      email: 'demo@example.com',
      name: body.name || 'Demo User',
      userType: body.userType || 'tenant',
      phone: body.phone || '+1 (555) 123-4567',
      address: body.address || '123 Demo St, San Francisco, CA 94105',
      emailVerified: true,
      mfaEnabled: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json(updatedUser)
  }),
]
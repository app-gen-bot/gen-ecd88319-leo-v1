import { http, HttpResponse } from 'msw'

export const handlers = [
  // Beta signup endpoint
  http.post('/api/beta-signup', async ({ request }) => {
    const body = await request.json()
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful signup
    return HttpResponse.json({
      success: true,
      waitlistNumber: Math.floor(Math.random() * 1000) + 2000,
      message: 'Successfully added to waitlist'
    })
  }),

  // Use cases endpoint
  http.get('/api/use-cases', () => {
    return HttpResponse.json({
      useCases: [],
      total: 0
    })
  }),

  // Use case detail endpoint
  http.get('/api/use-cases/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Sample Use Case',
      description: 'Sample description'
    })
  }),

  // Sample documentation download
  http.post('/api/download-sample', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      downloadUrl: '/samples/documentation.zip'
    })
  }),

  // Check email uniqueness
  http.get('/api/check-email', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    // Mock email check
    const isUnique = email !== 'existing@example.com'
    
    return HttpResponse.json({
      unique: isUnique
    })
  })
]
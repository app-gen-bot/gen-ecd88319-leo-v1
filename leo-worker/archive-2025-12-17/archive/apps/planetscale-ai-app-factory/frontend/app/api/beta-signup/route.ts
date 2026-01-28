import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, company, idea } = body

    // Validate required fields
    if (!email || !idea) {
      return NextResponse.json(
        { error: 'Email and idea are required' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to mailing list
    // 4. Trigger internal notifications

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added to beta waitlist',
        data: {
          email,
          company: company || null,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Beta signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
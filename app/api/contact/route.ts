import { NextRequest, NextResponse } from 'next/server';

interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Create contact submission object
    const contactSubmission: ContactSubmission = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      timestamp: new Date().toISOString()
    };

    // Log the contact submission (in production, you'd save to database)
    console.log('Contact Form Submission:', contactSubmission);

    // Here you can add code to:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    // 4. Store in Redis/Upstash
    
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Contact information received successfully',
      submission: contactSubmission
    });

  } catch (error) {
    console.error('Error processing contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to process contact submission' },
      { status: 500 }
    );
  }
} 
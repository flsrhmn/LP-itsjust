import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection function
async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'itsjust',
    });
    
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

// Function to get country from IP address
async function getCountryFromIP(request: NextRequest): Promise<string> {
  try {
    // Get client IP address
    let ip = request.headers.get('x-real-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    
    if (!ip && forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    }

    // If we're in development or can't get IP, return 'Unknown'
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip === 'localhost') {
      return 'Unknown';
    }

    // Use IPAPI.co for geolocation (free tier)
    try {
      const response = await fetch(`http://ipapi.co/${ip}/country_name/`);
      if (response.ok) {
        const country = await response.text();
        return country || 'Unknown';
      }
    } catch {
      console.log('IPAPI.co failed, trying ipinfo.io');
    }

    // Fallback to ipinfo.io
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || ''}`);
      if (response.ok) {
        const data = await response.json();
        return data.country || 'Unknown';
      }
    } catch {
      console.log('ipinfo.io also failed');
    }

    return 'Unknown';
  } catch (error) {
    console.error('IP geolocation error:', error);
    return 'Unknown';
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/submit-email received');
  
  try {
    const { email } = await request.json();
    console.log('Received email:', email);

    // Validate email
    if (!email || !email.includes('@')) {
      console.log('Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email address' }, 
        { status: 400 }
      );
    }

    // Get country from IP
    const country = await getCountryFromIP(request);
    console.log('Detected country:', country);
    
    // Connect to database and insert email
    const connection = await connectToDatabase();
    
    try {
      await connection.execute(
        'INSERT INTO emails (email, country) VALUES (?, ?)',
        [email, country]
      );
      
      console.log('Email saved successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email saved successfully',
        country 
      });
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      
      // Handle duplicate email error
      if (dbError instanceof Error && 'code' in dbError && dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      throw dbError;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to test the endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to submit an email',
    example: {
      method: 'POST',
      body: { email: 'user@example.com' }
    }
  });
}
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {  
  try {
    const payload = await request.json();
    let ip = request.headers.get('x-real-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    
    if (!ip && forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    }

    // If we're in development or can't get IP, return 'Unknown'
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip === 'localhost') {
      return 'Unknown';
    }
    
    try {
      const partner_result = await axios.post(
        'https://torazzo.net/api/v1/landing-page-generator/partner_api',
        {
          ...payload,
          ip: ip,
        },
        {
          headers: {
            Accept: "application/json, text/plain, */*",
            'landingpage-preview': true,
          },
        }
      );

      return NextResponse.json({ 
        success: true, 
        data: partner_result.data,
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
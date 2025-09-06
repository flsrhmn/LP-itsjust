import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection function
async function connectToDatabase() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Function to get city from IP address
async function getCityFromIP(request: NextRequest): Promise<string> {
  try {
    // Get client IP address
    let ip = request.ip || request.headers.get('x-real-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    
    if (!ip && forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    }

    // If we're in development or can't get IP, return a random city
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip === 'localhost') {
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 
                     'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'];
      return cities[Math.floor(Math.random() * cities.length)];
    }

    // Use IPAPI.co for geolocation (free tier available)
    const response = await fetch(`http://ipapi.co/${ip}/city/`);
    if (response.ok) {
      const city = await response.text();
      return city || 'Unknown City';
    }
    
    // Fallback to ipinfo.io if ipapi.co fails
    const response2 = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || ''}`);
    if (response2.ok) {
      const data = await response2.json();
      return data.city || 'Unknown City';
    }
    
    // Final fallback
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston'];
    return cities[Math.floor(Math.random() * cities.length)];
  } catch (error) {
    console.error('IP geolocation error:', error);
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston'];
    return cities[Math.floor(Math.random() * cities.length)];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Connect to database
    const connection = await connectToDatabase();
    
    // Create emails table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get city from IP address
    const city = await getCityFromIP(request);
    
    // Insert email
    await connection.execute(
      'INSERT INTO emails (email, city) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP',
      [email, city]
    );
    
    // Get count of users in the same city (randomized for demo)
    const userCount = Math.floor(Math.random() * 5) + 6; // Random between 6-10
    
    // Close connection
    await connection.end();

    return NextResponse.json({ 
      success: true, 
      city, 
      count: userCount 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
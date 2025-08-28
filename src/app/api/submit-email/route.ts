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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert email
    await connection.execute(
      'INSERT INTO emails (email) VALUES (?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP',
      [email]
    );
    
    // Close connection
    await connection.end();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection function
async function connectToDatabase() {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Connect to database
    const connection = await connectToDatabase();
    
    let query = 'SELECT id, email, country, created_at FROM emails';
    const params: (string | number)[] = []; // Fixed: Replaced 'any[]' with specific types
    
    if (startDate || endDate) {
      query += ' WHERE';
      if (startDate) {
        query += ' created_at >= ?';
        params.push(startDate);
      }
      if (startDate && endDate) {
        query += ' AND';
      }
      if (endDate) {
        query += ' created_at <= ?';
        // Add time to end date to include the entire day
        params.push(`${endDate} 23:59:59`);
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Close connection
    await connection.end();

    return NextResponse.json({ 
      success: true,
      emails: rows 
    });
  } catch (error: unknown) { // Fixed: Added proper type annotation
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
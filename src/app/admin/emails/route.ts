import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

async function connectToDatabase() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Connect to database
    const connection = await connectToDatabase();
    
    let query = 'SELECT * FROM emails';
    const params = [];
    
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

    return NextResponse.json({ emails: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
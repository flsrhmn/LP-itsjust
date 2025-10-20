import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection function with error handling
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
    throw new Error('Failed to connect to database. Please check your credentials and ensure MySQL is running.');
  }
}

export async function GET(request: NextRequest) {
  console.log('API endpoint hit: /api/admin/emails');
  
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Query parameters:', { startDate, endDate });

    // Connect to database
    const connection = await connectToDatabase();
    
    let query = 'SELECT id, email, country, created_at FROM emails';
    const params: any[] = [];
    
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
    
    console.log('Executing query:', query, 'with params:', params);
    
    const [rows] = await connection.execute(query, params);
    
    // Close connection
    await connection.end();

    console.log('Query successful, returning', Array.isArray(rows) ? rows.length : 0, 'emails');
    
    return NextResponse.json({ 
      success: true,
      emails: rows 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  }
}
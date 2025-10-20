import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Type guard for MySQL errors
function isMySQLError(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error;
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection({
      // your connection config
    });

    const [rows] = await connection.execute('SELECT * FROM emails ORDER BY created_at DESC');
    await connection.end();

    return NextResponse.json({ emails: rows });
  } catch (error: unknown) { // ← Changed from :any to :unknown
    console.error('Database error:', error);
    
    // If you need to check for specific error types
    if (isMySQLError(error)) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return NextResponse.json({ error: 'Database access denied' }, { status: 500 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const connection = await mysql.createConnection({
      // your connection config
    });

    await connection.execute('DELETE FROM emails WHERE id = ?', [id]);
    await connection.end();

    return NextResponse.json({ success: true });
  } catch (error: unknown) { // ← Changed from :any to :unknown
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    );
  }
}
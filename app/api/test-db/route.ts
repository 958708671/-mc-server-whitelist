import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not configured' 
      });
    }
    
    const sql = neon(databaseUrl);
    
    const result = await sql`SELECT 1 as test`;
    
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return NextResponse.json({ 
      success: true, 
      connection: 'OK',
      tables: tables.map((t: any) => t.table_name)
    });
    
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}

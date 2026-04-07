import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { seedDatabase } = await import('@/lib/seed');
    const result = await seedDatabase();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

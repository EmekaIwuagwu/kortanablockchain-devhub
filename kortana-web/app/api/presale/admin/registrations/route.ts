import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('kortana_presale');
        const users = await db.collection('presale_users').find({}).sort({ createdAt: -1 }).toArray();

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (username === 'admin' && password === 'kortana_presale') {
            const response = NextResponse.json({ success: true, message: 'Authenticated' });

            // Setting a cookie for authentication
            response.cookies.set('presale_admin_auth', 'authenticated', {
                httpOnly: false, // Changed to false so client-side check can see it
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

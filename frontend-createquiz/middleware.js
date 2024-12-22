import { NextResponse } from 'next/server'

export function middleware(request) {
    const token = request.cookies.get('token');
    // console.log('Token from cookie in middleware:', token);
    if (token) {
        // ถ้ามีคุกกี้ชื่อ 'token'
    } else {
        // ถ้าไม่มีคุกกี้ชื่อ 'token'
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: ['/profile/:path*', '/home'], // เพิ่ม '/home' เข้าไปใน matcher
};
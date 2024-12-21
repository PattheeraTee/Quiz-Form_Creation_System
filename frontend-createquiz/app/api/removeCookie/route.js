import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // สร้าง Response และตั้งค่า Cookie ชื่อ `token` ให้หมดอายุ
    const response = NextResponse.json({ message: 'Cookie token has been deleted' });

    // ตั้งค่าคุกกี้ `token` ให้หมดอายุ
    response.cookies.set('token', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // ค่าศูนย์เพื่อทำให้คุกกี้หมดอายุทันที
    });

    return response;
  } catch (error) {
    console.error('Error deleting cookie:', error);

    // ส่งข้อความตอบกลับเมื่อเกิดข้อผิดพลาด
    return new Response(JSON.stringify({ error: 'Failed to delete cookie' }), { status: 500 });
  }
}

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Define the secret key for JWT verification
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET; // ใช้ environment variable หรือค่าดีฟอลต์
console.log('JWT_SECRET:', JWT_SECRET);

// Define the API handler
export async function GET() {
  try {
    // Retrieve the cookie
    const cookie = cookies().get('token');
    console.log('Cookie:', cookie);
    const token = cookie ? cookie.value : null;
    console.log('Token from cookie:', token);

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || null;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in token' }), { status: 400 });
    }

    // Return the user ID in the response
    return new Response(JSON.stringify({ userId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error decoding token:', error);
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

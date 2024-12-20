"use client";
import { useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่',
        showConfirmButton: true,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          text: 'บัญชีของคุณถูกสร้างเรียบร้อย',
          showConfirmButton: true,
        });
        router.push('/'); // กลับไปยังหน้า Login
      } else if (response.status === 409) { // 409: Conflict
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'อีเมลนี้ถูกใช้ลงทะเบียนแล้ว',
          showConfirmButton: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่',
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'เกิดปัญหาขณะเชื่อมต่อกับเซิร์ฟเวอร์',
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F8F6]">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-md shadow-lg">
        <div>
          <Link href={"/"} className="text-[#03A9F4] text-sm mb-1 hover:underline bg-[#03A9F4] bg-opacity-10 p-1 rounded-md">
            &larr; Back
          </Link>
          <h2 className="text-center text-2xl font-semibold">ลงทะเบียน</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="กรอกชื่อผู้ใช้"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="กรอกอีเมล"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="กรอกรหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border mb-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 text-white font-semibold bg-[#03A9F4] rounded-full hover:bg-[#0B76BC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ลงทะเบียน
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          ถ้ายังมีบัญชีแล้วให้{' '}
          <Link href="/" className="text-[#03A9F4] underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ลิงก์สำหรับตั้งรหัสผ่านใหม่ถูกส่งไปยังอีเมลแล้ว",
          confirmButtonText: "ตกลง",
        });
      } else if (response.status === 404) {
        // กรณีอีเมลไม่มีในระบบ
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "อีเมลนี้ไม่ได้ลงทะเบียนไว้ในระบบ",
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถส่งคำขอได้ กรุณาลองใหม่",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
        confirmButtonText: "ตกลง",
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F9F8F6]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <Link
          href={"/"}
          className="text-[#03A9F4] text-sm mb-1 hover:underline bg-[#03A9F4] bg-opacity-10 p-1 rounded-md"
        >
          &larr; Back
        </Link>
        <h2 className="text-center text-2xl font-semibold mb-6">ลืมรหัสผ่าน</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-2">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#03A9F4] hover:bg-[#0B76BC] text-white py-2 rounded-full text-lg font-medium"
          >
            ส่ง
          </button>
        </form>
      </div>
    </div>
  );
}

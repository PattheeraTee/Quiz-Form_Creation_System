"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะป้องกันการส่งซ้ำ
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // ป้องกันการกดซ้ำ

    setIsSubmitting(true); // ตั้งสถานะว่ากำลังส่งข้อมูล

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ลิงก์สำหรับตั้งรหัสผ่านใหม่ถูกส่งไปยังอีเมลแล้ว",
          confirmButtonText: "ตกลง",
        });
        router.push("/"); // เปลี่ยนเส้นทางไปที่หน้า `/`
      } else if (response.status === 404) {
        // กรณีอีเมลไม่มีในระบบ
        await Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "อีเมลนี้ไม่ได้ลงทะเบียนไว้ในระบบ",
          confirmButtonText: "ตกลง",
        });
        setIsSubmitting(false); // คืนสถานะให้กดได้อีกครั้ง
      } else {
        await Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถส่งคำขอได้ กรุณาลองใหม่",
          confirmButtonText: "ตกลง",
        });
        setIsSubmitting(false); // คืนสถานะให้กดได้อีกครั้ง
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
        confirmButtonText: "ตกลง",
      });
      setIsSubmitting(false); // คืนสถานะให้กดได้อีกครั้ง
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
            className={`w-full py-2 rounded-full text-lg font-medium ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#03A9F4] hover:bg-[#0B76BC] text-white"
            }`}
            disabled={isSubmitting} // ปิดปุ่มเมื่อกำลังส่งข้อมูล
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่ง"}
          </button>
        </form>
      </div>
    </div>
  );
}

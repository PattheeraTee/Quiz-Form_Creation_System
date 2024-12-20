"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import axios from "axios";

export default function ChangePassword({params}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const token = params.token;

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกให้ตรงกัน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/change-password", {
        token,
        newPassword: password,
        confirmPassword: confirmPassword
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่",
          confirmButtonText: "ตกลง",
        }).then(() => {
          router.push("/"); // กลับไปยังหน้า Login
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F9F8F6]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Link
          href={"/"}
          className="text-[#03A9F4] text-sm mb-1 hover:underline bg-[#03A9F4] bg-opacity-10 p-1 rounded-md"
        >
          &larr; Back
        </Link>
        <h2 className="text-center text-2xl font-semibold mb-8">เปลี่ยนรหัสผ่าน</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1" htmlFor="password">
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="กรอกรหัสผ่านใหม่"
              className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 mb-1"
              htmlFor="confirmPassword"
            >
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="กรอกยืนยันรหัสผ่านใหม่"
              className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#03A9F4] text-white p-3 rounded-full hover:bg-[#0B76BC] transition duration-300"
          >
            ยืนยัน
          </button>
        </form>
      </div>
    </div>
  );
}

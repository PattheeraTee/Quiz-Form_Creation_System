"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="text-green-500 text-5xl mb-4">✔</div>
        <h1 className="text-2xl font-bold mb-4">ส่งคำตอบเรียบร้อย!</h1>
        <p className="text-gray-600 mb-6">
          ขอบคุณที่ทำแบบสอบถามของเรา
        </p>
        <button
          onClick={() => router.push("/home")}
          className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          กลับไปหน้าแรก
        </button>
      </div>
    </div>
  );
}

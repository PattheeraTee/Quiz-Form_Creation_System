// components/ProfileMenu.js
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // เรียก API เพื่อ remove cookie
      await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/removeCookie`, {
        withCredentials: true, // เพื่อส่ง cookie ไปด้วย
      });

      // เปลี่ยนเส้นทางไปยังหน้าแรก
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="absolute right-2 mt-44 w-40 bg-white rounded-lg shadow-lg border border-gray-300 z-50">
      <div className="flex flex-col text-start">
        <Link
          href="/profile"
          className="px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          ข้อมูลผู้ใช้
        </Link>
        <Link
          href="/change-password"
          className="px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          เปลี่ยนรหัสผ่าน
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

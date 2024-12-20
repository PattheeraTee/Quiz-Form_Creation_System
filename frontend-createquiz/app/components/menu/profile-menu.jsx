// components/ProfileMenu.js
import Link from 'next/link';

export default function ProfileMenu() {
  return (
    <div className="absolute right-2 mt-44 w-40 bg-white rounded-lg shadow-lg border border-gray-300">
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
        <Link
          href="/"
          className="px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Log out
        </Link>
      </div>
    </div>
  );
}

import Image from "next/image";
import taeyeon from "../images/taeyeon.png";
import Link from "next/link";
import ProfileMenu from "./profile-menu";
import { useState } from "react";

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="flex items-center justify-between bg-white border-b border-black p-4">
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-2xl font-bold text-black">QUIZ LOGO</span>
      </div>

      {/* Right: Home and Profile */}
      <div className="flex items-center space-x-6">
        {/* Home Button */}
        <Link className="flex items-center space-x-2" href="/home">
          <span className="rounded-full w-4 h-4 bg-black"></span>
          <p className="text-xl font-semibold text-black">HOME</p>
        </Link>

        {/* Profile Image */}
        <Image
          src={taeyeon}  // ใช้ตัวแปรที่นำเข้าโดยไม่ใช้เครื่องหมายคำพูด
          alt="Profile"
          width={40}    // ปรับขนาดภาพให้ชัดเจน
          height={40}
          className="w-10 h-10 rounded-full object-cover border border-black"
          onClick={toggleProfileMenu}
        />
        {isProfileMenuOpen && <ProfileMenu />}
      </div>
    </header>
  );
}

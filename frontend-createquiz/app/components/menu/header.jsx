import Image from "next/image";
import Link from "next/link";
import ProfileMenu from "./profile-menu";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ email: "", profileImage: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ดึง userId จาก API
        const cookieResponse = await axios.get("http://localhost:3000/api/getCookie", {
          withCredentials: true,
        });
        const userId = cookieResponse.data.userId;
    
        if (!userId) {
          console.error("User ID not found");
          return;
        }
    
        // ดึงข้อมูลผู้ใช้จาก API
        const response = await axios.get(`http://localhost:3001/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
    
        console.log("response.data:", response.data);
    
        // ตรวจสอบโครงสร้างของ response.data
        const { email = "", profileImage = "" } = response.data || {};
        setUserData({ email, profileImage });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    

    fetchUserData();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const getInitials = (email) => {
    if (!email) return "";
    return email.charAt(0).toUpperCase();
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

        {/* Profile Image or Initials */}
        <div
          onClick={toggleProfileMenu}
          className="cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full "
          style={{
            backgroundColor: userData.profileImage ? "transparent" : "#D1D5DB", // พื้นหลังสีเทาเมื่อไม่มีรูป
          }}
        >
          {userData.profileImage ? (
            <Image
              src={userData.profileImage}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">{getInitials(userData.email)}</span>
          )}
        </div>
        {isProfileMenuOpen && <ProfileMenu />}
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/menu/header";
import axios from "axios";

export default function ProfilePage() {
  const [userData, setUserData] = useState({ email: "", profileImage: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ดึง userId จาก API
        const cookieResponse = await axios.get("http://localhost:3000/api/getCookie", {
          withCredentials: true,
        });
        console.log("cookieResponse : ", cookieResponse.data.userId);
        const userId = cookieResponse.data.userId;

        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        // ดึงข้อมูลผู้ใช้จาก API
        const response = await axios.get(`http://localhost:3001/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("response : ", response.data);

        const { email, profileImage } = response.data;
        setUserData({ email, profileImage: profileImage || null });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (email) => {
    if (!email) return "";
    return email.charAt(0).toUpperCase();
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="bg-[#F9F8F6] text-black min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={"/home"}
              className="text-[#03A9F4] text-sm mb-1 hover:underline bg-[#03A9F4] bg-opacity-10 p-1 rounded-md"
            >
              &larr; Back
            </Link>
            <Link
              href={"/profile/edit"}
              className="border border-[#03A9F4] text-[#03A9F4] text-sm px-4 py-1 rounded-full"
            >
              แก้ไขข้อมูลผู้ใช้
            </Link>
          </div>

          <h2 className="text-xl font-semibold mt-4 mb-6 text-start">
            ข้อมูลผู้ใช้
          </h2>

          <div className="flex flex-col items-center mb-6">
            {userData.profileImage ? (
              <div className="relative w-24 h-24">
                <img
                  src={userData.profileImage}
                  alt="Profile Image"
                  className="rounded-full w-24 h-24 object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(userData.email)}
              </div>
            )}

            <div className="space-y-4 mt-4 w-full">
              <div className="flex">
                <p className="text-black">อีเมล :</p>
                <p className="text-black font-medium ml-2">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

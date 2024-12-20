"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import taeyeon from "../components/images/taeyeon.png";
import Header from "../components/menu/header";
import Cookies from "js-cookie";
import axios from "axios";

export default function ProfilePage() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await Cookies.get("token");
      console.log("Token from cookie:", token);

      const userId = decodeToken(token); // ถอดรหัส token เพื่อดึง userId
      console.log("userId", userId);

      if (!userId) {
        console.error("User ID not found in token");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user data...========");
        const response = await axios.get(`http://localhost:3001/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const {username,email} = response.data.user;
        setUserData({ username, email }); // เก็บเฉพาะ username และ email
        console.log("User data:", { username, email });
        // console.log("User data:", response.data);
        // console.log("user",response.data.user.username)
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).userId; // Assuming `userId` is in the token payload
    } catch (e) {
      return null;
    }
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
              href={"/edit-profile"}
              className="border border-[#03A9F4] text-[#03A9F4] text-sm px-4 py-1 rounded-full"
            >
              แก้ไขข้อมูลผู้ใช้
            </Link>
          </div>

          <h2 className="text-xl font-semibold mt-4 mb-6 text-start">
            ข้อมูลผู้ใช้
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src={taeyeon}
                alt="Profile Image"
                className="rounded-full"
                width={96}
                height={96}
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                <FontAwesomeIcon icon={faPencil} />
              </button>
            </div>

            <div className="space-y-4 mt-4 w-full">
              <div className="flex">
                <p className="text-black">ชื่อผู้ใช้ :</p>
                <p className="text-black font-medium ml-2">{userData.username}</p>
              </div>
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

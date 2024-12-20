// pages/edit-profile.js
"use client";
import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import taeyeon from '../components/images/taeyeon.png';
import Link from 'next/link';
import Header from '../components/menu/header';

export default function EditProfile() {
  const [username, setUsername] = useState('ty_kim');
  const [email, setEmail] = useState('kimty@gmail.com');

  const handleConfirm = () => {
    // Handle confirm logic here (e.g., form submission)
    alert('Profile updated');
  };

  return (
    <div className="bg-[#F9F8F6] text-black min-h-screen flex flex-col"> 
      <Header />
      {/* Profile Edit Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className='mb-4'>
            <Link href={"/profile"} className="text-[#03A9F4] text-sm hover:underline bg-[#03A9F4] bg-opacity-10 p-1 rounded-md">
              &larr; Back
            </Link>
          </div>
          <h1 className="text-xl font-bold text-start mb-6">แก้ไขข้อมูลผู้ใช้</h1>

          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src={taeyeon} // Replace with your profile image path
                width={100}
                height={100}
                className="rounded-full"
                alt="User Profile"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                <FontAwesomeIcon icon={faPencil} />
              </button>
            </div>
          </div>

          {/* Username Field */}
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded mb-4"
          />

          {/* Email Field */}
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded mb-6"
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#03A9F4] text-white rounded-full hover:bg-[#0B76BC]"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

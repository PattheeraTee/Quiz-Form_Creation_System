'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileMenu from '../../components/menu/profile-menu';
import axios from 'axios';

export default function QuizHeader() {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [userData, setUserData] = useState({ email: "", profileImage: "" });
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cookieResponse = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getCookie`, {
                    withCredentials: true,
                });
                const userId = cookieResponse.data.userId;

                if (!userId) {
                    console.error("User ID not found");
                    setIsGuest(true); // Mark as Guest if no user ID
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                const { email = "", profileImage = "" } = response.data || {};
                setUserData({ email, profileImage });
            } catch (error) {
                console.log("Error fetching user data:", error);
                setIsGuest(true); // Mark as Guest on error
            }
        };
        fetchUserData();
    }, []);

    const toggleProfileMenu = () => {
        // Prevent opening profile menu for guest users
        if (!isGuest) {
            setIsProfileMenuOpen(!isProfileMenuOpen);
        }
    };

    const getInitials = (email) => {
        if (!email) return "";
        return email.charAt(0).toUpperCase();
    };

    return (
        <div className='bg-white border-b border-black'>
            <header className="flex items-center justify-between p-4 relative">
                {/* Left Section: Logo */}
                <Link href={isGuest ? "/" : "/home"} className="flex items-center">
                    <span className="text-2xl font-bold text-black">QUIZ LOGO</span>
                </Link>

                {/* Right Section: Settings and User Profile */}
                <div className="flex items-center space-x-4">
                    {/* User Profile */}
                    <div
                        onClick={toggleProfileMenu}
                        className={`cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full ${
                            isGuest ? 'cursor-not-allowed' : ''
                        }`}
                        style={{
                            backgroundColor: userData.profileImage ? "transparent" : "#D1D5DB", // Gray background if no image
                        }}
                        title={isGuest ? "Guest users cannot access the profile menu" : ""}
                    >
                        {isGuest ? (
                            <span className="text-black text-sm font-bold">Guest</span>
                        ) : userData.profileImage ? (
                            <img
                                src={userData.profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-black text-md font-bold">{getInitials(userData.email)}</span>
                        )}
                    </div>
                    {isProfileMenuOpen && !isGuest && <ProfileMenu />}
                </div>
            </header>
        </div>
    );
}

'use client';
import React, { useState, useEffect, useContext } from 'react';
import { QuizContext } from "../QuizContext"; // Import QuizContext
import Link from 'next/link';
import ProfileMenu from "../../components/menu/profile-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faEye } from "@fortawesome/free-solid-svg-icons";
import Theme from '../question/popup/theme/page';
import axios from 'axios';

export default function QuizHeader({ quizData }) {
    const { quizTitle,primaryColor } = useContext(QuizContext);
    const [isThemeVisible, setIsThemeVisible] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState('คำถาม');
    const [isPublishPopupVisible, setIsPublishPopupVisible] = useState(false); // State for popup visibility
    const [currentTitle, setCurrentTitle] = useState(quizTitle); // Local state for quiz title
    const [userData, setUserData] = useState({ email: "", profileImage: "" });

    useEffect(() => {
        setCurrentTitle(quizTitle);
    }, [quizTitle]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cookieResponse = await axios.get("http://localhost:3000/api/getCookie", {
                    withCredentials: true,
                });
                const userId = cookieResponse.data.userId;

                if (!userId) {
                    console.error("User ID not found");
                    return;
                }

                const response = await axios.get(`http://localhost:3001/users/${userId}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

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

    const handleThemeClick = () => {
        setIsThemeVisible(!isThemeVisible);
    };

    const handlePublishClick = () => {
        setIsPublishPopupVisible(true); // Show the popup
    };

    const handleClosePopup = () => {
        setIsPublishPopupVisible(false); // Hide the popup
    };

    const handleCopyLink = () => {
        const formUrl = `http://localhost:3000/quiz/${quizData?.form.form_id || ''}`;
        navigator.clipboard.writeText(formUrl); // Copy the link to clipboard
        alert("Link copied to clipboard!");
    };

    return (
        <div className='bg-white border-b border-black'>
            <header className="flex items-center justify-between p-4 relative">
                {/* Left Section: Logo */}
                <Link className="flex items-center" href="/home">
                    <span className="text-2xl font-bold text-black">QUIZ LOGO</span>
                </Link>

                {/* Center Section: Quiz Name */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-medium text-center text-black">
                    {currentTitle}
                </div>

                {/* Right Section: Settings and User Profile */}
                <div className="flex items-center space-x-4">
                    {/* Icons Section */}
                    <button aria-label="Change Theme" className="p-2" onClick={handleThemeClick}>
                        <FontAwesomeIcon icon={faPalette} className='w-6 h-6 text-[#434146]' />
                    </button>
                    <button aria-label="Preview Quiz" className="p-2">
                        <FontAwesomeIcon icon={faEye} className='w-6 h-6 text-[#434146]' />
                    </button>

                    {/* Publish Button */}
                    <button
                        className="text-white rounded-full px-4 py-2"
                        style={{ backgroundColor: primaryColor }}
                        onClick={handlePublishClick}
                    >
                        เผยแพร่
                    </button>

                    {/* User Profile */}
                    <div
                        onClick={toggleProfileMenu}
                        className="cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full"
                        style={{
                            backgroundColor: userData.profileImage ? "transparent" : "#D1D5DB", // Gray background if no image
                        }}
                    >
                        {userData.profileImage ? (
                            <img
                                src={userData.profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-xl font-bold">{getInitials(userData.email)}</span>
                        )}
                    </div>
                    {isProfileMenuOpen && <ProfileMenu />}
                </div>
            </header>

            <nav className="flex justify-center space-x-8 mt-4">
                <div onClick={() => setSelectedSection('คำถาม')}>
                    <p className={`cursor-pointer ${selectedSection === 'คำถาม' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>คำถาม</p>
                </div>
                <div onClick={() => setSelectedSection('การตอบกลับ')}>
                    <p className={`cursor-pointer ${selectedSection === 'การตอบกลับ' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>การตอบกลับ</p>
                </div>
                <div onClick={() => setSelectedSection('ตั้งค่า')}>
                    <p className={`cursor-pointer ${selectedSection === 'ตั้งค่า' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>ตั้งค่า</p>
                </div>
            </nav>

            {/* Theme Component */}
            {isThemeVisible && (
                <Theme quizData={quizData} />
            )}

            {/* Publish Popup */}
            {isPublishPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">ลิงค์</h3>
                            <button onClick={handleClosePopup} className="text-gray-500 hover:text-gray-700">X</button>
                        </div>
                        <input
                            type="text"
                            value={`http://localhost:3000/quiz/${quizData?.form.form_id || ''}`}
                            readOnly
                            className="w-full border rounded px-3 py-2 mb-4 text-gray-700"
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleClosePopup}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 bg-[#03A9F4] text-white rounded-full hover:bg-blue-600"
                            >
                                คัดลอก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

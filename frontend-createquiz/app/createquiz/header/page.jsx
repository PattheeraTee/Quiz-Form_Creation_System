'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import taeyeon from "../../components/images/taeyeon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faEye } from "@fortawesome/free-solid-svg-icons";
import Theme from '../question/popup/theme/page';

export default function QuizHeader({ onSectionSelect, quizTitle}) {
    const [isThemeVisible, setIsThemeVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState('คำถาม');

    const handleThemeClick = () => {
        setIsThemeVisible(!isThemeVisible);
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
        if (onSectionSelect) {
            onSectionSelect(section);
        }
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
                    {quizTitle}
                </div>

                {/* Right Section: Settings and User Profile */}
                <div className="flex items-center space-x-4">
                    {/* Icons Section */}
                    <button aria-label="Change Theme" className="p-2" onClick={handleThemeClick}>
                        <FontAwesomeIcon icon={faPalette} className='w-6 h-6 text-[#434146]'/>
                    </button>
                    <button aria-label="Preview Quiz" className="p-2">
                        <FontAwesomeIcon icon={faEye} className='w-6 h-6 text-[#434146]'/>
                    </button>

                    {/* Publish Button */}
                    <button className="bg-[#03A9F4] text-white rounded-full px-4 py-2">เผยแพร่</button>

                    {/* User Profile */}
                    <div className="rounded-full overflow-hidden w-10 h-10">
                        <Image
                            src={taeyeon}
                            alt="User Profile"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-black"
                        />
                    </div>
                </div>
            </header>

            <nav className="flex justify-center space-x-8 mt-4">
                <div onClick={() => handleSectionClick('คำถาม')}>
                    <p className={`cursor-pointer ${selectedSection === 'คำถาม' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>คำถาม</p>
                </div>
                <div onClick={() => handleSectionClick('การตอบกลับ')}>
                    <p className={`cursor-pointer ${selectedSection === 'การตอบกลับ' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>การตอบกลับ</p>
                </div>
                <div onClick={() => handleSectionClick('ตั้งค่า')}>
                    <p className={`cursor-pointer ${selectedSection === 'ตั้งค่า' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-black'}`}>ตั้งค่า</p>
                </div>
            </nav>

            {/* Theme Component */}
            {isThemeVisible && (
                <Theme />
            )}
        </div>
    );
}


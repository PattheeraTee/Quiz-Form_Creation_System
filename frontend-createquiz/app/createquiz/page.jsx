'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import Question from "./question/page";
import HeaderQuiz from "./header/page";
import Setting from "./settings/page";
import Response from "../components/response/page";


export default function CreateQuiz() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const formId = searchParams.get("form_id");
  const [selectedTab, setSelectedTab] = useState('คำถาม');

  
  const handleTabSelect = (tab) => {
    console.log('Selected Tab:', tab);
    setSelectedTab(tab);
  };

  return (
    <div className='bg-gray-100 h-screen'>
      <HeaderQuiz onSectionSelect={handleTabSelect} />
      {selectedTab === 'คำถาม' && <Question />}
      {selectedTab === 'การตอบกลับ' && <Response />}
      {selectedTab === 'ตั้งค่า' && <Setting />}
    </div>
  );
}

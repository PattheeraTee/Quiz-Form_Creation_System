'use client';
import { useState } from "react";
import Header from "../components/menu/header";
import Sidebar from "../components/menu/sidebar";
import ImportFile from "../components/importfile/import-file";
import GenerateQuiz from "../components/generate-quiz/page";
import MyQuiz from "../components/myquiz/page";
import Template from "../components/template/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes ,faQuestion, faClipboardList, faBrain} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation"; 

export default function Page() {
  const [selectedComponent, setSelectedComponent] = useState("myquiz"); // default to "myquiz"
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup state
  const router = useRouter();

  const handleCreateQuiz = (type) => {
    // Redirect to CreateQuiz page with the selected type as a query parameter
    router.push(`/createquiz?type=${type}`);
  };

  // Function to conditionally render components based on selectedComponent
  const renderComponent = () => {
    switch (selectedComponent) {
      case "import":
        return <ImportFile />;
      case "ai":
        return <GenerateQuiz />;
      case "myquiz":
        return <MyQuiz />;
      case "template":
        return <Template />;
      default:
        return <MyQuiz />;
    }
  };

  return (
    <div className="bg-[#F9F8F6] text-black min-h-screen flex flex-col"> {/* Ensure full screen background */}
      <Header />
      <div className="flex mt-4 flex-grow bg-[#F9F8F6]"> {/* Extend background to this div */}
        <div className="w-1/5 bg-[#F9F8F6]">
          <Sidebar
            selectedComponent={selectedComponent}
            setSelectedComponent={setSelectedComponent}
          />
        </div>
        <div className="w-4/5 bg-[#F9F8F6] p-4"> {/* Add padding and background */}
          {renderComponent()}
        </div>
      </div>

      {/* Floating "plus" button, only shown when 'myquiz' is selected */}
      {selectedComponent === "myquiz" && (
        <button
          className="fixed bottom-10 right-10 bg-[#03A9F4] hover:bg-[#0B76BC] text-white p-4 rounded-full shadow-lg"
          onClick={() => setIsPopupOpen(true)} // Set popup to open
        >
          <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
        </button>
      )}

      {/* Popup for selecting quiz type */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button className="absolute top-3 right-3 text-black" onClick={() => setIsPopupOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-start text-xl font-semibold mb-4">เลือกประเภทที่ต้องการจะสร้าง</h2>
            <div className="flex flex-col gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-black rounded-full hover:bg-gray-100"
                onClick={() => handleCreateQuiz("quiz")}
              >
                <FontAwesomeIcon icon={faQuestion} className="text-lg" />
                สร้างแบบทดสอบ
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-black rounded-full hover:bg-gray-100"
                onClick={() => handleCreateQuiz("survey")}
              >
                <FontAwesomeIcon icon={faClipboardList} className="text-lg" />
                สร้างแบบสำรวจ
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-black rounded-full hover:bg-gray-100"
                onClick={() => handleCreateQuiz("psychology")}
              >
                <FontAwesomeIcon icon={faBrain} className="text-lg" />
                สร้างแบบทดสอบจิตวิทยา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

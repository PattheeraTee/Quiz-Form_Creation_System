import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faFileImport, faGlobe, faSimCard } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ selectedComponent, setSelectedComponent }) {
  return (
    <aside className="w-72 h-fit bg-white p-6 m-4 rounded-xl shadow-md border border-gray-200">
      {/* My Quiz button */}
      <div
        className={`flex items-center space-x-2 p-4 mb-4 rounded-full px-6 cursor-pointer ${
          selectedComponent === "myquiz" ? "bg-purple-200 text-purple-600" : "bg-gray-200 text-black"
        }`}
        onClick={() => setSelectedComponent("myquiz")}
      >
        <FontAwesomeIcon
          icon={faGlobe}
          className={`w-6 h-6 ${selectedComponent === "myquiz" ? "text-purple-600" : "text-black"}`}
        />
        <span className="text-xl font-semibold">ควิซของฉัน</span>
      </div>

      {/* Template button */}
      <div
        className={`flex items-center space-x-2 p-4 mb-4 rounded-full px-6 cursor-pointer ${
          selectedComponent === "template" ? "bg-purple-200 text-purple-600" : "bg-gray-200 text-black"
        }`}
        onClick={() => setSelectedComponent("template")}
      >
        <FontAwesomeIcon
          icon={faSimCard}
          className={`w-6 h-6 ${selectedComponent === "template" ? "text-purple-600" : "text-black"}`}
        />
        <span className="text-xl font-semibold">เทมเพลต</span>
      </div>

      <div className="border my-5"></div>

      {/* AI button */}
      <div
        className={`flex items-center space-x-2 p-4 mb-4 rounded-full px-6 cursor-pointer ${
          selectedComponent === "ai" ? "bg-purple-200 text-purple-600" : "bg-gray-200 text-black"
        }`}
        onClick={() => setSelectedComponent("ai")}
      >
        <FontAwesomeIcon
          icon={faRobot}
          className={`w-6 h-6 ${selectedComponent === "ai" ? "text-purple-600" : "text-black"}`}
        />
        <span className="text-xl font-semibold">AI</span>
      </div>

      {/* Import File button */}
      <div
        className={`flex items-center space-x-2 p-4 mb-4 rounded-full px-6 cursor-pointer ${
          selectedComponent === "import" ? "bg-purple-200 text-purple-600" : "bg-gray-200 text-black"
        }`}
        onClick={() => setSelectedComponent("import")}
      >
        <FontAwesomeIcon
          icon={faFileImport}
          className={`w-6 h-6 ${selectedComponent === "import" ? "text-purple-600" : "text-black"}`}
        />
        <span className="text-xl font-semibold">นำเข้าเอกสาร</span>
      </div>
    </aside>
  );
}

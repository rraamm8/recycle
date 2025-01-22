import React, { useState } from "react";
import {
  FaHome,
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const [active, setActive] = useState("홈");

  const menuItems = [
    { name: "홈", icon: <FaHome /> },
    { name: "학습", icon: <FaGraduationCap /> },
    { name: "프로필", icon: <FaUser /> },
    { name: "메시지", icon: <FaEnvelope /> },
    { name: "설정", icon: <FaCog /> },
    { name: "로그아웃", icon: <FaSignOutAlt /> },
  ];

  return (
    <div className="w-16 h-screen bg-black text-white flex flex-col items-center py-6 space-y-6 overflow-y-auto">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6">Sr.</div>

      {/* Nav Items */}
      <div className="space-y-6">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={`flex flex-col items-center cursor-pointer ${
              active === item.name
                ? "text-blue-500"
                : "hover:text-gray-400 transition-colors"
            }`}
            onClick={() => setActive(item.name)}
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="text-xs mt-2">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

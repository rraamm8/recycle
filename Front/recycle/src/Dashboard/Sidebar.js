import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";

const Sidebar = () => {
  const [active, setActive] = useState("홈");

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/dashboard" },
    { name: "Chart", icon: <FaChartLine />, path: "/LTDetailPage" },
    { name: "프로필", icon: <FaUser /> },
    { name: "메시지", icon: <FaEnvelope /> },
    { name: "설정", icon: <FaCog /> },
    { name: "Sign Out", icon: <FaSignOutAlt />, path: "/logout" },
  ];

  return (
    <div className="w-16 h-screen bg-black text-white flex flex-col items-center py-6 space-y-6 overflow-y-auto">
      {/* Logo */}
      <div className="text-2xl font-bold mb-6">Sr.</div>

      {/* Nav Items */}
      <div className="space-y-6">
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex flex-col items-center cursor-pointer ${active === item.name
                ? "text-blue-500"
                : "hover:text-gray-400 transition-colors"
              }`}
            onClick={() => setActive(item.name)}
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="text-xs mt-2">{item.name}</span>
          </Link>

        ))}
      </div>
    </div>
  );
};

export default Sidebar;

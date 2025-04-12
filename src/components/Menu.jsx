import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaQrcode, FaChartBar, FaCog, FaUser } from "react-icons/fa";
import alliedLogo from "../assets/AlliedLogo.png";

const Menu = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null); // User data state
  const profileRef = useRef(null); // Ref for the profile dropdown

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleProfile = () => setProfileOpen((prev) => !prev);

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close the sidebar after navigation
  };

  // Fetch user data from local storage
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className=" bg-white flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
        style={{ width: "250px" }}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-gray-800 text-2xl focus:outline-none"
        >
          <FaTimes />
        </button>

        {/* Logo in Sidebar */}
        <div className="flex justify-center items-center">
          <img
            src={alliedLogo}
            alt="Allied Medical Ltd Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="mt-10 space-y-4 px-6">
          <button
            onClick={() => handleNavigation("/qr-code")}
            className="w-full flex items-center px-4 py-3 space-x-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-400"
          >
            <FaQrcode className="text-xl" />
            <span className="text-lg font-medium">Scan QR Code</span>
          </button>
          <button
            onClick={() => handleNavigation("/reports")}
            className="w-full flex items-center px-4 py-3 space-x-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-400"
          >
            <FaChartBar className="text-xl" />
            <span className="text-lg font-medium">View Reports</span>
          </button>
          <button
            onClick={() => handleNavigation("/settings")}
            className="w-full flex items-center px-4 py-3 space-x-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-400"
          >
            <FaCog className="text-xl" />
            <span className="text-lg font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex justify-between">
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 text-gray-800 text-2xl focus:outline-none"
          >
            <FaBars />
          </button>
          <button
            onClick={toggleProfile}
            className="absolute top-4 right-4 text-gray-800 text-2xl focus:outline-none"
          >
            <FaUser />
          </button>
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && userData && (
          <div
            ref={profileRef}
            className="absolute top-16 right-4 bg-white shadow-lg rounded-xl w-[220px] z-50 border border-gray-200"
          >
            {/* User Info Section */}
            <div className="flex flex-col items-center px-6 py-8">
              {/* Profile Image */}
              <img
                className="w-[90px] h-[90px] rounded-full mb-4 border-4 border-gray-100 shadow-sm"
                src="https://media.istockphoto.com/id/1338289824/photo/close-up-image-of-indian-man-with-buzz-cut-hairstyle-to-disguise-receding-hairline-wearing-t.webp?a=1&b=1&s=612x612&w=0&k=20&c=_ZCZV9OPRVboaD2NxLUb7F1XdKdvyNQSYW3eyqUxzUQ=" // Replace with actual avatar URL if available
                alt="User Avatar"
              />
              {/* Dynamic User Details */}
              <h3 className="text-gray-900 font-semibold text-lg">{userData.full_name}</h3>
              <p className="text-gray-600 text-sm mt-1">{userData.email}</p>
              <p className="text-indigo-500 text-sm mt-1 font-medium">Role: {userData.roles}</p>
            </div>
          </div>
        )}

        {/* Logo in Main Content */}
        <div className="flex justify-center mb-4 mt-40">
          <img
            src={alliedLogo}c
            alt="Allied Medical Ltd Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <h1 className="text-xl font-extrabold text-gray-800 mb-4 text-center p-4">
          Allied welcomes you , let's get started on something great! 
        </h1>
        <p className="text-gray-600 font-semibold text-center">
          Use the menu to navigate through the app.
        </p>
      </div>
    </div>
  );
};

export default Menu;

import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };


  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Retrieve and parse the user data from local storage
    const storedData = localStorage.getItem("userDataDetails");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  return (
    isProfileOpen && userData && (
      <div
        ref={profileRef}
        className="absolute top-16 right-4 bg-white shadow-lg rounded-xl w-72 z-50 border border-gray-200"
      >
        {/* User Info Section */}
        <div className="flex flex-col items-center px-6 py-8">
          {/* Profile Image Placeholder */}
          <img
            className="w-[90px] h-[90px] rounded-full mb-4 border-4 border-gray-100 shadow-sm"
            src="https://via.placeholder.com/90" // Replace this with a default or actual avatar URL
            alt="User Avatar"
          />
          {/* Dynamic User Details */}
          <h3 className="text-gray-900 font-semibold text-lg">{userData.full_name}</h3>
          <p className="text-gray-600 text-sm mt-1">{userData.email}</p>
          <p className="text-indigo-500 text-sm mt-1 font-medium">Role: {userData.roles}</p>
        </div>
      </div>
    )
  );
};

export default ProfileDropdown;

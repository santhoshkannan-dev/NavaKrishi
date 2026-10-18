import { useState } from "react";

import {
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="relative">

      {/* Avatar */}
      <img
        src={user?.avatar_url || user?.avatar || "https://i.pravatar.cc/100"}
        alt="User avatar"
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full object-cover border-2 border-[#a4f792] cursor-pointer"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">

          {/* User Info */}
          <div className="p-5 border-b border-gray-100">
            
            <h3 className="font-bold text-[#012d1d] text-lg">
              {user?.first_name || user?.username || "Account"}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer"}
            </p>
          </div>

          {/* Menu */}
          <div className="py-2">

            <Link
              to="/settings"
              className="flex items-center gap-4 px-5 py-4 hover:bg-[#f5fff2] transition"
            >
              <FiUser />

              <span>Account</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-4 px-5 py-4 hover:bg-[#f5fff2] transition"
            >
              <FiSettings />

              <span>Settings</span>
            </Link>

            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-500 transition">
              
              <FiLogOut />

              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
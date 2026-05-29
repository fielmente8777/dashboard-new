import React from "react";
import { BsSearch, BsList, BsFilter } from "react-icons/bs";

const users = [
  { id: "4", name: "MANDIPSINH", color: "bg-blue-500", notifications: 4 },
  { id: "1", name: "Sourav", color: "bg-green-500", notifications: 1 },
  { id: "1", name: "Sz", color: "bg-red-500", notifications: 1 },
  { id: "1", name: "MAHI", color: "bg-purple-500", notifications: 1 },
  { id: "2", name: "pranav", color: "bg-orange-500", notifications: 2 },
  { id: "1", name: "Vasim", color: "bg-teal-500", notifications: 1 },
  { id: "3", name: "viraj", color: "bg-indigo-500", notifications: 3 },
  { id: "1", name: "Tranquilord", color: "bg-pink-500", notifications: 1 },
  { id: "1", name: "gouravson1209", color: "bg-cyan-500", notifications: 1 },
  { id: "1", name: "Kashish", color: "bg-yellow-500", notifications: 1 },
  { id: "1", name: "SaGaR", color: "bg-gray-500", notifications: 1 },
  { id: "1", name: "Shashank", color: "bg-emerald-500", notifications: 1 },
  { id: "1", name: "Mir", color: "bg-rose-500", notifications: 1 },
  { id: "1", name: "Neha", color: "bg-violet-500", notifications: 1 },
  { id: "2", name: "Mohan", color: "bg-amber-500", notifications: 2 },
  { id: "3", name: "JAMIEL", color: "bg-lime-500", notifications: 3 },
  { id: "2", name: "kateshiyad77", color: "bg-orange-600", notifications: 2 },
];

const Header = () => {
  return (
    <div className="bg-app-surface border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Search and Menu */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search name or mobile number"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm w-80"
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <BsFilter className="text-lg" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <BsList className="text-lg" />
          </button>
        </div>

        {/* Right side - User avatars */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hidden p-2">
          {users.map((user, index) => (
            <div key={index} className="relative">
              <div
                className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:scale-105 transition-transform`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.notifications && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user.notifications}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;

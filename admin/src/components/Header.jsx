import React from "react";

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Smart Tourist Safety Monitoring System
          </h1>
          <p className="text-sm text-gray-600">
            {user.role === "CentralAdmin"
              ? "Central Administration Dashboard"
              : `Police Station - ${user.jurisdiction}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, {user.name}</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { User, Bell } from "lucide-react";

export default function Dashboard({ patientName = "Patient" }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Top Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4
        flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 text-xl font-semibold">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back, {patientName} 👋
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2
              bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 bg-emerald-100 rounded-full
            flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-md p-10
          text-center max-w-md w-full">

          <div className="w-24 h-24 bg-emerald-100 rounded-full
            flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-emerald-500" />
          </div>

          <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest">
            Logged in as
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {patientName}
          </h2>

          <span className="inline-block bg-emerald-100 text-emerald-600
            text-xs font-medium px-4 py-1 rounded-full">
            Patient
          </span>
        </div>
      </main>
    </div>
  );
}
import React from 'react';
import { ArrowLeft, FileText, Calendar, User, Stethoscope, Pill, Lock, Bell } from 'lucide-react';

export function RecordDetails({ record, navigateTo }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Medical Record Details</h1>
            <p className="text-gray-500 text-sm sm:text-base">Consultation record #{record.id}</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Security Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-gray-800">Encrypted Record</p>
              <p className="text-gray-600">This record is securely encrypted</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
        </div>

        <div className="space-y-6">
          {/* Consultation Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="text-gray-800">Consultation Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-600">Date</p>
                </div>
                <p className="text-gray-900">{record.date}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-600">Doctor</p>
                </div>
                <p className="text-gray-900">{record.doctor}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-600">Consultation Type</p>
                </div>
                <p className="text-gray-900">{record.type}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-800">Diagnosis</h2>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-800">{record.diagnosis}</p>
            </div>
          </div>

          {/* Prescription */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Pill className="w-5 h-5 text-green-600" />
              <h2 className="text-gray-800">Prescription & Recommendations</h2>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-line">{record.prescription}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Download PDF
            </button>
            <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Share with Doctor
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
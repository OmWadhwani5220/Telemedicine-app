import React, { useState } from 'react';
import { ArrowLeft, FileText, Lock, Eye, Calendar, User, Bell } from 'lucide-react';

const records = [
  {
    id: '1',
    date: 'Nov 28, 2024',
    doctor: 'Dr. Sarah Johnson',
    type: 'Cardiology Consultation',
    diagnosis: 'Regular checkup - Heart function normal',
    prescription: 'Continue regular exercise and maintain healthy diet',
    status: 'Encrypted'
  },
  {
    id: '2',
    date: 'Nov 15, 2024',
    doctor: 'Dr. Michael Chen',
    type: 'General Consultation',
    diagnosis: 'Common cold with mild fever',
    prescription: 'Paracetamol 500mg - 3 times daily for 5 days, Rest and hydration',
    status: 'Encrypted'
  },
  {
    id: '3',
    date: 'Oct 22, 2024',
    doctor: 'Dr. Emily Davis',
    type: 'Dermatology Consultation',
    diagnosis: 'Mild skin allergy',
    prescription: 'Antihistamine cream - Apply twice daily, Avoid allergens',
    status: 'Encrypted'
  },
  {
    id: '4',
    date: 'Sep 10, 2024',
    doctor: 'Dr. Sarah Johnson',
    type: 'Follow-up Consultation',
    diagnosis: 'Blood pressure within normal range',
    prescription: 'Continue current medication',
    status: 'Encrypted'
  },
  {
    id: '5',
    date: 'Aug 05, 2024',
    doctor: 'Dr. Robert Wilson',
    type: 'Annual Physical Exam',
    diagnosis: 'Overall health good, minor vitamin D deficiency',
    prescription: 'Vitamin D supplements - 1000 IU daily',
    status: 'Encrypted'
  }
];

export function MedicalRecords({ navigateTo }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(record =>
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRecord = (record) => {
    navigateTo('recordDetails', { selectedRecord: record });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Medical Records</h1>
            <p className="text-gray-500 text-sm sm:text-base">Your encrypted health history</p>
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
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-800 mb-1">Secure & Encrypted</p>
            <p className="text-gray-600">All your medical records are encrypted and stored securely. Only you and authorized healthcare providers can access them.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, date, or consultation type..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-800">{record.type}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{record.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{record.doctor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-15 space-y-2">
                    <div className="flex items-start space-x-2">
                      <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{record.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleViewRecord(record)}
                  className="ml-4 flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No records found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
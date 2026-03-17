import React, { useState } from 'react';
import { Bell, User, Pill, Download, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const prescriptions = [
  {
    id: 1,
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    doctor: 'Dr. Sarah Johnson',
    date: 'Nov 28, 2024',
    status: 'Active',
    instructions: 'Take in the morning with water',
    refillsLeft: 2
  },
  {
    id: 2,
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '90 days',
    doctor: 'Dr. Michael Chen',
    date: 'Nov 15, 2024',
    status: 'Active',
    instructions: 'Take with meals',
    refillsLeft: 1
  },
  {
    id: 3,
    medication: 'Amoxicillin',
    dosage: '250mg',
    frequency: 'Three times daily',
    duration: '7 days',
    doctor: 'Dr. Emily Davis',
    date: 'Nov 10, 2024',
    status: 'Completed',
    instructions: 'Complete full course',
    refillsLeft: 0
  },
  {
    id: 4,
    medication: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    duration: '180 days',
    doctor: 'Dr. Robert Wilson',
    date: 'Oct 20, 2024',
    status: 'Active',
    instructions: 'Take with fatty meal for better absorption',
    refillsLeft: 3
  },
  {
    id: 5,
    medication: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    duration: '30 days',
    doctor: 'Dr. Sarah Johnson',
    date: 'Oct 05, 2024',
    status: 'Expired',
    instructions: 'Do not exceed 3 doses per day',
    refillsLeft: 0
  }
];

export function Prescriptions() {
  const [filter, setFilter] = useState('all');

  const filteredPrescriptions = prescriptions.filter(rx => {
    if (filter === 'all') return true;
    return rx.status.toLowerCase() === filter;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Prescriptions</h1>
            <p className="text-gray-500 text-sm sm:text-base">Manage your medications and prescriptions</p>
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
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-green-100 mb-1">Active Prescriptions</p>
            <p className="text-3xl">{prescriptions.filter(rx => rx.status === 'Active').length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 mb-1">Total Medications</p>
            <p className="text-3xl">{prescriptions.length}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-orange-100 mb-1">Refills Available</p>
            <p className="text-3xl">{prescriptions.reduce((sum, rx) => sum + rx.refillsLeft, 0)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {['all', 'active', 'completed', 'expired'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-4 ${
                  filter === f
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}{f === 'all' ? ' Prescriptions' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    rx.status === 'Active' ? 'bg-green-100' : 
                    rx.status === 'Completed' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Pill className={`w-7 h-7 ${
                      rx.status === 'Active' ? 'text-green-600' : 
                      rx.status === 'Completed' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-gray-800 mb-1">{rx.medication}</h3>
                    <p className="text-gray-500">{rx.dosage} • {rx.frequency}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  rx.status === 'Active' ? 'bg-green-100 text-green-700' :
                  rx.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {rx.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{rx.doctor}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Prescribed: {rx.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {rx.duration}</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg mb-4">
                <p className="text-purple-900">
                  <span className="font-medium">Instructions: </span>
                  {rx.instructions}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {rx.refillsLeft > 0 ? (
                    <span className="text-green-600">{rx.refillsLeft} refill{rx.refillsLeft > 1 ? 's' : ''} left</span>
                  ) : (
                    <span className="text-gray-400">No refills</span>
                  )}
                </p>
                <div className="flex space-x-2">
                  {rx.refillsLeft > 0 && rx.status === 'Active' && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Request Refill
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No prescriptions found in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}
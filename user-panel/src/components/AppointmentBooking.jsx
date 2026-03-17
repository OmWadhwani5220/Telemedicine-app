import React, { useState } from 'react';
import { ArrowLeft, Bell, Calendar, Filter, Star, Video, Clock, User } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    rating: 4.8,
    experience: '15 years',
    availability: 'Available Today',
    nextSlot: '2:00 PM',
    image: '👨‍⚕️'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'General Medicine',
    rating: 4.9,
    experience: '12 years',
    availability: 'Available Today',
    nextSlot: '3:30 PM',
    image: '👨‍⚕️'
  },
  {
    id: 3,
    name: 'Dr. Emily Davis',
    specialization: 'Dermatology',
    rating: 4.7,
    experience: '10 years',
    availability: 'Available Tomorrow',
    nextSlot: '10:00 AM',
    image: '👩‍⚕️'
  },
  {
    id: 4,
    name: 'Dr. Robert Wilson',
    specialization: 'Pediatrics',
    rating: 4.9,
    experience: '18 years',
    availability: 'Available Today',
    nextSlot: '4:00 PM',
    image: '👨‍⚕️'
  },
  {
    id: 5,
    name: 'Dr. Lisa Anderson',
    specialization: 'Psychiatry',
    rating: 4.6,
    experience: '8 years',
    availability: 'Available Tomorrow',
    nextSlot: '11:30 AM',
    image: '👩‍⚕️'
  },
  {
    id: 6,
    name: 'Dr. James Martinez',
    specialization: 'Orthopedics',
    rating: 4.8,
    experience: '20 years',
    availability: 'Available Today',
    nextSlot: '5:00 PM',
    image: '👨‍⚕️'
  }
];

const specializations = ['All', 'Cardiology', 'General Medicine', 'Dermatology', 'Pediatrics', 'Psychiatry', 'Orthopedics'];

export function AppointmentBooking({ navigateTo }) {
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedDate, setSelectedDate] = useState('today');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpec = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
    const matchesDate = selectedDate === 'all' || 
      (selectedDate === 'today' && doctor.availability === 'Available Today') ||
      (selectedDate === 'tomorrow' && doctor.availability === 'Available Tomorrow');
    return matchesSpec && matchesDate;
  });

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    setShowBookingModal(false);
    alert('Appointment booked successfully!');
    navigateTo('dashboard');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Book Appointment</h1>
            <p className="text-gray-500 text-sm sm:text-base">Choose a doctor and schedule your consultation</p>
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

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 text-sm sm:text-base">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Availability</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-gray-600 text-sm sm:text-base">Found {filteredDoctors.length} doctors</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                  {doctor.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-800 mb-1">{doctor.name}</h3>
                  <p className="text-gray-500 mb-2">{doctor.specialization}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-gray-700">{doctor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{doctor.experience} experience</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{doctor.availability}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Next slot: {doctor.nextSlot}</span>
                </div>
              </div>
              <button
                onClick={() => handleBookAppointment(doctor)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-gray-800 mb-4">Confirm Appointment</h2>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Doctor</p>
                <p className="text-gray-900">{selectedDoctor.name}</p>
                <p className="text-gray-500">{selectedDoctor.specialization}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Date & Time</p>
                <p className="text-gray-900">{selectedDoctor.availability}</p>
                <p className="text-gray-500">{selectedDoctor.nextSlot}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 mb-1">Consultation Type</p>
                <p className="text-gray-900">Video Consultation</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
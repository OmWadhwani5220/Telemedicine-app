import React, { useState } from 'react';
import { Bell, User, MessageSquare, Send, Search, Clock, CheckCheck } from 'lucide-react';

const conversations = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    lastMessage: 'Your test results look good. Keep up with your medication.',
    time: '10:30 AM',
    unread: 2,
    online: true
  },
  {
    id: 2,
    doctor: 'Dr. Michael Chen',
    specialty: 'General Medicine',
    lastMessage: 'Please schedule a follow-up appointment next week.',
    time: 'Yesterday',
    unread: 0,
    online: false
  },
  {
    id: 3,
    doctor: 'Dr. Emily Davis',
    specialty: 'Dermatology',
    lastMessage: 'The cream should be applied twice daily.',
    time: '2 days ago',
    unread: 0,
    online: true
  },
  {
    id: 4,
    doctor: 'Dr. Robert Wilson',
    specialty: 'Pediatrics',
    lastMessage: 'Thank you for updating me on your progress.',
    time: '3 days ago',
    unread: 1,
    online: false
  }
];

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const messages = [
    { sender: 'doctor', text: 'Hello! How are you feeling today?', time: '10:00 AM' },
    { sender: 'patient', text: "Hi Doctor, I'm feeling much better now.", time: '10:15 AM' },
    { sender: 'doctor', text: "That's great to hear! Have you been taking your medication regularly?", time: '10:20 AM' },
    { sender: 'patient', text: 'Yes, exactly as prescribed.', time: '10:25 AM' },
    { sender: 'doctor', text: 'Your test results look good. Keep up with your medication.', time: '10:30 AM' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Messages</h1>
            <p className="text-gray-500 text-sm sm:text-base">Chat with your healthcare providers</p>
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

      {/* Messages Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation.id === conv.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-800 truncate">{conv.doctor}</p>
                      <span className="text-gray-400 text-xs">{conv.time}</span>
                    </div>
                    <p className="text-gray-500 mb-1">{conv.specialty}</p>
                    <p className="text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-800">{selectedConversation.doctor}</p>
                  <p className="text-gray-500">{selectedConversation.specialty}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View Profile
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${msg.sender === 'patient' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.sender === 'patient'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <div className={`flex items-center space-x-1 mt-1 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{msg.time}</span>
                    {msg.sender === 'patient' && (
                      <CheckCheck className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
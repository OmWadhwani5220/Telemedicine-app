import React, { useState } from 'react';
import { ArrowLeft, Globe, User, Bell, Shield, Lock, LogOut, Save, Camera } from 'lucide-react';

export function Settings({ navigateTo, onLogout }) {
  const [language, setLanguage] = useState('english');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Settings</h1>
            <p className="text-gray-500 text-sm sm:text-base">Manage your account and preferences</p>
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
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-800">Profile Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>Change Photo</span>
                </button>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input type="text" defaultValue="John Smith" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email Address</label>
                <input type="email" defaultValue="john.smith@email.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date of Birth</label>
                <input type="date" defaultValue="1990-01-15" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="w-5 h-5 text-green-600" />
              <h2 className="text-gray-800">Language Preferences</h2>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Select Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="spanish">Spanish (Español)</option>
                <option value="french">French (Français)</option>
              </select>
              <p className="text-gray-500 mt-2">Changes will take effect after saving</p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-gray-800">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive appointment reminders via email', value: emailNotifications, setter: setEmailNotifications },
                { label: 'Push Notifications', desc: 'Receive notifications in your browser', value: pushNotifications, setter: setPushNotifications },
                { label: 'SMS Notifications', desc: 'Receive text messages for urgent updates', value: smsNotifications, setter: setSmsNotifications },
              ].map(({ label, desc, value, setter }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-800">{label}</p>
                    <p className="text-gray-500">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="text-gray-800">Security & Privacy</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: Lock, label: 'Change Password' },
                { icon: Shield, label: 'Two-Factor Authentication' },
                { icon: Lock, label: 'Privacy Settings' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">{label}</span>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSaveSettings}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
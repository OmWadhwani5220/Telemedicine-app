import React, { useState } from 'react';
import { ArrowLeft, Activity, AlertCircle, CheckCircle, Stethoscope, Bell, User } from 'lucide-react';

const commonSymptoms = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
  'Body Aches', 'Shortness of Breath', 'Nausea', 'Dizziness', 'Chest Pain'
];

export function SymptomChecker({ navigateTo }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [prediction, setPrediction] = useState(null);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handlePredict = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }
    setPrediction({
      condition: 'Common Cold',
      confidence: '85%',
      severity: 'Mild',
      recommendations: [
        'Rest and stay hydrated',
        'Take over-the-counter pain relievers if needed',
        'Monitor symptoms for any worsening',
        'Consult a doctor if symptoms persist beyond 7 days'
      ]
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">Symptom Checker</h1>
            <p className="text-gray-500 text-sm sm:text-base">Select your symptoms to get insights</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-800 text-lg sm:text-xl">Select Symptoms</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                      selectedSymptoms.includes(symptom)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{symptom}</span>
                      {selectedSymptoms.includes(symptom) && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-gray-800 mb-4">Additional Information</h2>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Describe any other symptoms or concerns..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handlePredict}
              disabled={selectedSymptoms.length === 0}
              className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Stethoscope className="w-5 h-5" />
              <span>Predict Condition</span>
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {prediction ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    <h2 className="text-gray-800">Prediction Result</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-600 mb-1">Possible Condition</p>
                      <p className="text-gray-900">{prediction.condition}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 mb-1">Confidence</p>
                        <p className="text-gray-900">{prediction.confidence}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-600 mb-1">Severity</p>
                        <p className="text-gray-900">{prediction.severity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-gray-800 mb-4">Recommendations</h2>
                  <ul className="space-y-3">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigateTo('appointments')}
                  className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Stethoscope className="w-5 h-5" />
                  <span>Consult a Doctor</span>
                </button>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select symptoms and click Predict</p>
                  <p>to see results here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
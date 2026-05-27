'use client';
import { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const RISK_COLORS = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
};

const FIELD_DESCRIPTIONS = {
  tenure: 'Customer lifetime in months',
  MonthlyCharges: 'Current monthly subscription cost',
  TotalCharges: 'Total amount paid to date',
  Contract: 'Contract type commitment period',
  InternetService: 'Internet service provider type',
  PaymentMethod: 'Preferred payment method',
  SeniorCitizen: 'Whether customer is a senior citizen',
};

// ✅ FIXED: All options match IBM Telco dataset exactly
const DROPDOWN_OPTIONS = {
  Contract: ['Month-to-month', 'One year', 'Two year'],
  InternetService: ['Fiber optic', 'DSL', 'No'],
  PaymentMethod: [
    'Electronic check',
    'Mailed check',
    'Bank transfer (automatic)',
    'Credit card (automatic)',
  ],
  SeniorCitizen: ['No', 'Yes'],
};

const FormField = ({ label, name, type = 'text', formData, handleChange }) => {
  const options = DROPDOWN_OPTIONS[name] || null;
  const description = FIELD_DESCRIPTIONS[name] || '';

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {description && (
          <span className="text-xs text-gray-500 italic">({description})</span>
        )}
      </div>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 hover:border-blue-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 hover:border-blue-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
      )}
    </div>
  );
};

export default function Home() {
  const [formData, setFormData] = useState({
    tenure: 12,
    MonthlyCharges: 80,
    TotalCharges: 960,
    Contract: 'Month-to-month',
    InternetService: 'Fiber optic',
    PaymentMethod: 'Electronic check',
    SeniorCitizen: 'No',
  });

  const [prediction, setPrediction] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null); // ✅ Clear previous prediction before new one

    try {
      // ✅ FIXED: Convert SeniorCitizen "Yes"/"No" to 1/0 for API
      const payload = {
        ...formData,
        tenure: Number(formData.tenure),
        MonthlyCharges: Number(formData.MonthlyCharges),
        TotalCharges: Number(formData.TotalCharges),
        SeniorCitizen: formData.SeniorCitizen === 'Yes' ? 1 : 0,
      };

      console.log('Sending payload:', payload); // Debug log

      const res = await axios.post(`${API_URL}/predict`, payload);
      setPrediction(res.data);
      setPredictions(prev => [
        { ...res.data, timestamp: new Date().toLocaleTimeString(), inputs: { ...formData } },
        ...prev,
      ]);
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Prediction failed. Is the backend running?');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setPrediction(null);
    setError(null);
    setFormData({
      tenure: 12,
      MonthlyCharges: 80,
      TotalCharges: 960,
      Contract: 'Month-to-month',
      InternetService: 'Fiber optic',
      PaymentMethod: 'Electronic check',
      SeniorCitizen: 'No',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🧠 Churn Prediction Platform
              </h1>
              <p className="text-gray-400 mt-1">AI-powered customer retention analytics</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Predictions: <span className="font-bold text-blue-400">{predictions.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {['single', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'single' ? 'Single Prediction' : `Prediction History (${predictions.length})`}
            </button>
          ))}
        </div>

        {/* Single Prediction Tab */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Input Form */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-blue-400">📋</span> Customer Details
              </h2>

              <FormField label="Tenure (months)" name="tenure" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Monthly Charges ($)" name="MonthlyCharges" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Total Charges ($)" name="TotalCharges" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Contract Type" name="Contract" formData={formData} handleChange={handleChange} />
              <FormField label="Internet Service" name="InternetService" formData={formData} handleChange={handleChange} />
              <FormField label="Payment Method" name="PaymentMethod" formData={formData} handleChange={handleChange} />
              <FormField label="Senior Citizen" name="SeniorCitizen" formData={formData} handleChange={handleChange} />

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Analyzing...
                    </span>
                  ) : '🔮 Predict Churn Risk'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  ↺ Reset
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  <p className="font-semibold">⚠️ Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Prediction Result */}
            <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-purple-400">📊</span> Prediction Result
              </h2>

              {!prediction ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-400 text-lg">
                    Fill in the customer details and click &quot;Predict Churn Risk&quot; to see the analysis
                  </p>
                </div>
              ) : (
                <>
                  {/* Risk Badge */}
                  <div
                    className="text-center p-8 rounded-2xl mb-6 border-2 transition-all"
                    style={{
                      backgroundColor: RISK_COLORS[prediction.risk_level] + '15',
                      borderColor: RISK_COLORS[prediction.risk_level],
                    }}
                  >
                    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Churn Risk Assessment
                    </p>
                    <p className="text-6xl font-black my-4"
                       style={{ color: RISK_COLORS[prediction.risk_level] }}>
                      {prediction.risk_level}
                    </p>
                    <p className="text-3xl font-bold text-gray-300">
                      {(prediction.churn_probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400 mt-1">probability of churning</p>
                    <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${prediction.churn_probability * 100}%`,
                          backgroundColor: RISK_COLORS[prediction.risk_level],
                        }}
                      />
                    </div>
                  </div>

                  {/* SHAP Chart */}
                  {prediction.top_reasons?.length > 0 && (
                    <>
                      <h3 className="font-bold text-lg text-gray-300 mb-4">
                        📈 Top Contributing Factors
                      </h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={prediction.top_reasons.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="feature"
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            angle={-30}
                            height={70}
                          />
                          <YAxis tick={{ fill: '#9ca3af' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #4b5563',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                          <Bar dataKey="importance" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Retention Strategy */}
                      <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/30">
                        <h4 className="font-semibold text-yellow-400 mb-3">
                          💡 Recommended Retention Strategy
                        </h4>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {prediction.risk_level === 'High' &&
                            '⚡ URGENT: Immediate outreach required. Offer 20–30% discount with contract extension. Assign dedicated account manager within 24 hours.'}
                          {prediction.risk_level === 'Medium' &&
                            '📧 Send personalized retention email with exclusive loyalty rewards. Offer 15% service discount for 12-month contract upgrade. Follow up within 48 hours.'}
                          {prediction.risk_level === 'Low' &&
                            '✅ Customer is stable. Continue regular engagement. Monitor satisfaction metrics monthly and proactively offer new features.'}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Prediction History</h2>
            {predictions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No predictions yet. Make your first prediction to see history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-all"
                  >
                    <div>
                      <p className="text-sm text-gray-400">Prediction #{predictions.length - idx}</p>
                      <p className="font-semibold">
                        Risk:{' '}
                        <span style={{ color: RISK_COLORS[pred.risk_level] }}>
                          {pred.risk_level}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Contract: {pred.inputs?.Contract} | Internet: {pred.inputs?.InternetService}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {(pred.churn_probability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-400">{pred.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-12 py-6 px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>🤖 Powered by Machine Learning | Real-time Churn Prediction & Customer Retention Analytics</p>
        </div>
      </div>
    </div>
  );
}
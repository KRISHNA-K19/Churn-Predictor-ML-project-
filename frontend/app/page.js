'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
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

const FIELD_DESCRIPTIONS = {
  tenure: 'Customer lifetime in months',
  MonthlyCharges: 'Current monthly subscription cost',
  TotalCharges: 'Total amount paid to date',
  Contract: 'Contract type commitment period',
  InternetService: 'Internet service provider type',
  PaymentMethod: 'Preferred payment method',
  SeniorCitizen: 'Whether customer is a senior citizen',
};

const FormField = ({ label, name, type = 'text', formData, handleChange }) => {
  const options = DROPDOWN_OPTIONS[name] || null;
  const description = FIELD_DESCRIPTIONS[name] || '';
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {description && <span className="text-xs text-gray-500 italic">({description})</span>}
      </div>
      {options ? (
        <select name={name} value={formData[name]} onChange={handleChange}
          className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 hover:border-blue-500 focus:outline-none focus:border-blue-400 transition-all">
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={formData[name]} onChange={handleChange}
          className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 hover:border-blue-500 focus:outline-none focus:border-blue-400 transition-all" />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// REVENUE IMPACT CALCULATOR COMPONENT
// ─────────────────────────────────────────────
const RevenueCalculator = () => {
  const reportRef = useRef(null);

  const [inputs, setInputs] = useState({
    totalCustomers: 10000,
    avgRevenue: 800,
    churnRate: 26,
    aiImprovement: 20,
    platformCost: 0,
  });

  const [results, setResults] = useState(null);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  const calculate = () => {
    const total = Number(inputs.totalCustomers);
    const revenue = Number(inputs.avgRevenue);
    const churnRate = Number(inputs.churnRate) / 100;
    const improvement = Number(inputs.aiImprovement) / 100;
    const platformCost = Number(inputs.platformCost);

    const customersAtRisk = Math.round(total * churnRate);
    const revenueAtRiskMonthly = customersAtRisk * revenue;
    const revenueAtRiskYearly = revenueAtRiskMonthly * 12;

    const customersSaved = Math.round(customersAtRisk * improvement);
    const revenueSavedMonthly = customersSaved * revenue;
    const revenueSavedYearly = revenueSavedMonthly * 12;

    const annualPlatformCost = platformCost * 12;
    const netSavings = revenueSavedYearly - annualPlatformCost;
    const roi = annualPlatformCost > 0
      ? ((netSavings / annualPlatformCost) * 100).toFixed(0)
      : '∞';

    const paybackMonths = annualPlatformCost > 0
      ? Math.ceil(annualPlatformCost / (revenueSavedMonthly))
      : 0;

    setResults({
      customersAtRisk,
      revenueAtRiskMonthly,
      revenueAtRiskYearly,
      customersSaved,
      revenueSavedMonthly,
      revenueSavedYearly,
      netSavings,
      roi,
      paybackMonths,
      annualPlatformCost,
    });
  };

  const downloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('churn-revenue-impact-report.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-green-400">💰</span> Revenue Impact Calculator
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter your business numbers to see how much revenue you can save with AI-powered churn prediction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Total Customers', key: 'totalCustomers', suffix: 'customers', icon: '👥' },
            { label: 'Avg Revenue per Customer/Month', key: 'avgRevenue', suffix: '₹/month', icon: '💵' },
            { label: 'Current Churn Rate', key: 'churnRate', suffix: '%', icon: '📉' },
            { label: 'Expected AI Improvement', key: 'aiImprovement', suffix: '%', icon: '🤖' },
            { label: 'Platform Cost/Month (₹)', key: 'platformCost', suffix: '₹/month', icon: '💻' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                <span>{field.icon}</span> {field.label}
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={inputs[field.key]}
                  onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 hover:border-green-500 focus:outline-none focus:border-green-400 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">{field.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={calculate}
          className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          📊 Calculate Revenue Impact
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <>
          <div ref={reportRef} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">

            {/* Report Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">📋 Revenue Impact Report</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Powered by</p>
                <p className="text-blue-400 font-bold">Churn Prediction Platform</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Customers at Risk',
                  value: results.customersAtRisk.toLocaleString('en-IN'),
                  sub: 'per year',
                  color: 'red',
                  icon: '⚠️',
                },
                {
                  label: 'Revenue at Risk',
                  value: formatCurrency(results.revenueAtRiskYearly),
                  sub: 'per year',
                  color: 'red',
                  icon: '📉',
                },
                {
                  label: 'Customers Saved',
                  value: results.customersSaved.toLocaleString('en-IN'),
                  sub: 'with AI platform',
                  color: 'green',
                  icon: '✅',
                },
                {
                  label: 'Revenue Saved',
                  value: formatCurrency(results.revenueSavedYearly),
                  sub: 'per year',
                  color: 'green',
                  icon: '💰',
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 border ${
                    metric.color === 'red'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <p className="text-2xl mb-1">{metric.icon}</p>
                  <p className={`text-2xl font-black ${metric.color === 'red' ? 'text-red-400' : 'text-green-400'}`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{metric.label}</p>
                  <p className="text-xs text-gray-500">{metric.sub}</p>
                </div>
              ))}
            </div>

            {/* ROI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 text-center">
                <p className="text-4xl font-black text-blue-400">{results.roi}%</p>
                <p className="text-sm text-gray-400 mt-1">Return on Investment</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 text-center">
                <p className="text-4xl font-black text-purple-400">
                  {formatCurrency(results.netSavings)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Net Annual Savings</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-center">
                <p className="text-4xl font-black text-yellow-400">
                  {results.paybackMonths > 0 ? `${results.paybackMonths} mo` : 'Immediate'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Payback Period</p>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-200 mb-4">📊 Monthly Breakdown</h4>
              <div className="space-y-3">
                {[
                  { label: 'Customers lost per month (without AI)', value: Math.round(results.customersAtRisk / 12), unit: 'customers', color: 'text-red-400' },
                  { label: 'Revenue lost per month (without AI)', value: formatCurrency(results.revenueAtRiskMonthly), unit: '', color: 'text-red-400' },
                  { label: 'Customers retained per month (with AI)', value: Math.round(results.customersSaved / 12), unit: 'customers', color: 'text-green-400' },
                  { label: 'Revenue retained per month (with AI)', value: formatCurrency(results.revenueSavedMonthly), unit: '', color: 'text-green-400' },
                  { label: 'Platform cost per month', value: formatCurrency(Number(inputs.platformCost)), unit: '', color: 'text-gray-400' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-600 pb-2">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className={`font-bold ${row.color}`}>{row.value} {row.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Recommendation */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
              <h4 className="font-bold text-blue-400 mb-3">💡 Business Recommendation</h4>
              <p className="text-gray-200 text-sm leading-relaxed">
                Based on your inputs, your business is currently losing{' '}
                <span className="text-red-400 font-bold">{formatCurrency(results.revenueAtRiskYearly)}</span> annually
                due to customer churn. By implementing AI-powered churn prediction, you can retain an estimated{' '}
                <span className="text-green-400 font-bold">{results.customersSaved.toLocaleString('en-IN')} customers</span>,
                saving <span className="text-green-400 font-bold">{formatCurrency(results.revenueSavedYearly)}</span> per year.
                {Number(inputs.platformCost) > 0
                  ? ` With a platform cost of ${formatCurrency(Number(inputs.platformCost))}/month, your ROI is ${results.roi}% with a payback period of just ${results.paybackMonths} months.`
                  : ' The platform pays for itself immediately with zero additional cost.'}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadPDF}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            📥 Download PDF Report
          </button>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN HOME COMPONENT
// ─────────────────────────────────────────────
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
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
      } else {
        setPredictions(data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => { await fetchHistory(); };
    loadHistory();
  }, [fetchHistory]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const payload = {
        ...formData,
        tenure: Number(formData.tenure),
        MonthlyCharges: Number(formData.MonthlyCharges),
        TotalCharges: Number(formData.TotalCharges),
        SeniorCitizen: formData.SeniorCitizen === 'Yes' ? 1 : 0,
      };
      const res = await axios.post(`${API_URL}/predict`, payload);
      const result = res.data;
      setPrediction(result);
      const { data, error: dbError } = await supabase
        .from('predictions')
        .insert([{
          churn_probability: result.churn_probability,
          risk_level: result.risk_level,
          tenure: Number(formData.tenure),
          monthly_charges: Number(formData.MonthlyCharges),
          total_charges: Number(formData.TotalCharges),
          contract: formData.Contract,
          internet_service: formData.InternetService,
          payment_method: formData.PaymentMethod,
          senior_citizen: formData.SeniorCitizen === 'Yes' ? 1 : 0,
          top_reasons: result.top_reasons,
        }])
        .select();
      if (dbError) {
        console.error('Supabase insert error:', dbError);
      } else {
        console.log('Saved to database:', data);
        await fetchHistory();
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
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

  const TABS = [
    { key: 'single', label: 'Single Prediction' },
    { key: 'simulator', label: '🔬 Simulator' },
    { key: 'bulk', label: '📂 Bulk Upload' },
    { key: 'revenue', label: '💰 Revenue Calculator' },
    { key: 'history', label: `📋 History (${predictions.length})` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🧠 Churn Prediction Platform
            </h1>
            <p className="text-gray-400 mt-1">AI-powered customer retention analytics</p>
          </div>
          <p className="text-sm text-gray-500">
            Total Predictions: <span className="font-bold text-blue-400">{predictions.length}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Single Prediction Tab */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-blue-400">📋</span> Customer Details
              </h2>
              <FormField label="Tenure (months)" name="tenure" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Monthly Charges (₹)" name="MonthlyCharges" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Total Charges (₹)" name="TotalCharges" type="number" formData={formData} handleChange={handleChange} />
              <FormField label="Contract Type" name="Contract" formData={formData} handleChange={handleChange} />
              <FormField label="Internet Service" name="InternetService" formData={formData} handleChange={handleChange} />
              <FormField label="Payment Method" name="PaymentMethod" formData={formData} handleChange={handleChange} />
              <FormField label="Senior Citizen" name="SeniorCitizen" formData={formData} handleChange={handleChange} />
              <div className="flex gap-3 mt-6">
                <button onClick={handlePredict} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Analyzing...</span>
                    : '🔮 Predict Churn Risk'}
                </button>
                <button onClick={resetForm}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all">
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

            <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-purple-400">📊</span> Prediction Result
              </h2>
              {!prediction ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-400 text-lg">Fill in the customer details and click &quot;Predict Churn Risk&quot;</p>
                </div>
              ) : (
                <>
                  <div className="text-center p-8 rounded-2xl mb-6 border-2"
                    style={{ backgroundColor: RISK_COLORS[prediction.risk_level] + '15', borderColor: RISK_COLORS[prediction.risk_level] }}>
                    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Churn Risk Assessment</p>
                    <p className="text-6xl font-black my-4" style={{ color: RISK_COLORS[prediction.risk_level] }}>{prediction.risk_level}</p>
                    <p className="text-3xl font-bold text-gray-300">{(prediction.churn_probability * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-400 mt-1">probability of churning</p>
                    <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full transition-all duration-500"
                        style={{ width: `${prediction.churn_probability * 100}%`, backgroundColor: RISK_COLORS[prediction.risk_level] }} />
                    </div>
                  </div>
                  {prediction.top_reasons?.length > 0 && (
                    <>
                      <h3 className="font-bold text-lg text-gray-300 mb-4">📈 Top Contributing Factors</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={prediction.top_reasons.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="feature" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-30} height={70} />
                          <YAxis tick={{ fill: '#9ca3af' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', color: '#fff' }} />
                          <Bar dataKey="importance" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/30">
                        <h4 className="font-semibold text-yellow-400 mb-3">💡 Recommended Retention Strategy</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {prediction.risk_level === 'High' && '⚡ URGENT: Immediate outreach required. Offer 20–30% discount with contract extension. Assign dedicated account manager within 24 hours.'}
                          {prediction.risk_level === 'Medium' && '📧 Send personalized retention email with exclusive loyalty rewards. Offer 15% service discount for 12-month contract upgrade. Follow up within 48 hours.'}
                          {prediction.risk_level === 'Low' && '✅ Customer is stable. Continue regular engagement. Monitor satisfaction metrics monthly.'}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Simulator Tab - Coming Soon */}
        {activeTab === 'simulator' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-16 border border-gray-700 shadow-2xl text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h2 className="text-2xl font-bold text-white mb-2">Churn Prevention Simulator</h2>
            <p className="text-gray-400">Coming soon — simulate &quot;What if we change X?&quot; scenarios</p>
          </div>
        )}

        {/* Bulk Upload Tab - Coming Soon */}
        {activeTab === 'bulk' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-16 border border-gray-700 shadow-2xl text-center">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-2xl font-bold text-white mb-2">Bulk CSV Upload</h2>
            <p className="text-gray-400">Coming soon — predict churn for hundreds of customers at once</p>
          </div>
        )}

        {/* Revenue Calculator Tab */}
        {activeTab === 'revenue' && <RevenueCalculator />}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Prediction History</h2>
              <button onClick={fetchHistory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all">
                🔄 Refresh
              </button>
            </div>
            {loadingHistory ? (
              <div className="text-center py-12"><p className="text-gray-400">Loading history from database...</p></div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12"><p className="text-gray-500 text-lg">No predictions yet. Make your first prediction!</p></div>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div key={pred.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-all">
                    <div>
                      <p className="text-sm text-gray-400">#{predictions.length - idx} · {new Date(pred.created_at).toLocaleString()}</p>
                      <p className="font-semibold mt-1">Risk: <span style={{ color: RISK_COLORS[pred.risk_level] }}>{pred.risk_level}</span></p>
                      <p className="text-xs text-gray-400 mt-1">Contract: {pred.contract} · Internet: {pred.internet_service} · Tenure: {pred.tenure} months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: RISK_COLORS[pred.risk_level] }}>{(pred.churn_probability * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-400 mt-1">₹{pred.monthly_charges}/month</p>
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
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IndianRupee, 
  Calculator, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  Download, 
  Phone, 
  MessageCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Building2,
  Mail,
  FileSpreadsheet
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function LoanCalculatorPage() {
  // Eligibility State
  const [income, setIncome] = useState(100000);
  const [existingEmi, setExistingEmi] = useState(0);
  const [eligibilityTenure, setEligibilityTenure] = useState(20);
  const [eligibilityRate, setEligibilityRate] = useState(8.5);

  // EMI Calculator State
  const [propertyValue, setPropertyValue] = useState(10000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [emiTenure, setEmiTenure] = useState(20);
  const [emiRate, setEmiRate] = useState(8.5);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Calculations for Eligibility
  const eligibilityResults = useMemo(() => {
    const eligibleMonthlyEmi = (income * 0.50) - existingEmi;
    const r = eligibilityRate / 1200;
    const n = eligibilityTenure * 12;
    
    let maxLoan = 0;
    if (eligibleMonthlyEmi > 0) {
      maxLoan = eligibleMonthlyEmi * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
    }

    const totalPayable = eligibleMonthlyEmi * n;
    const totalInterest = totalPayable - maxLoan;

    let meter = "Poor";
    if (income >= 150000 && existingEmi / income < 0.2) meter = "Excellent";
    else if (income >= 80000 && existingEmi / income < 0.35) meter = "Good";
    else if (income >= 40000 && existingEmi / income < 0.45) meter = "Fair";

    return {
      maxLoan,
      monthlyEmi: Math.max(0, eligibleMonthlyEmi),
      totalInterest: Math.max(0, totalInterest),
      totalPayable: Math.max(0, totalPayable),
      meter
    };
  }, [income, existingEmi, eligibilityTenure, eligibilityRate]);

  // Calculations for EMI
  const emiResults = useMemo(() => {
    const loanAmount = propertyValue * (1 - downPaymentPercent / 100);
    const r = emiRate / 1200;
    const n = emiTenure * 12;
    
    const monthlyEmi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = monthlyEmi * n;
    const totalInterest = totalPayable - loanAmount;

    // Amortization Schedule (Yearly)
    const schedule = [];
    let remainingBalance = loanAmount;
    for (let year = 1; year <= emiTenure; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      for (let month = 1; month <= 12; month++) {
        const interest = remainingBalance * r;
        const principal = monthlyEmi - interest;
        yearlyInterest += interest;
        yearlyPrincipal += principal;
        remainingBalance -= principal;
      }
      schedule.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, remainingBalance)
      });
    }

    return {
      loanAmount,
      monthlyEmi,
      totalInterest,
      totalPayable,
      schedule
    };
  }, [propertyValue, downPaymentPercent, emiTenure, emiRate]);

  const doughnutData = {
    labels: ['Principal Loan Amount', 'Total Interest'],
    datasets: [
      {
        data: [emiResults.loanAmount, emiResults.totalInterest],
        backgroundColor: ['#0F172A', '#C5A059'],
        borderColor: ['#0F172A', '#C5A059'],
        borderWidth: 1,
      },
    ],
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Elite Properties - Home Loan EMI Schedule', 14, 22);
    doc.setFontSize(12);
    doc.text(`Property Value: ${formatCurrency(propertyValue)}`, 14, 32);
    doc.text(`Loan Amount: ${formatCurrency(emiResults.loanAmount)}`, 14, 40);
    doc.text(`Interest Rate: ${emiRate}%`, 14, 48);
    doc.text(`Tenure: ${emiTenure} Years`, 14, 56);
    doc.text(`Monthly EMI: ${formatCurrency(emiResults.monthlyEmi)}`, 14, 64);

    const tableData = emiResults.schedule.map(row => [
      row.year,
      formatCurrency(row.principal),
      formatCurrency(row.interest),
      formatCurrency(row.balance)
    ]);

    autoTable(doc, {
      head: [['Year', 'Principal Paid', 'Interest Paid', 'Remaining Balance']],
      body: tableData,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`EMI_Schedule_${new Date().getTime()}.pdf`);
  };
  
  const downloadCSV = () => {
    const csvData = emiResults.schedule.map(row => ({
      'Year': row.year,
      'Principal Paid (INR)': row.principal.toFixed(2),
      'Interest Paid (INR)': row.interest.toFixed(2),
      'Remaining Balance (INR)': row.balance.toFixed(2)
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `EMI_Schedule_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmailSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-loan-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          loanAmount: formatCurrency(emiResults.loanAmount),
          emi: formatCurrency(emiResults.monthlyEmi),
          tenure: emiTenure,
          rate: emiRate,
          totalInterest: formatCurrency(emiResults.totalInterest),
          totalPayable: formatCurrency(emiResults.totalPayable)
        })
      });

      if (response.ok) {
        toast.success('Loan schedule sent to your email!');
        setEmail('');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
          >
            Financial Planning
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-bold text-primary mb-6"
          >
            Home Loan <span className="text-accent italic">Calculator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary/60 max-w-2xl mx-auto text-lg"
          >
            Plan your dream home with precision. Calculate your eligibility and EMIs with our advanced financial tools.
          </motion.p>
        </div>

        {/* SECTION 1: LOAN ELIGIBILITY */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-primary text-accent rounded-full flex items-center justify-center shadow-xl">
              <TrendingUp size={24} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">Loan Eligibility Checker</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Inputs */}
            <div className="lg:col-span-2 space-y-10 bg-gray-50 p-8 md:p-12 rounded-sm border border-gray-100 shadow-sm">
              <div className="grid md:grid-cols-2 gap-10">
                {/* Monthly Income */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary/50 block">Monthly Income (₹)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="20000" max="1000000" step="5000" 
                      value={income} onChange={(e) => setIncome(Number(e.target.value))}
                      className="flex-grow accent-accent h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="relative shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input 
                        type="number" 
                        value={income} 
                        onChange={(e) => setIncome(Number(e.target.value))}
                        className="w-32 bg-white border border-gray-200 rounded-sm pl-6 pr-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Existing EMIs */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary/50 block">Existing EMIs (₹)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="100000" step="1000" 
                      value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))}
                      className="flex-grow accent-accent h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="relative shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input 
                        type="number" 
                        value={existingEmi} 
                        onChange={(e) => setExistingEmi(Number(e.target.value))}
                        className="w-32 bg-white border border-gray-200 rounded-sm pl-6 pr-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {/* Tenure */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary/50 block">Tenure (Years)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="5" max="30" step="1" 
                      value={eligibilityTenure} onChange={(e) => setEligibilityTenure(Number(e.target.value))}
                      className="flex-grow accent-accent h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="relative shrink-0">
                      <input 
                        type="number" 
                        value={eligibilityTenure} 
                        onChange={(e) => setEligibilityTenure(Number(e.target.value))}
                        className="w-20 bg-white border border-gray-200 rounded-sm px-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400 uppercase">Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary/50 block">Interest Rate (%)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="6.5" max="14" step="0.1" 
                      value={eligibilityRate} onChange={(e) => setEligibilityRate(Number(e.target.value))}
                      className="flex-grow accent-accent h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="relative shrink-0">
                      <input 
                        type="number" 
                        value={eligibilityRate} 
                        onChange={(e) => setEligibilityRate(Number(e.target.value))}
                        className="w-20 bg-white border border-gray-200 rounded-sm px-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400 uppercase">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-6">
              <motion.div 
                key={eligibilityResults.maxLoan}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-primary p-8 rounded-sm shadow-2xl border-l-4 border-accent"
              >
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-2">Maximum Loan Eligibility</p>
                <h3 className="text-4xl font-serif font-bold text-accent">{formatCurrency(eligibilityResults.maxLoan)}</h3>
              </motion.div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-1">Monthly EMI</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(eligibilityResults.monthlyEmi)}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-1">Total Interest</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(eligibilityResults.totalInterest)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Eligibility Score</p>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    eligibilityResults.meter === 'Excellent' ? 'bg-green-500 text-white' :
                    eligibilityResults.meter === 'Good' ? 'bg-blue-500 text-white' :
                    eligibilityResults.meter === 'Fair' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                  )}>
                    {eligibilityResults.meter}
                  </span>
                </div>
                <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1 p-1">
                  <div className={cn("h-full flex-grow rounded-full transition-all duration-700", eligibilityResults.meter === 'Poor' ? 'bg-red-500' : 'bg-gray-300')} />
                  <div className={cn("h-full flex-grow rounded-full transition-all duration-700 delay-75", eligibilityResults.meter === 'Fair' ? 'bg-amber-500' : eligibilityResults.meter === 'Good' || eligibilityResults.meter === 'Excellent' ? 'bg-amber-500' : 'bg-gray-300')} />
                  <div className={cn("h-full flex-grow rounded-full transition-all duration-700 delay-150", eligibilityResults.meter === 'Good' ? 'bg-blue-500' : eligibilityResults.meter === 'Excellent' ? 'bg-blue-500' : 'bg-gray-300')} />
                  <div className={cn("h-full flex-grow rounded-full transition-all duration-700 delay-300", eligibilityResults.meter === 'Excellent' ? 'bg-green-500' : 'bg-gray-300')} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[8px] font-black text-gray-300 uppercase">Poor</span>
                  <span className="text-[8px] font-black text-gray-300 uppercase">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EMI CALCULATOR */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-primary text-accent rounded-full flex items-center justify-center shadow-xl">
              <Calculator size={24} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">EMI Calculator</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Inputs */}
            <div className="lg:col-span-7 space-y-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest block">Property Value</label>
                    <div className="flex items-center gap-6">
                      <input 
                        type="range" min="1000000" max="500000000" step="500000" 
                        value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))}
                        className="flex-grow accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="relative shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input 
                          type="number" 
                          value={propertyValue} 
                          onChange={(e) => setPropertyValue(Number(e.target.value))}
                          className="w-40 bg-white border border-gray-200 rounded-sm pl-6 pr-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest block">Down Payment (%)</label>
                    <div className="flex items-center gap-6">
                      <input 
                        type="range" min="10" max="90" step="5" 
                        value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="flex-grow accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="relative shrink-0">
                        <input 
                          type="number" 
                          value={downPaymentPercent} 
                          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                          className="w-24 bg-white border border-gray-200 rounded-sm px-3 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all text-center"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Amount: <span className="text-primary">{formatCurrency(propertyValue * downPaymentPercent / 100)}</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-primary uppercase tracking-widest block">Tenure (Years)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="30" step="1" 
                          value={emiTenure} onChange={(e) => setEmiTenure(Number(e.target.value))}
                          className="flex-grow accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input 
                          type="number" 
                          value={emiTenure} 
                          onChange={(e) => setEmiTenure(Number(e.target.value))}
                          className="w-16 bg-white border border-gray-200 rounded-sm px-2 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all text-center"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-primary uppercase tracking-widest block">Interest Rate (%)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="6.5" max="15" step="0.1" 
                          value={emiRate} onChange={(e) => setEmiRate(Number(e.target.value))}
                          className="flex-grow accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input 
                          type="number" 
                          value={emiRate} 
                          onChange={(e) => setEmiRate(Number(e.target.value))}
                          className="w-16 bg-white border border-gray-200 rounded-sm px-2 py-2 text-sm font-bold text-primary focus:border-accent outline-none transition-all text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              <div className="bg-gray-50 p-8 rounded-sm border border-gray-100 grid md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2">Monthly EMI</p>
                  <p className="text-2xl font-serif font-bold text-primary">{formatCurrency(emiResults.monthlyEmi)}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2">Total Interest</p>
                  <p className="text-2xl font-serif font-bold text-primary">{formatCurrency(emiResults.totalInterest)}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2">Total Payable</p>
                  <p className="text-2xl font-serif font-bold text-primary">{formatCurrency(emiResults.totalPayable)}</p>
                </div>
              </div>
            </div>

            {/* Visuals */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gray-50 p-8 rounded-sm border border-gray-100">
              <div className="w-full max-w-[300px] mb-8">
                <Doughnut 
                  data={doughnutData} 
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: { family: 'Inter', size: 10, weight: 'bold' },
                          usePointStyle: true,
                          padding: 20
                        }
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={downloadPDF}
                    className="flex-1 bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-accent hover:text-primary transition-all shadow-lg"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                  <button 
                    onClick={downloadCSV}
                    className="flex-1 bg-white border border-gray-200 text-primary py-4 rounded-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <FileSpreadsheet size={16} />
                    CSV
                  </button>
                </div>

                <form onSubmit={sendEmailSchedule} className="space-y-3 pt-4 border-t border-gray-200">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 text-center">Email me this schedule</p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow bg-white border border-gray-200 rounded-sm px-4 py-3 text-xs focus:border-accent outline-none"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={isSending}
                      className="bg-accent text-primary px-4 rounded-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      <Mail size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Amortization Table */}
          <div className="mt-12">
            <button 
              onClick={() => setIsTableOpen(!isTableOpen)}
              className="w-full bg-gray-50 border border-gray-100 p-6 flex justify-between items-center group hover:bg-white transition-all"
            >
              <div className="flex items-center gap-4">
                <TableIcon className="text-accent" size={20} />
                <span className="font-serif text-xl font-bold text-primary">Yearly Amortization Schedule</span>
              </div>
              {isTableOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            <AnimatePresence>
              {isTableOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto border-x border-b border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Year</th>
                          <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Principal Paid</th>
                          <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Interest Paid</th>
                          <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiResults.schedule.map((row) => (
                          <tr key={row.year} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                            <td className="p-4 font-bold text-primary text-sm">Year {row.year}</td>
                            <td className="p-4 text-gray-600 text-sm">{formatCurrency(row.principal)}</td>
                            <td className="p-4 text-gray-600 text-sm">{formatCurrency(row.interest)}</td>
                            <td className="p-4 font-bold text-primary text-sm">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SECTION 3: BANK RATES TABLE */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-primary text-accent rounded-full flex items-center justify-center shadow-xl">
              <Building2 size={24} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">Current Bank Interest Rates</h2>
          </div>

          <div className="overflow-x-auto rounded-sm border border-gray-100 shadow-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-6 text-[10px] uppercase font-black tracking-widest">Bank Name</th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-widest">Interest Rate</th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-widest">Processing Fee</th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-widest">Max Tenure</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'SBI', rate: '8.50%', fee: '0.35%', tenure: '30 yrs' },
                  { name: 'HDFC', rate: '8.70%', fee: '0.50%', tenure: '30 yrs' },
                  { name: 'ICICI', rate: '8.75%', fee: '0.50%', tenure: '30 yrs' },
                  { name: 'Axis', rate: '8.75%', fee: '1%', tenure: '30 yrs' },
                  { name: 'Kotak', rate: '8.70%', fee: '0.50%', tenure: '20 yrs' },
                  { name: 'LIC HFC', rate: '8.50%', fee: '0.25%', tenure: '30 yrs' },
                ].map((bank, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-6 font-serif font-bold text-primary text-lg">{bank.name}</td>
                    <td className="p-6 font-bold text-accent text-lg">{bank.rate}</td>
                    <td className="p-6 text-gray-500 font-bold">{bank.fee}</td>
                    <td className="p-6 text-gray-500 font-bold">{bank.tenure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-start gap-3 text-primary/40 bg-gray-50 p-4 rounded-sm">
            <Info size={16} className="mt-0.5" />
            <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed">
              Rates indicative. Subject to change. Contact bank for latest rates. Processing fees are subject to taxes as applicable.
            </p>
          </div>
        </section>

        {/* SECTION 4: CTA */}
        <section>
          <div className="bg-primary p-12 md:p-20 rounded-sm shadow-2xl relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-center lg:text-left max-w-xl">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                  Need Home Loan <span className="text-accent italic">Assistance?</span>
                </h2>
                <p className="text-white/60 text-lg mb-8">
                  Our financial experts will guide you through the entire process, from documentation to disbursement, absolutely <span className="text-accent font-bold">FREE</span>.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-accent" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Doorstep Service</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-accent" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Fast Approval</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-accent" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Multiple Banks</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[300px]">
                <a 
                  href="tel:+918884530510"
                  className="bg-accent text-primary py-5 px-8 rounded-sm font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl"
                >
                  <Phone size={18} />
                  Call: +91 88845 30510
                </a>
                <a 
                  href="https://wa.me/918884530510?text=Hi, I need home loan help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white py-5 px-8 rounded-sm font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl"
                >
                  <MessageCircle size={18} />
                  WhatsApp Assistance
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, MessageCircle, Info } from 'lucide-react';

export default function EMICalculator() {
  const [propertyValue, setPropertyValue] = useState(10000000); // 1 Cr
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  useEffect(() => {
    const loanAmount = propertyValue * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / (12 * 100);
    const months = tenure * 12;

    const emiValue = 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayableValue = emiValue * months;
    const totalInterestValue = totalPayableValue - loanAmount;

    setEmi(emiValue);
    setTotalInterest(totalInterestValue);
    setTotalPayable(totalPayableValue);
  }, [propertyValue, downPaymentPercent, interestRate, tenure]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="py-24 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Controls */}
          <div className="w-full lg:w-3/5">
            <div className="mb-12">
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Interactive Tool</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
                Home Loan <span className="text-accent italic">EMI Calculator</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Property Value */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary">Property Value</label>
                  <span className="text-accent font-black text-sm">{formatCurrency(propertyValue)}</span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="50000000"
                  step="100000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>₹20L</span>
                  <span>₹5Cr</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary">Down Payment (%)</label>
                  <span className="text-accent font-black text-sm">{downPaymentPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="1"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>10%</span>
                  <span>40%</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary">Interest Rate (%)</label>
                  <span className="text-accent font-black text-sm">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="6.5"
                  max="14"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>6.5%</span>
                  <span>14%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary">Tenure (Years)</label>
                  <span className="text-accent font-black text-sm">{tenure} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>5Y</span>
                  <span>30Y</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/5 bg-primary p-10 rounded-sm shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 -mr-16 -mt-16 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Calculator size={20} className="text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Your Monthly EMI</h3>
            </div>

            <div className="mb-10">
              <p className="text-accent font-black text-5xl md:text-6xl mb-2 tracking-tighter">
                {formatCurrency(emi)}
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold">Per Month</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-white/10">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Total Interest</p>
                <p className="text-white font-bold text-lg">{formatCurrency(totalInterest)}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Total Payable</p>
                <p className="text-white font-bold text-lg">{formatCurrency(totalPayable)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="https://wa.me/917304954717"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent text-primary py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle size={18} />
                Talk to Our Home Loan Expert
              </a>
              <p className="flex items-center gap-2 text-[10px] text-white/30 font-medium justify-center">
                <Info size={12} />
                Calculations are indicative and subject to bank approval.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

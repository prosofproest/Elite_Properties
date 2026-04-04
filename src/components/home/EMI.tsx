/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, IndianRupee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EMI() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const emiValue = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(emiValue));
  }, [loanAmount, interestRate, tenure]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block">Financial Planning</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight">
            Plan your <span className="italic text-accent">Investment.</span>
          </h2>
          <p className="text-primary/70 mb-12 leading-relaxed">
            Use our smart EMI calculator to estimate your monthly payments and plan your property purchase with confidence.
          </p>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary/70 uppercase">Loan Amount</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="100000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary/70 uppercase">Interest Rate (%)</span>
                  <span className="text-lg font-bold text-primary">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary/70 uppercase">Tenure (Years)</span>
                  <span className="text-lg font-bold text-primary">{tenure} Yrs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary p-12 rounded-2xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-accent mb-6">
              <Calculator size={32} />
            </div>
            <p className="text-white/60 text-sm uppercase tracking-widest font-bold mb-2">Your Monthly EMI</p>
            <h3 className="text-5xl md:text-6xl font-serif font-bold text-accent mb-8">
              {formatCurrency(emi)}
            </h3>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Interest</p>
                <p className="text-lg font-bold">{formatCurrency(emi * tenure * 12 - loanAmount)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Payment</p>
                <p className="text-lg font-bold">{formatCurrency(emi * tenure * 12)}</p>
              </div>
            </div>

            <Link to="/contact" className="btn-accent w-full flex items-center justify-center gap-2 group">
              Get Detailed Quote
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

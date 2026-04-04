/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  where, 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lead, Project, SiteVisit } from '../../lib/types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    totalProjects: 0,
    totalSiteVisits: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [todayVisits, setTodayVisits] = useState<SiteVisit[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubLeads = () => {};
    let unsubProjects = () => {};
    let unsubSiteVisitsAll = () => {};
    let unsubVisits = () => {};
    let unsubTotalLeads = () => {};

    try {
      // Real-time stats and data
      const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(10));
      const projectsQuery = query(collection(db, 'projects'));
      const siteVisitsAllQuery = query(collection(db, 'siteVisits'));
      
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const visitsQuery = query(
        collection(db, 'siteVisits'), 
        where('visitDate', '==', todayStr),
      );

      unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
        const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        setRecentLeads(leads);
        const todayLeadsCount = leads.filter(l => {
          const date = l.createdAt?.toDate?.();
          return date && isSameDay(date, new Date());
        }).length;
        setStats(prev => ({ ...prev, newLeadsToday: todayLeadsCount }));
      }, (error) => {
        console.error('Dashboard leads error:', error);
      });

      unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
        setStats(prev => ({ ...prev, totalProjects: snapshot.size }));
      }, (error) => {
        console.error('Dashboard projects error:', error);
      });

      unsubSiteVisitsAll = onSnapshot(siteVisitsAllQuery, (snapshot) => {
        setStats(prev => ({ ...prev, totalSiteVisits: snapshot.size }));
      }, (error) => {
        console.error('Dashboard site visits error:', error);
      });

      unsubVisits = onSnapshot(visitsQuery, (snapshot) => {
        const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit));
        setTodayVisits(visits);
      }, (error) => {
        console.error('Dashboard today visits error:', error);
      });

      const totalLeadsQuery = query(collection(db, 'leads'));
      unsubTotalLeads = onSnapshot(totalLeadsQuery, (snapshot) => {
        setStats(prev => ({ ...prev, totalLeads: snapshot.size }));
        
        // Prepare chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
        const dailyCounts = last7Days.map(day => {
          return snapshot.docs.filter(doc => {
            const createdAt = doc.data().createdAt?.toDate?.();
            return createdAt && isSameDay(createdAt, day);
          }).length;
        });

        setChartData({
          labels: last7Days.map(day => format(day, 'EEE, MMM d')),
          datasets: [
            {
              label: 'New Leads',
              data: dailyCounts,
              backgroundColor: '#C9A84C',
              borderColor: '#C9A84C',
              borderWidth: 0,
              borderRadius: 4,
              barThickness: 32,
            },
          ],
        });
        setLoading(false);
      }, (error) => {
        console.error('Dashboard total leads error:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Dashboard configuration error:', error);
      setLoading(false);
    }

    return () => {
      unsubLeads();
      unsubProjects();
      unsubSiteVisitsAll();
      unsubVisits();
      unsubTotalLeads();
    };
  }, []);

  const metricCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'bg-blue-500', trend: '+12%', isUp: true },
    { title: 'New Today', value: stats.newLeadsToday, icon: TrendingUp, color: 'bg-green-500', trend: '+5%', isUp: true },
    { title: 'Total Projects', value: stats.totalProjects, icon: Building2, color: 'bg-accent', trend: '0%', isUp: true },
    { title: 'Site Visits', value: stats.totalSiteVisits, icon: FileText, color: 'bg-purple-500', trend: '0%', isUp: true },
  ];

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Loading data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Total Leads', 'New Today', 'Total Projects', 'Site Visits'].map((title) => (
            <div key={title} className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-2/3" />
              <div className="h-10 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Welcome back! Here's what's happening with Elite Properties today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 border border-gray-200 rounded-sm flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest">
            <CalendarIcon size={16} className="text-accent" />
            {format(new Date(), 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-sm text-white shadow-lg", card.color)}>
                  <Icon size={24} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-black uppercase tracking-widest",
                  card.isUp ? "text-green-500" : "text-red-500"
                )}>
                  {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.trend}
                </div>
              </div>
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</h3>
              <p className="text-3xl font-serif font-bold text-primary">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Trends Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-sm border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">Lead Generation Trends</h2>
              <p className="text-gray-400 text-xs font-medium mt-1">Daily lead acquisition for the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-accent rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Leads</span>
            </div>
          </div>
          <div className="h-[300px]">
            {chartData && (
              <Bar 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#0A1931',
                      titleFont: { family: 'Inter', weight: 'bold' },
                      bodyFont: { family: 'Inter' },
                      padding: 12,
                      cornerRadius: 2,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f3f4f6' },
                      ticks: { font: { family: 'Inter', size: 10, weight: 'bold' }, color: '#9ca3af' }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { family: 'Inter', size: 10, weight: 'bold' }, color: '#9ca3af' }
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>

        {/* Today's Site Visits */}
        <div className="bg-white p-8 rounded-sm border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-xl font-bold text-primary">Today's Visits</h2>
            <Link to="/admin/site-visits" className="text-accent hover:text-accent/80 transition-colors">
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="flex-grow space-y-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {todayVisits.length > 0 ? todayVisits.map((visit) => (
              <div key={visit.id} className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-gray-50 rounded-sm flex flex-col items-center justify-center shrink-0 border border-gray-100 group-hover:border-accent transition-colors">
                  <span className="text-[10px] font-black text-gray-400 uppercase leading-none">{format(parseISO(visit.visitDate), 'MMM')}</span>
                  <span className="text-lg font-serif font-bold text-primary leading-none">{format(parseISO(visit.visitDate), 'd')}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{visit.name || 'Unnamed Lead'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{visit.projectName || 'General Inquiry'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={10} className="text-accent" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{visit.timeSlot || 'TBD'}</span>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                      visit.status === 'Confirmed' ? "bg-green-100 text-green-700" : 
                      visit.status === 'Visited' ? "bg-blue-100 text-blue-700" :
                      visit.status === 'Cancelled' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {visit.status}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No visits scheduled today</p>
              </div>
            )}
          </div>
          <Link 
            to="/admin/site-visits" 
            className="mt-8 w-full py-3 border border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-gray-50 transition-all text-center rounded-sm"
          >
            View Full Calendar
          </Link>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary">Recent Inquiries</h2>
            <p className="text-gray-400 text-xs font-medium mt-1">Latest 10 leads received across all channels</p>
          </div>
          <Link 
            to="/admin/leads" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
          >
            View All Leads
            <ExternalLink size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Project</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Budget</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold text-primary">{lead.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{lead.email}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                      {lead.projectInterest || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-600">{lead.budgetRange || 'N/A'}</td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-400">
                    {lead.createdAt ? format(lead.createdAt.toDate(), 'MMM d, HH:mm') : 'Just now'}
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm",
                      lead.status === 'New' ? "bg-blue-100 text-blue-700" : 
                      lead.status === 'Called' ? "bg-amber-100 text-amber-700" :
                      lead.status === 'Converted' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Link 
                      to={`/admin/leads?id=${lead.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-gray-400 hover:bg-primary hover:text-white transition-all"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';
import { SiteVisit } from '../../lib/types';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const SiteVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('All');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  useEffect(() => {
    // Bug 1: Simplified query to avoid index error
    const q = query(collection(db, 'siteVisits'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit));
      setVisits(visitsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'siteVisits');
    });

    return () => unsubscribe();
  }, []); // Status filter is now handled client-side

  const filteredVisits = visits.filter(v => 
    statusFilter === 'All' || 
    v.status?.toLowerCase() === statusFilter.toLowerCase()
  );

  const handleStatusUpdate = async (id: string, newStatus: SiteVisit['status']) => {
    try {
      await updateDoc(doc(db, 'siteVisits', id), { status: newStatus });
      toast.success(`Visit marked as ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `siteVisits/${id}`);
      toast.error('Failed to update status');
    }
  };

  const handleSendReminder = async (visit: SiteVisit) => {
    try {
      // Show loading state
      toast.loading('Sending reminder...');
      
      const response = await fetch('/api/send-visit-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visit.name,
          phone: visit.phone,
          email: visit.email,
          projectName: visit.projectName || 'Elite Properties',
          visitDate: visit.visitDate,
          timeSlot: visit.timeSlot,
          referenceNumber: visit.referenceNumber,
        })
      });

      if (!response.ok) {
        throw new Error('API not available');
      }

      toast.dismiss();
      toast.success('Reminder sent successfully!');
    } catch (error) {
      toast.dismiss();
      // Fallback: Open WhatsApp with reminder message
      const message = encodeURIComponent(
        `Hi ${visit.name}! This is a reminder for your site visit at Elite Properties.\n\n` +
        `📅 Date: ${visit.visitDate}\n` +
        `⏰ Time: ${visit.timeSlot}\n` +
        `🏢 Project: ${visit.projectName || 'Elite Properties'}\n` +
        `📍 Address: Elite Properties Office, Mumbai\n\n` +
        `Please bring: Aadhaar, PAN Card, Bank Statement\n\n` +
        `For queries: +91 73049 54717`
      );
      const phone = visit.phone?.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Opening WhatsApp reminder!');
    }
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: addDays(startOfWeek(monthEnd), 41) // Show 6 weeks
  });

  const getVisitsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return visits.filter(v => v.visitDate === dayStr);
  };

  const isToday = (dateStr: string) => {
    return dateStr === format(new Date(), 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Site Visit Schedule</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Coordinate property viewings and track conversion progress.</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-sm p-1 shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all", viewMode === 'list' ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary")}
          >
            List View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all", viewMode === 'calendar' ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary")}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {viewMode === 'calendar' ? (
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(addDays(currentDate, -30))} className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="font-serif text-xl font-bold text-primary min-w-[150px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by client or project..."
                className="w-full bg-gray-50 border border-gray-100 rounded-sm py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-300" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-sm py-3 px-4 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Visited">Visited</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Schedule...</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Client Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Project</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisits.length > 0 ? filteredVisits.map((visit) => (
                <tr key={visit.id} className={cn(
                  "hover:bg-gray-50/50 transition-colors group",
                  isToday(visit.visitDate) && "bg-accent/5 border-l-4 border-accent"
                )}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-primary font-black uppercase text-sm">
                        {visit.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{visit.name || 'Unnamed Client'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{visit.phone || 'No Phone'}</p>
                        <p className="text-[10px] text-gray-400 lowercase">{visit.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-gray-600">{visit.projectName || 'General Inquiry'}</p>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Ref: {visit.referenceNumber}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <CalendarIcon size={14} className="text-accent" />
                      {format(parseISO(visit.visitDate), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      <Clock size={12} />
                      {visit.timeSlot || 'TBD'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Confirmed', 'Visited', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(visit.id, status as any)}
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border transition-all",
                            visit.status === status 
                              ? status === 'Confirmed' ? "bg-green-500 border-green-500 text-white shadow-sm" :
                                status === 'Pending' ? "bg-amber-500 border-amber-500 text-white shadow-sm" :
                                status === 'Visited' ? "bg-blue-500 border-blue-500 text-white shadow-sm" :
                                "bg-red-500 border-red-500 text-white shadow-sm"
                              : "bg-white border-gray-100 text-gray-400 hover:border-accent hover:text-accent"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleSendReminder(visit)}
                      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      <Send size={12} />
                      Send Reminder
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No visits found for the selected criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayVisits = getVisitsForDay(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors",
                    !isCurrentMonth && "bg-gray-50/50",
                    isToday && "bg-accent/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-accent text-primary" : isCurrentMonth ? "text-primary" : "text-gray-300"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayVisits.length > 0 && (
                      <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayVisits.map(v => (
                        <div 
                          key={v.id} 
                          className={cn(
                            "text-[8px] font-bold p-1 rounded-sm truncate border-l-2",
                            v.status === 'Confirmed' ? "bg-green-50 border-green-500 text-green-700" : 
                            v.status === 'Pending' ? "bg-amber-50 border-amber-500 text-amber-700" : 
                            v.status === 'Visited' ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-400 text-gray-600"
                          )}
                          title={`${v.name} - ${v.projectName}`}
                        >
                          {v.timeSlot || 'TBD'} • {v.name}
                        </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteVisitsPage;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Save,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  where,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';
import { Lead } from '../../lib/types';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useSearchParams } from 'react-router-dom';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Lead['status']>('New');
  const [saving, setSaving] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const leadIdFromUrl = searchParams.get('id');

  useEffect(() => {
    let q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    
    if (dateRange !== 'All') {
      const now = new Date();
      let startDate = startOfDay(now);
      
      if (dateRange === 'Today') startDate = startOfDay(now);
      else if (dateRange === 'Yesterday') startDate = startOfDay(subDays(now, 1));
      else if (dateRange === 'Last 7 Days') startDate = startOfDay(subDays(now, 7));
      else if (dateRange === 'Last 30 Days') startDate = startOfDay(subDays(now, 30));
      
      const endDate = dateRange === 'Yesterday' ? endOfDay(subDays(now, 1)) : endOfDay(now);
      
      q = query(
        collection(db, 'leads'), 
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
      setLoading(false);

      if (leadIdFromUrl) {
        const lead = leadsData.find(l => l.id === leadIdFromUrl);
        if (lead) {
          openLeadPanel(lead);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    return () => unsubscribe();
  }, [leadIdFromUrl, dateRange]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const openLeadPanel = (lead: Lead) => {
    setSelectedLead(lead);
    setNotes(lead.notes || '');
    setStatus(lead.status);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedLead(null);
    setSearchParams({});
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        notes,
        status,
        updatedAt: Timestamp.now()
      });
      toast.success('Lead updated successfully');
      setIsPanelOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${selectedLead.id}`);
      toast.error('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
      toast.success('Lead deleted');
      if (selectedLead?.id === id) closePanel();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
      toast.error('Failed to delete lead');
    }
  };

  const exportCSV = () => {
    const dataToExport = filteredLeads.map(l => ({
      Name: l.name,
      Phone: l.phone,
      Email: l.email,
      Project: l.projectInterest || 'N/A',
      Budget: l.budgetRange || 'N/A',
      Source: l.source || 'Website',
      Status: l.status,
      Date: l.createdAt ? format(l.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A',
      Notes: l.notes || ''
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `elite_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads exported successfully');
  };

  const statusOptions: Lead['status'][] = ['New', 'Called', 'Site Visit', 'Converted', 'Lost'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Lead Management</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Track and manage all incoming inquiries across Mumbai projects.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest text-primary hover:bg-gray-50 transition-all shadow-sm"
        >
          <Download size={16} className="text-accent" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-sm py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-sm py-3 pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-sm py-3 pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Project & Budget</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => openLeadPanel(lead)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black uppercase text-sm">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-gray-600">{lead.projectInterest || 'General Inquiry'}</p>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-0.5">{lead.budgetRange || 'No Budget Set'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-sm">
                      {lead.source || 'Website'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-400">
                    {lead.createdAt ? format(lead.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-flex items-center gap-1.5",
                      lead.status === 'New' ? "bg-blue-100 text-blue-700" : 
                      lead.status === 'Called' ? "bg-amber-100 text-amber-700" :
                      lead.status === 'Site Visit' ? "bg-purple-100 text-purple-700" :
                      lead.status === 'Converted' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        lead.status === 'New' ? "bg-blue-500" : 
                        lead.status === 'Called' ? "bg-amber-500" :
                        lead.status === 'Converted' ? "bg-green-500" : "bg-red-500"
                      )} />
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <Search size={32} />
                      </div>
                      <p className="text-sm font-bold text-primary">No leads found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel */}
      {isPanelOpen && selectedLead && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
              <div>
                <h2 className="font-serif text-2xl font-bold">Lead Details</h2>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">ID: {selectedLead.id}</p>
              </div>
              <button onClick={closePanel} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-accent rounded-sm flex items-center justify-center text-primary font-black text-3xl shadow-lg">
                    {selectedLead.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary">{selectedLead.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-xs font-bold text-accent hover:underline">
                        <Phone size={14} />
                        {selectedLead.phone}
                      </a>
                      <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-xs font-bold text-accent hover:underline">
                        <Mail size={14} />
                        {selectedLead.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Project Interest</p>
                    <p className="text-sm font-bold text-primary">{selectedLead.projectInterest || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Budget Range</p>
                    <p className="text-sm font-bold text-primary">{selectedLead.budgetRange || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Source</p>
                    <p className="text-sm font-bold text-primary">{selectedLead.source || 'Website'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date Received</p>
                    <p className="text-sm font-bold text-primary">
                      {selectedLead.createdAt ? format(selectedLead.createdAt.toDate(), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <MessageSquare size={14} />
                  Original Message
                </div>
                <div className="bg-gray-50 p-6 rounded-sm border-l-4 border-accent italic text-gray-600 text-sm leading-relaxed">
                  "{selectedLead.message}"
                </div>
              </div>

              {/* Status & Notes Section */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Update Status</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setStatus(opt)}
                        className={cn(
                          "py-2 text-[8px] font-black uppercase tracking-widest rounded-sm border transition-all",
                          status === opt 
                            ? "bg-primary text-white border-primary shadow-md" 
                            : "bg-white text-gray-400 border-gray-200 hover:border-accent hover:text-accent"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all resize-none"
                    placeholder="Add follow-up notes, site visit feedback, etc..."
                  />
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete Lead
              </button>
              <button
                onClick={handleSaveLead}
                disabled={saving}
                className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 group"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} className="group-hover:scale-110 transition-transform" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadsPage;

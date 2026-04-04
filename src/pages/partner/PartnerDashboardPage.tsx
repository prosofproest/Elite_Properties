import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Copy, Share2, Mail, Users, CheckCircle, IndianRupee, Clock, LogOut, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerDashboardPage() {
  const { user, logout } = useAuth();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Fetch partner data
        const q = query(collection(db, 'channelPartners'), where('email', '==', user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const pData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
          setPartnerData(pData);

          // Fetch leads for this partner
          const leadsQ = query(collection(db, 'leads'), where('referralCode', '==', pData.refCode));
          const leadsSnapshot = await getDocs(leadsQ);
          const leadsData = leadsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setLeads(leadsData);
        }

        // Fetch leaderboard (top 5 partners by earnings)
        const lbQ = query(collection(db, 'channelPartners'), where('status', '==', 'Approved'));
        const lbSnapshot = await getDocs(lbQ);
        const lbData = lbSnapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
          .slice(0, 5);
        setLeaderboard(lbData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!partnerData || partnerData.status !== 'Approved') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center bg-gray-50">
        <div className="bg-white p-12 rounded-sm shadow-2xl max-w-lg w-full">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary mb-4">Application Pending</h2>
          <p className="text-gray-600 mb-8">
            Your channel partner application is currently under review. You will be notified once approved.
          </p>
          <button onClick={logout} className="text-accent font-bold uppercase tracking-widest text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/ref/${partnerData.refCode}`;
  
  const stats = {
    totalReferrals: leads.length,
    converted: leads.filter(l => l.status === 'Converted').length,
    totalEarned: partnerData.totalEarnings || 0,
    pendingCommission: leads.filter(l => l.status === 'Converted' && !l.commissionPaid).length * 50000 // Mock calculation
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Welcome, {partnerData.name}</h1>
            <p className="text-gray-500">Channel Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-sm shadow-sm border border-gray-100 flex items-center gap-3">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ref Code:</span>
              <span className="font-mono font-bold text-primary">{partnerData.refCode}</span>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <p className="text-3xl font-black text-primary mb-1">{stats.totalReferrals}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Referrals</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
            <p className="text-3xl font-black text-primary mb-1">{stats.converted}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Successful Conversions</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
            </div>
            <p className="text-3xl font-black text-primary mb-1">₹{stats.totalEarned.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Earned</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-3xl font-black text-primary mb-1">₹{stats.pendingCommission.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pending Commission</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Share Link */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4">Your Referral Link</h3>
              <p className="text-sm text-gray-500 mb-6">Share this link with your clients. Any enquiries made through this link will be automatically tracked to your account.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-gray-50 px-4 py-3 rounded-sm border border-gray-200 font-mono text-sm text-gray-600 truncate">
                  {referralLink}
                </div>
                <div className="flex gap-2">
                  <button onClick={copyLink} className="bg-primary text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Copy size={16} /> Copy
                  </button>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out premium properties from Elite Properties Mumbai: ${referralLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-3 rounded-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                    title="Share on WhatsApp"
                  >
                    <Share2 size={16} />
                  </a>
                  <a 
                    href={`mailto:?subject=Premium Properties in Mumbai&body=${encodeURIComponent(`Hi,\n\nCheck out premium properties from Elite Properties Mumbai: ${referralLink}`)}`}
                    className="bg-gray-800 text-white px-4 py-3 rounded-sm hover:bg-gray-900 transition-colors flex items-center justify-center"
                    title="Share via Email"
                  >
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-primary">Recent Leads</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Client Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No leads yet. Start sharing your referral link!
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-4">
                            <p className="font-bold text-primary text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.phone}</p>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {lead.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {lead.projectInterest || lead.propertyType || 'General'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                              lead.status === 'Lost' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <Award className="text-accent" /> Top Partners
              </h3>
              <div className="space-y-4">
                {leaderboard.map((partner, index) => (
                  <div key={partner.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{partner.name}</p>
                      <p className="text-xs text-gray-500">{partner.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">₹{(partner.totalEarnings || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

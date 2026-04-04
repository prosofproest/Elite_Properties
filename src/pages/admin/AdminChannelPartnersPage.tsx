import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle, Eye, MessageCircle, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

import { handleFirestoreError, OperationType } from '../../lib/firestore';

export default function AdminChannelPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const q = query(collection(db, 'channelPartners'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'channelPartners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleStatusChange = async (id: string, status: string, partnerData?: any) => {
    try {
      await updateDoc(doc(db, 'channelPartners', id), { status });
      
      if (status === 'Approved' && partnerData) {
        try {
          await fetch('/api/send-partner-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...partnerData })
          });
          toast.success(`Partner approved and welcome email sent`);
        } catch (emailErr) {
          console.error('Failed to send welcome email:', emailErr);
          toast.success(`Partner approved but email failed to send`);
        }
      } else {
        toast.success(`Partner status updated to ${status}`);
      }
      
      fetchPartners();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePayCommission = async (id: string, currentEarnings: number) => {
    const amount = prompt('Enter commission amount to pay (₹):');
    if (!amount || isNaN(Number(amount))) return;

    try {
      await updateDoc(doc(db, 'channelPartners', id), { 
        totalEarnings: (currentEarnings || 0) + Number(amount)
      });
      toast.success(`Commission of ₹${amount} paid successfully`);
      fetchPartners();
    } catch (error) {
      console.error('Error paying commission:', error);
      toast.error('Failed to pay commission');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading partners...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Channel Partners</h1>
          <p className="text-gray-500 text-sm">Manage partner applications and commissions</p>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Partner Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Ref Code</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Earnings</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No channel partners found.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-primary text-sm">{partner.name}</p>
                      <p className="text-xs text-gray-500">{partner.city} • {partner.experience}</p>
                      {partner.reraNumber && <p className="text-[10px] text-gray-400 mt-1">RERA: {partner.reraNumber}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{partner.email}</p>
                      <p className="text-xs text-gray-500">{partner.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-primary bg-gray-100 px-2 py-1 rounded">
                        {partner.refCode}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-sm text-primary">₹{(partner.totalEarnings || 0).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        partner.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        partner.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {partner.idProofUrl && (
                          <a 
                            href={partner.idProofUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                            title="View ID Proof"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                        <a 
                          href={`https://wa.me/${partner.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                        {partner.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(partner.id, 'Approved', partner)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(partner.id, 'Rejected', partner)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {partner.status === 'Approved' && (
                          <button 
                            onClick={() => handlePayCommission(partner.id, partner.totalEarnings)}
                            className="p-2 text-gray-400 hover:text-accent transition-colors"
                            title="Pay Commission"
                          >
                            <IndianRupee size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

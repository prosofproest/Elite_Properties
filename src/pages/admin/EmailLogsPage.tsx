import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ExternalLink, CheckCircle, XCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';

import { handleFirestoreError, OperationType } from '../../lib/firestore';

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'emailLogs'), orderBy('sentAt', 'desc'));
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'emailLogs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const templates = Array.from(new Set(logs.map(log => log.templateName))).filter(Boolean);

  const filteredLogs = logs.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterTemplate !== 'all' && log.templateName !== filterTemplate) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Email Logs</h1>
          <p className="text-gray-500 text-sm">Monitor automated email delivery status</p>
        </div>
        <a 
          href="https://resend.com/emails" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-primary text-white px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <ExternalLink size={16} /> Resend Dashboard
        </a>
      </div>

      <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Template</label>
          <select 
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Templates</option>
            {templates.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Recipient</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Template</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Sent At</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Related ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No email logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <Mail size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{log.recipientName}</p>
                          <p className="text-xs text-gray-500">{log.recipientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{log.templateName}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'sent' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {log.sentAt ? format(log.sentAt.toDate(), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-mono text-gray-500">
                      {log.relatedId || '-'}
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

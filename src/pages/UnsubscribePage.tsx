import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('error');
        return;
      }

      try {
        await setDoc(doc(db, 'unsubscribes', email), {
          email,
          unsubscribedAt: serverTimestamp(),
        });
        setStatus('success');
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setStatus('error');
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-sm shadow-sm max-w-md w-full text-center border border-gray-100"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">Processing...</h1>
            <p className="text-gray-600">Please wait while we update your preferences.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">Unsubscribed Successfully</h1>
            <p className="text-gray-600 mb-6">
              <strong>{email}</strong> has been removed from our mailing list. You will no longer receive automated marketing emails from Elite Properties.
            </p>
            <a href="/" className="btn-primary inline-block">Return to Homepage</a>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <MailX size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your unsubscribe request. The link might be invalid or expired.
            </p>
            <a href="/" className="btn-primary inline-block">Return to Homepage</a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

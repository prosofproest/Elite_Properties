import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReferralTrackerPage() {
  const { refCode } = useParams<{ refCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (refCode) {
      localStorage.setItem('eliteRefCode', refCode);
    }
    // Redirect to homepage after saving
    navigate('/', { replace: true });
  }, [refCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-primary font-medium">Applying referral code...</p>
      </div>
    </div>
  );
}

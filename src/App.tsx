/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsappButton from './components/layout/WhatsappButton';
import CallButton from './components/layout/CallButton';
import ChatBot from './components/shared/ChatBot';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProjectsPage from './pages/public/ProjectsPage';
import ProjectDetailsPage from './pages/public/ProjectDetailsPage';
import SearchPage from './pages/public/SearchPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import LoanCalculatorPage from './pages/public/LoanCalculatorPage';
import ChannelPartnersPage from './pages/public/ChannelPartnersPage';
import ReferralTrackerPage from './pages/public/ReferralTrackerPage';

// Partner Pages
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage';

// Admin Pages
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminLeadsPage from './pages/admin/LeadsPage';
import AdminProjectsPage from './pages/admin/ProjectsPage';
import AdminSiteVisitsPage from './pages/admin/SiteVisitsPage';
import AdminGalleryPage from './pages/admin/GalleryPage';
import EmailLogsPage from './pages/admin/EmailLogsPage';
import UnsubscribePage from './pages/UnsubscribePage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider } from './lib/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Toaster } from 'sonner';
import BookVisitModal from './components/booking/BookVisitModal';

function BookingModalWrapper() {
  const { isBookingModalOpen, closeBookingModal, selectedProjectId } = useBooking();
  return (
    <BookVisitModal 
      isOpen={isBookingModalOpen} 
      onClose={closeBookingModal} 
      initialProjectId={selectedProjectId}
    />
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" richColors />
          <BookingModalWrapper />
          <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="leads" element={<AdminLeadsPage />} />
                    <Route path="projects" element={<AdminProjectsPage />} />
                    <Route path="site-visits" element={<AdminSiteVisitsPage />} />
                    <Route path="gallery" element={<AdminGalleryPage />} />
                    <Route path="email-logs" element={<EmailLogsPage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />

          {/* Public Routes */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/loan-calculator" element={<LoanCalculatorPage />} />
                  <Route path="/channel-partners" element={<ChannelPartnersPage />} />
                  <Route path="/channel-partners/dashboard" element={<ProtectedRoute><PartnerDashboardPage /></ProtectedRoute>} />
                  <Route path="/ref/:refCode" element={<ReferralTrackerPage />} />
                  <Route path="/unsubscribe" element={<UnsubscribePage />} />
                </Routes>
              </main>
              <Footer />
              <WhatsappButton />
              <CallButton />
              <ChatBot />
            </>
          } />
        </Routes>
      </div>
    </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

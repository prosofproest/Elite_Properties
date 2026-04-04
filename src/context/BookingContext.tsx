import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  isBookingModalOpen: boolean;
  openBookingModal: (projectId?: string) => void;
  closeBookingModal: () => void;
  selectedProjectId?: string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const openBookingModal = (projectId?: string) => {
    setSelectedProjectId(projectId);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProjectId(undefined);
  };

  return (
    <BookingContext.Provider value={{ isBookingModalOpen, openBookingModal, closeBookingModal, selectedProjectId }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

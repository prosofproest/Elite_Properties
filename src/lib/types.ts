/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  location: string;
  city: string;
  type: 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Residential';
  status: 'Ongoing' | 'Completed' | 'Upcoming' | 'ongoing' | 'delivered' | 'upcoming';
  reraNumber?: string;
  description: string;
  highlights: string[];
  configurations: {
    type: string;
    carpetArea: string;
    price: string;
    availability: 'Available' | 'Sold Out' | 'Limited';
  }[];
  amenities: string[];
  coverImage: string;
  images: string[];
  floorPlanUrl?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  mapEmbed?: string;
  isFeatured: boolean;
  published: boolean;
  priceRange: string;
  startingPrice?: number; // For filtering
  createdAt: any; // Firestore Timestamp
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectInterest?: string;
  propertyType?: string;
  budgetRange?: string;
  message: string;
  status: 'New' | 'Called' | 'Site Visit' | 'Converted' | 'Lost';
  notes?: string;
  source: string;
  createdAt: any; // Firestore Timestamp
  referralCode?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  clientName?: string;
  projectName?: string;
  role: string;
  content: string;
  review?: string;
  avatar?: string;
  rating: number;
}

export interface Award {
  id: string;
  title: string;
  year: string;
  organization: string;
  description?: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: string;
  title?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category?: string;
  tags: string[];
  published: boolean;
  publishedAt?: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
}

export interface SiteVisit {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectId: string;
  projectName: string;
  visitDate: string; // YYYY-MM-DD
  timeSlot: string;
  peopleCount: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  referenceNumber: string;
  source: string;
  notes?: string;
  createdAt: any; // Firestore Timestamp
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface ChannelPartner {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  reraId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: any; // Firestore Timestamp
}

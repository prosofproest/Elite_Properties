/**
 * Elite Properties — firestore.ts (FIXED)
 * KEY FIX: Removed where('published', '==', true) from searchProjects
 * This was causing empty search results and flickering
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Project, Lead, Testimonial, Award, GalleryItem, Blog, SiteVisit, BlockedDate } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────

export async function getProjects(filters?: {
  type?: string; city?: string; status?: string;
  search?: string; minPrice?: number; maxPrice?: number;
}) {
  try {
    // Simple query — no compound indexes needed
    const snapshot = await getDocs(collection(db, 'projects'));
    let results = snapshot.docs.map(doc =>
      ({ id: doc.id, ...doc.data() } as Project)
    );
    if (filters?.type && filters.type !== 'All')
      results = results.filter(p => p.type === filters.type);
    if (filters?.city && filters.city !== 'All')
      results = results.filter(p => p.city === filters.city);
    if (filters?.status && filters.status !== 'All')
      results = results.filter(p => p.status?.toLowerCase() === filters.status!.toLowerCase());
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s)
      );
    }
    // Sort newest first client-side
    results.sort((a, b) =>
      ((b.createdAt as any)?.toMillis?.() || 0) -
      ((a.createdAt as any)?.toMillis?.() || 0)
    );
    return results;
  } catch (error) {
    console.error('getProjects error:', error);
    return [];
  }
}

export async function getFeaturedProjects() {
  try {
    const q = query(collection(db, 'projects'), where('isFeatured', '==', true), limit(9));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    }
    // Fallback: latest 6 projects
    const fallback = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(6));
    const fallbackSnap = await getDocs(fallback);
    return fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('getFeaturedProjects error:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const q = query(collection(db, 'projects'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Project;
  } catch (error) {
    console.error('getProjectBySlug error:', error);
    return null;
  }
}

export async function getRelatedProjects(projectId: string, city: string, _type: string) {
  try {
    const q = query(collection(db, 'projects'), where('city', '==', city), limit(4));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .filter(p => p.id !== projectId)
      .slice(0, 3);
  } catch (error) {
    console.error('getRelatedProjects error:', error);
    return [];
  }
}

// ─── SEARCH — FIXED (removed published filter) ────────────────────────────────

export async function searchProjects(filters: {
  city?: string;
  type?: string;
  status?: string;
  bhk?: string;
  budget?: string;
  amenities?: string[];
  sort?: string;
}) {
  try {
    // FIXED: No published filter — shows all projects
    let q = query(collection(db, 'projects'));
    if (filters.city) q = query(q, where('city', '==', filters.city));
    if (filters.type) q = query(q, where('type', '==', filters.type));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    // Case-insensitive status filter
    if (filters.status) {
      results = results.filter(p =>
        p.status?.toLowerCase() === filters.status!.toLowerCase()
      );
    }

    // BHK filter
    if (filters.bhk) {
      results = results.filter(p =>
        p.configurations?.some(c => c.type?.toLowerCase().includes(filters.bhk!.toLowerCase()))
      );
    }

    // Budget filter
    if (filters.budget) {
      const [min, max] = filters.budget.split('-').map(Number);
      results = results.filter(p => {
        const price = (p as any).startingPrice || 0;
        if (price === 0) return true;
        return price >= (min || 0) && price <= (max || Infinity);
      });
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(p =>
        filters.amenities!.every(a => p.amenities?.includes(a))
      );
    }

    // Sort
    results.sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc': return ((a as any).startingPrice || 0) - ((b as any).startingPrice || 0);
        case 'price_desc': return ((b as any).startingPrice || 0) - ((a as any).startingPrice || 0);
        case 'popular': return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        default: return ((b.createdAt as any)?.toMillis?.() || 0) - ((a.createdAt as any)?.toMillis?.() || 0);
      }
    });

    return results;
  } catch (error) {
    console.error('searchProjects error:', error);
    return [];
  }
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'projects');
  }
}

export async function updateProject(id: string, data: Partial<Project>) {
  try {
    await updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
  }
}

export async function deleteProject(id: string) {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
  }
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...data,
      status: 'New',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'leads');
  }
}

export async function getLeads(filters?: { status?: string }) {
  try {
    let q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    if (filters?.status) q = query(q, where('status', '==', filters.status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  } catch (error) {
    console.error('getLeads error:', error);
    return [];
  }
}

export async function updateLeadStatus(id: string, status: Lead['status'], notes?: string) {
  try {
    await updateDoc(doc(db, 'leads', id), { status, ...(notes !== undefined && { notes }) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
  }
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export async function getTestimonials() {
  try {
    const snapshot = await getDocs(collection(db, 'testimonials'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  } catch (error) {
    console.error('getTestimonials error:', error);
    return [];
  }
}

export async function createTestimonial(data: Omit<Testimonial, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), { ...data, createdAt: serverTimestamp() });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'testimonials');
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
  }
}

// ─── AWARDS ──────────────────────────────────────────────────────────────────

export async function getAwards() {
  try {
    const snapshot = await getDocs(collection(db, 'awards'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Award));
  } catch (error) {
    console.error('getAwards error:', error);
    return [];
  }
}

export async function createAward(data: Omit<Award, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'awards'), { ...data, createdAt: serverTimestamp() });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'awards');
  }
}

export async function deleteAward(id: string) {
  try {
    await deleteDoc(doc(db, 'awards', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `awards/${id}`);
  }
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────

export async function getGallery() {
  try {
    const snapshot = await getDocs(collection(db, 'gallery'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
  } catch (error) {
    console.error('getGallery error:', error);
    return [];
  }
}

export async function getFeaturedGallery() {
  try {
    const q = query(collection(db, 'gallery'), where('isFeatured', '==', true), limit(6));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
  } catch (error) {
    console.error('getFeaturedGallery error:', error);
    return [];
  }
}

export async function createGalleryItem(data: Omit<GalleryItem, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'gallery'), { ...data, createdAt: serverTimestamp() });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'gallery');
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
  }
}

// ─── BLOGS ───────────────────────────────────────────────────────────────────

export async function getBlogs() {
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
  } catch (error) {
    console.error('getBlogs error:', error);
    return [];
  }
}

export async function getLatestBlogs(limitCount: number = 3) {
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
  } catch (error) {
    console.error('getLatestBlogs error:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Blog;
  } catch (error) {
    console.error('getBlogBySlug error:', error);
    return null;
  }
}

// ─── SITE VISITS ─────────────────────────────────────────────────────────────

export async function createSiteVisit(data: Omit<SiteVisit, 'id' | 'createdAt' | 'status'>) {
  try {
    const docRef = await addDoc(collection(db, 'siteVisits'), {
      ...data,
      status: 'Pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'siteVisits');
  }
}

export async function getSiteVisits(filters?: { date?: string; status?: string }) {
  try {
    let q = query(collection(db, 'siteVisits'), orderBy('createdAt', 'desc'));
    if (filters?.date) q = query(q, where('visitDate', '==', filters.date));
    if (filters?.status) q = query(q, where('status', '==', filters.status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit));
  } catch (error) {
    console.error('getSiteVisits error:', error);
    return [];
  }
}

export async function getSiteVisitsBySlot(date: string, timeSlot: string) {
  try {
    const q = query(
      collection(db, 'siteVisits'),
      where('visitDate', '==', date),
      where('timeSlot', '==', timeSlot),
      where('status', '!=', 'Cancelled')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit));
  } catch (error) {
    console.error('getSiteVisitsBySlot error:', error);
    return [];
  }
}

export async function updateSiteVisitStatus(id: string, status: SiteVisit['status']) {
  try {
    await updateDoc(doc(db, 'siteVisits', id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `siteVisits/${id}`);
  }
}

// ─── BLOCKED DATES ───────────────────────────────────────────────────────────

export async function getBlockedDates() {
  try {
    const snapshot = await getDocs(collection(db, 'blockedDates'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlockedDate));
  } catch (error) {
    console.error('getBlockedDates error:', error);
    return [];
  }
}

export async function addBlockedDate(date: string, reason?: string) {
  try {
    const docRef = await addDoc(collection(db, 'blockedDates'), { date, reason });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'blockedDates');
  }
}

// ─── EMAIL LOGS ──────────────────────────────────────────────────────────────

export async function createEmailLog(data: {
  recipientEmail: string;
  recipientName: string;
  templateName: string;
  status: 'sent' | 'failed';
  relatedId?: string;
}) {
  try {
    await addDoc(collection(db, 'emailLogs'), { ...data, sentAt: serverTimestamp() });
  } catch (error) {
    console.error('createEmailLog error:', error);
  }
}

export async function getEmailLogs() {
  try {
    const q = query(collection(db, 'emailLogs'), orderBy('sentAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getEmailLogs error:', error);
    return [];
  }
}

// ─── CHANNEL PARTNERS ────────────────────────────────────────────────────────

export async function createChannelPartner(data: any) {
  try {
    const docRef = await addDoc(collection(db, 'channelPartners'), {
      ...data,
      status: 'pending',
      totalEarned: 0,
      pendingCommission: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'channelPartners');
  }
}

export async function getChannelPartners() {
  try {
    const q = query(collection(db, 'channelPartners'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getChannelPartners error:', error);
    return [];
  }
}

export async function updateChannelPartnerStatus(id: string, status: string) {
  try {
    await updateDoc(doc(db, 'channelPartners', id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `channelPartners/${id}`);
  }
}
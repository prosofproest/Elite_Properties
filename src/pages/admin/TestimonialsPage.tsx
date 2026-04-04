/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Loader2, 
  Star, 
  User,
  Building2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';
import { Testimonial } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const TestimonialsPage: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    clientName: '',
    projectName: '',
    role: 'Homeowner',
    review: '',
    rating: 5,
    avatar: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    });

    return () => unsubscribe();
  }, []);

  const openForm = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        clientName: '',
        projectName: '',
        role: 'Homeowner',
        review: '',
        rating: 5,
        avatar: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: editingItem ? formData.createdAt : serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'testimonials', editingItem.id), data);
        toast.success('Testimonial updated');
      } else {
        await addDoc(collection(db, 'testimonials'), data);
        toast.success('Testimonial added');
      }
      setIsFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, editingItem ? `testimonials/${editingItem.id}` : 'testimonials');
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Client Testimonials</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage feedback from your happy families in Mumbai.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-sm border border-gray-200 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={cn(i < (item.rating || 5) ? "text-accent fill-accent" : "text-gray-200")} />
                  ))}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openForm(item)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-sm transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-8 flex-grow">"{item.review || item.content}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary font-black text-lg uppercase shadow-inner">
                  {item.clientName?.[0] || item.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{item.clientName || item.name}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    <Building2 size={10} className="text-accent" />
                    {item.projectName || 'Elite Properties'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
              <h2 className="font-serif text-2xl font-bold">{editingItem ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Client Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.clientName || formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value, name: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Project Name</label>
                  <input 
                    type="text" 
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="e.g. Elite Heights"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Review Content</label>
                <textarea 
                  rows={5}
                  required
                  value={formData.review || formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value, content: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm font-medium focus:outline-none focus:border-accent resize-none"
                  placeholder="What did the client say about their experience?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Role/Tag</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="e.g. Homeowner"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingItem ? 'Update Testimonial' : 'Save Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;

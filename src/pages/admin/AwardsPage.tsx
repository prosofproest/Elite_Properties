/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Loader2, 
  Upload, 
  Calendar, 
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
import { Award } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dzynvkgqd';
const UPLOAD_PRESET = 'elite_properties';

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'elite-properties/awards');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).secure_url;
}
// ─────────────────────────────────────────────────────────────────────────────

const AwardsPage: React.FC = () => {
  const [items, setItems] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Award | null>(null);
  const [formData, setFormData] = useState<Partial<Award>>({
    title: '',
    year: new Date().getFullYear().toString(),
    organization: '',
    description: '',
    image: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'awards'), orderBy('year', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Award));
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'awards');
    });

    return () => unsubscribe();
  }, []);

  const openForm = (item?: Award) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        year: new Date().getFullYear().toString(),
        organization: '',
        description: '',
        image: ''
      });
    }
    setIsFormOpen(true);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(acceptedFiles[0]);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Award image uploaded');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

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
        await updateDoc(doc(db, 'awards', editingItem.id), data);
        toast.success('Award updated');
      } else {
        await addDoc(collection(db, 'awards'), data);
        toast.success('Award added');
      }
      setIsFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, editingItem ? `awards/${editingItem.id}` : 'awards');
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this award?')) return;
    try {
      await deleteDoc(doc(db, 'awards', id));
      toast.success('Deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `awards/${id}`);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Awards & Recognition</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Showcase the excellence and trust Elite Properties has earned.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-3 bg-accent text-primary px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-lg group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Add New Award
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Awards...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Trophy size={64} className="text-gray-200" />
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openForm(item)} className="p-2 bg-white text-gray-400 hover:text-accent rounded-sm shadow-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-sm shadow-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-accent text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg">
                    {item.year}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-grow">
                <h3 className="font-serif text-xl font-bold text-primary mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <Building2 size={12} className="text-accent" />
                  {item.organization}
                </div>
                <p className="text-gray-400 text-xs font-medium leading-relaxed line-clamp-3">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
              <h2 className="font-serif text-2xl font-bold">{editingItem ? 'Edit Award' : 'Add New Award'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Award Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                  placeholder="e.g. Best Luxury Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Organization</label>
                  <input 
                    type="text" 
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="e.g. Realty Plus"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Year</label>
                  <input 
                    type="text" 
                    required
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm font-medium focus:outline-none focus:border-accent resize-none"
                  placeholder="Briefly describe the award..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Award Image</label>
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
                    formData.image ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent hover:bg-gray-50"
                  )}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <Loader2 className="text-accent animate-spin" size={24} />
                  ) : formData.image ? (
                    <img src={formData.image} className="max-h-20 rounded-sm shadow-md" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-gray-300 mb-2" size={24} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Upload Image</p>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full bg-primary text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingItem ? 'Update Award' : 'Save Award'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardsPage;

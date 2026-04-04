/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  Search, 
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import app, { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';

const storage = getStorage(app);
import { GalleryItem } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('Residential');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [title, setTitle] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    
    if (categoryFilter !== 'All') {
      q = query(
        collection(db, 'gallery'), 
        where('category', '==', categoryFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setItems(galleryData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
    });

    return () => unsubscribe();
  }, [categoryFilter]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        await addDoc(collection(db, 'gallery'), {
          url,
          category,
          title: title || file.name.split('.')[0],
          createdAt: serverTimestamp()
        });
      });
      
      await Promise.all(uploadPromises);
      toast.success(`${acceptedFiles.length} images added to gallery`);
      setIsFormOpen(false);
      setTitle('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const dropzoneOptions: any = {
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  };

  const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image from gallery?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Image deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
      toast.error('Failed to delete');
    }
  };

  const categories = ['Residential', 'Villas', 'Commercial', 'Plots', 'Interiors', 'Events'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Media Gallery</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Showcase your finest properties and corporate events.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-sm py-3 pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-3 bg-accent text-primary px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-lg group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Upload Media
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden group relative aspect-square">
              <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-accent mb-1">{item.category}</span>
                <p className="text-white text-xs font-bold truncate w-full mb-4">{item.title}</p>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
              <h2 className="font-serif text-2xl font-bold">Upload to Gallery</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent appearance-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Common Title (Optional)</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                    placeholder="e.g. Lobby View"
                  />
                </div>
              </div>

              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-sm p-12 flex flex-col items-center justify-center cursor-pointer transition-all",
                  uploading ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent hover:bg-gray-50"
                )}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="text-center">
                    <Loader2 className="mx-auto text-accent animate-spin mb-4" size={40} />
                    <p className="text-sm font-bold text-primary">Uploading Media...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-gray-300 mb-4" size={40} />
                    <p className="text-sm font-bold text-primary">Click or drag images to upload</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Multiple files supported</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

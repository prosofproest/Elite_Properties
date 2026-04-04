/**
 * Elite Properties — Admin ProjectsPage
 * FIXED: Uses Cloudinary for image uploads (Firebase Storage = paid plan)
 * FIXED: No compound Firebase index needed (client-side city filter)
 * FIXED: generateSlug() to avoid name conflict with slug field
 * FIXED: Removed set() helper to avoid stale closures
 * FIXED: Dropzone accept typing without "as any"
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, Image as ImageIcon, MapPin, X, Save, Upload, PlusCircle, MinusCircle, LayoutGrid, List, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dzynvkgqd';
const UPLOAD_PRESET = 'elite_properties'; // Must be UNSIGNED in Cloudinary dashboard

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'elite-properties');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Cloudinary upload failed — check preset is set to Unsigned');
  return (await res.json()).secure_url;
}
// ─────────────────────────────────────────────────────────────────────────────

// FIX ERROR 4: renamed slug() → generateSlug() to avoid conflict with slug field
const generateSlug = (n: string) =>
  n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const EMPTY: Partial<Project> = {
  name: '', slug: '', tagline: '', location: '', city: 'Mumbai', type: 'Apartment',
  status: 'Ongoing', reraNumber: '', description: '', highlights: [], amenities: [],
  configurations: [{ type: '', carpetArea: '', price: '', availability: 'Available' }],
  coverImage: '', images: [], isFeatured: false, published: true,
  priceRange: '', startingPrice: 0, floorPlanUrl: '', videoUrl: ''
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({ ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // FIX ERROR 1: Simple query (orderBy only, no compound index needed)
  // City filtering done client-side
  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));

      // Filter by city client-side (no Firebase index needed)
      if (cityFilter !== 'All') {
        data = data.filter(p => p.city === cityFilter);
      }

      setProjects(data);
      setLoading(false);
    }, err => {
      console.error('Projects error:', err);
      setLoading(false);
    });

    return unsub;
  }, [cityFilter]);

  const filtered = useMemo(() => projects.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [projects, searchTerm]);

  const openForm = (p?: Project) => { setEditingProject(p || null); setFormData(p ? { ...p } : { ...EMPTY }); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingProject(null); };

  // FIX ERROR 3: Removed set() helper. Direct setFormData calls used throughout.

  const addConfig = () => setFormData(prev => ({ ...prev, configurations: [...(prev.configurations || []), { type: '', carpetArea: '', price: '', availability: 'Available' }] }));
  const removeConfig = (i: number) => {
    const c = [...(formData.configurations || [])];
    c.splice(i, 1);
    setFormData(prev => ({ ...prev, configurations: c }));
  };
  const updateConfig = (i: number, k: string, v: string) => {
    const c = [...(formData.configurations || [])];
    c[i] = { ...c[i], [k]: v };
    setFormData(prev => ({ ...prev, configurations: c }));
  };

  const addChip = (f: 'highlights' | 'amenities', v: string) => {
    if (!v.trim()) return;
    const cur = formData[f] || [];
    if (!cur.includes(v.trim())) {
      setFormData(prev => ({ ...prev, [f]: [...(prev[f] || []), v.trim()] }));
    }
  };
  const rmChip = (f: 'highlights' | 'amenities', i: number) => {
    const c = [...(formData[f] || [])];
    c.splice(i, 1);
    setFormData(prev => ({ ...prev, [f]: c }));
  };

  // FIX ERROR 2: useCallback with empty deps — setFormData is stable
  const onDropCover = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(files[0]);
      setFormData(prev => ({ ...prev, coverImage: url }));
      toast.success('Cover uploaded!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }, []); // Empty deps - setFormData is stable

  const onDropGallery = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }, []); // Empty deps - setFormData is stable

  // FIX ERROR 5: Proper dropzone accept typing (no "as any")
  const { getRootProps: coverRoot, getInputProps: coverInput } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false
  });
  const { getRootProps: gallRoot, getInputProps: gallInput } = useDropzone({
    onDrop: onDropGallery,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) { toast.error('Name and Slug required'); return; }
    setSaving(true);
    try {
      const data = { ...formData, updatedAt: serverTimestamp(), createdAt: editingProject ? formData.createdAt : serverTimestamp() };
      if (editingProject) { await updateDoc(doc(db, 'projects', editingProject.id), data); toast.success('Project updated!'); }
      else { await addDoc(collection(db, 'projects'), data); toast.success('Project created!'); }
      closeForm();
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'projects'); toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try { await deleteDoc(doc(db, 'projects', id)); toast.success('Deleted'); }
    catch (err) { handleFirestoreError(err, OperationType.DELETE, `projects/${id}`); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Project Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} projects</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-accent text-primary px-8 py-4 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-accent/90 transition-all">
          <Plus size={18} /> Add New Project
        </button>
      </div>

      <div className="bg-white p-4 rounded-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search projects..."
            className="w-full bg-gray-50 border border-gray-100 rounded-sm py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent" />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-sm py-3 px-4 text-xs font-black uppercase tracking-widest focus:outline-none appearance-none">
          {['All', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'].map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          {(['grid', 'list'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={cn("p-2 rounded-sm", viewMode === m ? "bg-primary text-white" : "text-gray-400 hover:bg-gray-100")}>
              {m === 'grid' ? <LayoutGrid size={18} /> : <List size={18} />}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={36} className="text-accent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-sm p-16 text-center border border-dashed border-gray-200">
          <Building2 size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-serif text-2xl font-bold text-primary mb-2">No projects yet</p>
          <button onClick={() => openForm()} className="mt-4 bg-accent text-primary px-8 py-3 rounded-sm text-xs font-black uppercase tracking-widest">Add First Project</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative h-52 overflow-hidden">
                <img src={p.coverImage || 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Properties'} alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-sm",
                    p.status === 'Ongoing' ? "bg-green-500 text-white" : p.status === 'Completed' ? "bg-blue-500 text-white" : "bg-amber-500 text-white")}>
                    {p.status}
                  </span>
                  {p.isFeatured && <span className="bg-accent text-primary text-[8px] font-black uppercase px-2 py-1 rounded-sm">Featured</span>}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex gap-2 w-full">
                    <button onClick={() => openForm(p)} className="flex-grow bg-white text-primary py-2 text-xs font-black uppercase rounded-sm">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white p-2 rounded-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg font-bold text-primary truncate">{p.name}</h3>
                  <span className="text-[10px] font-black text-accent uppercase shrink-0">{p.type}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                  <MapPin size={12} className="text-accent" />{p.location}, {p.city}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-primary">{p.priceRange}</span>
                  <div className={cn("w-2.5 h-2.5 rounded-full", p.published ? "bg-green-500" : "bg-gray-300")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Project', 'Location', 'Status', 'Price', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.coverImage || 'https://placehold.co/80x80/0A1931/C9A84C?text=EP'} className="w-10 h-10 object-cover rounded-sm" alt={p.name} loading="lazy" />
                      <div><p className="text-sm font-bold text-primary">{p.name}</p><p className="text-[10px] text-gray-400 uppercase">{p.type}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{p.location}, {p.city}</td>
                  <td className="px-6 py-4"><span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-sm",
                    p.status === 'Ongoing' ? "bg-green-100 text-green-700" : p.status === 'Completed' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>{p.status}</span></td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{p.priceRange}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openForm(p)} className="p-2 text-gray-400 hover:text-accent rounded-sm"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                <p className="text-gray-400 text-sm mt-1">Images are uploaded to Cloudinary (free cloud storage)</p>
              </div>
              <button onClick={closeForm} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><X size={22} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-14">

              {/* Basic Info */}
              <Section title="Basic Info" desc="Core project details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Project Name" required>
                    {/* FIX ERROR 4: use generateSlug() not slug() */}
                    <input required value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                      className="input-admin" placeholder="Elite Heights" />
                  </Field>
                  <Field label="Slug">
                    {/* FIX ERROR 3: direct setFormData instead of set('slug', ...) */}
                    <input value={formData.slug || ''} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} className="input-admin" placeholder="elite-heights" />
                  </Field>
                  <Field label="Tagline" span>
                    <input value={formData.tagline || ''} onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))} className="input-admin" placeholder="Luxury Living in Mumbai" />
                  </Field>
                  <Field label="Location" required>
                    <input required value={formData.location || ''} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="input-admin" placeholder="Worli, South Mumbai" />
                  </Field>
                  <Field label="City">
                    <select value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} className="input-admin appearance-none">
                      {['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              {/* Details */}
              <Section title="Details & Pricing" desc="Type, RERA, pricing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Type">
                    <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} className="input-admin appearance-none">
                      {['Apartment', 'Villa', 'Commercial', 'Plot'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} className="input-admin appearance-none">
                      {['Ongoing', 'Completed', 'Upcoming'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Price Range">
                    <input value={formData.priceRange || ''} onChange={e => setFormData(prev => ({ ...prev, priceRange: e.target.value }))} className="input-admin" placeholder="₹1.5 Cr - ₹4.2 Cr" />
                  </Field>
                  <Field label="Description" span>
                    <textarea rows={4} value={formData.description || ''} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="input-admin resize-none" placeholder="Describe the project..." />
                  </Field>
                </div>
              </Section>

              {/* Configurations */}
              <Section title="Configurations" desc="BHK types and pricing rows">
                <div className="space-y-3">
                  {formData.configurations?.map((c, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-sm border border-gray-100 relative group">
                      {[['type', 'Type', '2 BHK'], ['carpetArea', 'Area', '750 Sq.Ft.'], ['price', 'Price', '₹1.25 Cr']].map(([k, l, ph]) => (
                        <div key={k}><p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{l}</p>
                          <input value={(c as any)[k] || ''} onChange={e => updateConfig(i, k, e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm p-2 text-xs font-bold focus:outline-none focus:border-accent" placeholder={ph} /></div>
                      ))}
                      <div><p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Availability</p>
                        <select value={c.availability || 'Available'} onChange={e => updateConfig(i, 'availability', e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm p-2 text-xs font-bold focus:outline-none appearance-none">
                          {['Available', 'Limited', 'Sold Out'].map(a => <option key={a}>{a}</option>)}
                        </select></div>
                      {i > 0 && <button type="button" onClick={() => removeConfig(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><MinusCircle size={14} /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addConfig} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-sm text-xs font-black uppercase tracking-widest text-gray-400 hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                    <PlusCircle size={16} /> Add Configuration
                  </button>
                </div>
              </Section>

              {/* Chips */}
              {(['highlights', 'amenities'] as const).map(field => (
                <React.Fragment key={field}>
                  <Section title={field === 'highlights' ? 'Key Highlights' : 'Amenities'} desc="Press Enter to add">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData[field]?.map((item, i) => (
                        <span key={i} className={cn("text-[10px] font-bold uppercase px-3 py-1.5 rounded-sm flex items-center gap-2", field === 'highlights' ? "bg-primary text-white" : "bg-accent text-primary")}>
                          {item}<button type="button" onClick={() => rmChip(field, i)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <input onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(field, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                      className="input-admin" placeholder={`Type and press Enter...`} />
                  </Section>
                </React.Fragment>
              ))}

              {/* Media */}
              <Section title="Media" desc="Upload to Cloudinary">
                <div className="space-y-8">
                  {/* Cover */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Cover Image</p>
                    <div {...coverRoot()} className={cn("border-2 border-dashed rounded-sm p-10 flex flex-col items-center cursor-pointer transition-all",
                      formData.coverImage ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent hover:bg-gray-50")}>
                      <input {...coverInput()} />
                      {uploading ? <><Loader2 size={32} className="text-accent animate-spin mb-2" /><p className="text-sm text-gray-400">Uploading...</p></>
                        : formData.coverImage ? <div className="relative group"><img src={formData.coverImage} className="max-h-40 rounded-sm" alt="Cover" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">Change</div></div>
                          : <><Upload className="text-gray-300 mb-3" size={36} /><p className="text-sm font-bold text-primary">Click or drag cover image</p></>}
                    </div>
                  </div>
                  {/* Gallery */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Gallery Images</p>
                    <div {...gallRoot()} className="border-2 border-dashed border-gray-200 rounded-sm p-8 flex flex-col items-center cursor-pointer hover:border-accent hover:bg-gray-50 transition-all">
                      <input {...gallInput()} />
                      <ImageIcon className="text-gray-300 mb-3" size={36} />
                      <p className="text-sm font-bold text-primary">Drop multiple images here</p>
                    </div>
                    {(formData.images?.length || 0) > 0 && (
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 mt-4">
                        {formData.images?.map((url, i) => (
                          <div key={i} className="relative group aspect-square">
                            <img src={url} className="w-full h-full object-cover rounded-sm" alt={`Gallery ${i}`} loading="lazy" />
                            <button type="button" onClick={() => { const imgs = [...(formData.images || [])]; imgs.splice(i, 1); setFormData(prev => ({ ...prev, images: imgs })); }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Floor Plan URL"><input value={formData.floorPlanUrl || ''} onChange={e => setFormData(prev => ({ ...prev, floorPlanUrl: e.target.value }))} className="input-admin" placeholder="URL to floor plan" /></Field>
                    <Field label="Video URL"><input value={formData.videoUrl || ''} onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))} className="input-admin" placeholder="YouTube link" /></Field>
                  </div>
                </div>
              </Section>

              {/* Visibility */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-100">
                {[['isFeatured', 'Featured', 'bg-accent'], ['published', 'Published', 'bg-green-500']].map(([k, l, c]) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setFormData(prev => ({ ...prev, [k]: !(prev as any)[k] }))} className={cn("w-12 h-6 rounded-full relative transition-all", (formData as any)[k] ? c : "bg-gray-200")}>
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", (formData as any)[k] ? "left-7" : "left-1")} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary">{l}</span>
                  </label>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-6 pt-8 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary">Discard</button>
                <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : editingProject ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.input-admin { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 2px; padding: 12px 16px; font-size: 14px; font-weight: 500; outline: none; transition: border-color 0.2s; } .input-admin:focus { border-color: #C9A84C; background: white; }`}</style>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div><h3 className="font-serif text-xl font-bold text-primary">{title}</h3><p className="text-gray-400 text-xs mt-2 leading-relaxed">{desc}</p></div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Field({ label, children, span, required }: { label: string; children: React.ReactNode; span?: boolean; required?: boolean }) {
  return (
    <div className={cn("space-y-2", span && "sm:col-span-2")}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}
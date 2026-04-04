/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  X, 
  Save, 
  Upload, 
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Tag
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
  Timestamp,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore';
import { Blog } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dzynvkgqd';
const UPLOAD_PRESET = 'elite_properties';

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'elite-properties/blogs');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).secure_url;
}
// ─────────────────────────────────────────────────────────────────────────────

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Real Estate',
    tags: [],
    published: false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    
    if (categoryFilter !== 'All') {
      q = query(
        collection(db, 'blogs'), 
        where('category', '==', categoryFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setBlogs(blogsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogs');
    });

    return () => unsubscribe();
  }, [categoryFilter]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const openForm = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData(blog);
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: 'Real Estate',
        tags: [],
        published: false,
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
  };

  const onDropCover = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(acceptedFiles[0]);
      setFormData(prev => ({ ...prev, coverImage: url }));
      toast.success('Cover image uploaded');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    disabled: uploading,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...formData,
        author: auth.currentUser?.displayName || auth.currentUser?.email || 'Elite Admin',
        updatedAt: serverTimestamp(),
        createdAt: editingBlog ? formData.createdAt : serverTimestamp(),
        publishedAt: formData.published ? (formData.publishedAt || serverTimestamp()) : null
      };

      if (editingBlog) {
        await updateDoc(doc(db, 'blogs', editingBlog.id), data);
        toast.success('Blog updated successfully');
      } else {
        await addDoc(collection(db, 'blogs'), data);
        toast.success('Blog published successfully');
      }
      closeForm();
    } catch (error) {
      handleFirestoreError(error, editingBlog ? OperationType.UPDATE : OperationType.CREATE, editingBlog ? `blogs/${editingBlog.id}` : 'blogs');
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteDoc(doc(db, 'blogs', id));
      toast.success('Blog deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
      toast.error('Failed to delete blog');
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Blog & Insights</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage articles, market reports and news for Elite Properties.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Write New Article
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search articles by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-sm py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-sm py-3 pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Market Trends">Market Trends</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Investment">Investment</option>
              <option value="News">News</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Articles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={blog.coverImage || 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Properties'} 
                  alt={blog.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-lg",
                    blog.published ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  )}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent mb-2">
                  {blog.category || 'Real Estate'}
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  {blog.createdAt ? format(blog.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                </div>
                <h3 className="font-serif text-xl font-bold text-primary mb-3 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-400 text-xs font-medium line-clamp-3 mb-6 leading-relaxed">{blog.excerpt}</p>
                
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-primary font-black text-[8px] uppercase">
                      {blog.author?.[0] || 'A'}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openForm(blog)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-sm transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Editor Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-300">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
              <div>
                <h2 className="font-serif text-4xl font-bold text-primary">
                  {editingBlog ? 'Edit Article' : 'Write New Article'}
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-2">Create engaging content for your audience in Mumbai.</p>
              </div>
              <button 
                onClick={closeForm}
                className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Editor */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Article Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-5 text-xl font-serif font-bold text-primary focus:outline-none focus:border-accent focus:bg-white transition-all"
                      placeholder="Enter a compelling title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Excerpt (Short Summary)</label>
                    <textarea 
                      rows={3}
                      required
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all resize-none"
                      placeholder="A brief summary of the article for listing pages..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Content</label>
                    <div className="prose-editor">
                      <ReactQuill 
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        modules={quillModules}
                        className="bg-white rounded-sm h-[500px] mb-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Cover Image</label>
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-all aspect-video",
                        formData.coverImage ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent hover:bg-gray-50"
                      )}
                    >
                      <input {...getInputProps()} />
                      {formData.coverImage ? (
                        <div className="relative group w-full h-full">
                          <img src={formData.coverImage} className="w-full h-full object-cover rounded-sm shadow-lg" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                            Change Image
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Upload Cover</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Slug</label>
                      <input 
                        type="text" 
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3 text-xs font-bold focus:outline-none focus:border-accent appearance-none"
                      >
                        <option value="Real Estate">Real Estate</option>
                        <option value="Market Trends">Market Trends</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Investment">Investment</option>
                        <option value="News">News</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 space-y-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          formData.published ? "bg-green-500" : "bg-gray-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                          formData.published ? "left-7" : "left-1"
                        )} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-primary group-hover:text-green-600 transition-colors">Publish Article</span>
                    </label>

                    <button
                      type="submit"
                      disabled={saving || uploading}
                      className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-2xl disabled:opacity-50 group"
                    >
                      {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={18} className="group-hover:scale-110 transition-transform" />
                          {editingBlog ? 'Update Article' : 'Publish Now'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;

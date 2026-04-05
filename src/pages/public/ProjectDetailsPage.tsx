/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Home, 
  IndianRupee, 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Share2, 
  CheckCircle2, 
  Play, 
  ChevronRight,
  LayoutGrid,
  Building2,
  TreePine,
  Car,
  Users,
  Dumbbell,
  Waves
} from 'lucide-react';
import { getProjectBySlug, getRelatedProjects } from '../../lib/firestore';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';
import ProjectGallery from '../../components/projects/ProjectGallery';
import ProjectEnquiryForm from '../../components/projects/ProjectEnquiryForm';
import ProjectCard from '../../components/projects/ProjectCard';
import { useBooking } from '../../context/BookingContext';

const amenityIcons: Record<string, any> = {
  'Pool': Waves,
  'Gym': Dumbbell,
  'Parking': Car,
  'Clubhouse': Users,
  'Garden': TreePine,
  'Security': ShieldCheck,
  'Kids Play Area': LayoutGrid,
  'Power Backup': Building2,
};

const ProjectDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const { openBookingModal } = useBooking();

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getProjectBySlug(slug);
        if (data) {
          setProject(data);
          const related = await getRelatedProjects(data.id, data.city, data.type);
          if (related) setRelatedProjects(related);
        } else {
          navigate('/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.name,
        text: `Check out ${project?.name} in ${project?.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-primary/50">Loading Project Details...</p>
      </div>
    );
  }

  if (!project) return null;

  const whatsappUrl = `https://wa.me/917304954717?text=${encodeURIComponent(`Hi, I'm interested in ${project.name}. Please share more details.`)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 pt-32 pb-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-primary/40 text-[10px] uppercase font-black tracking-widest">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/projects" className="hover:text-accent transition-colors">Projects</Link>
          <ChevronRight size={10} />
          <span className="text-accent">{project.name}</span>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <ProjectGallery images={project.images || [project.coverImage]} />
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Left Content */}
          <div className="flex-grow lg:w-2/3">
            {/* Header */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={cn(
                  "px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-sm text-white shadow-lg",
                  (project.status === 'Ongoing' || project.status === 'ongoing') ? 'bg-green-600' : 
                  (project.status === 'Delivered' || project.status === 'delivered') ? 'bg-blue-600' : 'bg-amber-500'
                )}>
                  {project.status}
                </span>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <MapPin size={12} className="text-accent" />
                  {project.location}, {project.city}
                </div>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary mb-4 leading-tight">
                {project.name}
              </h1>
              <div className="inline-block bg-primary text-white px-8 py-4 rounded-sm shadow-2xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60 mb-1">Starting from</p>
                <p className="text-2xl font-serif font-bold text-accent">₹{project.priceRange}*</p>
              </div>
            </div>

            {/* Configurations Table */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <LayoutGrid className="text-accent" size={24} />
                Project Configurations
              </h3>
              <div className="overflow-x-auto border border-gray-100 rounded-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Type</th>
                      <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Carpet Area</th>
                      <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Price</th>
                      <th className="p-4 text-[10px] uppercase font-black tracking-widest text-primary/50">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.configurations?.map((config, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-black text-primary text-sm">{config.type}</td>
                        <td className="p-4 text-gray-500 text-sm">{config.carpetArea}</td>
                        <td className="p-4 font-bold text-primary text-sm">{config.price}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 text-[9px] uppercase font-black tracking-widest rounded-sm",
                            config.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          )}>
                            {config.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <CheckCircle2 className="text-accent" size={24} />
                Key Highlights
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {project.highlights?.map((highlight, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-sm border border-gray-100 hover:border-accent transition-colors group">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent mb-4 shadow-sm group-hover:bg-accent group-hover:text-white transition-all">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-bold text-primary leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <Waves className="text-accent" size={24} />
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {project.amenities?.map((amenity, idx) => {
                  const Icon = amenityIcons[amenity] || Building2;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-primary hover:bg-accent hover:text-white transition-all shadow-sm">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-primary/60">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <MapPin className="text-accent" size={24} />
                Location
              </h3>
              <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden border border-gray-100 shadow-lg">
                {project.mapEmbed ? (
                  <iframe 
                    src={project.mapEmbed} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <MapPin size={48} />
                    <p className="text-xs font-bold uppercase tracking-widest">Map View Unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* Floor Plans */}
            {project.floorPlanUrl && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                  <Home className="text-accent" size={24} />
                  Floor Plans
                </h3>
                <div className="relative group rounded-sm overflow-hidden border border-gray-100 shadow-xl">
                  <img src={project.floorPlanUrl} alt="Floor Plan" className="w-full h-auto" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={project.floorPlanUrl} 
                      download 
                      className="bg-accent text-primary px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-2xl"
                    >
                      <Download size={16} />
                      Download Floor Plan
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Virtual Tour */}
            {project.virtualTourUrl && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                  <Play className="text-accent" size={24} />
                  Virtual Tour
                </h3>
                <div className="aspect-video bg-black rounded-sm overflow-hidden shadow-2xl">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={project.virtualTourUrl.replace('watch?v=', 'embed/')} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* About Project */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <Building2 className="text-accent" size={24} />
                About the Project
              </h3>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {project.description.split('\n').map((para, idx) => (
                  <p key={idx} className="mb-4">{para}</p>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32 flex flex-col gap-8">
              {/* Enquiry Form */}
              <ProjectEnquiryForm projectName={project.name} />

              {/* Share */}
              <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary/50">Share this project</span>
                <div className="flex gap-4">
                  <button 
                    onClick={handleShare}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-accent hover:text-primary transition-all shadow-sm"
                  >
                    <Share2 size={18} />
                  </button>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${project.name}: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                  >
                    <MessageCircle size={18} />
                  </a>
                </div>
              </div>
              
              {/* Copy Success Toast */}
              <AnimatePresence>
                {isSharing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-primary text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-center"
                  >
                    Link Copied to Clipboard!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Similar Properties</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
                  Related <span className="text-accent italic">Projects</span>
                </h2>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group"
              >
                View All Projects
                <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <a 
          href="tel:+917304954717" 
          className="flex-1 bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
        >
          <Phone size={14} />
          Call
        </a>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-600 text-white py-4 rounded-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
        <button 
          onClick={() => openBookingModal(project.id)}
          className="flex-1 bg-accent text-primary py-4 rounded-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
        >
          <Calendar size={14} />
          Book Visit
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

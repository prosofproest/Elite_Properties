/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [projects, setProjects] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), limit(5));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          name: doc.data().name,
          slug: doc.data().slug
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects for footer:', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <footer className="bg-primary text-white pt-24 pb-12 px-6 border-t border-accent/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        {/* Brand */}
        <div className="flex flex-col gap-8">
          <Link to="/" className="flex items-center group">
            <span className="font-serif text-2xl font-bold text-white">ELITE</span>
            <span className="font-serif text-2xl font-light text-white/80 ml-1">PROPERTIES</span>
            <span className="w-1.5 h-1.5 bg-accent rounded-full ml-1 mt-2" />
          </Link>
          <p className="text-white/60 text-sm leading-relaxed font-medium">
            Building Dreams in Mumbai since 2005. Elite Properties is Mumbai's premier real estate developer, crafting luxury living spaces that redefine elegance and comfort.
          </p>
          <div className="flex gap-5">
            {[
              { Icon: Facebook, name: 'Facebook' },
              { Icon: Instagram, name: 'Instagram' },
              { Icon: Twitter, name: 'Twitter' },
              { Icon: Linkedin, name: 'Linkedin' }
            ].map(({ Icon, name }) => (
              <a key={name} href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-accent hover:text-primary hover:border-accent transition-all duration-300">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-xl font-bold mb-8 text-accent tracking-tight">Quick Links</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/60 font-medium">
            {['Home', 'About', 'Projects', 'Gallery', 'Loan Calculator', 'Contact'].map((link) => (
              <li key={link}>
                <Link to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-[1px] bg-accent transition-all group-hover:w-3" />
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Projects */}
        <div>
          <h4 className="font-serif text-xl font-bold mb-8 text-accent tracking-tight">Our Projects</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/60 font-medium">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <li key={project.slug || `project-${index}`}>
                  <Link to={`/projects/${project.slug}`} className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-[1px] bg-accent transition-all group-hover:w-3" />
                    {project.name}
                  </Link>
                </li>
              ))
            ) : (
              ['Elite Residency', 'Skyline Towers', 'Ocean View', 'Green Meadows', 'The Grand Plaza'].map((name) => (
                <li key={name}>
                  <Link to="/projects" className="hover:text-accent transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-[1px] bg-accent transition-all group-hover:w-3" />
                    {name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-serif text-xl font-bold mb-8 text-accent tracking-tight">Contact Us</h4>
          <ul className="flex flex-col gap-6 text-sm text-white/60 font-medium">
            <li className="flex gap-4">
              <MapPin className="text-accent shrink-0" size={20} />
              <span>Elite Tower, BKC, Mumbai, Maharashtra 400051</span>
            </li>
            <li className="flex gap-4">
              <Phone className="text-accent shrink-0" size={20} />
              <a href="tel:+917304954717" className="hover:text-accent transition-colors">+91 73049 54717</a>
            </li>
            <li className="flex gap-4">
              <Mail className="text-accent shrink-0" size={20} />
              <a href="mailto:info@eliteproperties.in" className="hover:text-accent transition-colors">info@eliteproperties.in</a>
            </li>
            <li className="flex gap-4">
              <Clock className="text-accent shrink-0" size={20} />
              <span>Mon-Sat: 10AM - 7PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-8">
          <p className="text-xs text-white/40 font-medium">© {currentYear} Elite Properties. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <Link to="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms of Use</Link>
            <Link to="/sitemap" className="hover:text-accent transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLatestBlogs } from '../../lib/firestore';
import { Blog } from '../../lib/types';
import { cn } from '../../lib/utils';

const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
  const date = blog.createdAt?.toDate ? blog.createdAt.toDate() : new Date();
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-sm overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={blog.coverImage || `https://picsum.photos/seed/${blog.slug}/800/600`}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-accent text-primary px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-sm shadow-lg">
          {blog.category || 'Real Estate'}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-accent" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1">
            <User size={12} className="text-accent" />
            {blog.author || 'Elite Admin'}
          </div>
        </div>

        <h3 className="font-serif text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors line-clamp-2">
          {blog.title}
        </h3>
        
        <p className="text-gray-500 text-xs leading-relaxed mb-8 line-clamp-3">
          {blog.excerpt}
        </p>

        <Link
          to={`/blog/${blog.slug}`}
          className="mt-auto inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:text-accent transition-colors group/link"
        >
          Read More
          <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLatestBlogs(3);
        if (data) setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return null;
  if (blogs.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Latest Insights</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
              Real Estate <span className="text-accent italic">Knowledge</span>
            </h2>
          </div>
          
          <Link
            to="/blog"
            className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group"
          >
            View All Blogs
            <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}

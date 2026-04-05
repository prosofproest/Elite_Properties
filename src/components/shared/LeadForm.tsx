/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createLead } from '../../lib/firestore';
import { cn } from '../../lib/utils';

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter valid phone'),
  projectInterest: z.string().optional(),
  propertyType: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  source: string;
  project?: string;
  className?: string;
}

export default function LeadForm({ source, project, className }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      projectInterest: project || '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const refCode = localStorage.getItem('eliteRefCode') || null;
      const leadId = await createLead({
        ...data,
        projectInterest: data.projectInterest || null,
        propertyType: data.propertyType || null,
        budgetRange: data.budgetRange || null,
        source,
        referralCode: refCode,
      });

      // Send automated email
      try {
        await fetch('/api/send-lead-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source, id: leadId })
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }

      setIsSuccess(true);
      reset();
      toast.success('Enquiry saved! Email confirmation sent.');
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Submission failed. Call us: +917304954717');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center text-white"
      >
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <h4 className="text-2xl font-serif font-bold mb-2">Thank You!</h4>
        <p className="text-white/70 max-w-xs">
          Your enquiry has been received. Our property expert will contact you shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <input
            {...register('name')}
            placeholder="Your Name"
            className={cn('input-field bg-white/10 border-white/20 text-white placeholder:text-white/40', errors.name && 'border-red-500')}
          />
          {errors.name && <span className="text-[10px] text-red-400 font-bold uppercase">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <input
            {...register('phone')}
            placeholder="Phone Number"
            className={cn('input-field bg-white/10 border-white/20 text-white placeholder:text-white/40', errors.phone && 'border-red-500')}
          />
          {errors.phone && <span className="text-[10px] text-red-400 font-bold uppercase">{errors.phone.message}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <input
          {...register('email')}
          placeholder="Email Address"
          className={cn('input-field bg-white/10 border-white/20 text-white placeholder:text-white/40', errors.email && 'border-red-500')}
        />
        {errors.email && <span className="text-[10px] text-red-400 font-bold uppercase">{errors.email.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          {...register('propertyType')}
          className="input-field bg-white/10 border-white/20 text-white placeholder:text-white/40 appearance-none"
        >
          <option value="" className="bg-primary text-white">Property Type</option>
          <option value="Apartment" className="bg-primary text-white">Apartment</option>
          <option value="Villa" className="bg-primary text-white">Villa</option>
          <option value="Plot" className="bg-primary text-white">Plot</option>
          <option value="Commercial" className="bg-primary text-white">Commercial</option>
        </select>
        <select
          {...register('budgetRange')}
          className="input-field bg-white/10 border-white/20 text-white placeholder:text-white/40 appearance-none"
        >
          <option value="" className="bg-primary text-white">Budget Range</option>
          <option value="₹1 Cr - ₹3 Cr" className="bg-primary text-white">₹1 Cr - ₹3 Cr</option>
          <option value="₹3 Cr - ₹5 Cr" className="bg-primary text-white">₹3 Cr - ₹5 Cr</option>
          <option value="₹5 Cr - ₹10 Cr" className="bg-primary text-white">₹5 Cr - ₹10 Cr</option>
          <option value="Above ₹10 Cr" className="bg-primary text-white">Above ₹10 Cr</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          {...register('message')}
          placeholder="How can we help you?"
          rows={4}
          className={cn('input-field bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none', errors.message && 'border-red-500')}
        />
        {errors.message && <span className="text-[10px] text-red-400 font-bold uppercase">{errors.message.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-accent w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={20} />
            Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}

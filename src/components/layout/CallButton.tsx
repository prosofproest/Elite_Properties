/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone } from 'lucide-react';

export default function CallButton() {
  return (
    <a
      href="tel:+917304954717"
      className="fixed bottom-6 left-6 z-50 bg-[#007AFF] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center md:hidden group"
      aria-label="Call Us"
    >
      <Phone size={28} />
      <span className="absolute left-full ml-4 bg-white text-primary px-3 py-1 rounded-md text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Call Us
      </span>
    </a>
  );
}

import React, { useEffect, useState } from 'react';

const items = [
  {
    quote: 'ReviewShield helped us uncover coordinated fake review networks that had been damaging our product listings. Their insights saved us thousands in reputation recovery.',
    author: 'Amrita M.',
    role: 'Head of Listings, Ecomrc Cloud'
  },
  {
    quote: 'Fast, reliable, and surprisingly accurate. The AI-driven classifier reduced our moderation load by 67% and improved buyer trust.',
    author: 'Jon B.',
    role: 'Marketplace Ops, Flip Kart Core'
  },
  {
    quote: 'Directly actionable insights and an easy CSV workflow — we integrated ReviewShield into daily QA pipelines in under a day.',
    author: 'S. Lee',
    role: 'Head of Analytics, AMZ Listings'
  }
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card p-6">
      <div className="text-sm text-slate-300 italic">"{items[index].quote}"</div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white">{items[index].author}</div>
          <div className="text-[11px] text-slate-400">{items[index].role}</div>
        </div>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-teal-400' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

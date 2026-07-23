import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function InventoryBanner() {
  return (
    <Link
      href={SITE.availabilityPath}
      className="group flex items-center justify-center gap-3 bg-iron-900 py-4 px-6 hover:bg-iron-800 transition-colors duration-200"
    >
      <span className="font-display font-bold text-lg sm:text-xl uppercase tracking-widest text-white group-hover:text-brand-400 transition-colors duration-200">
        View Inventory &amp; Rates
      </span>
      <svg className="w-5 h-5 text-brand-500 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

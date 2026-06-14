import { MapPin } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';
import Reveal from '@/components/Reveal';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Who We Help',  href: '#who-we-help' },
  { label: 'Amenities',    href: '#amenities' },
  { label: 'Locations',    href: '#locations' },
  { label: 'FAQ',          href: '#faq' },
] as const;

const INVENTORY = 'https://docs.google.com/document/d/1WzosuTy5dRP1OoL5GROj5aP8jsY132h6Vmd9cVLiccw/edit?pli=1&tab=t.0';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-stone-900 border-t border-stone-700">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <Reveal className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-stone-700">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span className="font-display font-bold text-2xl tracking-widest uppercase text-gradient-animate">
              Canyon Apartments
            </span>
            <p className="text-xs leading-relaxed text-stone-400 max-w-xs">
              Fully furnished weekly and monthly rentals across the Phoenix metro.
              No credit check. Utilities included. Move in this week.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 mb-4">Navigate</p>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="nav-link inline-block text-sm text-stone-400 hover:text-brand-400 transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 mb-4">Quick Links</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <BookCallButton
                  label="Book a 15-Min Call"
                  className="text-sm text-stone-400 hover:text-brand-400 transition-colors duration-200 text-left"
                />
              </li>
              <li>
                <a href={INVENTORY} target="_blank" rel="noopener noreferrer"
                  className="nav-link inline-block text-sm text-stone-400 hover:text-brand-400 transition-colors duration-200">
                  View Inventory & Rates
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 mb-4">Contact</p>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-stone-400">
                <MapPin size={14} strokeWidth={1.5} />
                Phoenix Metro Area, AZ
              </span>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                All inquiries handled through our appointment booking process. Please use the Book a Call button above.
              </p>
            </div>
          </div>

        </Reveal>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600">&copy; {year} Canyon Apartments. All rights reserved.</p>
          <p className="text-xs text-stone-700 font-mono tracking-wide">Phoenix Metro Furnished Rentals</p>
        </div>
      </div>
    </footer>
  );
}

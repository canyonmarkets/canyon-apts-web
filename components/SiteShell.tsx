'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import PageChrome from './PageChrome';
import ScrollProgress from './ScrollProgress';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/leads') || pathname.startsWith('/book') || pathname.startsWith('/staff') || pathname.startsWith('/sign')) {
    return <>{children}</>;
  }
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Spacer so the sticky mobile CTA never covers footer content */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
      <PageChrome />
    </>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // اگر در صفحه لاگین ادمین بودیم، Navbar را نشان نده
  const showNavbar = pathname !== '/admin';

  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
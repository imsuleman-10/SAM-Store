'use client';

import { usePathname } from 'next/navigation';

export function ConditionalLayout({ children, header, footer }) {
  const pathname = usePathname();
  const hideLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/staff');

  return (
    <>
      {!hideLayout && header}
      <main>{children}</main>
      {!hideLayout && footer}
    </>
  );
}

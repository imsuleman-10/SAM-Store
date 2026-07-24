export const metadata = {
  title: 'Admin Dashboard — Glowvie',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }) {
  // Minimal layout for admin routes — do not render public site Header/Footer
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main>{children}</main>
    </div>
  );
}

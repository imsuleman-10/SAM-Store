import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ConditionalLayout } from '@/components/ConditionalLayout';

export const metadata = {
  title: 'Glowvie — Premium Beauty & Grooming',
  description: 'Discover exclusive beauty and grooming collections by Glowvie. Premium quality face wash, beard oils, and more, with nationwide cash on delivery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <CartProvider>
          <ConditionalLayout header={<Header />} footer={<Footer />}>
            {children}
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}

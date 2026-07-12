import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'SAM&CO — Premium Beauty & Grooming',
  description: 'Discover exclusive beauty and grooming collections by SAM&CO. Premium quality face wash, beard oils, and more, with nationwide cash on delivery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

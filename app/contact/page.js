import Link from 'next/link';
import { getStoreSettings } from '@/lib/storeSettings';

export const metadata = {
  title: 'Contact Us — Glowvie',
  description: 'Get in touch with the Glowvie team for any queries regarding your premium beauty and grooming orders.',
};

export default async function ContactPage() {
  const { store_phone, store_email, store_address } = await getStoreSettings();

  return (
    <main className="min-h-[70vh] bg-sand py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-soft rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Info */}
        <div className="bg-coal text-white p-10 md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="font-display text-3xl font-light mb-4">Get in Touch</h1>
            <p className="text-silver text-sm mb-10 leading-relaxed">
              Have a question about our grooming products, an order, or just want to say hi? We&apos;d love to hear from you.
            </p>
            
            <div className="space-y-6">
              {store_address && (
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">📍</span>
                  <div>
                    <h3 className="text-[11px] uppercase tracking-widest text-silver mb-1">Head Office</h3>
                    <p className="text-sm font-medium whitespace-pre-line">{store_address}</p>
                  </div>
                </div>
              )}
              
              {store_phone && (
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">📞</span>
                  <div>
                    <h3 className="text-[11px] uppercase tracking-widest text-silver mb-1">Phone / WhatsApp</h3>
                    <a href={`tel:${store_phone}`} className="text-sm font-medium hover:text-gold transition">
                      {store_phone}
                    </a>
                  </div>
                </div>
              )}

              {store_email && (
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">✉️</span>
                  <div>
                    <h3 className="text-[11px] uppercase tracking-widest text-silver mb-1">Email</h3>
                    <a href={`mailto:${store_email}`} className="text-sm font-medium hover:text-gold transition">
                      {store_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Fallback if nothing set yet */}
              {!store_phone && !store_email && !store_address && (
                <p className="text-sm text-silver/60 italic">
                  Contact details will appear here once configured by the admin.
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-[10px] uppercase tracking-widest text-silver mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gold transition">Instagram</a>
              <a href="#" className="hover:text-gold transition">Facebook</a>
              <a href="#" className="hover:text-gold transition">TikTok</a>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-10 md:w-1/2">
          <h2 className="font-display text-2xl font-light mb-6 text-black">Send a Message</h2>
          <form className="space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Your Name</label>
              <input type="text" className="input bg-sand border-none" placeholder="Ali Khan" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Email Address</label>
              <input type="email" className="input bg-sand border-none" placeholder="ali@example.com" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Phone Number</label>
              <input type="tel" className="input bg-sand border-none" placeholder="03xx-xxxxxxx" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Message</label>
              <textarea rows={4} className="input bg-sand border-none resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" className="btn btn-primary w-full mt-2">Send Message</button>
          </form>
        </div>
        
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Shipping Info — SAM&CO',
};

export default function ShippingPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-light mb-10 text-center text-black">Shipping Information</h1>
      
      <div className="prose prose-sm max-w-none text-grey space-y-6">
        <p>At SAM&CO, we offer fast and reliable shipping across Pakistan. We understand you're excited to receive your premium grooming products, and we work hard to get them to you as quickly as possible.</p>

        <div className="bg-sand p-6 border border-border rounded-lg mt-8 mb-8">
          <h3 className="font-display text-lg text-black mb-2">Free Delivery Nationwide</h3>
          <p className="text-sm m-0">We are currently offering completely FREE standard shipping on all orders across Pakistan, with no minimum purchase required.</p>
        </div>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Delivery Timelines</h3>
        <p>Our standard delivery times vary depending on your location:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Lahore:</strong> 1-2 Working Days</li>
          <li><strong>Major Cities (Karachi, Islamabad, Rawalpindi, etc.):</strong> 2-3 Working Days</li>
          <li><strong>Other Cities & Remote Areas:</strong> 3-5 Working Days</li>
        </ul>
        <p className="text-xs text-silver mt-2 italic">*Please note that during sales or promotional events, delivery times may be slightly extended.</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Cash on Delivery (COD)</h3>
        <p>We offer Cash on Delivery (COD) for all orders. You only pay when the rider hands over your SAM&CO package to you at your doorstep. Please ensure you have the exact amount ready to avoid any change issues.</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Order Tracking</h3>
        <p>Once your order has been dispatched from our warehouse, you will receive an SMS from our courier partner with your tracking number. You can use this tracking number on our <strong>Track Order</strong> page or directly on the courier's website to see the real-time status of your delivery.</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Missed Deliveries</h3>
        <p>The courier will attempt delivery twice. If you are unavailable, the parcel will be returned to us. If you still wish to receive the items, you may need to place a new order.</p>
      </div>
    </main>
  );
}

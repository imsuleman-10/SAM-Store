'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      // Mock logic: if orderId is typed, show a result
      if (orderId) {
        setStatus({
          id: orderId,
          status: 'shipped',
          date: new Date().toLocaleDateString(),
          courier: 'TCS Pakistan',
          trackingNumber: 'TCS-982347982'
        });
      } else {
        setStatus({ error: 'Order not found. Please check your details.' });
      }
    }, 1000);
  };

  return (
    <main className="min-h-[70vh] py-20 px-6 bg-white">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-light mb-3 text-black">Track Your Order</h1>
          <p className="text-grey text-sm">Enter your Order ID and Phone Number to check the delivery status of your SAM&CO products.</p>
        </div>

        <div className="bg-sand p-8 rounded-xl border border-border">
          <form onSubmit={handleTrack} className="space-y-5">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-grey block mb-2">Order ID</label>
              <input 
                type="text" 
                className="input bg-white" 
                placeholder="e.g. 5f4e3d2c..." 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-grey block mb-2">Phone Number</label>
              <input 
                type="text" 
                className="input bg-white" 
                placeholder="03xx-xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          {status && status.error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100 rounded text-center">
              {status.error}
            </div>
          )}

          {status && !status.error && (
            <div className="mt-8 p-6 bg-white border border-border rounded-lg shadow-soft">
              <h3 className="font-display text-xl font-light mb-4">Status: <span className="text-gold font-medium uppercase tracking-widest text-sm ml-2">SHIPPED</span></h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-line pb-3">
                  <span className="text-grey">Order Reference</span>
                  <span className="font-mono text-black font-semibold">#{status.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-line pb-3">
                  <span className="text-grey">Date</span>
                  <span className="text-black font-medium">{status.date}</span>
                </div>
                <div className="flex justify-between border-b border-line pb-3">
                  <span className="text-grey">Courier</span>
                  <span className="text-black font-medium">{status.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey">Tracking Number</span>
                  <span className="font-mono text-black">{status.trackingNumber}</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-center text-silver mt-6">Expected Delivery in 2-4 working days</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

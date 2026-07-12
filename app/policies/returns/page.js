export const metadata = {
  title: 'Return Policy — SAM&CO',
};

export default function ReturnsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-light mb-10 text-center text-black">Return & Exchange Policy</h1>
      
      <div className="prose prose-sm max-w-none text-grey space-y-6">
        <p>At SAM&CO, we strive to ensure our customers are 100% satisfied with their grooming and beauty purchases. If for any reason you are not completely satisfied, we are here to help.</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">7-Day Easy Returns</h3>
        <p>You have 7 days from the date of delivery to return or exchange an item. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging (including unbroken seals for liquid/cream products).</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Non-Returnable Items</h3>
        <p>Due to hygiene and safety reasons, the following items cannot be returned once the seal is broken or the product has been used:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Face Washes & Scrubs</li>
          <li>Beard Oils & Serums</li>
          <li>Creams, Lotions, and Lip Balms</li>
        </ul>

        <h3 className="font-display text-xl text-black mt-8 mb-3">How to Initiate a Return</h3>
        <p>To start a return, please contact our support team at <strong>support@samandco.pk</strong> or WhatsApp us at <strong>+92 300 1234567</strong> with your Order ID and a picture of the product. Once approved, we will provide you with instructions on how and where to send your package.</p>

        <h3 className="font-display text-xl text-black mt-8 mb-3">Refunds</h3>
        <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed via Bank Transfer or EasyPaisa/JazzCash within 5-7 business days.</p>
      </div>
    </main>
  );
}

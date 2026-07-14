import { redirect } from 'next/navigation';

// All return & exchange policy is now consolidated on the Shipping & Return Policy page.
export default function ReturnsRedirect() {
  redirect('/policies/shipping#return-exchange');
}

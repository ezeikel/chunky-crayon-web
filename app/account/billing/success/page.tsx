import Link from 'next/link';

const BillingSuccessPage = () => (
  <div>
    <h1>Thanks for your purchase!</h1>
    <Link href="/pricing">Go to billing</Link>
  </div>
);

export default BillingSuccessPage;

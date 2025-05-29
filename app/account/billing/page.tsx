import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/user';
import Billing from '@/components/Billing/Billing';

const BillingPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <Billing user={user} />;
};

export default BillingPage;

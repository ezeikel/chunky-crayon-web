import BillingSuccess from '@/components/BillingSuccess/BillingSuccess';
import { getStripeSession } from '@/app/actions/stripe';

const BillingSuccessPage = async ({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) => {
  let sessionData = null;
  if (searchParams.session_id) {
    sessionData = await getStripeSession(searchParams.session_id);
  }

  return (
    <BillingSuccess
      amount={sessionData?.amount_total ? sessionData.amount_total / 100 : null}
      currency={sessionData?.currency?.toUpperCase() || 'GBP'}
      sessionId={searchParams.session_id}
    />
  );
};

export default BillingSuccessPage;

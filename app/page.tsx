import { Suspense } from 'react';
import CreateColoringPageForm from '@/components/forms/CreateColoringPageForm/CreateColoringPageForm';

export const maxDuration = 60;

const HomePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CreateColoringPageForm />
  </Suspense>
);

export default HomePage;

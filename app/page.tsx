import type { Viewport } from 'next';
import { faMagicWandSparkles } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageWrap from '@/components/PageWrap/PageWrap';
import CreateColoringPageForm from '@/components/forms/CreateColoringPageForm/CreateColoringPageForm';
import AllColoringPageImages from '@/components/AllColoringPageImages/AllColoringPageImages';

export const maxDuration = 150;

// FIX: stop 14px fonts for inputs from zooming in on focus on iOS
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const HomePage = () => (
  <PageWrap className='bg-gradient-to-br from-[#FFF2E6] to-[#FFE6CC]" justify-center items-center gap-y-16'>
    <div className="max-w-lg flex flex-col gap-y-6 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <p className="font-dyna-puff text-[#FF8A65] font-base text-lg">
          Unleash your creativity! Describe a scene and let Chunky Crayon
          generate a coloring book page for you &nbsp;
          <FontAwesomeIcon
            icon={faMagicWandSparkles}
            className="text-[#FF8A65] text-base"
          />
        </p>
        <p className="text-[#FF8A65] text-sm font-bold">
          (This can take up to 2 minutes - please be patient)
        </p>
      </div>
      <CreateColoringPageForm />
    </div>
    <AllColoringPageImages />
  </PageWrap>
);

export default HomePage;

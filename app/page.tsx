import { faMagicWandSparkles } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageWrap from '@/components/PageWrap/PageWrap';
import CreateColoringPageForm from '@/components/forms/CreateColoringPageForm/CreateColoringPageForm';
import AllColoringPageImages from '@/components/AllColoringPageImages/AllColoringPageImages';

export const maxDuration = 80;

const HomePage = () => (
  <PageWrap className='bg-gradient-to-br from-[#FFF2E6] to-[#FFE6CC]" justify-center items-center gap-y-16'>
    <div className="max-w-lg flex flex-col gap-y-6 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="font-dyna-puff text-5xl font-bold text-[#FF8A65]">
          Chunky Crayon
        </h1>
        <p className="mt-4 text-[#A35709] font-normal">
          Unleash your creativity! Describe a scene and let Chunky Crayon
          generate a coloring book page for you.{' '}
          <FontAwesomeIcon
            icon={faMagicWandSparkles}
            className="text-[#FF8A65] text-base"
          />
        </p>
      </div>
      <CreateColoringPageForm />
    </div>
    <AllColoringPageImages />
  </PageWrap>
);

export default HomePage;

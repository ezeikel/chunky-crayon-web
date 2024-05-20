import ColoringImage from '@/components/ColoringImage/ColoringImage';
import PageWrap from '@/components/PageWrap/PageWrap';

type ColoringImagePageProps = {
  params: {
    id: string;
  };
};

const ColoringImagePage = ({ params: { id } }: ColoringImagePageProps) => (
  <PageWrap className='bg-gradient-to-br from-[#FFF2E6] to-[#FFE6CC]" justify-center items-center gap-y-32'>
    <h1 className="font-dyna-puff text-5xl font-bold text-center">
      Coloring Image title goes here
    </h1>
    <ColoringImage id={id} />
  </PageWrap>
);

export default ColoringImagePage;

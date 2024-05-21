import { getColoringImage } from '@/app/actions';
import ColoringImage from '@/components/ColoringImage/ColoringImage';
import PageWrap from '@/components/PageWrap/PageWrap';

type ColoringImagePageProps = {
  params: {
    id: string;
  };
};

const ColoringImagePage = async ({
  params: { id },
}: ColoringImagePageProps) => {
  const coloringImage = await getColoringImage(id);

  if (!coloringImage) {
    return null;
  }

  return (
    <PageWrap className='bg-gradient-to-br from-[#FFF2E6] to-[#FFE6CC]" justify-center items-center gap-y-32'>
      <div className="max-w-3xl w-full p-8 bg-[#FF8A65] rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="font-dyna-puff text-5xl font-bold mb-2 text-white">
            {coloringImage.title}
          </h1>
          <div className="flex items-center gap-x-2 text-lg text-white font-mediu">
            by Chunky Crayon
          </div>
        </div>
        <ColoringImage
          id={id}
          showActions
          className="rounded-lg shadow-lg bg-white"
        />
      </div>
    </PageWrap>
  );
};

export default ColoringImagePage;

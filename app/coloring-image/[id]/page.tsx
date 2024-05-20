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
      <div className="flex flex-col gap-y-4">
        <h1 className="font-dyna-puff text-5xl font-bold text-center">
          {coloringImage.title}
        </h1>
        <p className="text-center text-2xl">{coloringImage.description}</p>
      </div>
      <ColoringImage id={id} />
    </PageWrap>
  );
};

export default ColoringImagePage;

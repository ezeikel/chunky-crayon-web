import Image from 'next/image';
import { getColoringImage } from '@/app/actions';

type ColoringImageProps = {
  id: string;
};

const ColoringImage = async ({ id }: ColoringImageProps) => {
  const coloringImage = await getColoringImage(id);

  if (!coloringImage) {
    return null;
  }

  return (
    <Image
      src={coloringImage.blobUrl}
      alt={coloringImage.alt}
      width={1024}
      height={1024}
    />
  );
};

export default ColoringImage;

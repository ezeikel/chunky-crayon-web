import Image from 'next/image';
import { getColoringImage } from '@/app/actions';
import cn from '@/utils/cn';
import SaveButton from '../buttons/SaveButton/SaveButton';

type ColoringImageProps = {
  id: string;
  showActions?: boolean;
  className?: string;
};

const ColoringImage = async ({
  id,
  showActions = false,
  className,
}: ColoringImageProps) => {
  const coloringImage = await getColoringImage(id);

  if (!coloringImage) {
    return null;
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden', {
        [className as string]: !!className,
      })}
    >
      <Image
        src={coloringImage.url as string}
        alt={coloringImage.alt as string}
        width={1024}
        height={1024}
        quality={100}
        style={{
          objectFit: 'cover',
        }}
      />
      {showActions ? (
        <div className="absolute top-4 right-4 flex gap-x-4">
          <SaveButton coloringImage={coloringImage} />
        </div>
      ) : null}
    </div>
  );
};

export default ColoringImage;

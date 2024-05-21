import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown, faPrint } from '@fortawesome/pro-regular-svg-icons';
import { getColoringImage } from '@/app/actions';
import cn from '@/utils/cn';

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
        src={coloringImage.blobUrl}
        alt={coloringImage.alt}
        width={1024}
        height={1024}
        quality={100}
        style={{
          objectFit: 'cover',
        }}
      />
      {showActions ? (
        <div className="absolute top-4 right-4 flex gap-x-4">
          <button
            className="bg-[#FF8A65] size-12 rounded-full flex items-center justify-center"
            type="button"
            aria-label="save as pdf"
          >
            <FontAwesomeIcon
              icon={faFileArrowDown}
              className="text-3xl text-white"
            />
          </button>
          <button
            className="bg-[#FF8A65] size-12 rounded-full flex items-center justify-center"
            type="button"
            aria-label="print"
          >
            <FontAwesomeIcon icon={faPrint} className="text-3xl text-white" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ColoringImage;

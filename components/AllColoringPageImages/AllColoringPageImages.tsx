import Link from 'next/link';
import { getAllColoringImages } from '@/app/actions';
import ColoringImage from '@/components/ColoringImage/ColoringImage';

const AllColoringPageImages = async () => {
  const allColoringImages = await getAllColoringImages();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
      {allColoringImages.map((coloringImage) => (
        <Link
          href={`/coloring-image/${coloringImage.id}`}
          key={coloringImage.id}
        >
          <ColoringImage
            id={coloringImage.id}
            className="rounded-lg shadow-lg bg-white"
          />
        </Link>
      ))}
    </div>
  );
};

export default AllColoringPageImages;

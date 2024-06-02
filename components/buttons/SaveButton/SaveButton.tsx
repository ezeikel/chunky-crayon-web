'use client';

import dynamic from 'next/dynamic';
import { track } from '@vercel/analytics';
import { ColoringImage } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/pro-regular-svg-icons';
import ColoringPageDocument from '@/components/pdfs/ColoringPageDocument/ColoringPageDocument';
import cn from '@/utils/cn';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
  },
);

function formatTitleForFileName(title: string | undefined): string {
  if (!title) {
    return 'chunky-crayon';
  }

  return `${title.toLowerCase().replace(/\s+/g, '-')}-coloring-page.pdf`;
}

type SaveButtonProps = {
  coloringImage: Partial<ColoringImage>;
  className?: string;
};

const SaveButton = ({ coloringImage, className }: SaveButtonProps) => {
  if (!coloringImage) {
    return null;
  }

  return (
    <PDFDownloadLink
      document={<ColoringPageDocument coloringImage={coloringImage} />}
      fileName={`${formatTitleForFileName(coloringImage.title)}-coloring-page.pdf`}
      className={cn(
        'flex items-center justify-center gap-x-4 text-black font-semibold p-4 rounded-lg shadow-lg bg-white',
        {
          [className as string]: !!className,
        },
      )}
      onClick={async () =>
        track('Clicked save coloring image', {
          id: coloringImage.id as string,
        })
      }
    >
      {({ loading, error }) => {
        if (loading) {
          return 'Loading...';
        }

        if (error) {
          return 'Error';
        }

        return (
          <>
            Download PDF
            <FontAwesomeIcon
              icon={faFileArrowDown}
              className="text-3xl text-black"
            />
          </>
        );
      }}
    </PDFDownloadLink>
  );
};

export default SaveButton;

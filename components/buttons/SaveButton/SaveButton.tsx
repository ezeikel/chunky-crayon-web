'use client';

import dynamic from 'next/dynamic';
import { track } from '@vercel/analytics';
import { ColoringImage } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/pro-regular-svg-icons';
import ColoringPageDocument from '@/components/pdfs/ColoringPageDocument/ColoringPageDocument';

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
};

const SaveButton = ({ coloringImage }: SaveButtonProps) => {
  if (!coloringImage) {
    return null;
  }

  return (
    <button
      className="bg-[#FF8A65] size-12 rounded-full flex items-center justify-center"
      type="button"
      aria-label="save"
      onClick={async () => track('Clicked save coloring image')}
    >
      <PDFDownloadLink
        document={<ColoringPageDocument coloringImage={coloringImage} />}
        fileName={`${formatTitleForFileName(coloringImage.title)}-coloring-page.pdf`}
      >
        {({ loading, error }) => {
          if (loading) {
            return 'Loading...';
          }

          if (error) {
            return 'Error';
          }

          return (
            <FontAwesomeIcon
              icon={faFileArrowDown}
              className="text-3xl text-white"
            />
          );
        }}
      </PDFDownloadLink>
    </button>
  );
};

export default SaveButton;

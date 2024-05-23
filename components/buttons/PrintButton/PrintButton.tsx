'use client';

import { track } from '@vercel/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/pro-regular-svg-icons';

const PrintButton = () => (
  <button
    className="bg-[#FF8A65] size-12 rounded-full flex items-center justify-center"
    type="button"
    aria-label="print"
    onClick={() => track('Clicked print coloring image')}
  >
    <FontAwesomeIcon icon={faPrint} className="text-3xl text-white" />
  </button>
);

export default PrintButton;

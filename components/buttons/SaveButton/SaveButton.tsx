'use client';

import { track } from '@vercel/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/pro-regular-svg-icons';

const SaveButton = () => (
  <button
    className="bg-[#FF8A65] size-12 rounded-full flex items-center justify-center"
    type="button"
    aria-label="save"
    onClick={() => track('Clicked save coloring image')}
  >
    <FontAwesomeIcon icon={faFileArrowDown} className="text-3xl text-white" />
  </button>
);

export default SaveButton;

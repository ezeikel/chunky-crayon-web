'use client';

import { ReactTyped } from 'react-typed';

type TypedTextProps = {
  strings: string[];
};

const TypedText = ({ strings }: TypedTextProps) => (
  <ReactTyped
    strings={strings}
    typeSpeed={40}
    loop
    showCursor={false}
    backDelay={1500}
  />
);

export default TypedText;

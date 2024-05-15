'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { createColoringPage } from '@/app/actions';

type CreateColoringPageFormProps = {
  className?: string;
};

const CreateColoringPageForm = ({ className }: CreateColoringPageFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <>
      <form
        action={async (formData) => {
          // DEBUG:
          // eslint-disable-next-line no-console
          console.log('Form data', formData);

          const response = await createColoringPage(formData);
          if (response) {
            setImageUrl(response);
          }
        }}
        ref={formRef}
        className={className}
      >
        <input
          type="text"
          name="text"
          placeholder="Enter a description"
          style={{
            color: 'black',
          }}
        />
        <button type="submit">Submit</button>
      </form>
      {imageUrl ? (
        <Image src={imageUrl} alt="Coloring page" width={1024} height={1024} />
      ) : null}
    </>
  );
};

export default CreateColoringPageForm;

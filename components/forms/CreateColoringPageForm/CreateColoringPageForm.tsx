'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { createColoringImage } from '@/app/actions';
import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import { Textarea } from '@/components/ui/textarea';
import cn from '@/utils/cn';

type CreateColoringPageFormProps = {
  className?: string;
};

const CreateColoringPageForm = ({ className }: CreateColoringPageFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        // DEBUG:
        // eslint-disable-next-line no-console
        console.log('Form data', formData);

        const rawFormData = {
          description: (formData.get('description') as string) || '',
        };

        track('Submitted coloring image description', {
          description: rawFormData.description,
          type: 'text',
        });

        const coloringImage = await createColoringImage(formData);

        router.push(`/coloring-image/${coloringImage.id}`);
      }}
      ref={formRef}
      className={cn('flex flex-col gap-y-4', {
        [className as string]: !!className,
      })}
    >
      <Textarea
        name="description"
        placeholder="e.g. a dragon flying around New York City"
        className="border border-[#FFA07A] rounded-md shadow-sm focus:outline-none focus:ring-[#FF8A65] focus:border-[#FF8A65]"
      />
      <SubmitButton
        text="Generate Coloring Page"
        className="text-white bg-[#FF8A65] hover:bg-[#FF7043] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:ring-offset-2"
      />
    </form>
  );
};

export default CreateColoringPageForm;

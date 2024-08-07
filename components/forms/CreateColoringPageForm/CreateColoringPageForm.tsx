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
    <div className="max-w-lg flex flex-col gap-y-4 p-8 bg-white rounded-lg shadow-perfect">
      <p className="font-tondo font-bold text-xl text-orange text-center">
        Describe a scene and let Chunky Crayon generate a unique coloring page
        for you! ✨
      </p>
      <p className="font-tondo text-[#A6A6A6] text-base leading-6 font-bold text-center">
        (This can take up to 2 minutes - please be patient)
      </p>
      <form
        action={async (formData) => {
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
          placeholder="e.g. a pirate ship sailing through space"
          className="text-base border border-[#4B4B4B] h-56 rounded-md  focus:outline-none resize-none placeholder:text-[#A6A6A6] placeholder:text-base"
          required
        />
        <SubmitButton
          text="Generate coloring page"
          className="font-tondo text-white bg-[#FF8A65] hover:bg-[#FF7043] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:ring-offset-2"
        />
      </form>
    </div>
  );
};

export default CreateColoringPageForm;

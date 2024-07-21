'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { createColoringImage } from '@/app/actions';
import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import cn from '@/utils/cn';

type JoinMailingListFormProps = {
  className?: string;
};

const JoinMailingListForm = ({ className }: JoinMailingListFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <div
      className={cn('flex flex-col gap-y-4', {
        [className as string]: !!className,
      })}
    >
      <p className="text-[#4B4B4B] text-base leading-5">
        Drop your email to the receive one free colouring page in your inbox
        every week.
      </p>
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
        className={cn('flex gap-x-8', {
          [className as string]: !!className,
        })}
      >
        <input
          type="text"
          className="flex-1 border border-[#4B4B4B] rounded shadow-perfect py-2 px-4 placeholder:text-[#A6A6A6] placeholder:text-base"
          placeholder="coco@melon.com"
        />
        <SubmitButton
          text="Join"
          className="font-tondo text-[#FF8A65] bg-transparent hover:bg-[#FF8A65] hover:text-white border border-[#FF8A65] font-bold text-xl leading-6 shadow-perfect py-2 px-4"
        />
      </form>
    </div>
  );
};

export default JoinMailingListForm;

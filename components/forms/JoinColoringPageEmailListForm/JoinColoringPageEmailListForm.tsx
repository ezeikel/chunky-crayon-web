'use client';

import { useRef } from 'react';
import { track } from '@vercel/analytics';
import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import cn from '@/utils/cn';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

type JoinColoringPageEmailListFormProps = {
  className?: string;
};

const JoinColoringPageEmailListForm = ({
  className,
}: JoinColoringPageEmailListFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  return (
    <div
      className={cn('flex flex-col gap-y-4', {
        [className as string]: !!className,
      })}
    >
      <p className="text-[#4B4B4B] text-base leading-5">
        Enter your email to receive a{' '}
        <span className="uppercase font-semibold underline">free</span> coloring
        page in your inbox every week.
      </p>
      <form
        action={async (formData) => {
          const rawFormData = {
            email: (formData.get('email') as string) || '',
          };

          // add email to email list
          try {
            const response = await fetch('/api/email-list/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(rawFormData),
            });

            if (!response.ok) {
              throw new Error('Failed to subscribe to email list');
            }

            // show success toast
            toast({
              title: 'Success 🎉',
              description: 'You have successfully joined the email list!',
            });

            // track email list subscription
            track('Signed up to coloring page email list', {
              email: rawFormData.email,
            });

            // reset form after submission
            if (emailInputRef.current) {
              emailInputRef.current.value = '';
            }
          } catch (error) {
            // show error toast
            toast({
              title: 'Something went wrong 😢',
              description: 'Failed to join the email list. Please try again.',
            });

            console.error({ error });
          }
        }}
        ref={formRef}
        className={cn('flex gap-x-8', {
          [className as string]: !!className,
        })}
      >
        <Input
          type="email"
          name="email"
          className="flex-1 border border-[#4B4B4B] rounded shadow-perfect placeholder:text-[#A6A6A6] placeholder:text-base"
          placeholder="thecoolparent@example.com"
          ref={emailInputRef}
          required
        />
        <SubmitButton
          text="Join"
          className="font-tondo text-[#FF8A65] bg-transparent hover:bg-[#FF8A65] hover:text-white border border-[#FF8A65]"
        />
      </form>
    </div>
  );
};

export default JoinColoringPageEmailListForm;

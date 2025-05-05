'use client';

import { useEffect, useRef, useActionState } from 'react';
import { track } from '@vercel/analytics';
import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import cn from '@/utils/cn';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { joinColoringPageEmailList } from '@/app/actions';

type JoinColoringPageEmailListFormProps = {
  className?: string;
};

const JoinColoringPageEmailListForm = ({
  className,
}: JoinColoringPageEmailListFormProps) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  // TODO: useFormState has been swapped out for useActionState in later canary versions
  const [state, joinColoringPageEmailListAction] = useActionState(
    joinColoringPageEmailList,
    {
      success: false,
    },
  );

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success 🎉',
        description: 'You have successfully joined the email list!',
      });

      track('Signed up to coloring page email list', {
        email: state.email as string,
      });

      if (emailInputRef.current) {
        emailInputRef.current.value = '';
      }
    } else if (state.error) {
      toast({
        title: 'Something went wrong 😢',
        description: 'Failed to join the email list. Please try again.',
      });

      console.error({ error: state.error });
    }
  }, [state.success, state.error]);

  return (
    <div
      className={cn('flex flex-col gap-y-4', {
        [className as string]: !!className,
      })}
    >
      <p className="text-[#4B4B4B] text-base leading-5">
        Enter your email to receive a{' '}
        <span className="uppercase font-semibold underline">free</span> coloring
        page in your inbox every day.
      </p>
      <form
        action={joinColoringPageEmailListAction}
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

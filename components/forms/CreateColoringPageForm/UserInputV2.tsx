'use client';

import useUser from '@/hooks/useUser';
import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import cn from '@/utils/cn';

const UserInputV2 = () => {
  const {
    isSignedIn,
    hasEnoughCredits,
    hasActiveSubscription,
    handleAuthAction,
  } = useUser();

  const getTextareaConfig = () => {
    if (!isSignedIn) {
      return {
        disabled: true,
        placeholder: 'Sign in to start creating magical colouring pages!',
      };
    }

    if (!hasEnoughCredits) {
      if (hasActiveSubscription) {
        return {
          disabled: true,
          placeholder: "You're out of credits — top up or upgrade your plan!",
        };
      }
      return {
        disabled: true,
        placeholder:
          "You've used your free credits — choose a plan to continue creating!",
      };
    }

    return {
      disabled: false,
      placeholder: 'e.g. a pirate ship sailing through space',
    };
  };

  const getButtonConfig = () => {
    if (!isSignedIn) {
      return {
        text: 'Get started for free',
        action: () => handleAuthAction('signin'),
        subtext: "You'll get 15 free credits — enough to generate 3 pages!",
        isSubmit: false,
      };
    }

    if (!hasEnoughCredits) {
      if (hasActiveSubscription) {
        return {
          text: 'Buy more credits',
          action: () => handleAuthAction('billing'),
          subtext:
            'Need more magic? Top up or upgrade to keep the creativity going!',
          isSubmit: false,
        };
      }
      return {
        text: 'View plans',
        action: () => handleAuthAction('billing'),
        subtext: 'Choose a subscription to unlock more creations',
        isSubmit: false,
      };
    }

    return {
      text: 'Generate colouring page',
      isSubmit: true,
    };
  };

  const textareaConfig = getTextareaConfig();
  const buttonConfig = getButtonConfig();

  return (
    <>
      <Textarea
        name="description"
        placeholder={textareaConfig.placeholder}
        className={cn(
          'text-base border h-56 rounded-md focus:outline-none resize-none placeholder:text-[#A6A6A6] placeholder:text-base',
          textareaConfig.disabled
            ? 'border-[#E5E5E5] bg-[#F5F5F5] cursor-not-allowed'
            : 'border-[#4B4B4B]',
        )}
        required
        disabled={textareaConfig.disabled}
      />
      {buttonConfig.isSubmit ? (
        <SubmitButton
          text={buttonConfig.text}
          className="font-tondo text-white bg-[#FF8A65] hover:bg-[#FF7043] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:ring-offset-2"
        />
      ) : (
        <Button
          onClick={buttonConfig.action}
          className="font-tondo text-white bg-[#FF8A65] hover:bg-[#FF7043] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:ring-offset-2"
          type="button"
        >
          {buttonConfig.text}
        </Button>
      )}
      {buttonConfig.subtext && (
        <p className="text-sm text-center text-[#A6A6A6] mt-2">
          {buttonConfig.subtext}
        </p>
      )}
    </>
  );
};

export default UserInputV2;

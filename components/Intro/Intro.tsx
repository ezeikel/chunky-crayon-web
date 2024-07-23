import Balancer from 'react-wrap-balancer';
import cn from '@/utils/cn';
import { UNLEASH_STRINGS } from '@/constants';
import JoinColoringPageEmailListFormProps from '../forms/JoinColoringPageEmailListForm/JoinColoringPageEmailListForm';
import TypedText from '../TypedText/TypedText';

type IntroProps = {
  className?: string;
};

const Intro = ({ className }: IntroProps) => {
  return (
    <div
      className={cn({
        [className as string]: !!className,
      })}
    >
      <h2 className="font-tondo font-bold text-[64px] leading-[79px] text-[#4B4B4B] mb-8 [white-space:pre-wrap] [word-break:break-word]">
        <Balancer>
          Unleash your child&apos;s <TypedText strings={UNLEASH_STRINGS} />
          &nbsp;today
        </Balancer>
      </h2>
      <p className="text-2xl text-[#A6A6A6] mb-8">
        From vibrant coloring pages to imaginative adventures, Chunky Crayon
        transforms creativity into pure joy.
      </p>
      <JoinColoringPageEmailListFormProps className="max-w-[429px]" />
    </div>
  );
};

export default Intro;

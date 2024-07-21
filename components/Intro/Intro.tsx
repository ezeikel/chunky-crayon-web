import cn from '@/utils/cn';
import JoinMailingListForm from '../forms/JoinMailingListForm/JoinMailingListForm';
import TypedText from '../TypedText/TypedText';

const STRINGS = [
  'creativity',
  'imagination',
  'fun',
  'adventure',
  'discovery',
  'exploration',
  'inspiration',
  'art',
  'joy',
  'learning',
  'wonder',
  'dreams',
  'playtime',
  'innovation',
  'magic',
  'curiosity',
  'expression',
  'fantasy',
  'stories',
  'excitement',
];

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
      <h2 className="font-tondo font-bold text-[64px] leading-[79px] text-[#4B4B4B] mb-8">
        Unleash your child&apos;s <TypedText strings={STRINGS} />
        &nbsp;today
      </h2>
      <p className="text-2xl text-[#A6A6A6] mb-8">
        From vibrant colouring pages to imaginative adventures, Chunky Crayon
        transforms creativity into pure joy.
      </p>
      <JoinMailingListForm className="max-w-[429px]" />
    </div>
  );
};

export default Intro;

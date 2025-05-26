import SubmitButton from '@/components/buttons/SubmitButton/SubmitButton';
import { Textarea } from '@/components/ui/textarea';

const UserInput = () => (
  <>
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
  </>
);

export default UserInput;

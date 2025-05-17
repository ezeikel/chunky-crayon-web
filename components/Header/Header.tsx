import Link from 'next/link';
import { showAuthButtonsFlag } from '@/flags';
import SignInButtons from '../buttons/SignInButtons/SignInButtons';

const Header = async () => {
  const showAuthButtons = await showAuthButtonsFlag();

  return (
    <header className="flex p-4 shadow-perfect sticky top-0 z-10 bg-white">
      <Link href="/">
        <h1 className="font-tondo text-4xl font-bold text-[#FF8A65] tracking-tight">
          Chunky Crayon
        </h1>
      </Link>
      {showAuthButtons && <SignInButtons />}
    </header>
  );
};

export default Header;

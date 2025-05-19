import Link from 'next/link';
import { showAuthButtonsFlag } from '@/flags';
import { getCurrentUser } from '@/app/actions/user';
import { signOut } from '@/auth';
import SignInButtons from '../buttons/SignInButtons/SignInButtons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const Header = async () => {
  const user = await getCurrentUser();
  const showAuthButtons = await showAuthButtonsFlag();

  const renderItems = () => {
    if (!showAuthButtons) {
      return null;
    }

    if (user) {
      return (
        <div className="flex items-center gap-4">
          <ul className="flex gap-4">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <form
                action={async () => {
                  'use server';

                  await signOut();
                }}
              >
                <button type="submit">Sign out</button>
              </form>
            </li>
          </ul>
          <Avatar>
            {user.image && <AvatarImage src={user.image} />}
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm">{user.credits} credits</p>
        </div>
      );
    }

    return <SignInButtons />;
  };

  return (
    <header className="flex items-center justify-between p-4 shadow-perfect sticky top-0 z-10 bg-white">
      <Link href="/">
        <h1 className="font-tondo text-4xl font-bold text-[#FF8A65] tracking-tight">
          Chunky Crayon
        </h1>
      </Link>
      {renderItems()}
    </header>
  );
};

export default Header;

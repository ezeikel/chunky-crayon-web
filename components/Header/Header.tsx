import Link from 'next/link';
import { User } from '@prisma/client';
import { showAuthButtonsFlag } from '@/flags';
import { getCurrentUser } from '@/app/actions/user';
import { signOut } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Visibility = 'always' | 'authenticated' | 'unauthenticated';

type NavItem = {
  label: string;
  href?: string;
  component?: (user: Partial<User>) => React.ReactNode;
  visibility: Visibility;
};

const ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    visibility: 'always',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    visibility: 'unauthenticated',
  },
  {
    label: 'Billing',
    href: '/account/billing',
    visibility: 'authenticated',
  },
  {
    label: 'Credits',
    component: (user: Partial<User>) => (
      <p className="text-sm">{user.credits} credits</p>
    ),
    visibility: 'authenticated',
  },
  {
    label: 'Sign out',
    component: () => (
      <form
        action={async () => {
          'use server';

          await signOut();
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    ),
    visibility: 'authenticated',
  },
];

const Header = async () => {
  const user = await getCurrentUser();
  const showAuthButtons = await showAuthButtonsFlag();

  const renderItems = () => {
    if (!showAuthButtons) {
      return null;
    }

    const visibleItems = ITEMS.filter((item) => {
      switch (item.visibility) {
        case 'always':
          return true;
        case 'authenticated':
          return !!user;
        case 'unauthenticated':
          return !user;
        default:
          return false;
      }
    });

    if (user) {
      return (
        <div className="flex items-center gap-4">
          <ul className="flex gap-4">
            {visibleItems.map((item) => (
              <li key={item.href}>
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  item.component?.(user)
                )}
              </li>
            ))}
          </ul>
          <Avatar>
            {user.image && <AvatarImage src={user.image} />}
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <ul className="flex gap-4">
          {visibleItems.map((item) => (
            <li key={item.href}>
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                item.component?.({} as Partial<User>)
              )}
            </li>
          ))}
        </ul>
        <Link href="/signin">Sign in</Link>
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between p-4 shadow-perfect sticky top-0 z-50 bg-white">
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

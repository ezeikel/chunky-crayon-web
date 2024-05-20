import Link from 'next/link';

const Header = () => (
  <header className="p-4">
    <Link href="/">
      <h1 className="font-dyna-puff text-4xl font-bold text-[#FF8A65]">
        Chunky Crayon
      </h1>
    </Link>
  </header>
);

export default Header;

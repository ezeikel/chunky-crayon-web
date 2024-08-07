import Link from 'next/link';

const Header = () => (
  <header className="flex p-4 shadow-perfect sticky top-0 z-10 bg-white">
    <Link href="/">
      <h1 className="font-tondo text-4xl font-bold text-[#FF8A65] tracking-tight">
        Chunky Crayon
      </h1>
    </Link>
  </header>
);

export default Header;

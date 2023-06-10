import Link from "next/link";

const Navbar = () => {
  return (
    <div className="navbar fixed top-0 z-50 bg-base-100 shadow-md">
      <Link href="/" className="btn-ghost btn">
        Home
      </Link>
    </div>
  );
};

export default Navbar;

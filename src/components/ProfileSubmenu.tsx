import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export const ProfileSubmenu = () => {
  const user = useUser();

  if (!user.user) return null;

  return (
    <div className="m-3 flex max-h-36 flex-col justify-start bg-white p-4 shadow-md">
      <Link href={`/profile/${user.user?.id}`} className="btn-ghost btn">
        Profile
      </Link>
      <button className="btn-ghost btn">Sign out</button>
    </div>
  );
};

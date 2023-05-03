import Image from "next/image";
import { api } from "~/utils/api";

type user = {
  id: string;
  fullName: string;
  profileImageUrl: string;
};
const UserView = (props: user) => {
  const { fullName, profileImageUrl } = props;

  return (
    <div className="flex items-center justify-center">
      <Image
        className="mx-4 my-2 rounded-full"
        alt={`${fullName}'s profile`}
        src={profileImageUrl}
        height={36}
        width={36}
      />
      <div>{fullName}</div>
      {/* Implement check for if users are already friends, make userRelations procedure for 
      sending a friend request */}
      <button>Friend Request</button>
    </div>
  );
};

export const UsersList = () => {
  const { data, isLoading } = api.users.getAll.useQuery();
  console.log("data is: ", data);

  if (!data) return null;

  if (isLoading) return <div>Loading...</div>;

  const mappedUsers = data?.map((user) => {
    return <UserView key={user.id} {...user} />;
  });

  return (
    <div>
      <h1>Users List</h1>
      <div>{mappedUsers}</div>
    </div>
  );
};

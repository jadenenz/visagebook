import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";

type user = {
  id: string;
  fullName: string;
  profileImageUrl: string;
};
const UserView = (props: user) => {
  const { fullName, profileImageUrl, id } = props;

  const user = useUser().user;

  if (id === user?.id) return null;

  const { data, isLoading } = api.relations.getAll.useQuery();
  console.log("data is: ", data);
  console.log("userID is : ", user?.id);

  if (!data) return null;

  if (isLoading) return <div>Loading...</div>;

  const relationsInvolvingUser = data?.filter(
    (relation) => relation.relatingUser.id === user?.id
  );

  console.log("relationsInvolvingUser: ", relationsInvolvingUser);

  const userIsFriendsWith = relationsInvolvingUser?.filter(
    (relation) => relation.relatedUser === id
  );
  return (
    <div className="flex items-center justify-center">
      <Image
        className="mx-4 my-2 rounded-full"
        alt={`${fullName}'s profile`}
        src={profileImageUrl}
        height={36}
        width={36}
      />
      <div className="mx-2">{fullName}</div>
      {userIsFriendsWith.length > 0 && (
        <div className="text-sm">Already friends!</div>
      )}
      {userIsFriendsWith.length === 0 && (
        <button className="text-sm">Friend Request</button>
      )}
    </div>
  );
};

export const UsersList = () => {
  const { data, isLoading } = api.users.getAll.useQuery();

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

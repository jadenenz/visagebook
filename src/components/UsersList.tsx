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

  const ctx = api.useContext();
  const user = useUser().user;

  if (id === user?.id) return null;

  const { data, isLoading } = api.relations.getAll.useQuery();
  const mutation = api.relations.requestById.useMutation({
    onSuccess: () => {
      void ctx.relations.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        console.log(errorMessage[0]);
      } else {
        console.log("Failed to update! Please try again later.");
      }
    },
  });
  console.log("data is: ", data);
  console.log("userID is : ", user?.id);

  if (!data) return null;

  if (isLoading) return <div>Loading...</div>;

  const handleFriendRequest = () => {
    mutation.mutate({ relatedUserId: id });
  };

  const relationsInvolvingUser = data?.filter(
    (relation) => relation.relatingUser.id === user?.id
  );

  console.log("relationsInvolvingUser: ", relationsInvolvingUser);

  const userIsFriendsWith = relationsInvolvingUser?.filter(
    (relation) => relation.relatedUser === id && relation.type === "friend"
  );

  const userSentPendingRequest = relationsInvolvingUser?.filter(
    (relation) => relation.relatedUser === id && relation.type === "pending"
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
      {userIsFriendsWith.length === 0 &&
        userSentPendingRequest.length === 0 && (
          <button onClick={handleFriendRequest} className="text-sm">
            Friend Request
          </button>
        )}
      {userSentPendingRequest.length > 0 && <div>Friend request pending</div>}
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
    <div className="flex flex-col items-center">
      <div>Users List</div>
      <div>{mappedUsers}</div>
    </div>
  );
};

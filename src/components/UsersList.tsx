import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
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

  const { data, isLoading } = api.relations.getAll.useQuery();
  // const mutation = api.relations.requestById.useMutation({
  //   onSuccess: () => {
  //     void ctx.relations.getAll.invalidate();
  //   },
  //   onError: (e) => {
  //     const errorMessage = e.data?.zodError?.fieldErrors.content;
  //     if (errorMessage && errorMessage[0]) {
  //       console.log(errorMessage[0]);
  //     } else {
  //       console.log("Failed to update! Please try again later.");
  //     }
  //   },
  // });
  console.log("data is: ", data);
  console.log("userID is : ", user?.id);

  if (id === user?.id) return null;

  if (!data) return null;

  if (isLoading) return <div>Loading...</div>;

  // const handleFriendRequest = () => {
  //   mutation.mutate({ relatedUserId: id });
  // };

  // const relationsInvolvingUser = data?.filter(
  //   (relation) => relation.relatingUser.id === user?.id
  // );

  // const userIsFriendsWith = relationsInvolvingUser?.filter(
  //   (relation) => relation.relatedUser === id && relation.type === "friend"
  // );

  // const userSentPendingRequest = relationsInvolvingUser?.filter(
  //   (relation) => relation.relatedUser === id && relation.type === "pending"
  // );
  return (
    <Link href={`/profile/${id}`} className="btn-ghost btn">
      <div className="flex items-center justify-start">
        <Image
          className="mx-4 my-2 rounded-full"
          alt={`${fullName}'s profile`}
          src={profileImageUrl}
          height={36}
          width={36}
        />
        <div className="mx-2">{fullName}</div>
        {/* {userIsFriendsWith.length > 0 && (
        <div className="text-sm text-blue-500">Already friends!</div>
      )}
      {userIsFriendsWith.length === 0 &&
        userSentPendingRequest.length === 0 && (
          <button onClick={handleFriendRequest} className="text-sm">
            Friend Request
          </button>
        )}
      {userSentPendingRequest.length > 0 && <div>Friend request pending</div>} */}
      </div>
    </Link>
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
    <div className="flex flex-col items-start">
      <div>Users List</div>
      <div className="flex flex-col items-start">{mappedUsers}</div>
    </div>
  );
};

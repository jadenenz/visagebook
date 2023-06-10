import type { NextPage } from "next";
import { api } from "~/utils/api";
import { PostView } from "~/components/PostView";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "~/components/Navbar";

const ProfileFeed = () => {
  const router = useRouter();
  if (!router.query.id) return null;

  const { data: postData, isLoading: postsLoading } =
    api.posts.getPostsByUser.useQuery({ content: router.query.id as string });

  if (!postData) return null;

  //   const filteredData = postData.filter(
  //     (post) => post.author.id === router.query.id
  //   );

  if (postsLoading)
    return <span className="loading-spinner loading-lg loading"></span>;
  if (!postData) return <div>Something went wrong</div>;

  return (
    <div className="flex w-full max-w-4xl flex-col">
      {postData?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
      {postData.length === 0 && (
        <div className="text-bold text-6xl">
          This user hasn&apos;t posted anything yet...
          <span className="loading-ring loading-lg loading"></span>
        </div>
      )}
    </div>
  );
};

const UserProfilePage: NextPage = () => {
  const ctx = api.useContext();
  const router = useRouter();
  const user = useUser().user;

  const { data: relationData, isLoading: relationIsLoading } =
    api.relations.getAll.useQuery();
  const friendMutation = api.relations.requestById.useMutation({
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

  const unfriendMutation = api.relations.unfriendById.useMutation({
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

  const relationsInvolvingUser = relationData?.filter(
    (relation) => relation.relatingUser.id === user?.id
  );

  const userIsFriendsWith = relationsInvolvingUser?.filter(
    (relation) =>
      relation.relatedUser === router.query.id && relation.type === "friend"
  );

  const userSentPendingRequest = relationsInvolvingUser?.filter(
    (relation) =>
      relation.relatedUser === router.query.id && relation.type === "pending"
  );

  const handleFriendRequest = () => {
    friendMutation.mutate({ relatedUserId: router.query.id as string });
  };

  const handleUnfriendRequest = () => {
    unfriendMutation.mutate({ relatedUserId: router.query.id as string });
  };

  const { data, isLoading } = api.users.getById.useQuery({
    content: router.query.id as string,
  });

  if (relationsInvolvingUser === undefined) return null;
  if (userIsFriendsWith === undefined) return null;
  if (userSentPendingRequest === undefined) return null;
  if (!data) return null;
  if (isLoading)
    return <span className="loading-spinner loading-lg loading"></span>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mb-8 flex min-w-full flex-col items-center bg-white shadow-md lg:px-20">
        <div className="h-72 w-full max-w-7xl justify-center rounded bg-gray-200"></div>
        <div className="relative flex w-full max-w-7xl justify-between p-2 pb-4 shadow-md">
          <div>
            <div className="absolute bottom-1 ml-6 flex h-28 w-28 items-center justify-center rounded-full bg-white">
              <Image
                className="rounded-full"
                src={data.profileImageUrl}
                alt={`${data.fullName}'s profile`}
                height={98}
                width={98}
              />
            </div>
            <div className="ml-36 text-4xl font-bold">{data.fullName}</div>
          </div>
          <div>
            {userIsFriendsWith.length === 0 &&
              userSentPendingRequest.length === 0 && (
                <button
                  className="btn-ghost btn"
                  onClick={handleFriendRequest}
                  disabled={friendMutation.isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-3 h-6 w-6 text-blue-500"
                  >
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                  Friend Request
                </button>
              )}
            {userSentPendingRequest.length > 0 && (
              <button
                className="btn-ghost btn"
                onClick={handleFriendRequest}
                disabled={true}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-3 h-6 w-6 text-blue-500"
                >
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
                Pending request
              </button>
            )}
            {userIsFriendsWith.length > 0 && (
              <button className="btn-ghost btn" onClick={handleUnfriendRequest}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-3 h-6 w-6 text-blue-500"
                >
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
                Unfriend
              </button>
            )}
            <button className="btn-ghost btn ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-3 h-6 w-6 text-blue-500"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                  clip-rule="evenodd"
                />
              </svg>
              Message
            </button>
          </div>
        </div>
      </div>
      <div className=" flex h-full flex-col content-center items-center justify-center">
        <ProfileFeed />
      </div>
    </div>
  );
};

export default UserProfilePage;

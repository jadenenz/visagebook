import type { NextPage } from "next";
import { api } from "~/utils/api";
import { PostView } from "~/components/PostView";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";

const ProfileFeed = () => {
  const router = useRouter();
  if (!router.query.id) return null;

  const { data: postData, isLoading: postsLoading } =
    api.posts.getPostsByUser.useQuery({ content: router.query.id as string });

  if (!postData) return null;

  //   const filteredData = postData.filter(
  //     (post) => post.author.id === router.query.id
  //   );

  if (postsLoading) return <div>Loading...</div>;
  if (!postData) return <div>Something went wrong</div>;

  return (
    <div className="flex w-full max-w-4xl flex-col">
      {postData?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const UserProfilePage: NextPage = () => {
  const router = useRouter();
  const { data, isLoading } = api.users.getById.useQuery({
    content: router.query.id as string,
  });

  if (!data) return null;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex min-w-full flex-col items-center border bg-white lg:px-20">
        <div className="h-72 w-full max-w-7xl justify-center rounded bg-gray-200"></div>
        <div className="relative flex w-full max-w-7xl p-2 shadow-md">
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
      </div>
      <div className=" flex flex-col content-center items-center justify-center">
        <ProfileFeed />
      </div>
    </div>
  );
};

export default UserProfilePage;

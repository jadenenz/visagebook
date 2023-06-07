import type { NextPage } from "next";
import { api } from "~/utils/api";
import { PostView } from "~/components/PostView";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

const ProfileFeed = () => {
  const router = useRouter();
  const { data: postData, isLoading: postsLoading } =
    api.posts.getAll.useQuery();

  if (!postData) return null;

  const filteredData = postData.filter(
    (post) => post.author.id === router.query.id
  );

  if (postsLoading) return <div>Loading...</div>;
  if (!postData) return <div>Something went wrong</div>;

  return (
    <div className="flex w-full max-w-4xl flex-col">
      {filteredData?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const UserProfilePage: NextPage = () => {
  //   const router = useRouter();
  //   console.log(router.query.id);

  return (
    <div>
      <div className="flex min-w-full flex-col items-center border bg-white px-20">
        <div className="h-72 w-full max-w-7xl justify-center rounded bg-gray-200"></div>
        <div className="flex w-full max-w-7xl shadow-md">
          <div className="text-4xl font-bold">Users Name</div>
        </div>
      </div>
      <div className="flex flex-col content-center items-center justify-center">
        <ProfileFeed />
      </div>
    </div>
  );
};

export default UserProfilePage;

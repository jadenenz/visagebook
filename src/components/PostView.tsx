import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div
      key={post.id}
      className="mb-8 flex min-w-full flex-col rounded bg-white p-2 shadow-md"
    >
      <div className="flex items-center justify-center">
        <Image
          src={author.profileImageUrl}
          alt={`${author.fullName}'s profile`}
          className="m-4 rounded-full"
          height={46}
          width={46}
        />

        <div className="flex flex-col">
          <div>
            <div>{author.fullName}</div>
            <div className="text-sm text-gray-700">3d ago</div>
          </div>
        </div>
      </div>
      <div className="bg-red-300">{post.content}</div>
      <div className="flex w-full flex-col">
        <div className="divider"></div>
        <div className="flex justify-between">
          <button className="btn-outline btn px-16">Like</button>
          <button className="btn-outline btn px-16">Comment</button>
        </div>
      </div>
    </div>
  );
};

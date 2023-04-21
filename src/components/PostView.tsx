import Image from "next/image";
import { RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex">
      <Image
        src={author.profileImageUrl}
        alt={`${author.fullName}'s profile`}
        height={56}
        width={56}
      />

      <div className="flex flex-col">
        <div>{author.fullName}</div>
        <div className="bg-red-300">{post.content}</div>
      </div>
    </div>
  );
};

import { type Post } from "@prisma/client";
import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";

const CommentView = (props: PostWithUser) => {
  const { post } = props;
  const commentsList = post.comments.map((comment) => {
    if (comment.content === undefined) return null;

    return (
      <div className="flex items-center justify-center" key={comment.id}>
        <div>
          <Image
            src={comment.commentAuthorData.profileImageUrl}
            alt={`${comment.commentAuthorData.fullName}'s profile`}
            className="m-4 rounded-full"
            height={46}
            width={46}
          />
        </div>
        <div className="mx-2">{comment.commentAuthorData.fullName}</div>
        <div>{comment.content}</div>
      </div>
    );
  });

  return <div>{commentsList}</div>;
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

// type PostWithUserAndCommentsWithUser = {

// }

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
      <div className="">{post.content}</div>
      <div className="flex w-full flex-col">
        <div className="divider"></div>
        <div className="flex justify-between">
          <button className="btn-outline btn px-16">Like</button>
          <button className="btn-outline btn px-16">Comment</button>
        </div>
        <div className="divider"></div>
        <CommentView {...props} />
      </div>
    </div>
  );
};

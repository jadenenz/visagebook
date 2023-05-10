import { type Post } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { type RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.postComment.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
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

  const handleSubmitComment = () => {
    if (input !== "") {
      mutate({ content: input, postId: post.id });
    }
    setInput("");
    setShowCommentInput(false);
  };

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
          <button
            onClick={() => setShowCommentInput(true)}
            className="btn-outline btn px-16"
          >
            Comment
          </button>
        </div>
        {showCommentInput && (
          <div>
            <input
              placeholder="Add a comment..."
              className="grow bg-transparent outline-none"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (input !== "") {
                    mutate({ content: input, postId: post.id });
                    setInput("");
                    setShowCommentInput(false);
                  }
                }
              }}
              disabled={isPosting}
            />
            <button onClick={() => setShowCommentInput(false)}>Cancel</button>
            <button onClick={handleSubmitComment}>Submit</button>
          </div>
        )}
        <div className="divider"></div>
        <CommentView {...props} />
      </div>
    </div>
  );
};

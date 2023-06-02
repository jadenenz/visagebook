import { useUser } from "@clerk/nextjs";
import { type Post } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import Image from "next/image";
import { useId, useState } from "react";
import { type RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { HandThumbUpIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid";

const CommentView = (props: PostWithUser) => {
  const { post } = props;
  const commentsList = post.comments.map((comment) => {
    if (comment.content === undefined) return null;

    return (
      <div className="flex items-center justify-start" key={comment.id}>
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

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { data: likedPosts } = api.posts.getLikedPosts.useQuery();
  const likedPostsQueryKey = getQueryKey(api.posts.getLikedPosts);

  const postsThatUserHasLiked = likedPosts?.filter(
    (like) => like.userId === user?.id
  );
  const likedPostsThatMatchId = postsThatUserHasLiked?.filter(
    (like) => like.postId === post.id
  );

  const listOfLikesOnPost = likedPosts?.filter(
    (like) => like.postId === post.id
  );

  //mutation for posting comments
  const { mutate: mutateComment, isLoading: isPosting } =
    api.posts.postComment.useMutation({
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

  //mutation for liking posts
  const { mutate: mutateLike, isLoading: isLiking } =
    api.posts.likePost.useMutation({
      onMutate: async (newLikePostId) => {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await ctx.posts.getLikedPosts.cancel();
        // Snapshot the previous value
        const previousLikedPosts = ctx.posts.getLikedPosts.getData();

        if (user === undefined || user === null) return;

        const newLike = {
          //mock id to fit the object shape
          id: "banana",
          postId: newLikePostId.postId,
          userId: user.id,
        };

        // Optimistically update to the new value
        ctx.posts.getLikedPosts.setData(undefined, (old) => {
          if (old === undefined) {
            throw new Error("Old data is undefined. This should never happen!");
          } else {
            return [...old, newLike];
          }
        });

        // Return a context object with the snapshotted value
        return { previousLikedPosts };
      },
      onSuccess: () => {
        void ctx.posts.getLikedPosts.invalidate();
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

  //mutation for unliking posts
  const { mutate: mutateUnlike, isLoading: isUnliking } =
    api.posts.unlikePost.useMutation({
      onMutate: async (likedPostId) => {
        console.log("likedPostId", likedPostId);
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await ctx.posts.getLikedPosts.cancel();
        // Snapshot the previous value
        const previousLikedPosts = ctx.posts.getLikedPosts.getData();

        if (user === undefined || user === null) return;

        const likesFilteredToUser = previousLikedPosts?.filter(
          (post) => post.userId === user.id
        );

        console.log("likesFilteredToUser: ", likesFilteredToUser);

        const indexOfLikeToDelete = likesFilteredToUser?.findIndex(
          (post) => post.postId === likedPostId.postId
        );

        console.log("indexOfLikeToDelete", indexOfLikeToDelete);

        if (indexOfLikeToDelete === undefined) return;

        // Optimistically update to the new value
        ctx.posts.getLikedPosts.setData(undefined, (old) => {
          if (old === undefined) {
            throw new Error("Old data is undefined. This should never happen!");
          } else {
            const oldCopy = [...old];
            oldCopy?.splice(indexOfLikeToDelete, 1);
            console.log("oldCopy is: ", oldCopy);
            return oldCopy;
          }
        });

        // Return a context object with the snapshotted value
        return { previousLikedPosts };
      },
      onSuccess: () => {
        void ctx.posts.getLikedPosts.invalidate();
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
      mutateComment({ content: input, postId: post.id });
    }
    setInput("");
    setShowCommentInput(false);
  };

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
      <div className="mt-4 flex place-items-center">
        <HandThumbUpIcon className="mr-2 h-5 w-5 text-blue-500" />
        <div>{listOfLikesOnPost?.length}</div>
      </div>
      <div className="flex w-full flex-col">
        <div className="divider"></div>
        <div className="flex justify-between">
          {/* True if the user has not liked the post */}
          {likedPostsThatMatchId !== undefined &&
            likedPostsThatMatchId.length === 0 && (
              //Renders the liked button if the DB is currently updating the like, else renders like button
              // (isLiking ? (
              //   <button
              //     onClick={() => mutateUnlike({ postId: post.id })}
              //     className="btn-outline btn px-16 text-red-300"
              //   >
              //     Liked
              //   </button>
              // ) :
              <button
                onClick={() => mutateLike({ postId: post.id })}
                className="btn-outline btn px-16"
                disabled={isUnliking}
              >
                <HandThumbUpIcon className="mr-2 h-5 w-5 " />
                Like
              </button>
            )}

          {/* True if the user has liked the post  */}
          {likedPostsThatMatchId !== undefined &&
            likedPostsThatMatchId.length > 0 && (
              <button
                onClick={() => mutateUnlike({ postId: post.id })}
                className="btn-outline btn px-16 text-blue-500"
                disabled={isLiking}
              >
                <HandThumbUpIcon className="mr-2 h-5 w-5 text-blue-500" />
                Liked
              </button>
            )}
          <button
            onClick={() => setShowCommentInput(true)}
            className="btn-outline btn px-16"
          >
            <ChatBubbleLeftIcon className="mr-2 h-5 w-5" />
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
                    mutateComment({ content: input, postId: post.id });
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

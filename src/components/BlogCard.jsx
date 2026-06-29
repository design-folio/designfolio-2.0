import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const BlogCard = ({ post, isLoading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isLoading) {
    return (
      <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative aspect-[16/9]">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </article>
    );
  }

  if (!post) return null;

  return (
    <article className="group overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className={`h-full w-full cursor-pointer object-cover transition-all duration-500 group-hover:scale-105`}
        />
      </div>
      <div className="cursor-pointer p-6">
        <h2 className="mb-3 line-clamp-2 cursor-pointer text-xl font-semibold text-gray-900">
          {post.title}
        </h2>
        <p className="mb-4 line-clamp-2 cursor-pointer text-base leading-relaxed text-gray-600">
          {post.excerpt}
        </p>

        <div className="flex cursor-pointer items-center text-sm text-gray-500 transition-colors group-hover:text-gray-700">
          Read article
          <svg
            className="ml-2 h-4 w-4 cursor-pointer transition-transform duration-300 group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

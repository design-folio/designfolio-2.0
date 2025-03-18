/* eslint-disable @next/next/no-img-element */

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const BlogCard = ({ post, isLoading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isLoading) {
    return (
      <article className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="aspect-[16/9] relative">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="p-6 space-y-4">
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
    <article className="group  bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="aspect-[16/9] overflow-hidden relative bg-gray-100">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className={`w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105`}
        />
      </div>
      <div className="p-6 cursor-pointer">
        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 cursor-pointer">
          {post.title}
        </h2>
        <p className="text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed cursor-pointer">
          {post.excerpt}
        </p>

        <div className="flex items-center cursor-pointer text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
          Read article
          <svg
            className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

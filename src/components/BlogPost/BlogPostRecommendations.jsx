import { useQuery } from "@tanstack/react-query";
import { fetchRecommendedPosts } from "@/services/contentful";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function BlogPostRecommendations({ postId }) {
  const {
    data: recommendedPosts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recommendedPosts", postId],
    queryFn: () => fetchRecommendedPosts(postId),
    enabled: !!postId,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isError) {
    console.log("Error loading recommended posts");
    return null; // Silently fail on error
  }

  if (!recommendedPosts && isLoading) {
    return (
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">More from Shai and Designfolio</h3>

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-1/3 md:w-1/4">
                <Skeleton className="aspect-[4/3] rounded-md" />
              </div>
              <div className="w-2/3 md:w-3/4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedPosts || recommendedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 cursor-pointer border-t border-gray-200 pt-8">
      <h3 className="mb-4 cursor-pointer text-xl font-semibold text-gray-800">
        More from Shai and Designfolio
      </h3>

      <div className="space-y-4">
        {recommendedPosts.slice(0, 2).map((post) => (
          <Link
            key={post.id}
            href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}
            className="group block"
          >
            <div className="-mx-2 flex cursor-pointer gap-4 rounded-md p-2 transition-colors hover:bg-gray-50">
              <div className="w-1/3 shrink-0 cursor-pointer md:w-1/4">
                <div className="aspect-[4/3] cursor-pointer overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="w-2/3 cursor-pointer md:w-3/4">
                <h4 className="mb-1 line-clamp-2 cursor-pointer font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                  {post.title}
                </h4>
                <p className="cursor-pointer text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

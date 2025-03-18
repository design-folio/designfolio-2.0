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
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          More from Shai and Designfolio
        </h3>

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-1/3 md:w-1/4">
                <Skeleton className="aspect-[4/3] rounded-md" />
              </div>
              <div className="w-2/3 md:w-3/4">
                <Skeleton className="h-6 w-3/4 mb-2" />
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
    <div className="mt-10 pt-8 border-t border-gray-200 cursor-pointer">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 cursor-pointer">
        More from Shai and Designfolio
      </h3>

      <div className="space-y-4">
        {recommendedPosts.slice(0, 2).map((post) => (
          <Link
            key={post.id}
            href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}
            className="block group"
          >
            <div className="flex gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-md transition-colors cursor-pointer">
              <div className="w-1/3 md:w-1/4 flex-shrink-0 cursor-pointer">
                <div className="aspect-[4/3] rounded-md overflow-hidden bg-gray-100 cursor-pointer">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  />
                </div>
              </div>
              <div className="w-2/3 md:w-3/4 cursor-pointer">
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h4>
                <p className="text-sm text-gray-500 cursor-pointer">
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

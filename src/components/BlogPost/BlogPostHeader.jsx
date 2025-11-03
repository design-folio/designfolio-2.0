export const BlogPostHeader = ({ post }) => {
  return (
    <header className="mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="relative w-12 h-12">
          <img
            src={post.author.image}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover transition-opacity duration-300 opacity-100"
            loading="eager"
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">{post.author.name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            {post.author.position}
            <span className="inline-block w-1 h-1 bg-gray-500 rounded-full"></span>
            {new Date(post.date || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {post.image && post.image !== "/placeholder.svg" && (
        <div className="relative -mx-4 sm:-mx-8 md:-mx-16 lg:-mx-24 xl:-mx-32 mb-8">
          <div className="aspect-[16/9] overflow-hidden rounded-none sm:rounded-xl relative bg-gray-100">
            <img
              src={post.image}
              alt={post.title}
              loading="eager"
              className="w-full h-full object-cover transition-opacity duration-300 opacity-100"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export const BlogPostHeader = ({ post }) => {
  return (
    <header className="mb-8">
      <h1 className="mb-4 text-2xl leading-tight font-bold text-gray-900 sm:text-3xl md:mb-6 md:text-4xl">
        {post.title}
      </h1>

      <div className="mb-6 flex items-center gap-4 md:mb-8">
        <div className="relative h-12 w-12">
          <img
            src={post.author.image}
            alt={post.author.name}
            className="h-12 w-12 rounded-full object-cover opacity-100 transition-opacity duration-300"
            loading="eager"
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">{post.author.name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {post.author.position}
            <span className="inline-block h-1 w-1 rounded-full bg-gray-500"></span>
            {new Date(post.date || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {post.image && post.image !== "/placeholder.svg" && (
        <div className="relative -mx-4 mb-8 sm:-mx-8 md:-mx-16 lg:-mx-24 xl:-mx-32">
          <div className="relative aspect-[16/9] overflow-hidden rounded-none bg-gray-100 sm:rounded-xl">
            <img
              src={post.image}
              alt={post.title}
              loading="eager"
              className="h-full w-full object-cover opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      )}
    </header>
  );
};

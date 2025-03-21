import Head from "next/head";
import Link from "next/link";
import { RichText } from "@/components/RichText/RichText";
import { BlogPostHeader } from "@/components/BlogPost/BlogPostHeader";
import BlogPostRecommendations from "@/components/BlogPost/BlogPostRecommendations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchPost } from "@/services/contentful";
import Footer from "@/components/footer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const BlogPost = ({ post }) => {
  const hasTags = post?.tags && post.tags.length > 0;
  const router = useRouter();
  const currentUrl = `https://designfolio.me${router.asPath}`;
  const [dfToken, setDfToken] = useState(false);

  useEffect(() => {
    const token = Cookies.get("df-token");
    setDfToken(!!token);
  }, []);

  return (
    <>
      <Head>
        <Head>
          <title>{post.seoTitle || post.title}</title>
          <meta
            name="description"
            content={post.seoDescription || post.excerpt}
          />
          <meta name="keywords" content={hasTags ? post.tags.join(", ") : ""} />
          <meta name="author" content={post.author || "Unknown Author"} />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.seoTitle || post.title} />
          <meta
            property="og:description"
            content={post.seoDescription || post.excerpt}
          />
          <meta property="og:url" content={currentUrl} />
          {post.image && <meta property="og:image" content={post.image} />}
          <meta property="og:site_name" content="YourWebsite" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.seoTitle || post.title} />
          <meta
            name="twitter:description"
            content={post.seoDescription || post.excerpt}
          />
          {post.image && <meta name="twitter:image" content={post.image} />}
          {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}
          {/* <meta
            name="twitter:creator"
            content={post.author || "@YourTwitterHandle"}
          /> */}

          <meta
            property="article:author"
            content={post.author || "Unknown Author"}
          />
          <meta
            property="article:published_time"
            content={post.publishedAt || new Date().toISOString()}
          />
          {hasTags && (
            <meta property="article:tag" content={post.tags.join(", ")} />
          )}

          <link rel="canonical" href={currentUrl} />
        </Head>
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "#F2F2F0" }}>
        <main className="container mx-auto px-4 pb-10 pt-[108px] md:pb-8">
          <article className="max-w-2xl mx-auto">
            <Link href="/" passHref>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mb-8 text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-transparent"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to posts
              </Button>
            </Link>

            <BlogPostHeader post={post} />
            <div className="prose prose-gray max-w-none">
              <RichText content={post.content} />
            </div>

            {hasTags && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 shadow-sm"
                      style={{ backgroundColor: "#D9D9D3", color: "#757566" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <BlogPostRecommendations postId={post.id} />
          </article>
          <Footer
            dfToken={dfToken}
            innerClass="!bg-landing-bg-color"
            className="!p-0"
          />
        </main>
      </div>
    </>
  );
};

BlogPost.theme = "light";

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  try {
    const post = await fetchPost(params.slug);

    if (!post) {
      return { notFound: true };
    }

    return {
      props: { post },
    };
  } catch (error) {
    return { notFound: true };
  }
}

export default BlogPost;

import React, { useEffect, useState } from "react";
import { fetchPosts } from "@/services/contentful";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/footer";
import Cookies from "js-cookie";

export default function Index({ posts }) {
  const [dfToken, setDfToken] = useState(false);

  useEffect(() => {
    const token = Cookies.get("df-token");
    setDfToken(!!token);
  }, []);
  return (
    <>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 pt-[108px] pb-10 md:pb-8 relative">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-semibold md:font-bold mb-3 md:mb-4">
              <span className="text-black">Lesser known career</span>
              <br />
              <span className="text-black">hacks</span>
              <span className="mr-1"></span>{" "}
              <span className="relative inline-block">
                <span className="relative z-10">for job seekers</span>
                <span className="absolute bottom-0 left-0 w-full h-[0.5em] bg-[#FCE89E] z-0 transform -skew-y-1"></span>
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Career tips, stories, and advice to help you grow
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {posts.map((post) => {
              return (
                <Link
                  key={post.id}
                  href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}
                >
                  <BlogCard post={post} />
                </Link>
              );
            })}
          </div>
          <Footer
            dfToken={dfToken}
            innerClass="!bg-landing-bg-color"
            className="!p-0"
          />
        </main>
      </div>
    </>
  );
}

Index.theme = "light";

// This function runs at build time on the server-side.
export async function getStaticProps() {
  // Fetch data from your service (contentful in this case)
  const posts = await fetchPosts();

  return {
    props: {
      posts,
    },
    // Re-generate the page every 60 seconds (if you need data to update)
    // revalidate: 60,
  };
}

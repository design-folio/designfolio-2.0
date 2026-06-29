import React, { useEffect, useState, startTransition } from "react";
import { fetchPosts } from "@/services/contentful";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/footer";
import Cookies from "js-cookie";

export default function Index({ posts }) {
  const [dfToken, setDfToken] = useState(false);

  useEffect(() => {
    startTransition(() => setDfToken(!!Cookies.get("df-token")));
  }, []);
  return (
    <>
      <div className="min-h-screen">
        <main className="relative container mx-auto px-4 pt-[108px] pb-10 md:pb-8">
          <header className="mb-12 text-center md:mb-16">
            <h1 className="mb-3 text-3xl font-semibold md:mb-4 md:text-5xl md:font-bold">
              <span className="text-black">Lesser known career</span>
              <br />
              <span className="text-black">hacks</span>
              <span className="mr-1"></span>{" "}
              <span className="relative inline-block">
                <span className="relative z-10">for job seekers</span>
                <span className="absolute bottom-0 left-0 z-0 h-[0.5em] w-full -skew-y-1 transform bg-[#FCE89E]"></span>
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              Career tips, stories, and advice to help you grow
            </p>
          </header>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              return (
                <Link key={post.id} href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}>
                  <BlogCard post={post} />
                </Link>
              );
            })}
          </div>
          <Footer dfToken={dfToken} innerClass="!bg-landing-bg-color" className="!p-0" />
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

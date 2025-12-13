import Editor from "@/components/editor";
import React from "react";

export default function Index() {
  return (
    <main className="min-h-screen">
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0`}
      >
        <Editor edit />
      </div>
    </main>
  );
}

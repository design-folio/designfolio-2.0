import Button from "@/components/button";
import Text from "@/components/text";
import Link from "next/link";
import React from "react";

export default function Error404() {
  return (
    <main className="min-h-screen bg-df-bg-color">
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
      >
        <div className="flex justify-center items-center rounded-2xl p-4 md:p-8">
          <div className="text-center m-auto flex flex-col items-center justify-center">
            <img src="/assets/svgs/404.svg" alt="" />
            <div>
              <Text
                size="p-large"
                className="mt-10 font-bold text-center text-df-base-text-color"
              >
                Oops. The page you’re looking for doesn’t exist.
              </Text>
              <Text
                size="p-small"
                className="mt-4 text-center text-df-secondary-text-color"
              >
                You may have mistyped the address or the page may have moved
              </Text>
              <Link href={"/"}>
                <Button text="Go to homepage" customClass="mt-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

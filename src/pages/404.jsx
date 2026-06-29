import Button from "@/components/button";
import Text from "@/components/text";
import Link from "next/link";
import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function Error404() {
  const { wallpaperUrl, wallpaperEffects } = useGlobalContext();
  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className="min-h-screen">
        <div className={`mx-auto max-w-[848px] px-2 py-[94px] md:px-4 md:py-[124px] lg:px-0`}>
          <div className="flex items-center justify-center rounded-2xl p-4 md:p-8">
            <div className="m-auto flex flex-col items-center justify-center text-center">
              <img src="/assets/svgs/404.svg" alt="" />
              <div>
                <Text
                  size="p-large"
                  className="text-df-base-text-color mt-10 text-center font-bold"
                >
                  Oops. The page you’re looking for doesn’t exist.
                </Text>
                <Text size="p-small" className="text-df-secondary-text-color mt-4 text-center">
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
    </>
  );
}

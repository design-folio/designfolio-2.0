import React from "react";
import ImgStack from "../../ui/image-stack";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";

const AboutWindow = ({ userDetails, fullName, edit = false, onEdit }) => {
  const aboutObj = userDetails?.about;
  const pegboardImages =
    aboutObj?.pegboardImages?.length > 0 ? aboutObj.pegboardImages : DEFAULT_PEGBOARD_IMAGES;
  const pegboardStickers =
    aboutObj?.pegboardStickers?.length > 0 ? aboutObj.pegboardStickers : DEFAULT_PEGBOARD_STICKERS;

  const stackImages = [
    ...pegboardImages.map((img) => img?.src).filter(Boolean),
    // ...pegboardStickers.map((sticker) => sticker?.src).filter(Boolean),
  ];

  return (
    <div className="font-chalkboard relative flex h-full w-full flex-col bg-[#1e3d2f]">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/chalkboard.png")`,
            backgroundColor: "#1e3d2f",
          }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        {/* <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/5 rounded-full opacity-20 -rotate-12" /> */}
        <div className="absolute bottom-20 left-10 h-1 w-48 rotate-3 bg-white/5 opacity-20" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-white/90">
          {/* Header */}
          <div className="border-b-2 border-white/20 pb-4">
            <h1 className="mb-2 text-5xl font-bold tracking-tight text-white italic drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
              Yo! I&apos;m {fullName}
            </h1>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
            {/* Left — text sections */}
            <div className="space-y-8">
              <section>
                <h2 className="mb-3 text-2xl font-bold text-[#fef08a] underline decoration-wavy">
                  Background
                </h2>
                {userDetails?.about?.description ? (
                  <p className="text-lg leading-relaxed italic">{userDetails.about.description}</p>
                ) : (
                  <button
                    type="button"
                    onClick={edit && onEdit ? onEdit : undefined}
                    disabled={!edit || !onEdit}
                    className={`flex min-h-[4.5rem] w-full items-center justify-center rounded-lg border-2 border-dashed border-[#fef08a]/30 bg-white/[0.06] px-5 py-4 text-left transition-colors ${
                      edit && onEdit
                        ? "cursor-pointer hover:border-[#fef08a]/50 hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fef08a]/50"
                        : "cursor-default"
                    }`}
                  >
                    <p className="text-center text-base leading-relaxed text-white/45 italic">
                      {edit && onEdit
                        ? "Click to add your background — where you’re from, what drives you, and where you’re headed."
                        : "Your story goes here — where you’re from, what drives you, and where you’re headed."}
                    </p>
                  </button>
                )}
              </section>

              {userDetails?.skills?.length > 0 && (
                <section>
                  <h2 className="mb-3 text-2xl font-bold text-[#fecaca] underline decoration-wavy">
                    Skills
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {userDetails.skills.map((skill, i) => (
                      <div
                        key={i}
                        className="rounded-full border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-2 text-xs font-bold text-[#86efac]"
                        style={{ rotate: `${((i % 3) - 1) * 2}deg` }}
                      >
                        #{skill.label}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {userDetails?.tools?.length > 0 && (
                <section>
                  <h2 className="mb-3 text-2xl font-bold text-[#fed7aa] underline decoration-wavy">
                    Tools
                  </h2>
                  <ul className="list-inside list-disc space-y-1 text-lg italic">
                    {Array.from({ length: Math.ceil(userDetails.tools.length / 2) }, (_, i) => {
                      const a = userDetails.tools[i * 2];
                      const b = userDetails.tools[i * 2 + 1];
                      return (
                        <li key={i}>
                          {a?.label}
                          {b ? ` / ${b.label}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>

            {/* Right — pegboard image stack */}
            <div className="flex flex-col items-center justify-center pt-4">
              <ImgStack images={stackImages} />
              <p className="pointer-events-none mt-3 text-center text-[10px] font-medium tracking-widest text-white/35 uppercase">
                Try moving things around :)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;

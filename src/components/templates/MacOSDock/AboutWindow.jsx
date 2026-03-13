import React from "react";
import ImgStack from "../../ui/image-stack";
import {
  DEFAULT_PEGBOARD_IMAGES,
  DEFAULT_PEGBOARD_STICKERS,
} from "@/lib/aboutConstants";

const AboutWindow = ({ userDetails, fullName, edit = false, onEdit }) => {
  const aboutObj = userDetails?.about;
  const pegboardImages =
    aboutObj?.pegboardImages?.length > 0
      ? aboutObj.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;
  const pegboardStickers =
    aboutObj?.pegboardStickers?.length > 0
      ? aboutObj.pegboardStickers
      : DEFAULT_PEGBOARD_STICKERS;

  const stackImages = [
    ...pegboardImages.map((img) => img?.src).filter(Boolean),
    // ...pegboardStickers.map((sticker) => sticker?.src).filter(Boolean),
  ];

  return (
    <div className="w-full h-full bg-[#1e3d2f] relative font-chalkboard flex flex-col">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/chalkboard.png")`,
            backgroundColor: "#1e3d2f",
          }}
        />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        {/* <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/5 rounded-full opacity-20 -rotate-12" /> */}
        <div className="absolute bottom-20 left-10 w-48 h-1 bg-white/5 rotate-3 opacity-20" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-8 text-white/90 max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="border-b-2 border-white/20 pb-4">
            <h1 className="text-5xl font-bold tracking-tight mb-2 text-white italic drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
              Yo! I'm {fullName}
            </h1>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left — text sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#fef08a] mb-3 underline decoration-wavy">
                  Background
                </h2>
                {userDetails?.about?.description ? (
                  <p className="text-lg leading-relaxed italic">
                    {userDetails.about.description}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={edit && onEdit ? onEdit : undefined}
                    disabled={!edit || !onEdit}
                    className={`min-h-[4.5rem] w-full rounded-lg border-2 border-dashed border-[#fef08a]/30 bg-white/[0.06] flex items-center justify-center px-5 py-4 text-left transition-colors ${
                      edit && onEdit
                        ? "cursor-pointer hover:bg-white/[0.1] hover:border-[#fef08a]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fef08a]/50"
                        : "cursor-default"
                    }`}
                  >
                    <p className="text-white/45 text-base leading-relaxed italic text-center">
                      {edit && onEdit
                        ? "Click to add your background — where you’re from, what drives you, and where you’re headed."
                        : "Your story goes here — where you’re from, what drives you, and where you’re headed."}
                    </p>
                  </button>
                )}
              </section>

              {userDetails?.skills?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#fecaca] mb-3 underline decoration-wavy">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {userDetails.skills.map((skill, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-[#86efac]/10 border border-[#86efac]/30 rounded-full text-[#86efac] text-xs font-bold"
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
                  <h2 className="text-2xl font-bold text-[#fed7aa] mb-3 underline decoration-wavy">
                    Tools
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-lg italic">
                    {Array.from(
                      { length: Math.ceil(userDetails.tools.length / 2) },
                      (_, i) => {
                        const a = userDetails.tools[i * 2];
                        const b = userDetails.tools[i * 2 + 1];
                        return (
                          <li key={i}>
                            {a?.label}
                            {b ? ` / ${b.label}` : ""}
                          </li>
                        );
                      },
                    )}
                  </ul>
                </section>
              )}
            </div>

            {/* Right — pegboard image stack */}
            <div className="flex items-center justify-center pt-4">
              <ImgStack images={stackImages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutWindow;

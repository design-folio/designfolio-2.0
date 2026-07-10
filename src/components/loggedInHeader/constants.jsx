import { TEMPLATE_IDS } from "@/lib/templates";

export const cursors = [
  {
    id: 1,
    item: (
      <p className="text-popover-heading-color font-inter cursor-pointer text-[14px] font-[500] md:text-[16px]">
        Default
      </p>
    ),
  },
  {
    id: 2,
    item: <img src="/assets/svgs/default1.svg" alt="cursor1" className="cursor-pointer" />,
  },
  {
    id: 3,
    item: <img src="/assets/svgs/default2.svg" alt="cursor2" className="cursor-pointer" />,
  },
  {
    id: 4,
    item: <img src="/assets/svgs/default3.svg" alt="cursor3" className="cursor-pointer" />,
  },
  {
    id: 5,
    item: <img src="/assets/svgs/default4.svg" alt="cursor4" className="h-8 w-8 cursor-pointer" />,
  },
  {
    id: 6,
    item: <img src="/assets/svgs/default5.svg" alt="cursor5" className="cursor-pointer" />,
  },
  {
    id: 7,
    item: <img src="/assets/svgs/default6.svg" alt="cursor6" className="cursor-pointer" />,
  },
];

export function getWallpapers(isDark, templateId) {
  const wpPath = isDark ? "/wallpaper/darkui" : "/wallpaper";

  const wallpaperImage = (src) => (
    <div
      className="h-8 w-full rounded"
      style={{ backgroundImage: `url(${src})`, backgroundSize: "cover" }}
    />
  );

  const wallpapers = [
    {
      id: 1,
      value: 0,
      item: (
        <p className="text-popover-heading-color font-inter cursor-pointer text-[14px] font-[500] md:text-[16px]">
          Default
        </p>
      ),
    },
    { id: 1, value: 1, item: wallpaperImage(`${wpPath}/wall1.png`) },
    { id: 2, value: 2, item: wallpaperImage(`${wpPath}/wall2.png`) },
    { id: 3, value: 3, item: wallpaperImage(`${wpPath}/wall3.png`) },
    { id: 4, value: 4, item: wallpaperImage(`${wpPath}/wall4.png`) },
    { id: 5, value: 5, item: wallpaperImage(`${wpPath}/wall5.png`) },
    { id: 6, value: 6, item: wallpaperImage(`${wpPath}/wall6.png`) },
    { id: 7, value: 7, item: wallpaperImage(`${wpPath}/wall7.png`) },
    { id: 9, value: 9, item: wallpaperImage(`${wpPath}/wall9.png`) },
    { id: 10, value: 10, item: wallpaperImage(`${wpPath}/wall10.png`) },
  ];

  if (templateId === TEMPLATE_IDS.RETRO_OS) {
    wallpapers.push({ id: 8, value: 8, item: wallpaperImage(`${wpPath}/wall8.png`) });
  }

  return wallpapers;
}

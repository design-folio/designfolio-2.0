export const cursors = [
  {
    id: 1,
    item: (
      <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
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
    item: <img src="/assets/svgs/default4.svg" alt="cursor4" className="w-8 h-8 cursor-pointer" />,
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

export function getWallpapers(isDark) {
  const wpPath = isDark ? "/wallpaper/darkui" : "/wallpaper";

  const wallpaperImage = (src) => (
    <div
      className="w-full h-8 rounded"
      style={{ backgroundImage: `url(${src})`, backgroundSize: "cover" }}
    />
  );

  return [
    {
      id: 1,
      value: 0,
      item: (
        <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
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
    { id: 8, value: 8, item: wallpaperImage(`${wpPath}/wall8.png`) },
  ];
}

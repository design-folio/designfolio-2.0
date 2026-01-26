export function usePegboardSounds(options = {}) {
  const { volume = 0.4 } = options;

  const play = (src) => {
    // SSR / tests safety
    if (typeof window === "undefined") return;

    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => { });
    } catch {
      // ignore
    }
  };

  const playPick = () => play("/sounds/pick.mp3");
  const playPlace = () => play("/sounds/place.mp3");

  return { playPick, playPlace };
}


import React, { useRef, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import PixelVoyagerCanvas from "./PixelVoyagerCanvas";

const HomeWindow = ({ userDetails, fullName, onViewProjects }) => {
  const textControls = useAnimation();
  const buttonControls = useAnimation();

  const headline = userDetails?.introduction
    ? userDetails?.introduction
    : `${"Hey, I'm"} ${fullName}`;

  useEffect(() => {
    textControls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.5,
        duration: 1.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    });
    buttonControls.start({
      opacity: 1,
      transition: { delay: 2.5, duration: 1 },
    });
  }, [textControls, buttonControls]);

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden bg-[#1a0033]"
      style={{ fontFamily: "'Press Start 2P', system-ui" }}
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <PixelVoyagerCanvas />
      </div>
      <div className="relative z-10 px-4 text-center">
        {userDetails?.avatar?.url && (
          <img
            src={userDetails.avatar.url}
            alt={fullName}
            className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-white/20 object-cover shadow-xl"
          />
        )}
        <motion.h1
          className="mx-auto max-w-3xl text-2xl font-bold tracking-tighter text-white md:text-4xl"
          style={{ textShadow: "2px 2px 0px #ff00ff", lineHeight: "3rem" }}
          initial={{ opacity: 0, y: 50 }}
          animate={textControls}
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={textControls}
          className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-slate-300"
        >
          {userDetails?.bio}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={buttonControls} className="mt-8">
          <button
            onClick={onViewProjects}
            className="rounded-none border-2 border-white bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black"
          >
            Show Projects
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeWindow;

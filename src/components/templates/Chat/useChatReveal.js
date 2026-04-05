import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { getPlainTextLength } from "@/lib/tiptapUtils";

const STATIC_SECTIONS = ["tools", "projects", "works", "reviews", "about"];

const FIRST_LEFT_OFFSET = {
  tools: 1,
  projects: 0,
  works: 1,
  reviews: 1,
  about: 1,
};

export default function useChatReveal({ preview = false }) {
  const { userDetails } = useGlobalContext();

  const {
    about,
    experiences = [],
    reviews = [],
    skills = [],
    tools = [],
    projects = [],
    phone,
  } = userDetails || {};

  const email = userDetails?.contact_email || userDetails?.email;
  const visibleProjects = (projects || []).filter((p) => !p.hidden);
  const aboutDescription = about?.description;
  const hasAboutDescription =
    aboutDescription && getPlainTextLength(aboutDescription || "") > 0;
  const hasCustomAboutImages = about?.pegboardImages?.length > 0;
  const hasAboutContent = hasAboutDescription || hasCustomAboutImages;

  const DEFAULT_SECTION_ORDER = ["tools", "projects", "works", "reviews", "about"];
  const sectionOrder =
    userDetails?.sectionOrder?.length > 0
      ? userDetails.sectionOrder
      : DEFAULT_SECTION_ORDER;

  const sectionSteps = useMemo(() => {
    const steps = {};
    sectionOrder.forEach((section, i) => {
      steps[section] = 4 + i * 3;
    });
    steps._contact = 4 + sectionOrder.length * 3;
    return steps;
  }, [sectionOrder]);

  const s = useCallback(
    (staticStep) => {
      if (staticStep <= 3) return staticStep;
      if (staticStep >= 19) return staticStep - 19 + sectionSteps._contact;
      const sectionIdx = Math.floor((staticStep - 4) / 3);
      const offset = (staticStep - 4) % 3;
      return sectionSteps[STATIC_SECTIONS[sectionIdx]] + offset;
    },
    [sectionSteps],
  );

  const getNextLeftStep = useCallback(
    (sectionName) => {
      const idx = sectionOrder.indexOf(sectionName);
      if (idx < sectionOrder.length - 1) {
        const next = sectionOrder[idx + 1];
        return sectionSteps[next] + FIRST_LEFT_OFFSET[next];
      }
      return sectionSteps._contact + 1;
    },
    [sectionOrder, sectionSteps],
  );

  const stepsToReveal = useMemo(() => {
    const steps = [1, 2, 3];
    const totalSteps = 3 + sectionOrder.length * 3 + 3;
    const sectionEmpty = {
      tools: [
        skills.length === 0 && tools.length === 0,
        skills.length === 0,
        tools.length === 0,
      ],
      projects: [
        visibleProjects.length === 0,
        visibleProjects.length === 0,
        visibleProjects.length === 0,
      ],
      works: [
        experiences.length === 0,
        experiences.length === 0,
        experiences.length === 0,
      ],
      reviews: [
        reviews.length === 0,
        reviews.length === 0,
        reviews.length === 0,
      ],
      about: [!hasAboutContent, !hasAboutContent, !hasAboutContent],
    };
    for (let step = 4; step <= totalSteps; step++) {
      if (preview) {
        const sectionStart = 4;
        const sectionEnd = sectionStart + sectionOrder.length * 3 - 1;
        const contactStart = sectionEnd + 1;
        if (step >= sectionStart && step <= sectionEnd) {
          const sIdx = Math.floor((step - sectionStart) / 3);
          const offset = (step - sectionStart) % 3;
          const sName = sectionOrder[sIdx];
          if (sectionEmpty[sName]?.[offset]) continue;
        }
        if (
          step >= contactStart &&
          step <= contactStart + 1 &&
          !email &&
          !phone
        )
          continue;
      }
      steps.push(step);
    }
    return steps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [chatRevealStep, setChatRevealStep] = useState(0);
  const containerRef = useRef(null);
  const isInViewRef = useRef(false);

  useEffect(() => {
    setChatRevealStep(0);
    let queueIndex = 0;
    let timerId = null;

    const scheduleNext = () => {
      if (queueIndex >= stepsToReveal.length) return;
      const delay = queueIndex === 0 ? 500 : 1000;
      timerId = setTimeout(() => {
        timerId = null;
        if (!isInViewRef.current) return;
        const step = stepsToReveal[queueIndex];
        queueIndex++;
        setChatRevealStep(step);
        scheduleNext();
      }, delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasInView = isInViewRef.current;
        isInViewRef.current = entry.isIntersecting;
        if (
          entry.isIntersecting &&
          !wasInView &&
          !timerId &&
          queueIndex < stepsToReveal.length
        ) {
          scheduleNext();
        }
      },
      { threshold: 0 },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    if (isInViewRef.current) scheduleNext();

    return () => {
      clearTimeout(timerId);
      observer.disconnect();
    };
  }, [stepsToReveal]);

  return {
    chatRevealStep,
    containerRef,
    s,
    sectionSteps,
    getNextLeftStep,
  };
}

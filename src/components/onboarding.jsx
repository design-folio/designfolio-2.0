"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "./ui/buttonNew";
import Stepper from "./Stepper";
import ErrorBanner from "./ErrorBanner";
import SectionTitle from "./SectionTitle";
import RoleGrid from "./RoleGrid";
import OptionList from "./OptionList";
import SkillsPicker from "./SkillPicker";
import { _getSkills, _getPersonas } from "../network/get-request";
import { _updateUser } from "../network/post-request";
import { GOALS, EXPERIENCE_LEVELS } from "../lib/onboardingStepData";
import { useGlobalContext } from "@/context/globalContext";
import {
  ExperienceValidationSchema,
  GoalValidationSchema,
  RoleValidationSchema,
  SkillsValidationSchema,
} from "@/lib/validationSchemas";

function toOptionString(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (x?.label) return x.label;
  if (x?.value) return x.value;
  if (x?.name) return x.name;
  return String(x);
}

function normalizePersona(p) {
  return {
    _id: p._id || p.id,
    label: p.label || p.name || p.title,
    image: p.image || "/onboarding-animated-icons/others.png",
  };
}

export default function Onboarding() {
  const router = useRouter();
  const { userDetails, updateCache, setUserDetails, closeModal } = useGlobalContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillsMap, setSkillsMap] = useState(new Map());
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [skillsSearch, setSkillsSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPreFilled, setIsPreFilled] = useState(false);

  // Lock body scroll when component mounts
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Clear error when step changes
  useEffect(() => {
    setError("");
  }, [currentStep]);

  // Fetch Personas
  useEffect(() => {
    setLoading(true);
    _getPersonas()
      .then((response) => {
        const personas = response?.data?.personas || [];
        if (Array.isArray(personas)) setRoles(personas.map(normalizePersona));
      })
      .catch(() => setError("Failed to load personas. Please refresh."))
      .finally(() => setLoading(false));
  }, []);


  // Prefill from Context
  useEffect(() => {
    if (!userDetails || isPreFilled || roles.length === 0) return;

    const { persona, goal, experienceLevel, skills } = userDetails;
    if (persona) {
      // Handles new format { value, label, __isNew__, custom }
      if (persona.value && persona.label) {
        const personaId = persona.value;
        const personaLabel = persona.label;
        // Check if it's a custom persona: has __isNew__, label is "Others", or has custom field
        const isCustom = persona.__isNew__ === true || personaLabel === "Others" || !!persona.custom;
        const customValue = persona.custom || (personaLabel === "Others" ? "" : personaLabel);

        if (isCustom) {
          setSelectedRole("Others");
          // Use custom field if available, otherwise use empty string (user can fill it)
          setCustomRole(customValue);
          // Set personaId even for custom to trigger skills fetch
          setSelectedPersonaId(personaId);
        } else {
          const matchedRole = roles.find((r) => r._id === personaId);
          if (matchedRole) {
            setSelectedRole(matchedRole.label);
            setSelectedPersonaId(matchedRole._id);
          } else {
            // If label doesn't match any standard role, treat as custom
            const isStandardRole = roles.some((r) => r.label === personaLabel);
            if (!isStandardRole) {
              setSelectedRole("Others");
              setCustomRole(personaLabel);
              setSelectedPersonaId(personaId);
            } else {
              setSelectedRole(personaLabel);
              setSelectedPersonaId(personaId);
            }
          }
        }
      }
    }
    if (goal !== undefined) setSelectedGoalId(goal);
    if (experienceLevel !== undefined) setSelectedExperienceId(experienceLevel);
    if (skills && Array.isArray(skills)) {
      const labels = skills.map((s) => s.label);
      const map = new Map();
      skills.forEach((s) => map.set(s.label, s));
      setSkillsMap(map);
      setSelectedInterests(labels);
    }
    setIsPreFilled(true);
  }, [roles, userDetails, isPreFilled]);


  // Fetch Skills (Persona + Search)
  useEffect(() => {
    if (!selectedPersonaId && !skillsSearch.trim()) return;

    const hasSearch = skillsSearch.trim().length > 0;
    setSkillsLoading(true);

    const timer = setTimeout(() => {
      _getSkills(skillsSearch, hasSearch ? "" : selectedPersonaId)
        .then((res) => {
          const apiSkills = res?.data?.skills || [];
          if (!Array.isArray(apiSkills)) return;

          const newMap = new Map(skillsMap);
          const normalized = apiSkills.map((s) => ({
            label: toOptionString(s),
            value: s._id || s.id || s.value,
            __isNew__: false,
          }));

          normalized.forEach((s) => newMap.set(s.label, s));
          setSkillsMap(newMap);

          const preSelected = normalized.filter((s) => s.selected).map(toOptionString);
          const selected = selectedInterests.length ? selectedInterests : preSelected;
          const allSkills = [...new Set([...selected, ...normalized.map((s) => s.label)])];
          setSkills(allSkills.slice(0, 30));

          if (selectedInterests.length === 0 && preSelected.length > 0) {
            setSelectedInterests(preSelected);
          }
        })
        .catch((err) => console.error("Error loading skills:", err))
        .finally(() => setSkillsLoading(false));
    }, hasSearch ? 300 : 0);

    return () => clearTimeout(timer);
  }, [selectedPersonaId, skillsSearch]);


  // Handlers
  const handleInterestToggle = (interest) => {
    setSelectedInterests((prev) => {
      const isAdding = !prev.includes(interest);
      if (isAdding) {
        setSkillsSearch(""); // Clear search when adding a skill
      }
      return prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
    });
  };

  const handleAddCustomSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    const newSkill = {
      label: trimmed,
      value: `custom-${Date.now()}`,
      __isNew__: true,
    };
    setSkillsMap((prev) => new Map(prev).set(trimmed, newSkill));
    setSkills((prev) => [...new Set([...prev, trimmed])]);
    setSelectedInterests((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setSkillsSearch("");
  };


  // Validation + Step Control
  const validateStep = async () => {
    try {
      if (currentStep === 1)
        await RoleValidationSchema.validate({ selectedRole, customRole });
      if (currentStep === 2)
        await GoalValidationSchema.validate({ selectedGoalId });
      if (currentStep === 3)
        await ExperienceValidationSchema.validate({ selectedExperienceId });
      if (currentStep === 4)
        await SkillsValidationSchema.validate({ selectedInterests });
      setError("");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (currentStep < 4) setCurrentStep((s) => s + 1);
    else submitAll();
  };


  // Submit Final Data
  const submitAll = async () => {
    const valid = await validateStep();
    if (!valid) return;

    const persona = {
      value: selectedPersonaId,
      label: selectedRole,
      ...(selectedRole === "Others" && { __isNew__: true, label: customRole.trim() }),
    };

    const skillsPayload = selectedInterests.map((label) => {
      const skill = skillsMap.get(label);
      return skill || { label, value: label, __isNew__: true };
    });

    const payload = {
      isNewUser: true,
      persona,
      goal: selectedGoalId,
      experienceLevel: selectedExperienceId,
      skills: skillsPayload,
    };

    setLoading(true);
    try {
      const res = await _updateUser(payload);
      const updatedUser = res?.data?.user;
      if (updatedUser) {
        updateCache("userDetails", updatedUser);
        setUserDetails(updatedUser);
        closeModal();
      }
    } catch (e) {
      console.error("Update error:", e);
      setError("We couldn’t save your details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] overflow-hidden bg-background"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div className="min-h-full w-full flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl md:py-8">
          <Stepper current={currentStep} />

          <AnimatePresence mode="wait">
            {/* Step 1: Role */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SectionTitle
                  title="What describes you the best?"
                  subtitle="Help us tailor your experience to match your professional journey"
                />
                <RoleGrid
                  roles={roles}
                  selectedRole={selectedRole}
                  onSelect={(role) => {
                    setSelectedRole(role);
                    const persona = roles.find((r) => r.label === role);
                    if (persona?._id) setSelectedPersonaId(persona._id);
                  }}
                  customRole={customRole}
                  setCustomRole={setCustomRole}
                  message={error}
                />
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full mt-4 h-11 rounded-full bg-foreground text-background font-semibold"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Goal */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SectionTitle title="What is your main goal?" subtitle="Choose the one that matters most to you" />
                <OptionList
                  message={error}
                  items={GOALS}
                  selected={GOALS.find((g) => g.id === selectedGoalId)?.label || ""}
                  onSelect={(label) => setSelectedGoalId(GOALS.find((g) => g.label === label)?.id)}
                />
                <div className="flex gap-3 md:mt-6 mt-4">
                  <Button onClick={() => setCurrentStep(1)} variant="outline" className="h-11 rounded-full px-6">
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={loading} className="flex-1 h-11 rounded-full bg-foreground text-background font-semibold">
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SectionTitle title="What's your experience level?" subtitle="This helps us recommend the right features for you" />
                <OptionList
                  message={error}
                  items={EXPERIENCE_LEVELS}
                  selected={EXPERIENCE_LEVELS.find((e) => e.id === selectedExperienceId)?.label || ""}
                  onSelect={(label) => setSelectedExperienceId(EXPERIENCE_LEVELS.find((e) => e.label === label)?.id)}
                />
                <div className="flex gap-3 md:mt-6 mt-4">
                  <Button onClick={() => setCurrentStep(2)} variant="outline" className="h-11 rounded-full px-6">
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={loading} className="flex-1 h-11 rounded-full bg-foreground text-background font-semibold">
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SectionTitle title="Choose at least 3 strengths" subtitle="Pick three that feel most true right now—add more if you like." />
                <SkillsPicker
                  skills={skills}
                  selected={selectedInterests}
                  onToggle={handleInterestToggle}
                  onAdd={handleAddCustomSkill}
                  search={skillsSearch}
                  setSearch={setSkillsSearch}
                  loading={skillsLoading}
                  message={error}
                />
                <div className="flex gap-3 md:mt-6 mt-4">
                  <Button onClick={() => setCurrentStep(3)} variant="outline" className="h-11 rounded-full px-6">
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={loading} className="flex-1 h-11 rounded-full bg-foreground text-background font-semibold">
                    {loading ? "Saving..." : "Get Started"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

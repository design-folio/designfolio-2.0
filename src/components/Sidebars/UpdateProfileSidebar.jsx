import { useState, useEffect, useRef } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Camera, Loader2 } from "lucide-react";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import useImageCompression from "@/hooks/useImageCompression";

export default function UpdateProfileSidebar() {
  const { userDetails, setUserDetails, updateCache, closeSidebar } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const { compress, compressedImage, compressionProgress } = useImageCompression();

  const [values, setValues] = useState({
    firstName: userDetails?.firstName || "",
    lastName: userDetails?.lastName || "",
    introduction: userDetails?.introduction || "",
    bio: userDetails?.bio || "",
  });

  useEffect(() => {
    setValues({
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      introduction: userDetails?.introduction || "",
      bio: userDetails?.bio || "",
    });
  }, [userDetails]);

  useEffect(() => {
    if (compressionProgress === 100 && compressedImage) {
      setAvatarFile(compressedImage);
      setAvatarPreview(URL.createObjectURL(compressedImage));
    }
  }, [compressionProgress, compressedImage]);

  const currentAvatar = avatarPreview || getUserAvatarImage(userDetails);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compress(file);
  };

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...values };

      if (avatarFile) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            payload.avatar = {
              key: reader.result,
              originalName: avatarFile.name,
              extension: avatarFile.type.split("/")[1],
            };
            resolve();
          };
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await _updateUser(payload);
      const updated = res?.data?.user;
      if (updated) {
        updateCache("userDetails", updated);
        setUserDetails(updated);
      }
      closeSidebar(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            aria-label="Change profile photo"
            className="relative size-24 overflow-hidden rounded-2xl border border-border group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={currentAvatar}
              alt=""
              width={96}
              height={96}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {compressionProgress > 0 && compressionProgress < 100 ? (
                <Loader2 className="size-5 text-white animate-spin" aria-hidden />
              ) : (
                <Camera className="size-5 text-white" aria-hidden />
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Change photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>


        {/* Name */}
        <div className="flex flex-col gap-2">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="update-profile-first-name"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                First name
              </Label>
              <Input
                id="update-profile-first-name"
                name="given-name"
                autoComplete="given-name"
                spellCheck={false}
                value={values.firstName}
                onChange={set("firstName")}
                placeholder="e.g. Alex…"
                maxLength={50}
                className="min-w-0"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="update-profile-last-name"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Last name
              </Label>
              <Input
                id="update-profile-last-name"
                name="family-name"
                autoComplete="family-name"
                spellCheck={false}
                value={values.lastName}
                onChange={set("lastName")}
                placeholder="e.g. Rivera…"
                maxLength={50}
                className="min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="update-profile-introduction"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Introduction / Tagline
          </Label>
          <Input
            id="update-profile-introduction"
            name="introduction"
            autoComplete="off"
            value={values.introduction}
            onChange={set("introduction")}
            placeholder="e.g. Product designer in Berlin…"
            maxLength={50}
          />
          <p className="text-right text-[11px] text-muted-foreground tabular-nums">
            {values.introduction.length}/50
          </p>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="update-profile-bio"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Bio
          </Label>
          <Textarea
            id="update-profile-bio"
            name="bio"
            autoComplete="off"
            value={values.bio}
            onChange={set("bio")}
            placeholder="Short bio about yourself…"
            className="min-h-[100px] resize-none"
            maxLength={250}
          />
          <p className="text-right text-[11px] text-muted-foreground tabular-nums">
            {values.bio.length}/250
          </p>
        </div>
      </div>

      <div className="flex gap-2 py-3 px-6 border-t border-border justify-end">
        <Button variant="outline" type="button" onClick={() => closeSidebar(true)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

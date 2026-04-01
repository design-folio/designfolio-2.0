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
    introduction: userDetails?.introduction || "",
    bio: userDetails?.bio || "",
  });

  useEffect(() => {
    setValues({
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group border border-border"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {compressionProgress > 0 && compressionProgress < 100 ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Introduction */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Introduction / Tagline
          </Label>
          <Input
            value={values.introduction}
            onChange={set("introduction")}
            placeholder="e.g. Hey, I'm a Product Designer"
            maxLength={50}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {values.introduction.length}/50
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bio
          </Label>
          <Textarea
            value={values.bio}
            onChange={set("bio")}
            placeholder="Short bio about yourself..."
            className="min-h-[100px] resize-none"
            maxLength={250}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {values.bio.length}/250
          </p>
        </div>
      </div>

      <div className="flex gap-2 py-3 px-6 border-t border-border justify-end">
        <Button variant="outline" type="button" onClick={() => closeSidebar(true)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

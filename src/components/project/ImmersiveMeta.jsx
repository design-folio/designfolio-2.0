import { cn } from "@/lib/utils";
import { getMetaLabel, getMetaValue } from "@/lib/constant";
import { metaColsClass } from "./ProjectMetaGrid";
import EditableField from "./EditableField";

// Bottom meta columns for the immersive hero (over the dark cover image).
// `meta` is the pre-filtered field list (all fields in editor, filled-only in
// public/preview).
export default function ImmersiveMeta({ project, onMetaChange, isEditable, meta }) {
  if (!meta || meta.length === 0) return null;

  return (
    <div className={cn("grid gap-y-5", metaColsClass(meta.length))}>
      {meta.map(({ index, defaultLabel }) => {
        const label = getMetaLabel(project, index);
        const value = getMetaValue(project, index);
        return (
          <div key={index} className="flex min-w-0 flex-col gap-1">
            {isEditable ? (
              <EditableField
                value={label}
                onChange={(v) => onMetaChange?.(index, { label: v.trim() || null })}
                tag="span"
                placeholder={defaultLabel}
                className="text-[11px] font-medium tracking-widest text-white/50 uppercase [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
              />
            ) : (
              <span className="text-[11px] font-medium tracking-widest text-white/50 uppercase">
                {label}
              </span>
            )}
            {isEditable ? (
              <EditableField
                value={value}
                onChange={(v) => onMetaChange?.(index, { value: v })}
                tag="span"
                placeholder="Write here…"
                className="text-[15px] leading-snug font-semibold text-white [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
              />
            ) : (
              <span className="text-[15px] leading-snug font-semibold [overflow-wrap:anywhere] text-white">
                {value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

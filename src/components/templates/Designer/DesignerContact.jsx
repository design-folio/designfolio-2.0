import { useCallback, useState } from "react";
import { ArrowUpRight, Trash2, Pencil } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { _deleteResume } from "@/network/post-request";
import AddItem from "@/components/addItem";
import MemoSocial from "@/components/icons/Social";
import { Button } from "@/components/ui/button";

function ContactRow({ label, value, href }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") || href?.startsWith("mailto") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group block no-underline"
    >
      <div className="flex items-center justify-between border-b border-[#CBD5E1] py-5">
        <span className="text-[11px] font-bold tracking-[0.1em] text-[#64748B] uppercase">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#0F172A] transition-colors group-hover:text-[#3B82F6]">
            {value}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6] opacity-50 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </a>
  );
}

export default function DesignerContact({ isEditing }) {
  const { userDetails, openSidebar, userDetailsRefecth } = useGlobalContext();
  const email = userDetails?.contact_email || userDetails?.email || "";
  const phone = userDetails?.phone || "";
  const socials = userDetails?.socials || {};
  const portfolios = userDetails?.portfolios || {};
  const resumeUrl = userDetails?.resume?.url || "";
  const firstName = userDetails?.firstName || "";

  const [year] = useState(() => new Date().getFullYear());

  const handleDeleteResume = useCallback(() => {
    _deleteResume().then(() => userDetailsRefecth());
  }, [userDetailsRefecth]);

  const rows = [
    email && { label: "Mail", value: email, href: `mailto:${email}` },
    phone && { label: "Phone", value: phone, href: `tel:${phone}` },
    socials.linkedin && { label: "LinkedIn", value: "LinkedIn", href: socials.linkedin },
    socials.twitter && { label: "Twitter", value: "Twitter / X", href: socials.twitter },
    portfolios.dribbble && { label: "Dribbble", value: "Dribbble", href: portfolios.dribbble },
    portfolios.notion && { label: "Notion", value: "Notion", href: portfolios.notion },
    portfolios.medium && { label: "Medium", value: "Medium", href: portfolios.medium },
    socials.instagram && { label: "Instagram", value: "Instagram", href: socials.instagram },
  ].filter(Boolean);

  const hasAnything = rows.length > 0 || !!resumeUrl;

  if (!isEditing && !hasAnything) return null;

  return (
    <div className="relative pt-24 pb-16" id="section-contact">
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openSidebar(sidebars.footer)}
          className="absolute top-24 right-0 h-9 gap-1.5 rounded-full border-[#E2E8F0] bg-white px-3.5 text-[12px] font-medium shadow-sm hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Contact
        </Button>
      )}

      <h2
        className="designer-heading mb-6"
        style={{
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: "#3B82F6",
        }}
      >
        Contact
      </h2>

      <div className="h-[1.5px] bg-[#CBD5E1]" />

      {rows.map((row) => (
        <ContactRow key={row.label} {...row} />
      ))}

      {resumeUrl && (
        <div className="flex items-center justify-between border-b border-[#CBD5E1] py-5">
          <span className="text-[11px] font-bold tracking-[0.1em] text-[#64748B] uppercase">
            Resume
          </span>
          <div className="flex items-center gap-3">
            <a
              href={resumeUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 no-underline"
            >
              <span className="text-[15px] font-medium text-[#0F172A] transition-colors group-hover:text-[#3B82F6]">
                Download
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#3B82F6] opacity-50 transition-opacity group-hover:opacity-100" />
            </a>
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteResume}
                aria-label="Delete resume"
                className="h-auto w-auto p-0 text-[#94A3B8] hover:bg-transparent hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {isEditing && !hasAnything && (
        <div className="mt-6">
          <AddItem
            title="Add contact links, phone, or resume"
            onClick={() => openSidebar(sidebars.footer)}
            iconLeft={<MemoSocial />}
            className="w-full bg-white"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <a
            href="#section-projects"
            className="text-[13px] text-[#64748B] no-underline hover:text-[#0F172A]"
          >
            / Work
          </a>
          {portfolios.dribbble && (
            <a
              href={portfolios.dribbble}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#64748B] no-underline hover:text-[#0F172A]"
            >
              / Dribbble
            </a>
          )}
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#64748B] no-underline hover:text-[#0F172A]"
            >
              / LinkedIn
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#64748B] no-underline hover:text-[#0F172A]"
            >
              / Twitter
            </a>
          )}
        </div>
        <span className="text-[12px] text-[#94A3B8]">
          © {year} {firstName}
        </span>
      </div>
    </div>
  );
}

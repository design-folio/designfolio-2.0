import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import Link from "next/link";
import { JobsFloatingNav } from "@/components/jobs/JobsFloatingNav";
import { CreditsBalance } from "@/components/jobs/CreditsBalance";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
import DocumentsLibrary from "@/components/jobs/documents/DocumentsLibrary";

function DocumentsTopBar() {
  return (
    <div className="flex flex-row flex-shrink-0 items-center pl-4 md:pl-[108px] pr-4 mt-2.5 md:mt-6 mb-1.5 md:mb-2 gap-2">
      {/* Left: empty — mirrors FilterBar's left group width */}
      <div className="flex-1 md:flex-none" />

      {/* Right group: tab switcher + credits + avatar */}
      <div className="hidden md:flex items-center gap-1.5 ml-auto">
        <div className="flex items-center gap-0.5 bg-card rounded-full p-0.5 flex-shrink-0">
          <Link href="/jobs">
            <span className="block text-[12px] font-medium px-3 py-1.5 rounded-full text-foreground/45 hover:text-foreground/70 transition-colors cursor-pointer select-none">
              Jobs
            </span>
          </Link>
          <Link href="/jobs/documents">
            <span className="block text-[12px] font-medium px-3 py-1.5 rounded-full bg-foreground text-background cursor-pointer select-none">
              Documents
            </span>
          </Link>
        </div>
        <CreditsBalance />
        <AvatarDropdown />
      </div>
    </div>
  );
}

export default function JobsDocumentsPage() {
  return (
    <>
      <JobsFloatingNav />
      <div className="flex flex-col h-screen overflow-hidden">
        <DocumentsTopBar />
        <DocumentsLibrary />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const base = await loggedInServerSideProps(context);
  if (base.redirect || base.notFound) return base;
  return {
    props: {
      ...(base.props ?? {}),
      hideHeader: true,
    },
  };
}

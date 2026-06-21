import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { JobsFloatingNav } from "@/components/jobs/JobsFloatingNav";
import { CreditsBalance } from "@/components/jobs/CreditsBalance";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
import { TabSwitcher } from "@/components/jobs/FilterBar";
import DocumentsLibrary from "@/components/jobs/documents/DocumentsLibrary";

function DocumentsTopBar() {
  return (
    <div className="flex flex-row flex-shrink-0 items-center pl-4 md:pl-[108px] pr-4 mt-2.5 md:mt-6 mb-1.5 md:mb-2 gap-2">
      <div className="flex-1 md:flex-none" />
      <div className="hidden md:flex items-center gap-1.5 ml-auto">
        <TabSwitcher />
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

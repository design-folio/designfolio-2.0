import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { CreditsBalance } from "@/components/jobs/CreditsBalance";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
import { TabSwitcher } from "@/components/jobs/FilterBar";
import DocumentsLibrary from "@/components/jobs/documents/DocumentsLibrary";

function DocumentsTopBar() {
  return (
    <div className="mt-2.5 mb-1.5 flex shrink-0 flex-row items-center gap-2 pr-4 pl-4 md:mt-6 md:mb-2">
      <div className="flex-1 md:flex-none" />
      <div className="ml-auto hidden items-center gap-1.5 md:flex">
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
      <div className="flex h-screen flex-col overflow-hidden">
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

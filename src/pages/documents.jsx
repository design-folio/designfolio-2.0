import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import Navbar from "@/components/loggedInHeader/navbar";
import DocumentsLibrary from "@/components/jobs/documents/DocumentsLibrary";

export default function DocumentsPage() {
  return (
    <>
      <Navbar />
      <DocumentsLibrary />
    </>
  );
}

export async function getServerSideProps(context) {
  const base = await loggedInServerSideProps(context);
  if (base.redirect || base.notFound) return base;

  return {
    props: {
      ...(base.props ?? {}),
    },
  };
}

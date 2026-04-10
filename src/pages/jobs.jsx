import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { Jobs } from "@/components/jobs/index";
import { JobsFloatingNav } from "@/components/jobs/JobsFloatingNav";

/**
 * /jobs — AI-powered job finder page (logged-in only, no navbar)
 *
 * NOTE: APIS TO BE INTEGRATED HERE — getServerSideProps can prefetch user
 * preferences and existing pipeline via GET /api/jobs/status and pass as props.
 */
export default function JobsPage() {
  return (
    <>
      <JobsFloatingNav />
      <Jobs />
    </>
  );
}

export async function getServerSideProps(context) {
  const base = await loggedInServerSideProps(context);

  // Propagate any redirect/notFound from the auth check
  if (base.redirect || base.notFound) return base;

  return {
    props: {
      ...(base.props ?? {}),
      hideHeader: true,
    },
  };
}

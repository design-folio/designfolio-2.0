import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { Jobs } from "@/components/jobs/index";
import { JobsFloatingNav } from "@/components/jobs/JobsFloatingNav";
import { isJobsBetaUser } from "@/lib/jobsBeta";

function decodeJwtEmail(token) {
  try {
    const raw = token.replace(/^Bearer\s+/i, '');
    const payload = JSON.parse(Buffer.from(raw.split('.')[1], 'base64').toString('utf8'));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

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
  if (base.redirect || base.notFound) return base;

  const token = context.req.cookies['df-token'] ?? '';
  const email = decodeJwtEmail(token);

  if (!isJobsBetaUser(email)) return { notFound: true };

  return {
    props: {
      ...(base.props ?? {}),
      hideHeader: true,
    },
  };
}

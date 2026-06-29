/**
 * Wraps getServerSideProps for admin-only pages.
 * Returns { notFound: true } (renders 404) if the user is not a logged-in admin.
 * Non-admins (including logged-in regular users) see a generic 404.
 */
export const withAdminAuth = (inner) => async (ctx) => {
  const token = ctx.req.cookies?.["df-token"];
  if (!token) return { notFound: true };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/me`, {
      headers: { Authorization: token },
    });
    if (!res.ok) return { notFound: true };
  } catch {
    return { notFound: true };
  }

  if (inner) {
    const result = await inner(ctx);
    if (result.props) result.props.hideHeader = true;
    return result;
  }
  return { props: { hideHeader: true } };
};

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  if (dfToken) {
    return {
      redirect: {
        destination: "/builder",
        permanent: false,
      },
    };
  }
  return {
    props: { dfToken: !!dfToken },
  };
};

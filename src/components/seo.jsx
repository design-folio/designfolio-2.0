// components/Seo.js
import Head from "next/head";

const Seo = ({
  title = "Designfolio",
  description = "Default description",
  keywords = "Dead simple & Painless way to build your portfolio",
  author = "Designfolio",
  imageUrl = "/images/png/seo-avatar.png",
  url = "https://designfolio.me",
  favicon = "/favicon.ico", // Specify the path to your default favicon
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="icon" href={favicon} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Add any other meta tags you need */}
    </Head>
  );
};

export default Seo;

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <Html lang="en">
      <Head>
        <link
          rel="preconnect"
          href="https://designfolio-dev.s3.ap-south-1.amazonaws.com"
          crossOrigin="anonymous"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        {isProduction && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "lryoca442i");
            `,
            }}
          />
        )}
        <div id="modal-root"></div>
      </body>
    </Html>
  );
}

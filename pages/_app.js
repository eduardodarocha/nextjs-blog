import "../styles/global.css"

export default function App({ Component, pageProps }) {
  return (
    <>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-PH31J3DLE1"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-PH31J3DLE1');
      </script>
      <Component {...pageProps} />
    </>
  );
}

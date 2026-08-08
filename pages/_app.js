import { Inter, JetBrains_Mono } from "@next/font/google";
import "../styles/global.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap" });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-jetbrains-mono: ${jetbrainsMono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

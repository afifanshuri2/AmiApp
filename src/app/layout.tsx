import "./globals.css";
import { Figtree, Schoolbell } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});
// Handwriting is kept for the fridge note only.
const schoolbell = Schoolbell({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schoolbell",
});
export const metadata = {
  title: "AmiApp · A little space for us",
  description:
    "Your shared little corner of the world. Notes, dreams, and everyday love.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/amiapp-mark.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "AmiApp", statusBarStyle: "default" },
};
export const viewport = { themeColor: "#c2456b" };
// Applies the saved accent and colour mode before first paint, avoiding a flash.
const themeScript = `try{var d=document.documentElement,t=localStorage.getItem("ami-theme"),m=localStorage.getItem("ami-mode");if(t==="sage"||t==="lavender")d.dataset.theme=t;d.dataset.mode=m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"}catch(e){}`;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${schoolbell.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

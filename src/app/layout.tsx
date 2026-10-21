import "./globals.css";
export const metadata = {
  title: "AmiApp · A little space for us",
  description:
    "Your shared little corner of the world. Notes, dreams, and everyday love.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/amiapp-mark.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "AmiApp", statusBarStyle: "default" },
};
export const viewport = { themeColor: "#b96379" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

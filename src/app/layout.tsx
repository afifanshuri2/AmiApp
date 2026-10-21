import "./globals.css";
export const metadata = {
  title: "AmiApp · A little space for us",
  description:
    "Your shared little corner of the world. Notes, dreams, and everyday love.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

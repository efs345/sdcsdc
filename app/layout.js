import "./globals.css";

export const metadata = {
  title: "DPI-HT-01 | Vladislavs Grigorjevs",
  description: "DPI-HT-01 accounting and audit submission dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

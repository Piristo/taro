import type { Metadata } from "next";
import "./globals.css";
import { TarotProvider } from "../contexts/TarotContext";

export const metadata: Metadata = {
  title: "Таро Гадание",
  description:
    "Автономное Telegram Mini App для глубоких таро-раскладов с локальной историей и премиальными анимациями.",
  applicationName: "Таро Гадание",
  metadataBase: new URL("https://localhost"),
  openGraph: {
    title: "Таро Гадание",
    description:
      "Мистический мини-опыт: расклады, интерпретации и история полностью оффлайн.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2C1810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="min-h-screen bg-[var(--bg-veil)] text-[var(--ink-100)] antialiased">
        <TarotProvider>{children}</TarotProvider>
      </body>
    </html>
  );
}

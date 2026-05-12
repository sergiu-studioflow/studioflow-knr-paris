import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#0A0000",
};

export const metadata: Metadata = {
  title: "KNR Paris Creative Studio",
  description:
    "KNR Paris' internal creative operations studio — brand intelligence, competitor research, static ads, and video generation for our luxury fashion and beauty clients.",
  openGraph: {
    title: "KNR Paris Creative Studio",
    description:
      "KNR Paris' internal creative operations studio — brand intelligence, competitor research, static ads, and video generation for our luxury fashion and beauty clients.",
    images: ["/knr-paris-logo.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${robotoMono.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";


const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "nyc.pet — Lost & Found Pets in New York City",
  description:
    "Help reunite lost pets with their families in NYC. Browse lost and found pet listings across all five boroughs.",
  openGraph: {
    title: "nyc.pet — Lost & Found Pets in NYC",
    description: "Help reunite lost pets with their families in New York City.",
    siteName: "nyc.pet",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${nunito.variable} font-nunito antialiased bg-gray-50 text-gray-900`}>
        <Navbar />
        <div className="pb-16 md:pb-0">{children}</div>
        <div className="hidden md:block"><Footer /></div>
        <MobileBottomNav />
      </body>
    </html>
  );
}

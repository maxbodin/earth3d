import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import {Providers} from "@/app/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flight Radar 3D",
  description: "Flight Radar 3D",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
              <body className={`overflow-hidden ${inter.className}`}>
                <Providers>{children}</Providers>
              </body>
      </html>
  );
}

/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import Navbar from "./components/Navbar";
export const metadata = {
  title: "SBD Store",
  description: "SBD Practicum Module 10 – Frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PlaceLayout({ children }: Props) {
  return (
    <section className="min-h-screen bg-white">
      <main>
        <Navbar />
        {children}
        <Footer />
      </main>
    </section>
  );
}

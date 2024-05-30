import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-5">
        <Hero />
        <About />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}

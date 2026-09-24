import { useEffect } from "react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Memory from "./components/Memory";
import HowItWorks from "./components/HowItWorks";
import Walrus from "./components/Walrus";
import Final from "./components/Final";
import Footer from "./components/Footer";

export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="min-h-screen bg-white text-n-text overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <Memory />
        <HowItWorks />
        <Walrus />
        <Final />
      </main>
      <Footer />
    </div>
  );
}

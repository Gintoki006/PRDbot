import TopNavBar from "./_components/landing/TopNavBar";
import HeroSection from "./_components/landing/HeroSection";
import HowItWorksSection from "./_components/landing/HowItWorksSection";
import FeaturesSection from "./_components/landing/FeaturesSection";
import ProblemSolutionSection from "./_components/landing/ProblemSolutionSection";
import Footer from "./_components/landing/Footer";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow pt-16">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ProblemSolutionSection />
      </main>
      <Footer />
    </>
  );
}

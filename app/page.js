import TopNavBar from "./_components/landing/TopNavBar";
import HeroSection from "./_components/landing/HeroSection";
import FeaturesSection from "./_components/landing/FeaturesSection";
import LogoCloud from "./_components/landing/LogoCloud";
import Footer from "./_components/landing/Footer";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow pt-16">
        <HeroSection />
        <FeaturesSection />
        <LogoCloud />
      </main>
      <Footer />
    </>
  );
}

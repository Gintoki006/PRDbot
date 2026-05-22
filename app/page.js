import TopNavBar from "./_components/landing/TopNavBar";
import HeroSection from "./_components/landing/HeroSection";
import LogoCloud from "./_components/landing/LogoCloud";
import Footer from "./_components/landing/Footer";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow pt-16">
        <HeroSection />
        <LogoCloud />
      </main>
      <Footer />
    </>
  );
}

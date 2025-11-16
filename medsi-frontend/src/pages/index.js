import Navbar from "@/components/Home/Navbar";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import HowItWorks from "@/components/Home/HowItWorks";
import Testimonials from "@/components/Home/Testimonials";
import CTASection from "@/components/Home/CTASection";
import Footer from "@/components/Home/Footer";
import ForPatients from "@/components/Home/ForPatients";
import ForDoctors from "@/components/Home/ForDoctors";


export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ForPatients />
      <ForDoctors />
      <Testimonials />
      <CTASection />
      <Footer />
    </>
  );
}

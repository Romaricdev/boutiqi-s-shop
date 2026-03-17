import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProofBar } from "@/components/landing/proof-bar";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhatsAppFirst } from "@/components/landing/whatsapp-first";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProofBar />
      <ProblemSection />
      <HowItWorks />
      <WhatsAppFirst />
      <Features />
      <Pricing />
      <Testimonials />
      <CtaSection />
      <Footer />
    </>
  );
}

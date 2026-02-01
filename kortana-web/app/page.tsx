import Hero from "@/components/landing/Hero";
import KeyMetrics from "@/components/landing/KeyMetrics";
import WhyKortana from "@/components/landing/WhyKortana";
import ProtocolStats from "@/components/landing/ProtocolStats";
import EcosystemShowcase from "@/components/landing/EcosystemShowcase";
import Roadmap from "@/components/landing/Roadmap";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-deep-space selection:bg-cyan-500/30">
      <Hero />
      <ProtocolStats />
      <div className="relative z-10 space-y-24 pb-24">
        <KeyMetrics />
        <WhyKortana />
        <EcosystemShowcase />
        <Roadmap />
      </div>
    </div>
  );
}

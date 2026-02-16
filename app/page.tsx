"use client"

import HeroSection from '@/components/Home/HeroSection';
import AdvertSection from '@/components/Home/AdvertSection';
import FeaturesSection from '@/components/Home/FeaturesSection';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />
      <AdvertSection />
      <FeaturesSection />
    </main>
  );
}
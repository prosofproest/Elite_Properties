/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense } from 'react';
import Hero from '../../components/home/Hero';
import SearchOverlay from '../../components/home/SearchOverlay';
import StatsBar from '../../components/home/StatsBar';
import AboutSnippet from '../../components/home/AboutSnippet';
import FeaturedProjects from '../../components/home/FeaturedProjects';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import EMICalculator from '../../components/home/EMICalculator';
import GalleryPreview from '../../components/home/GalleryPreview';
import FinalCTA from '../../components/home/FinalCTA';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SearchOverlay />
      <StatsBar />
      <AboutSnippet />
      <FeaturedProjects />
      <WhyChooseUs />
      <EMICalculator />
      <GalleryPreview />
      <FinalCTA />
    </div>
  );
}

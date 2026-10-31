import { useState } from 'react';
import Cover from './components/Cover';
import Footer from './components/Footer';
import OriginSection from './components/OriginSection';
import PlannerSection from './components/PlannerSection';
import TargetSection from './components/TargetSection';
import TopRail from './components/TopRail';
import { useActiveSection, useReveal } from './hooks/usePageTools';
import type { VectorId } from './types/plan';

const SECTIONS = ['origin', 'target', 'protocol'];

export default function App() {
  const [vector, setVector] = useState<VectorId>('fortune');

  useReveal();
  const active = useActiveSection(SECTIONS);

  return (
    <>
      <a className="skip" href="#origin">
        Skip to the file
      </a>
      <TopRail active={active} />
      <main>
        <Cover />
        <OriginSection />
        <TargetSection vector={vector} onVector={setVector} />
        <PlannerSection vector={vector} onVector={setVector} />
      </main>
      <Footer />
    </>
  );
}

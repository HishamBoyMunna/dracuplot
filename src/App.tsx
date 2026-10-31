import { useState } from 'react';
import Cover from './components/Cover';
import FileTabs from './components/FileTabs';
import Footer from './components/Footer';
import OriginSection from './components/OriginSection';
import PlannerSection from './components/PlannerSection';
import TargetSection from './components/TargetSection';
import TopRail from './components/TopRail';
import { useActiveSection, useReadProgress, useReveal } from './hooks/usePageTools';
import type { VectorId } from './types/plan';

const SECTIONS = ['origin', 'target', 'protocol'];

export default function App() {
  const [vector, setVector] = useState<VectorId>('fortune');

  useReveal();
  const active = useActiveSection(SECTIONS);
  const progress = useReadProgress();

  return (
    <>
      <a className="skip" href="#origin">
        Skip to the file
      </a>
      <TopRail active={active} progress={progress} />
      <main>
        <Cover />
        <OriginSection />
        <TargetSection vector={vector} onVector={setVector} />
        <PlannerSection vector={vector} onVector={setVector} />
      </main>
      <Footer />
      <FileTabs active={active} />
    </>
  );
}

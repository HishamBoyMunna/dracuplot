import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TargetSection from './components/TargetSection';
import PlanGenerator from './components/PlanGenerator';
import Footer from './components/Footer';
import { useScrollReveal } from './hooks/useScrollReveal';
import type { WeaknessId } from './types/plan';

export default function App() {
  const [selectedWeakness, setSelectedWeakness] = useState<WeaknessId>('jaw');
  useScrollReveal();

  return (
    <div className="min-h-screen overflow-clip bg-void text-bone">
      <Navbar />
      <main>
        <Hero />
        <TargetSection
          selectedWeakness={selectedWeakness}
          onSelectWeakness={setSelectedWeakness}
        />
        <PlanGenerator
          focusWeakness={selectedWeakness}
          onFocusWeakness={setSelectedWeakness}
        />
      </main>
      <Footer />
    </div>
  );
}

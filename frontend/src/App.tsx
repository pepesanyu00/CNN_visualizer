import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ConfigPanel } from './components/config/ConfigPanel';
import { VisualizerBoard } from './components/visualizer/VisualizerBoard';
import { useCNN } from './hooks/useCNN';
import { Modal } from './components/ui/Modal';
import { OperationsCalculator } from './components/calculator/OperationsCalculator';
import { Calculator } from 'lucide-react';

function App() {
  const { config, updateConfig, inputs, filters, outputs } = useCNN();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <>
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full shadow-lg border border-neutral-700 hover:bg-neutral-700 hover:scale-105 transition-all"
        >
          <Calculator className="w-4 h-4" />
          <span className="text-sm font-bold">Calculator</span>
        </button>
      </div>

      <AppLayout
        sidebar={
          <ConfigPanel config={config} updateConfig={updateConfig} />
        }
        content={
          <VisualizerBoard
            inputs={inputs}
            filters={filters}
            outputs={outputs}
            padding={config.padding}
          />
        }
      />

      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="CNN Operations Calculator"
      >
        <OperationsCalculator />
      </Modal>
    </>
  );
}

export default App;

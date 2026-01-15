import React, { useMemo } from 'react';
import { MatrixGrid } from './MatrixGrid';
import type { Matrix, Filter } from '../../types/cnn';
import type { ConvLayerOutput } from '../../logic/convolution';
import { padMatrix } from '../../logic/convolution';
import { ArrowRight, Plus, Equal } from 'lucide-react';

interface VisualizerContentProps {
    inputs: Matrix[];
    filters: Filter[];
    outputs: ConvLayerOutput[];
    padding: number;
}

export const VisualizerContent = React.memo<VisualizerContentProps>(({ inputs, filters, outputs, padding }) => {

    // Memoize padded inputs for display
    const visibleInputs = useMemo(() => {
        return inputs.map(input => padMatrix(input, padding));
    }, [inputs, padding]);

    return (
        <div className="flex flex-row gap-8 items-start">
            {/* COLUMN 1: INPUTS */}
            <div className="flex flex-col gap-6 items-center shrink-0">
                <h2 className="text-xl font-bold bg-neutral-800 px-4 py-1 rounded-full text-blue-200 border border-blue-900/50 shadow-lg shadow-blue-900/20">
                    Input
                </h2>
                <div className="flex flex-col gap-4">
                    {visibleInputs.map((matrix, idx) => (
                        <MatrixGrid
                            key={`input-${idx}`}
                            data={matrix}
                            title={`Channel ${idx}`}
                            colorTheme="blue"
                            highlightPadding={padding > 0 ? padding : undefined}
                        />
                    ))}
                </div>
            </div>

            {/* CONNECTOR */}
            <div className="hidden xl:flex flex-col justify-center h-full pt-32 shrink-0">
                <ArrowRight className="w-8 h-8 text-neutral-600 animate-pulse" />
            </div>

            {/* COLUMN 2: FILTERS */}
            <div className="flex flex-col gap-6 items-center shrink-0">
                <h2 className="text-xl font-bold bg-neutral-800 px-4 py-1 rounded-full text-green-200 border border-green-900/50 shadow-lg shadow-green-900/20">
                    Filters
                </h2>
                <div className="flex flex-col gap-16">
                    {filters.map((filter, fIdx) => (
                        <div key={filter.id} className="flex flex-col gap-2 p-4 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-900/30 backdrop-blur-sm">
                            <span className="text-xs text-neutral-400 font-mono text-center mb-1">Filter {fIdx}</span>
                            <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                                {filter.kernels.map((kernel, kIdx) => (
                                    <MatrixGrid
                                        key={`k-${fIdx}-${kIdx}`}
                                        data={kernel.weights}
                                        title={`Kernel (${fIdx},${kIdx})`}
                                        colorTheme="green"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CONNECTOR */}
            <div className="hidden xl:flex flex-col justify-center h-full pt-32 shrink-0">
                <ArrowRight className="w-8 h-8 text-neutral-600 animate-pulse" />
            </div>

            {/* COLUMN 3: INTERMEDIATE (PARTIALS) */}
            <div className="flex flex-col gap-6 items-center shrink-0">
                <h2 className="text-xl font-bold bg-neutral-800 px-4 py-1 rounded-full text-yellow-200 border border-yellow-900/50 shadow-lg shadow-yellow-900/20">
                    Partial Convolutions
                </h2>
                <div className="flex flex-col gap-16">
                    {outputs.map((out, fIdx) => (
                        <div key={`partial-group-${fIdx}`} className="flex flex-col gap-4 relative p-4 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-900/30 backdrop-blur-sm">
                            <span className="text-xs text-neutral-400 font-mono text-center mb-1">Filter {fIdx} Results</span>
                            <div className="flex flex-row items-center gap-2 overflow-x-auto pb-2">
                                {out.intermediates.map((partial, pIdx) => (
                                    <div key={`p-${fIdx}-${pIdx}`} className="flex flex-row items-center gap-2">
                                        <MatrixGrid
                                            data={partial}
                                            title={`Partial (${fIdx},${pIdx})`}
                                            colorTheme="yellow"
                                        />
                                        {pIdx < out.intermediates.length - 1 && (
                                            <Plus className="w-6 h-6 text-neutral-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {filters[fIdx].bias !== 0 && (
                                <div className="text-xs text-neutral-500 font-mono mt-2 self-center">
                                    + Bias ({filters[fIdx].bias})
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CONNECTOR */}
            <div className="hidden xl:flex flex-col justify-center h-full pt-32 shrink-0">
                <Equal className="w-8 h-8 text-neutral-600" />
            </div>

            {/* COLUMN 4: OUTPUTS */}
            <div className="flex flex-col gap-6 items-center shrink-0">
                <h2 className="text-xl font-bold bg-neutral-800 px-4 py-1 rounded-full text-purple-200 border border-purple-900/50 shadow-lg shadow-purple-900/20">
                    Output Maps
                </h2>
                <div className="flex flex-col gap-16">
                    {outputs.map((out, idx) => (
                        <div key={`out-${idx}`} className="flex items-center justify-center p-4">
                            <MatrixGrid
                                data={out.final}
                                title={`Map ${idx}`}
                                colorTheme="purple"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

VisualizerContent.displayName = 'VisualizerContent';

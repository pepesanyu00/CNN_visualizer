

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// If @/lib/utils doesn't exist, I'll use standard className. Checking previous context, it wasn't shown but likely exists in a shadcn setup.
// I'll assume it exists or use standard template literals if simple.
// Wait, I saw package.json has clsx and tailwind-merge, so commonly `cn` is in utils. 
// I will assume it is there. If not I will fix.

interface ConfigPanelProps {
    config: {
        inputHeight: number;
        inputWidth: number;
        inputChannels: number;
        numFilters: number;
        kernelSize: number;
        stride: number;
        padding: number;
        sparsity?: number;
    };
    updateConfig: (cfg: any) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, updateConfig }) => {
    const handleChange = (key: string, value: number) => {
        updateConfig({ [key]: value });
    };

    return (
        <div className="space-y-8 p-1">
            {/* Input Configuration */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Input Volume</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500 font-semibold">Height</Label>
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-blue-500/50"
                            value={config.inputHeight}
                            min={3} max={15}
                            onChange={(e) => handleChange('inputHeight', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500 font-semibold">Width</Label>
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-blue-500/50"
                            value={config.inputWidth}
                            min={3} max={15}
                            onChange={(e) => handleChange('inputWidth', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-neutral-500 font-semibold">Channels (Depth)</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-blue-500/50"
                            value={config.inputChannels}
                            min={1} max={5}
                            onChange={(e) => handleChange('inputChannels', parseInt(e.target.value) || 0)}
                        />
                        <span className="text-xs text-neutral-600">Max: 5</span>
                    </div>
                </div>
            </div>

            <Separator className="bg-neutral-800" />

            {/* Convolution Configuration */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Convolution Layer</h3>

                {/* Kernel Size Selector - Premium Visual Style */}
                <div className="space-y-3">
                    <Label className="text-xs text-neutral-500 font-semibold">Kernel Size</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {[1, 3, 5, 7].map((size) => (
                            <button
                                key={size}
                                onClick={() => handleChange('kernelSize', size)}
                                className={`
                                    flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                                    ${config.kernelSize === size
                                        ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                        : 'bg-neutral-900/30 border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:bg-neutral-800'
                                    }
                                `}
                            >
                                <span className="text-lg font-bold">{size}×{size}</span>
                                <div className="grid gap-0.5 mt-2"
                                    style={{ gridTemplateColumns: `repeat(${Math.min(size, 3)}, 2px)` }}>
                                    {Array.from({ length: Math.min(size * size, 9) }).map((_, i) => (
                                        <div key={i} className={`w-0.5 h-0.5 rounded-full ${config.kernelSize === size ? 'bg-green-500' : 'bg-neutral-600'}`} />
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-neutral-500 font-semibold">Filters</Label>
                    <Input
                        type="number"
                        className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-green-500/50"
                        value={config.numFilters}
                        min={1} max={6}
                        onChange={(e) => handleChange('numFilters', parseInt(e.target.value) || 0)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500 font-semibold">Stride</Label>
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-purple-500/50"
                            value={config.stride}
                            min={1} max={3}
                            onChange={(e) => handleChange('stride', parseInt(e.target.value) || 1)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500 font-semibold">Padding</Label>
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-neutral-800 text-white focus:ring-blue-500/50"
                            value={config.padding}
                            min={0} max={5}
                            onChange={(e) => handleChange('padding', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-neutral-500 font-semibold text-red-400">Sparsity (%)</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            type="number"
                            className="bg-neutral-900/50 border-red-900/30 text-white focus:ring-red-500/50"
                            value={config.sparsity || 0}
                            min={0} max={99}
                            onChange={(e) => handleChange('sparsity', Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                        />
                        <span className="text-xs text-neutral-600">0-99%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const OperationsCalculator: React.FC = () => {
    // Independent state for calculator
    const [params, setParams] = useState({
        inputHeight: "32",
        inputWidth: "32",
        inputChannels: "3",
        numFilters: "10",
        kernelSize: "3",
        stride: "1",
        padding: "0",
        sparsity: "0"
    });

    const handleChange = (key: string, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const results = useMemo(() => {
        const inputHeight = Number(params.inputHeight) || 0;
        const inputWidth = Number(params.inputWidth) || 0;
        const inputChannels = Number(params.inputChannels) || 0;
        const numFilters = Number(params.numFilters) || 0;
        const kernelSize = Number(params.kernelSize) || 0;
        const stride = Number(params.stride) || 1;
        const padding = Number(params.padding) || 0;
        const sparsity = Math.min(99, Math.max(0, Number(params.sparsity) || 0));

        // Output Dimensions
        const outH = Math.floor((inputHeight + 2 * padding - kernelSize) / stride) + 1;
        const outW = Math.floor((inputWidth + 2 * padding - kernelSize) / stride) + 1;

        if (outH <= 0 || outW <= 0) {
            return {
                outputShape: "Invalid (<= 0)",
                totalMults: 0,
                totalAdds: 0,
                totalOps: 0,
                breakdown: { start: 0, merge: 0, bias: 0 },
                zeroOps: { mults: 0, adds: 0, total: 0 }
            };
        }

        // Operations per Output Pixel per Filter
        // 1. Multiplications: K * K * Cin
        const multsPerPixel = kernelSize * kernelSize * inputChannels;

        // 2. Additions
        //    a) Convolution Adds (Intra-kernel summation): (K*K - 1) per channel
        const convAdds = (kernelSize * kernelSize - 1) * inputChannels;

        //    b) Channel Merge Adds (Inter-channel summation): (Cin - 1)
        const channelSumAdds = Math.max(0, inputChannels - 1);

        //    c) Bias Add: +1
        const biasAdd = 1;

        // Total Operations
        const totalPixels = outH * outW;
        const totalMapPixels = totalPixels * numFilters;

        const totalMults = totalMapPixels * multsPerPixel;

        const totalConvAdds = totalMapPixels * convAdds;
        const totalChannelAdds = totalMapPixels * channelSumAdds;
        const totalBiasAdds = totalMapPixels * biasAdd;

        const totalAdds = totalConvAdds + totalChannelAdds + totalBiasAdds;

        // Sparsity Calculations (Zero Ops)
        // Only kernel weights affect this.
        // Zero Mults = totalMults * (sparsity%)
        // Zero Adds = Zero Mults (Each zero weight results in a +0 operation)
        const zeroMults = totalMults * (sparsity / 100);
        const zeroAdds = zeroMults;

        return {
            outputShape: `${outH} x ${outW} x ${numFilters}`,
            totalMults,
            totalAdds,
            breakdown: {
                start: totalConvAdds,
                merge: totalChannelAdds,
                bias: totalBiasAdds
            },
            totalOps: totalMults + totalAdds,
            zeroOps: {
                mults: zeroMults,
                adds: zeroAdds,
                total: zeroMults + zeroAdds
            }
        };
    }, [params]);

    const formatNumber = (num: number) => {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + " B"; // 10^9
        if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";      // 10^6
        if (num >= 1e3) return (num / 1e3).toFixed(2) + " k";         // 10^3
        return num.toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Input Height</Label>
                    <Input type="number" value={params.inputHeight} onChange={(e) => handleChange('inputHeight', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Input Width</Label>
                    <Input type="number" value={params.inputWidth} onChange={(e) => handleChange('inputWidth', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Channels</Label>
                    <Input type="number" value={params.inputChannels} onChange={(e) => handleChange('inputChannels', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Filters (K)</Label>
                    <Input type="number" value={params.numFilters} onChange={(e) => handleChange('numFilters', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Kernel Size</Label>
                    <Input type="number" value={params.kernelSize} onChange={(e) => handleChange('kernelSize', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Stride</Label>
                    <Input type="number" value={params.stride} onChange={(e) => handleChange('stride', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">Padding</Label>
                    <Input type="number" value={params.padding} onChange={(e) => handleChange('padding', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-500 text-red-400">Sparsity (%)</Label>
                    <Input type="number" value={params.sparsity} onChange={(e) => handleChange('sparsity', e.target.value)} className="bg-neutral-800 border-red-900/30 text-white focus:ring-red-500/50" />
                </div>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800 space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Output Shape</h4>
                        <div className="text-3xl font-mono text-white tracking-tighter">
                            {results.outputShape}
                        </div>
                    </div>

                    <Separator className="bg-neutral-700/50" />

                    <div>
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Sparsity Impact</h4>
                        <p className="text-xs text-neutral-500 mb-2">Operations with Zero (Skipped)</p>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Zero Mults:</span>
                                <span className="font-mono text-red-300">{formatNumber(results.zeroOps.mults)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Zero Adds:</span>
                                <span className="font-mono text-red-300">{formatNumber(results.zeroOps.adds)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold pt-1 border-t border-neutral-700/50 mt-1">
                                <span className="text-neutral-300">Total Zero Ops:</span>
                                <span className="font-mono text-red-400">{formatNumber(results.zeroOps.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800 space-y-3">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Complexity</h4>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300 font-bold">Multiplications</span>
                        <span className="text-lg font-mono text-blue-300">{formatNumber(results.totalMults)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-300 font-bold">Total Additions</span>
                            <span className="text-lg font-mono text-green-300">{formatNumber(results.totalAdds)}</span>
                        </div>
                        {/* Breakdown */}
                        <div className="pl-4 flex justify-between items-center text-xs text-neutral-500">
                            <span>↳ Intra-Kernel Sums</span>
                            <span className="font-mono">{formatNumber(results.breakdown.start)}</span>
                        </div>
                        <div className="pl-4 flex justify-between items-center text-xs text-neutral-500">
                            <span>↳ Channel Merge Sums</span>
                            <span className="font-mono">{formatNumber(results.breakdown.merge)}</span>
                        </div>
                        <div className="pl-4 flex justify-between items-center text-xs text-neutral-500">
                            <span>↳ Bias Additions</span>
                            <span className="font-mono">{formatNumber(results.breakdown.bias)}</span>
                        </div>
                    </div>
                    <Separator className="bg-neutral-700" />
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold text-neutral-300">Total FLOPs (Approx)</span>
                        <span className="text-xl font-mono text-purple-300 font-bold">{formatNumber(results.totalOps)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

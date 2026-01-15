import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Filter, Matrix } from "../types/cnn";
import { randomMatrix, computeConvLayer } from "../logic/convolution";

const DEFAULT_CONFIG = {
    inputHeight: 5,
    inputWidth: 5,
    inputChannels: 3,
    numFilters: 2,
    kernelSize: 3,
    stride: 1,
    padding: 0,
    sparsity: 0
};

export const useCNN = () => {
    // Configuration State (Persisted)
    const [config, setConfig] = useLocalStorage("cnn_config", DEFAULT_CONFIG);

    // Data State (Not necessarily persisted, or maybe yes? Let's persist for better UX)
    // Actually persisting large matrices might be heavy. Let's just persist config and regenerate on load.
    const [inputs, setInputs] = useState<Matrix[]>([]);
    const [filters, setFilters] = useState<Filter[]>([]);

    // Output State (Derived)
    const outputs = useMemo(() => {
        if (inputs.length === 0 || filters.length === 0) return [];
        // Now returns { final: Matrix, intermediates: Matrix[] }[]
        return computeConvLayer(inputs, filters, config.stride, config.padding);
    }, [inputs, filters, config.stride, config.padding]);

    // Initialization / Re-generation
    // We utilize a simple approach: whenever dimensions change, we regenerate data.
    // In a real app we might want to preserve overlapping areas, but it's complex.
    useEffect(() => {
        const { inputHeight, inputWidth, inputChannels, numFilters, kernelSize, sparsity = 0 } = config;

        // Generate Inputs
        const newInputs = Array.from({ length: inputChannels }, () =>
            randomMatrix(inputHeight, inputWidth, 0, 9)
        );

        // Generate Filters
        const newFilters: Filter[] = Array.from({ length: numFilters }, (_, i) => ({
            id: `f-${i}`,
            bias: 0, // Simplified
            kernels: Array.from({ length: inputChannels }, () => {
                // Generate base matrix
                const weights = randomMatrix(kernelSize, kernelSize, -1, 1);

                // Apply Sparsity
                if (sparsity > 0) {
                    for (let r = 0; r < kernelSize; r++) {
                        for (let c = 0; c < kernelSize; c++) {
                            // Randomly set to 0 based on sparsity %
                            if (Math.random() * 100 < sparsity) {
                                weights[r][c] = 0;
                            }
                        }
                    }
                }

                return { weights };
            })
        }));

        setInputs(newInputs);
        setFilters(newFilters);
    }, [
        config.inputHeight,
        config.inputWidth,
        config.inputChannels,
        config.numFilters,
        config.kernelSize,
        config.sparsity
    ]);

    const updateConfig = (newConfig: Partial<typeof DEFAULT_CONFIG>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    return {
        config,
        updateConfig,
        inputs,
        filters,
        outputs
    };
};

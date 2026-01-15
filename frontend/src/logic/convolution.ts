import type { Matrix, Filter } from "../types/cnn";

/**
 * Creates a zero-filled matrix of given dimensions
 */
export const createMatrix = (rows: number, cols: number, initialValue: number = 0): Matrix => {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
};

/**
 * Generates a random matrix with values between min and max
 */
export const randomMatrix = (rows: number, cols: number, min: number = -1, max: number = 1): Matrix => {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Number((Math.random() * (max - min) + min).toFixed(2)))
    );
};

/**
 * Validates dimensions
 */
export const getDimensions = (matrix: Matrix): [number, number] => {
    if (matrix.length === 0) return [0, 0];
    return [matrix.length, matrix[0].length];
};

/**
 * Performs 2D convolution between a specific input channel and a kernel.
 * No padding/stride logic handled here (assumes inputs are pre-padded if needed).
 */
/**
 * Pads a matrix with zeros.
 */
export const padMatrix = (matrix: Matrix, padding: number): Matrix => {
    if (padding === 0) return matrix;
    const [rows, cols] = getDimensions(matrix);
    const newRows = rows + 2 * padding;
    const newCols = cols + 2 * padding;
    const padded = createMatrix(newRows, newCols, 0);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            padded[i + padding][j + padding] = matrix[i][j];
        }
    }
    return padded;
};

/**
 * Performs 2D convolution between a specific input channel and a kernel.
 * No padding/stride logic handled here (assumes inputs are pre-padded if needed).
 */
export const convolve2D = (input: Matrix, kernel: Matrix, stride: number = 1): Matrix => {
    const [hIn, wIn] = getDimensions(input);
    const [hK, wK] = getDimensions(kernel);

    if (hK > hIn || wK > wIn) {
        // Kernel bigger than input - return empty or handle error
        return [];
    }

    const hOut = Math.floor((hIn - hK) / stride) + 1;
    const wOut = Math.floor((wIn - wK) / stride) + 1;

    const output = createMatrix(hOut, wOut, 0);

    for (let i = 0; i < hOut; i++) {
        for (let j = 0; j < wOut; j++) {
            let sum = 0;
            // Kernel operation
            for (let ki = 0; ki < hK; ki++) {
                for (let kj = 0; kj < wK; kj++) {
                    const r = i * stride + ki;
                    const c = j * stride + kj;
                    sum += input[r][c] * kernel[ki][kj];
                }
            }
            output[i][j] = Number(sum.toFixed(3)); // Limit precision
        }
    }
    return output;
};

/**
 * Adds two matrices element-wise
 */
export const addMatrices = (m1: Matrix, m2: Matrix): Matrix => {
    const [rows, cols] = getDimensions(m1);
    const [r2, c2] = getDimensions(m2);
    if (rows !== r2 || cols !== c2) throw new Error("Matrix dimensions mismatch in add");

    const res = createMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            res[i][j] = Number((m1[i][j] + m2[i][j]).toFixed(3));
        }
    }
    return res;
};

export interface ConvLayerOutput {
    final: Matrix;
    intermediates: Matrix[]; // One per input channel
}

/**
 * Computes the output of a CONV layer for all filters.
 * Returns both final summed outputs and intermediate per-channel convolutions.
 */
export const computeConvLayer = (
    inputs: Matrix[],
    filters: Filter[],
    stride: number = 1,
    padding: number = 0
): ConvLayerOutput[] => {
    // 0. Pre-pad inputs
    const paddedInputs = inputs.map(m => padMatrix(m, padding));

    return filters.map(filter => {
        // A filter has one kernel per input channel.
        if (filter.kernels.length !== paddedInputs.length) {
            console.error("Mismatch between input channels and filter kernels");
            return { final: [], intermediates: [] };
        }

        // 1. Convolve each channel (Partial Convolutions)
        const partials = paddedInputs.map((input, idx) =>
            convolve2D(input, filter.kernels[idx].weights, stride)
        );

        // 2. Sum them all up
        if (partials.length === 0) return { final: [], intermediates: [] };

        let totalSum = partials[0];
        for (let k = 1; k < partials.length; k++) {
            totalSum = addMatrices(totalSum, partials[k]);
        }

        // 3. Add Bias
        if (filter.bias !== 0) {
            const [h, w] = getDimensions(totalSum);
            // Create new matrix to avoid mutating partials[0] if it was assigned to totalSum
            // (addMatrices creates new, but the first assignment was direct)
            // Wait, addMatrices returns new. But the first assignment 'totalSum = partials[0]' references the array in partials.
            // So mutating totalSum would mutate partials[0] which is an intermediate output.
            // We must copy it if we are going to mutate it for bias.

            // Actually, let's just map to create a new one for the final output or use a safe add approach.
            // Deep copy for the final result before adding bias.
            totalSum = totalSum.map(row => [...row]);

            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    totalSum[r][c] += filter.bias;
                    totalSum[r][c] = Number(totalSum[r][c].toFixed(3));
                }
            }
        }

        return {
            final: totalSum,
            intermediates: partials
        };
    });
};

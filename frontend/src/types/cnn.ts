export type Matrix = number[][];

export interface Kernel {
    weights: Matrix;
}

export interface Filter {
    id: string;
    kernels: Kernel[]; // One kernel per input channel
    bias: number;
    color?: string; // For visualization
}

export interface InputLayer {
    channels: Matrix[];
}

export interface OutputLayer {
    featureMaps: Matrix[];
}

export interface CNNState {
    inputHeight: number;
    inputWidth: number;
    inputChannels: number;
    numFilters: number;
    kernelSize: number; // assuming square for now
    stride: number;
    padding: number;

    // Data
    inputs: Matrix[];
    filters: Filter[];
}

import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MatrixGridProps {
    data: number[][];
    title?: string;
    highlightedCell?: { r: number, c: number };
    className?: string;
    cellClassName?: string;
    colorTheme?: 'blue' | 'green' | 'red' | 'purple' | 'neutral' | 'yellow';
    highlightPadding?: number; // Number of padded rows/cols
}

const THEMES = {
    neutral: "bg-neutral-800 border-neutral-700 text-neutral-300",
    blue: "bg-blue-950/30 border-blue-800 text-blue-200",
    green: "bg-emerald-950/30 border-emerald-800 text-emerald-200",
    red: "bg-red-950/30 border-red-800 text-red-200",
    purple: "bg-purple-950/30 border-purple-800 text-purple-200",
    yellow: "bg-yellow-950/30 border-yellow-800 text-yellow-200",
};

export const MatrixGrid = React.memo<MatrixGridProps>(({
    data,
    title,
    className,
    colorTheme = 'neutral',
    highlightPadding = 0
}) => {
    if (!data || data.length === 0) return null;

    const rows = data.length;
    const cols = data[0].length;

    const isPaddedCell = (r: number, c: number) => {
        if (highlightPadding <= 0) return false;
        return r < highlightPadding || r >= rows - highlightPadding || c < highlightPadding || c >= cols - highlightPadding;
    };

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            {title && <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">{title}</span>}
            <div
                className="grid gap-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                }}
            >
                {data.map((row, i) => (
                    row.map((val, j) => {
                        const isPadding = isPaddedCell(i, j);

                        return (
                            <motion.div
                                key={`${i}-${j}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: (i * cols + j) * 0.005 }}
                                className={cn(
                                    "flex items-center justify-center rounded overflow-hidden text-xs font-mono font-medium",
                                    "w-9 h-9 sm:w-11 sm:h-11",
                                    isPadding
                                        ? "bg-transparent border-dashed border-neutral-800 text-neutral-600"
                                        : THEMES[colorTheme],
                                    !isPadding && val === 0 ? "text-red-500 font-extrabold bg-red-500/10" : "",
                                    !isPadding && "hover:brightness-125",
                                    "subpixel-antialiased" // Force sharp text rendering
                                )}
                            >
                                {val}
                            </motion.div>
                        );
                    })
                ))}
            </div>
            {/* Dimensions label */}
            <span className="text-[10px] text-neutral-600 font-mono">{rows}x{cols}</span>
        </div>
    );
});

MatrixGrid.displayName = 'MatrixGrid';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Matrix, Filter } from '../../types/cnn';
import type { ConvLayerOutput } from '../../logic/convolution';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { VisualizerContent } from './VisualizerContent';

interface VisualizerBoardProps {
    inputs: Matrix[];
    filters: Filter[];
    outputs: ConvLayerOutput[];
    padding: number;
}

export const VisualizerBoard: React.FC<VisualizerBoardProps> = ({ inputs, filters, outputs, padding }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Reference to current state for event listeners to avoid stale closures
    const transformRef = useRef({ x: position.x, y: position.y, scale });

    // Sync ref with state
    useEffect(() => {
        transformRef.current = { x: position.x, y: position.y, scale };
    }, [position, scale]);

    // --- ZOOM HANDLERS ---
    const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 3));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.1));

    // --- PAN HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only left click
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    // --- AUTO FIT ---
    const handleAutoFit = useCallback(() => {
        if (containerRef.current && contentRef.current) {
            const container = containerRef.current;
            const content = contentRef.current; // The wrapper inside

            const contentW = content.scrollWidth;
            const contentH = content.scrollHeight;
            const containerW = container.clientWidth;
            const containerH = container.clientHeight;

            const paddingFactor = 0.9;
            const scaleX = containerW / contentW;
            const scaleY = containerH / contentH;
            const newScale = Math.min(scaleX, scaleY) * paddingFactor;

            const finalScale = Math.min(Math.max(newScale, 0.1), 1.5);
            setScale(finalScale);

            // Center
            const centerX = (containerW - contentW * finalScale) / 2;
            const centerY = (containerH - contentH * finalScale) / 2;

            setPosition({ x: centerX, y: centerY });
        }
    }, [inputs, filters, outputs]);

    // Initial AutoFit
    useEffect(() => {
        // Small delay to ensure DOM is rendered
        const timer = setTimeout(handleAutoFit, 50);
        return () => clearTimeout(timer);
    }, [handleAutoFit]);

    // --- NATIVE WHEEL LISTENER ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                const { x: currentX, y: currentY, scale: currentScale } = transformRef.current;
                const rect = container.getBoundingClientRect();

                // Mouse position relative to container
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // 1. Calculate 'World' coordinates under the mouse before zoom
                const worldX = (mouseX - currentX) / currentScale;
                const worldY = (mouseY - currentY) / currentScale;

                // 2. Calculate New Scale
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newScale = Math.min(Math.max(currentScale + delta, 0.1), 3);

                // 3. Calculate New Translate to keep World point under Mouse
                const newX = mouseX - (worldX * newScale);
                const newY = mouseY - (worldY * newScale);

                // Batch updates
                setScale(newScale);
                setPosition({ x: newX, y: newY });
            }
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`
                relative w-full h-full overflow-hidden bg-neutral-900 
                ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                select-none
            `}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Pattern for "Premium" feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    // Round the background translation too to avoid jitter
                    transform: `translate(${Math.round(position.x) % 24}px, ${Math.round(position.y) % 24}px)`
                }}
            />

            {/* Floating Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-50 bg-neutral-900/90 backdrop-blur p-2 rounded-lg border border-neutral-800 shadow-xl"
                onMouseDown={e => e.stopPropagation()} // Prevent drag when clicking controls
            >
                <button onClick={handleZoomOut} className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-12 flex items-center justify-center text-xs font-mono text-neutral-500">
                    {Math.round(scale * 100)}%
                </div>
                <button onClick={handleZoomIn} className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-neutral-700 mx-1 self-center" />
                <button onClick={handleAutoFit} className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-blue-400" title="Fit to Screen">
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            {/* Transform Container */}
            <div
                ref={contentRef}
                style={{
                    // Rounding X/Y is CRITICAL for sharp text rendering on non-retina screens during translation.
                    // Subpixel translation often causes blurriness.
                    transform: `translate(${Math.round(position.x)}px, ${Math.round(position.y)}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    // Hints for browser rendering
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'subpixel-antialiased',
                }}
                className={`absolute top-0 left-0 ease-out inline-flex p-20 ${isDragging ? '' : 'transition-transform duration-75'}`}
            >
                <VisualizerContent
                    inputs={inputs}
                    filters={filters}
                    outputs={outputs}
                    padding={padding}
                />
            </div>
        </div>
    );
};

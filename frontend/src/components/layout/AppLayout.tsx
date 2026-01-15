import React from 'react';

interface LayoutProps {
    sidebar: React.ReactNode;
    content: React.ReactNode;
}

export const AppLayout: React.FC<LayoutProps> = ({ sidebar, content }) => {
    return (
        <div className="h-screen overflow-hidden bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
            {/* Sidebar / Config Panel */}
            <aside className="w-full md:w-80 border-r border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen sticky top-0">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        CNN Visualizer
                    </h1>
                    <p className="text-sm text-neutral-400 mt-2">
                        Interactive Convolutional Neural Network Layer Visualization
                    </p>
                </div>
                {sidebar}
            </aside>

            {/* Main Content / Visualizer */}
            <main className="flex-1 p-0 bg-neutral-900 overflow-hidden w-full relative">
                {content}
            </main>
        </div>
    );
};

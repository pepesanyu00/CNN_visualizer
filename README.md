# CNN Visualizer

This project is a web application designed to visually demonstrate the convolution operation in Convolutional Neural Networks (CNNs). It features a **Django** backend and a **React (Vite)** frontend with a premium, responsive UI.

## 🎯 Features

### Backend (Django)
-   Standard Django project structure (`backend/core`).
-   Configured CORS to allow seamless communication with the frontend.

### Frontend (Vite + React)
-   **UI Library**: Shadcn/UI + TailwindCSS for a modern, accessible dark-mode design.
-   **Visualizer Logic**:
    -   **Convolution Math**: Pure TypeScript implementation of 2D convolution algorithms.
    -   **State Management**: Custom hooks with **Local Storage persistence** to save your configurations.
-   **Key Components**:
    -   `ConfigPanel`: Interactive sidebar to adjust Kernels, Channels, and Matrix dimensions.
    -   `VisualizerBoard`: Displays Inputs, Filters, and Outputs in connected columns.
    -   `MatrixGrid`: Animated grid component using Framer Motion for smooth visualizations.

## 🚀 How to Run

You will need two terminal windows to run the application (one for the backend and one for the frontend).

### Prerequisites
-   Python 3.8+
-   Node.js & npm

### Terminal 1: Backend Setup
1.  Source to the virtual environment (in the root folder of the project):
    ```bash
    source venv/bin/activate
    ```
2.  Run the development server:
    ```bash
    python backend/manage.py runserver
    ```

### Terminal 2: Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser to start using the visualizer.

## ℹ️ How to Use

1.  **Configuration**: Use the **ConfigPanel** on the left to set:
    -   **Input Size**: Dimensions of the input matrix.
    -   **Kernels**: Number of filters and their size.
    -   **Stride/Padding**: (If implemented) convolution parameters.
2.  **Visualization**:
    -   The **VisualizerBoard** will update in real-time.
    -   Hover over elements to see interactions or values.
    -   Observe how the kernels slide over the input channels to produce the output feature maps.

## 🛠️ Code Structure

-   `frontend/src/logic/convolution.ts`: Contains the core mathematical logic for convolution.
-   `frontend/src/hooks/useCNN.ts`: Manages the application state and logic.
-   `frontend/src/components/visualizer/`: Contains the specific React components for the visualization (Grid, Board, etc.).

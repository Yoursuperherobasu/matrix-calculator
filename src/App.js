import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import MatrixCalculator from './MatrixCalculator';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <MatrixCalculator />
      </ErrorBoundary>
    </div>
  );
}

export default App;
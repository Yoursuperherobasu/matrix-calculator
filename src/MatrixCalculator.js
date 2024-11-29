import React, { useState } from 'react';
import './MatrixCalculator.css';

function MatrixCalculator() {
  const [state, setState] = useState({
    matrixA: [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ],
    steps: [],
    loading: false,
    error: null,
    showSteps: false
  });

  const MatrixDisplay = ({ matrix, label }) => (
    <div className="flex items-center gap-4 justify-center">
      {label && <span className="text-xl">{label} =</span>}
      <div className="relative">
        <div className="absolute inset-y-0 -left-3 w-2 border-l-2 border-t-2 border-b-2 border-black"></div>
        <div className="absolute inset-y-0 -right-3 w-2 border-r-2 border-t-2 border-b-2 border-black"></div>
        <div className="grid grid-cols-3 gap-4 py-2">
          {matrix.map((row, i) => 
            row.map((cell, j) => (
              <div key={`${i}-${j}`} className="w-12 text-center">
                {cell}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const calculateEigenvalues = () => {
    setState(prev => ({ ...prev, loading: true, error: null, steps: [], showSteps: true }));

    try {
      const steps = [];
      const matrix = state.matrixA.map(row => 
        row.map(cell => {
          const num = parseFloat(cell);
          if (isNaN(num)) throw new Error('Matrix must contain valid numbers');
          return num;
        })
      );

      const [[a, b, c], [d, e, f], [g, h, i]] = matrix;

      // Step 1: Input Matrix
      steps.push({
        title: "Input Matrix",
        content: "The given matrix is:",
        matrix: matrix
      });

      // Step 2: Characteristic Matrix
      steps.push({
        title: "Step 1: Characteristic Matrix (A - λI)",
        content: "Subtracting λI from A gives us:",
        matrices: [
          {
            label: "A",
            matrix: matrix
          },
          {
            label: "λI",
            matrix: [
              ["λ", "0", "0"],
              ["0", "λ", "0"],
              ["0", "0", "λ"]
            ]
          },
          {
            label: "A - λI",
            matrix: [
              [`${a}-λ`, `${b}`, `${c}`],
              [`${d}`, `${e}-λ`, `${f}`],
              [`${g}`, `${h}`, `${i}-λ`]
            ]
          }
        ]
      });

      // Calculate coefficients of characteristic equation
      const p = -(a + e + i);  // trace
      const q = (a*e + e*i + i*a) - (b*d + f*h + c*g);  // sum of principal minors
      const r = -(a*e*i + b*f*g + c*d*h - c*e*g - a*f*h - b*d*i);  // determinant

      // Cubic equation solver using Cardano's formula
      const p1 = q - (p*p)/3;
      const q1 = (2*p*p*p)/27 - (p*q)/3 + r;
      const disc = (q1*q1/4) + (p1*p1*p1/27);

      let eigenvals;
      if (Math.abs(disc) < 1e-10) {  // disc ≈ 0
        const u = -Math.cbrt(q1/2);
        eigenvals = [
          u - p/3,
          u - p/3,
          u - p/3
        ];
      } else if (disc > 0) {
        const u = Math.cbrt(-q1/2 + Math.sqrt(disc));
        const v = Math.cbrt(-q1/2 - Math.sqrt(disc));
        eigenvals = [
          u + v - p/3,
          -(u + v)/2 - p/3 + (u - v)*Math.sqrt(3)/2,
          -(u + v)/2 - p/3 - (u - v)*Math.sqrt(3)/2
        ];
      } else {
        const theta = Math.acos(-q1/(2*Math.sqrt(-p1*p1*p1/27)));
        const r1 = 2*Math.sqrt(-p1/3);
        eigenvals = [
          r1*Math.cos(theta/3) - p/3,
          r1*Math.cos((theta + 2*Math.PI)/3) - p/3,
          r1*Math.cos((theta + 4*Math.PI)/3) - p/3
        ];
      }

      eigenvals = eigenvals.map(val => Number(val.toFixed(4)));

      // Step 3: Characteristic Equation
      steps.push({
        title: "Step 2: Characteristic Equation",
        content: "The characteristic equation is:",
        equation: {
          full: `λ³ + ${p}λ² + ${q}λ + ${r} = 0`,
          factored: `(λ - λ₁)(λ - λ₂)(λ - λ₃) = 0`
        }
      });

      // Step 4: Solution
      steps.push({
        title: "Step 3: Eigenvalues",
        content: "The eigenvalues are:",
        eigenvalues: eigenvals.map((val, idx) => ({
          label: `λ${idx + 1}`,
          value: val
        }))
      });

      setState(prev => ({
        ...prev,
        steps: steps,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const handleMatrixInput = (rowIndex, colIndex, value) => {
    // Validate input
    if (value !== '' && !/^-?\d*\.?\d*$/.test(value)) {
      return; // Invalid input
    }

    const newMatrix = [...state.matrixA];
    newMatrix[rowIndex][colIndex] = value;
    setState(prev => ({
      ...prev,
      matrixA: newMatrix,
      steps: [],
      showSteps: false
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Visual Matrix Calculator</h1>

      {/* Input Matrix */}
      <div className="border p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Input Matrix (3×3)</h2>
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {state.matrixA.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <input
                key={`input-${rowIndex}-${colIndex}`}
                type="text"
                className="matrix-input"
                value={cell}
                onChange={(e) => handleMatrixInput(rowIndex, colIndex, e.target.value)}
                placeholder="0"
              />
            ))
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center mb-6">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={calculateEigenvalues}
          disabled={state.loading}
        >
          {state.loading ? 'Calculating...' : 'Calculate with Details'}
        </button>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
          Error: {state.error}
        </div>
      )}

      {/* Steps Display */}
      {state.showSteps && state.steps.map((step, index) => (
        <div key={index} className="border p-6 rounded-lg shadow-lg mb-6 bg-white">
          <h3 className="text-xl font-semibold mb-3 text-blue-600">
            {step.title}
          </h3>
          <p className="mb-4 text-center">{step.content}</p>

          {step.matrix && (
            <MatrixDisplay matrix={step.matrix} />
          )}

          {step.matrices && (
            <div className="space-y-4">
              {step.matrices.map((m, idx) => (
                <MatrixDisplay key={idx} matrix={m.matrix} label={m.label} />
              ))}
            </div>
          )}

          {step.equation && (
            <div className="space-y-4 text-center text-xl">
              <div>{step.equation.full}</div>
              <div>{step.equation.factored}</div>
            </div>
          )}

          {step.eigenvalues && (
            <div className="space-y-2 text-center text-xl">
              {step.eigenvalues.map((eigen, idx) => (
                <div key={idx}>
                  {eigen.label} = {eigen.value}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Loading Overlay */}
      {state.loading && (
        <div className="loading-overlay">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg">Calculating...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatrixCalculator; 
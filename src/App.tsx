//import React from 'react';
import { usePixelGrid } from './hooks/usePixelGrid';
import { PixelGrid } from './components/PixelGrid';
import { FormulaPanel } from './components/FormulaPanel';
import { SavedShapesList } from './components/SavedShapesList';
import './index.css';

const GRID_WIDTH = 25;
const GRID_HEIGHT = 15;

function App() {
  const {
    pixels,
    togglePixel,
    clearGrid,
    rawMoments,
    centroid,
    centralMoments,
    huMoments,
    basicDescriptors,
    savedShapes,
    saveShape,
    deleteShape,
    comparisonShapeId,
    toggleComparison,
    comparisonShape,
  } = usePixelGrid({ width: GRID_WIDTH, height: GRID_HEIGHT });

  const hasActivePixels = pixels.some(p => p.active);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '450px 1fr 560px',
      gridTemplateRows: 'auto auto auto',
      gap: '16px',
      maxWidth: '1920px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Shape Moment Analysis
          </h1>
          <button
            onClick={clearGrid}
            style={{
              padding: '6px 14px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Clear Grid
          </button>
          <button
            onClick={saveShape}
            disabled={!hasActivePixels}
            style={{
              padding: '6px 14px',
              backgroundColor: hasActivePixels ? '#4a90d9' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: hasActivePixels ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Save Shape
          </button>
        </div>
        <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
          Click on pixels to activate them and see real-time moment calculations
        </p>
      </div>

      {/* TOP LEFT - Raw Moments and Centroid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        /* justifyContent: 'space-between', */
        gap: '16px',
        height: '100%',
      }}>
        <FormulaPanel
          title="Raw Moments"
          titleFormula="m_{pq} = \sum_x \sum_y x^p y^q I(x,y)"
          formulas={[
            { formula: 'm_{00} = \\sum\\sum I(x,y)', value: rawMoments.m00, comparisonValue: comparisonShape?.rawMoments. m00 },
            { formula: 'm_{10} = \\sum\\sum x \\cdot I(x,y)', value: rawMoments.m10, comparisonValue: comparisonShape?.rawMoments.m10 },
            { formula: 'm_{01} = \\sum\\sum y \\cdot I(x,y)', value: rawMoments. m01, comparisonValue: comparisonShape?.rawMoments.m01 },
          ]}
        />

        <FormulaPanel
          title="Centroid"
          titleFormula={"(\\bar{x}, \\bar{y})"}
          formulas={[
            { formula: '\\bar{x} = \\frac{m_{10}}{m_{00}}', value: centroid.x, comparisonValue: comparisonShape?.centroid.x },
            { formula: '\\bar{y} = \\frac{m_{01}}{m_{00}}', value: centroid.y, comparisonValue: comparisonShape?. centroid.y },
          ]}
        />
      </div>

      {/* TOP CENTER - Graph */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <PixelGrid
          pixels={pixels}
          gridWidth={GRID_WIDTH}
          gridHeight={GRID_HEIGHT}
          onPixelClick={togglePixel}
          centroid={centroid}
          comparisonShape={comparisonShape}
        />
      </div>

      {/* TOP RIGHT - Hu's Moments */}
      <div>
        <FormulaPanel
          title="Hu's Moments"
          titleFormula={"\\eta_{pq} = \\frac{\\mu_{pq}}{\\mu_{00}^{1+\\frac{p+q}{2}}}"}
          formulas={[
            { 
              formula: 'H_1 = \\eta_{20} + \\eta_{02}', 
              value: huMoments.h1,
              comparisonValue: comparisonShape?.huMoments.h1,
              precision: 6
            },
            { 
              formula: 'H_2 = (\\eta_{20} - \\eta_{02})^2 + 4\\eta_{11}^2', 
              value: huMoments.h2,
              comparisonValue: comparisonShape?.huMoments.h2,
              precision: 6
            },
            { 
              formula: 'H_3 = (\\eta_{30} - 3\\eta_{12})^2 + (3\\eta_{21} - \\eta_{03})^2', 
              value: huMoments.h3,
              comparisonValue: comparisonShape?.huMoments.h3,
              precision: 6
            },
            { 
              formula: 'H_4 = (\\eta_{30} + \\eta_{12})^2 + (\\eta_{21} + \\eta_{03})^2', 
              value: huMoments.h4,
              comparisonValue: comparisonShape?.huMoments.h4,
              precision: 6
            },
            { 
              formula: [
                'H_5 = (\\eta_{30} - 3\\eta_{12})(\\eta_{30} + \\eta_{12})[(\\eta_{30} + \\eta_{12})^2 - 3(\\eta_{21} + \\eta_{03})^2]',
                '+ (3\\eta_{21} - \\eta_{03})(\\eta_{21} + \\eta_{03})[3(\\eta_{30} + \\eta_{12})^2 - (\\eta_{21} + \\eta_{03})^2]'
              ], 
              value: huMoments. h5,
              comparisonValue: comparisonShape?. huMoments. h5,
              precision: 6
            },
            { 
              formula: [
                'H_6 = (\\eta_{20} - \\eta_{02})[(\\eta_{30} + \\eta_{12})^2 - (\\eta_{21} + \\eta_{03})^2]',
                '+ 4\\eta_{11}(\\eta_{30} + \\eta_{12})(\\eta_{21} + \\eta_{03})'
              ], 
              value: huMoments.h6,
              comparisonValue: comparisonShape?.huMoments.h6,
              precision: 6
            },
            { 
              formula: [
                'H_7 = (3\\eta_{21} - \\eta_{03})(\\eta_{30} + \\eta_{12})[(\\eta_{30} + \\eta_{12})^2 - 3(\\eta_{21} + \\eta_{03})^2]',
                '- (\\eta_{30} - 3\\eta_{12})(\\eta_{21} + \\eta_{03})[3(\\eta_{30} + \\eta_{12})^2 - (\\eta_{21} + \\eta_{03})^2]'
              ], 
              value: huMoments.h7,
              comparisonValue: comparisonShape?.huMoments.h7,
              precision: 6
            },
          ]}
        />
      </div>

      {/* BOTTOM LEFT - Central Moments */}
      <div style={{ paddingRight: '0px' }}>
        <FormulaPanel
          title="Central Moments"
          titleFormula={"\\mu_{pq} = \\sum_x \\sum_y (x-\\bar{x})^p(y-\\bar{y})^q I(x,y)"}
          formulas={[
            { formula: '\\mu_{11} = \\sum\\sum (x-\\bar{x})(y-\\bar{y})I(x,y)', value: centralMoments.mu11, comparisonValue: comparisonShape?.centralMoments.mu11 },
            { formula: '\\mu_{20} = \\sum\\sum (x-\\bar{x})^2 I(x,y)', value: centralMoments.mu20, comparisonValue: comparisonShape?.centralMoments.mu20 },
            { formula: '\\mu_{02} = \\sum\\sum (y-\\bar{y})^2 I(x,y)', value: centralMoments.mu02, comparisonValue: comparisonShape?.centralMoments.mu02 },
            { formula: '\\mu_{21} = \\sum\\sum (x-\\bar{x})^2(y-\\bar{y})I(x,y)', value: centralMoments.mu21, comparisonValue: comparisonShape?.centralMoments.mu21 },
            { formula: '\\mu_{12} = \\sum\\sum (x-\\bar{x})(y-\\bar{y})^2 I(x,y)', value: centralMoments.mu12, comparisonValue: comparisonShape?.centralMoments.mu12 },
            { formula: '\\mu_{30} = \\sum\\sum (x-\\bar{x})^3 I(x,y)', value: centralMoments.mu30, comparisonValue: comparisonShape?.centralMoments.mu30 },
            { formula: '\\mu_{03} = \\sum\\sum (y-\\bar{y})^3 I(x,y)', value: centralMoments.mu03, comparisonValue: comparisonShape?.centralMoments.mu03 },
          ]}
        />
      </div>

      {/* BOTTOM CENTER - Basic Shape Descriptors */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '0 0px' }}>
        <div style={{ width: '100%',/*  maxWidth: '500px' */ }}>
          <FormulaPanel
            title="Basic Shape Descriptors"
            formulas={[
              { 
                formula: '\\theta = \\frac{1}{2} \\arctan\\left(\\frac{2\\mu_{11}}{\\mu_{20} - \\mu_{02}}\\right)', 
                value: basicDescriptors.theta,
                comparisonValue: comparisonShape?.basicDescriptors.theta,
                precision: 4
              },
              { 
                formula: 'e = \\frac{(\\mu_{20} - \\mu_{02})^2 + 4\\mu_{11}^2}{(\\mu_{20} + \\mu_{02})^2}', 
                value: basicDescriptors.eccentricity,
                comparisonValue: comparisonShape?.basicDescriptors.eccentricity,
                precision: 4
              },
              { 
                formula: 'P = \\sum \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}', 
                value: basicDescriptors.perimeter,
                comparisonValue: comparisonShape?.basicDescriptors.perimeter,
                precision: 2
              },
              { 
                formula: 'D_{eq} = 2\\sqrt{\\frac{A}{\\pi}}', 
                value: basicDescriptors.equivalentDiameter,
                comparisonValue: comparisonShape?.basicDescriptors.equivalentDiameter,
                precision: 4
              },
              { 
                formula: 'C = \\frac{4\\pi A}{P^2}', 
                value: basicDescriptors.circularity,
                comparisonValue: comparisonShape?.basicDescriptors.circularity,
                precision: 4
              },
              { 
                formula: 'AR = \\frac{\\text{Width}}{\\text{Height}}', 
                value: basicDescriptors.aspectRatio,
                comparisonValue: comparisonShape?.basicDescriptors.aspectRatio,
                precision: 4
              },
            ]}
          />
        </div>
      </div>

      {/* BOTTOM RIGHT - Saved Shapes List */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{ width: '50%', minWidth: '200px' }}>
          <SavedShapesList
            shapes={savedShapes}
            activeShapeId={comparisonShapeId}
            onToggle={toggleComparison}
            onDelete={deleteShape}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
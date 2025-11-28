import React from 'react';
import type { Pixel, Centroid, SavedShape } from '../types/moments';

interface PixelGridProps {
  pixels: Pixel[];
  gridWidth: number;
  gridHeight: number;
  onPixelClick: (x: number, y: number) => void;
  centroid: Centroid;
  showCentroid?: boolean;
  comparisonShape?: SavedShape | null;
}

const PIXEL_RADIUS = 8;
const PIXEL_SPACING = 20;
const PADDING = 50;

export const PixelGrid: React.FC<PixelGridProps> = ({
  pixels,
  gridWidth,
  gridHeight,
  onPixelClick,
  centroid,
  showCentroid = true,
  comparisonShape = null,
}) => {
  const svgWidth = gridWidth * PIXEL_SPACING + PADDING * 2;
  const svgHeight = gridHeight * PIXEL_SPACING + PADDING * 2;

  const toSvgX = (x: number) => PADDING + x * PIXEL_SPACING + PIXEL_SPACING / 2;
  const toSvgY = (y: number) => svgHeight - PADDING - y * PIXEL_SPACING - PIXEL_SPACING / 2;

  const axisOriginX = PADDING - 15;
  const axisOriginY = svgHeight - PADDING + 15;

  const hasActivePixels = pixels.some(p => p. active);

  // Create a set of comparison pixel coordinates for quick lookup
  const comparisonPixelSet = new Set(
    comparisonShape?.pixels.map(p => `${p.x},${p.y}`) || []
  );

  return (
    <svg 
      width={svgWidth} 
      height={svgHeight}
      style={{ border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fff' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3. 5, 0 7" fill="#888" />
        </marker>
      </defs>
      
      {/* X-axis line */}
      <line
        x1={axisOriginX}
        y1={axisOriginY}
        x2={svgWidth - 20}
        y2={axisOriginY}
        stroke="#888"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />
      
      {/* Y-axis line */}
      <line
        x1={axisOriginX}
        y1={axisOriginY}
        x2={axisOriginX}
        y2={20}
        stroke="#888"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />

      {/* X-axis tick marks and labels */}
      {Array.from({ length: gridWidth }, (_, i) => (
        <g key={`x-tick-${i}`}>
          <line
            x1={toSvgX(i)}
            y1={axisOriginY - 4}
            x2={toSvgX(i)}
            y2={axisOriginY + 4}
            stroke="#888"
            strokeWidth={1}
          />
          {(i % 5 === 0 || i < 3) && (
            <text
              x={toSvgX(i)}
              y={axisOriginY + 18}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {i}
            </text>
          )}
        </g>
      ))}

      {/* Y-axis tick marks and labels */}
      {Array. from({ length: gridHeight }, (_, i) => (
        <g key={`y-tick-${i}`}>
          <line
            x1={axisOriginX - 4}
            y1={toSvgY(i)}
            x2={axisOriginX + 4}
            y2={toSvgY(i)}
            stroke="#888"
            strokeWidth={1}
          />
          {(i % 2 === 0 || i < 3) && (
            <text
              x={axisOriginX - 12}
              y={toSvgY(i) + 4}
              fontSize="10"
              fill="#666"
              textAnchor="end"
            >
              {i}
            </text>
          )}
        </g>
      ))}

      {/* Axis labels */}
      <text
        x={svgWidth - 15}
        y={axisOriginY - 8}
        fontSize="12"
        fill="#666"
        fontStyle="italic"
      >
        x
      </text>
      <text
        x={axisOriginX + 12}
        y={25}
        fontSize="12"
        fill="#666"
        fontStyle="italic"
      >
        y
      </text>

      {/* Comparison shape pixels (red, rendered first/behind) */}
      {comparisonShape?. pixels.map((pixel) => (
        <circle
          key={`comparison-${pixel.x}-${pixel.y}`}
          cx={toSvgX(pixel.x)}
          cy={toSvgY(pixel.y)}
          r={PIXEL_RADIUS}
          fill="#cc0000"
          stroke="#cc0000"
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Main pixel grid */}
      {pixels.map((pixel) => {
        const isComparisonPixel = comparisonPixelSet.has(`${pixel.x},${pixel.y}`);
        // If this pixel is part of comparison and not active, don't render the inactive circle
        // to let the red one show through
        if (isComparisonPixel && !pixel.active) {
          return (
            <circle
              key={`${pixel.x}-${pixel.y}`}
              cx={toSvgX(pixel.x)}
              cy={toSvgY(pixel.y)}
              r={PIXEL_RADIUS}
              fill="transparent"
              stroke="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onPixelClick(pixel.x, pixel.y)}
            />
          );
        }
        
        return (
          <circle
            key={`${pixel.x}-${pixel.y}`}
            cx={toSvgX(pixel.x)}
            cy={toSvgY(pixel.y)}
            r={PIXEL_RADIUS}
            fill={pixel.active ? 'var(--pixel-active)' : 'var(--pixel-inactive)'}
            stroke={pixel.active ?  'var(--pixel-active)' : '#ccc'}
            strokeWidth={1.5}
            style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
            onClick={() => onPixelClick(pixel.x, pixel. y)}
          />
        );
      })}

      {/* Current shape centroid marker */}
      {showCentroid && hasActivePixels && (
        <g style={{ pointerEvents: 'none' }}>
          <circle
            cx={toSvgX(centroid.x)}
            cy={toSvgY(centroid.y)}
            r={5}
            fill="var(--accent-color)"
            stroke="#fff"
            strokeWidth={2}
          />
          <circle
            cx={toSvgX(centroid.x)}
            cy={toSvgY(centroid.y)}
            r={12}
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        </g>
      )}

      {/* Comparison shape centroid marker (red) */}
      {comparisonShape && (
        <g style={{ pointerEvents: 'none' }}>
          <circle
            cx={toSvgX(comparisonShape. centroid.x)}
            cy={toSvgY(comparisonShape. centroid.y)}
            r={5}
            fill="#cc0000"
            stroke="#fff"
            strokeWidth={2}
          />
          <circle
            cx={toSvgX(comparisonShape. centroid.x)}
            cy={toSvgY(comparisonShape. centroid.y)}
            r={12}
            fill="none"
            stroke="#cc0000"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        </g>
      )}
    </svg>
  );
};
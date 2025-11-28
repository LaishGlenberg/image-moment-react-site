import React, { useState, useCallback, useRef } from 'react';
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

// Base values at zoom level 1
const BASE_PIXEL_RADIUS = 8;
const BASE_PIXEL_SPACING = 20;
const PADDING = 50;
const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.0;

export const PixelGrid: React.FC<PixelGridProps> = ({
  pixels,
  gridWidth,
  gridHeight,
  onPixelClick,
  centroid,
  showCentroid = true,
  comparisonShape = null,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate scaled values based on zoom
  // When zoomed out (zoomLevel > 1), we show more grid but smaller pixels
  // When zoomed in (zoomLevel < 1), we show less grid but larger pixels
  const pixelSpacing = BASE_PIXEL_SPACING / zoomLevel;
  const pixelRadius = BASE_PIXEL_RADIUS / zoomLevel;

  // Fixed SVG dimensions - grid stays same size on screen
  const svgWidth = gridWidth * BASE_PIXEL_SPACING + PADDING * 2;
  const svgHeight = gridHeight * BASE_PIXEL_SPACING + PADDING * 2;

  // How many logical units we can display at current zoom
  const visibleWidth = Math.floor(gridWidth * zoomLevel);
  const visibleHeight = Math.floor(gridHeight * zoomLevel);

  const toSvgX = (x: number) => PADDING + x * pixelSpacing + pixelSpacing / 2;
  const toSvgY = (y: number) => svgHeight - PADDING - y * pixelSpacing - pixelSpacing / 2;

  const axisOriginX = PADDING - 15;
  const axisOriginY = svgHeight - PADDING + 15;

  const hasActivePixels = pixels.some(p => p.active);

  // Create a set of comparison pixel coordinates for quick lookup
  const comparisonPixelSet = new Set(
    comparisonShape?.pixels.map(p => `${p.x},${p.y}`) || []
  );

  // Filter pixels to only show those within visible range
  const visiblePixels = pixels.filter(p => p.x < visibleWidth && p.y < visibleHeight);

  // Paintbrush state
  const [isPainting, setIsPainting] = useState(false);
  const toggledDuringStroke = useRef<Set<string>>(new Set());

  const handlePixelToggle = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    if (!toggledDuringStroke.current.has(key)) {
      toggledDuringStroke.current.add(key);
      onPixelClick(x, y);
    }
  }, [onPixelClick]);

  const handleMouseDown = useCallback((x: number, y: number) => {
    setIsPainting(true);
    toggledDuringStroke.current = new Set();
    handlePixelToggle(x, y);
  }, [handlePixelToggle]);

  const handleMouseEnter = useCallback((x: number, y: number) => {
    if (isPainting) {
      handlePixelToggle(x, y);
    }
  }, [isPainting, handlePixelToggle]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    toggledDuringStroke.current = new Set();
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPainting(false);
    toggledDuringStroke.current = new Set();
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Calculate tick interval based on zoom level
  const getTickInterval = (zoom: number) => {
    if (zoom >= 1.8) return 10;
    if (zoom >= 1.4) return 5;
    if (zoom >= 1.0) return 5;
    return 2;
  };

  const tickInterval = getTickInterval(zoomLevel);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '70px',
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        zIndex: 10,
      }}>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel <= MIN_ZOOM}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: zoomLevel <= MIN_ZOOM ? '#f0f0f0' : '#fff',
            cursor: zoomLevel <= MIN_ZOOM ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: zoomLevel <= MIN_ZOOM ? '#aaa' : '#333',
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleResetZoom}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
          }}
          title="Reset Zoom"
        >
          1:1
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel >= MAX_ZOOM}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: zoomLevel >= MAX_ZOOM ? '#f0f0f0' : '#fff',
            cursor: zoomLevel >= MAX_ZOOM ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: zoomLevel >= MAX_ZOOM ? '#aaa' : '#333',
          }}
          title="Zoom Out"
        >
          −
        </button>
      </div>

      <svg 
        width={svgWidth} 
        height={svgHeight}
        style={{ 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px', 
          backgroundColor: '#fff',
          userSelect: 'none',
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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
            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
          </marker>
          {/* Clip path to hide content outside the grid area */}
          <clipPath id="gridClip">
            <rect 
              x={PADDING - pixelRadius} 
              y={PADDING - pixelRadius} 
              width={svgWidth - PADDING * 2 + pixelRadius * 2} 
              height={svgHeight - PADDING * 2 + pixelRadius * 2} 
            />
          </clipPath>
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
        {Array.from({ length: visibleWidth }, (_, i) => (
          <g key={`x-tick-${i}`}>
            <line
              x1={toSvgX(i)}
              y1={axisOriginY - 4}
              x2={toSvgX(i)}
              y2={axisOriginY + 4}
              stroke="#888"
              strokeWidth={1}
            />
            {(i % tickInterval === 0 || i < 3) && (
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
        {Array.from({ length: visibleHeight }, (_, i) => (
          <g key={`y-tick-${i}`}>
            <line
              x1={axisOriginX - 4}
              y1={toSvgY(i)}
              x2={axisOriginX + 4}
              y2={toSvgY(i)}
              stroke="#888"
              strokeWidth={1}
            />
            {(i % tickInterval === 0 || i < 3) && (
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

        {/* Grid content with clipping */}
        <g clipPath="url(#gridClip)">
          {/* Comparison shape pixels (red, rendered first/behind) */}
          {comparisonShape?.pixels
            .filter(p => p.x < visibleWidth && p.y < visibleHeight)
            .map((pixel) => (
              <circle
                key={`comparison-${pixel.x}-${pixel.y}`}
                cx={toSvgX(pixel.x)}
                cy={toSvgY(pixel.y)}
                r={pixelRadius}
                fill="#cc0000"
                stroke="#cc0000"
                strokeWidth={1.5 / zoomLevel}
                style={{ pointerEvents: 'none' }}
              />
            ))}

          {/* Main pixel grid */}
          {visiblePixels.map((pixel) => {
            const isComparisonPixel = comparisonPixelSet.has(`${pixel.x},${pixel.y}`);
            // If this pixel is part of comparison and not active, don't render the inactive circle
            // to let the red one show through
            if (isComparisonPixel && !pixel.active) {
              return (
                <circle
                  key={`${pixel.x}-${pixel.y}`}
                  cx={toSvgX(pixel.x)}
                  cy={toSvgY(pixel.y)}
                  r={pixelRadius}
                  fill="transparent"
                  stroke="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(pixel.x, pixel.y);
                  }}
                  onMouseEnter={() => handleMouseEnter(pixel.x, pixel.y)}
                />
              );
            }
            
            return (
              <circle
                key={`${pixel.x}-${pixel.y}`}
                cx={toSvgX(pixel.x)}
                cy={toSvgY(pixel.y)}
                r={pixelRadius}
                fill={pixel.active ? 'var(--pixel-active)' : 'var(--pixel-inactive)'}
                stroke={pixel.active ? 'var(--pixel-active)' : '#ccc'}
                strokeWidth={1.5 / zoomLevel}
                style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMouseDown(pixel.x, pixel.y);
                }}
                onMouseEnter={() => handleMouseEnter(pixel.x, pixel.y)}
              />
            );
          })}

          {/* Current shape centroid marker */}
          {showCentroid && hasActivePixels && centroid.x < visibleWidth && centroid.y < visibleHeight && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={toSvgX(centroid.x)}
                cy={toSvgY(centroid.y)}
                r={5 / zoomLevel}
                fill="var(--accent-color)"
                stroke="#fff"
                strokeWidth={2 / zoomLevel}
              />
              <circle
                cx={toSvgX(centroid.x)}
                cy={toSvgY(centroid.y)}
                r={12 / zoomLevel}
                fill="none"
                stroke="var(--accent-color)"
                strokeWidth={1.5 / zoomLevel}
                strokeDasharray={`${4 / zoomLevel} ${2 / zoomLevel}`}
              />
            </g>
          )}

          {/* Comparison shape centroid marker (red) */}
          {comparisonShape && comparisonShape.centroid.x < visibleWidth && comparisonShape.centroid.y < visibleHeight && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={toSvgX(comparisonShape.centroid.x)}
                cy={toSvgY(comparisonShape.centroid.y)}
                r={5 / zoomLevel}
                fill="#cc0000"
                stroke="#fff"
                strokeWidth={2 / zoomLevel}
              />
              <circle
                cx={toSvgX(comparisonShape.centroid.x)}
                cy={toSvgY(comparisonShape.centroid.y)}
                r={12 / zoomLevel}
                fill="none"
                stroke="#cc0000"
                strokeWidth={1.5 / zoomLevel}
                strokeDasharray={`${4 / zoomLevel} ${2 / zoomLevel}`}
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
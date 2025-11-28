import { useState, useCallback, useMemo } from 'react';
import type { Pixel, RawMoments, Centroid, CentralMoments, NormalizedMoments, BasicShapeDescriptors, HuMoments, SavedShape } from '../types/moments';
import { 
  calculateRawMoments, 
  calculateCentroid, 
  calculateCentralMoments,
  calculateNormalizedMoments,
  calculateHuMoments,
  calculateBasicShapeDescriptors 
} from '../utils/momentCalculations';

interface UsePixelGridProps {
  width: number;
  height: number;
}

export function usePixelGrid({ width, height }: UsePixelGridProps) {
  const [pixels, setPixels] = useState<Pixel[]>(() => {
    const grid: Pixel[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.push({ x, y, active: false });
      }
    }
    return grid;
  });

  const [savedShapes, setSavedShapes] = useState<SavedShape[]>([]);
  const [comparisonShapeId, setComparisonShapeId] = useState<string | null>(null);

  const togglePixel = useCallback((x: number, y: number) => {
    setPixels(prev => 
      prev.map(p => 
        p.x === x && p.y === y 
          ? { ... p, active: ! p.active }
          : p
      )
    );
  }, []);

  const clearGrid = useCallback(() => {
    setPixels(prev => prev.map(p => ({ ...p, active: false })));
  }, []);

  const rawMoments: RawMoments = useMemo(
    () => calculateRawMoments(pixels),
    [pixels]
  );

  const centroid: Centroid = useMemo(
    () => calculateCentroid(rawMoments),
    [rawMoments]
  );

  const centralMoments: CentralMoments = useMemo(
    () => calculateCentralMoments(pixels, centroid),
    [pixels, centroid]
  );

  const normalizedMoments: NormalizedMoments = useMemo(
    () => calculateNormalizedMoments(centralMoments, rawMoments),
    [centralMoments, rawMoments]
  );

  const huMoments: HuMoments = useMemo(
    () => calculateHuMoments(normalizedMoments),
    [normalizedMoments]
  );

  const basicDescriptors: BasicShapeDescriptors = useMemo(
    () => calculateBasicShapeDescriptors(pixels, rawMoments, centralMoments),
    [pixels, rawMoments, centralMoments]
  );

  const saveShape = useCallback(() => {
    const activePixels = pixels. filter(p => p.active);
    if (activePixels. length === 0) return;

    const newShape: SavedShape = {
      id: `shape-${Date.now()}`,
      name: `S${savedShapes.length + 1}`,
      pixels: activePixels. map(p => ({ x: p.x, y: p. y })),
      rawMoments,
      centroid,
      centralMoments,
      normalizedMoments,
      huMoments,
      basicDescriptors,
    };

    setSavedShapes(prev => [...prev, newShape]);
  }, [pixels, rawMoments, centroid, centralMoments, normalizedMoments, huMoments, basicDescriptors, savedShapes. length]);

  const deleteShape = useCallback((id: string) => {
    setSavedShapes(prev => prev.filter(s => s.id !== id));
    if (comparisonShapeId === id) {
      setComparisonShapeId(null);
    }
  }, [comparisonShapeId]);

  const toggleComparison = useCallback((id: string) => {
    setComparisonShapeId(prev => prev === id ? null : id);
  }, []);

  const comparisonShape = useMemo(
    () => savedShapes.find(s => s.id === comparisonShapeId) || null,
    [savedShapes, comparisonShapeId]
  );

  return {
    pixels,
    togglePixel,
    clearGrid,
    rawMoments,
    centroid,
    centralMoments,
    normalizedMoments,
    huMoments,
    basicDescriptors,
    gridWidth: width,
    gridHeight: height,
    // Shape comparison
    savedShapes,
    saveShape,
    deleteShape,
    comparisonShapeId,
    toggleComparison,
    comparisonShape,
  };
}
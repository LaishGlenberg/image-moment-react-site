import type { Pixel, RawMoments, Centroid, CentralMoments, NormalizedMoments, BasicShapeDescriptors, HuMoments } from '../types/moments';

/**
 * Calculate raw moments from pixel data
 */
export function calculateRawMoments(pixels: Pixel[]): RawMoments {
  const activePixels = pixels.filter(p => p.active);
  
  const m00 = activePixels.length;
  const m10 = activePixels.reduce((sum, p) => sum + p.x, 0);
  const m01 = activePixels.reduce((sum, p) => sum + p.y, 0);
  
  return { m00, m10, m01 };
}

/**
 * Calculate centroid from raw moments
 */
export function calculateCentroid(moments: RawMoments): Centroid {
  if (moments.m00 === 0) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: moments.m10 / moments.m00,
    y: moments.m01 / moments.m00
  };
}

/**
 * Calculate central moments
 */
export function calculateCentralMoments(pixels: Pixel[], centroid: Centroid): CentralMoments {
  const activePixels = pixels.filter(p => p.active);
  
  if (activePixels.length === 0) {
    return { mu11: 0, mu20: 0, mu02: 0, mu21: 0, mu12: 0, mu30: 0, mu03: 0 };
  }

  const { x: xBar, y: yBar } = centroid;

  let mu11 = 0, mu20 = 0, mu02 = 0;
  let mu21 = 0, mu12 = 0, mu30 = 0, mu03 = 0;

  for (const p of activePixels) {
    const dx = p.x - xBar;
    const dy = p.y - yBar;
    
    mu11 += dx * dy;
    mu20 += dx * dx;
    mu02 += dy * dy;
    
    mu21 += dx * dx * dy;
    mu12 += dx * dy * dy;
    mu30 += dx * dx * dx;
    mu03 += dy * dy * dy;
  }

  return { mu11, mu20, mu02, mu21, mu12, mu30, mu03 };
}

/**
 * Calculate normalized central moments
 * η_pq = μ_pq / μ_00^(1 + (p+q)/2)
 */
export function calculateNormalizedMoments(
  centralMoments: CentralMoments,
  rawMoments: RawMoments
): NormalizedMoments {
  const mu00 = rawMoments.m00;
  
  if (mu00 === 0) {
    return { eta11: 0, eta20: 0, eta02: 0, eta21: 0, eta12: 0, eta30: 0, eta03: 0 };
  }

  // For p+q = 2: exponent = 1 + 2/2 = 2
  // For p+q = 3: exponent = 1 + 3/2 = 2.5
  const norm2 = Math.pow(mu00, 2);      // for second order moments
  const norm3 = Math.pow(mu00, 2.5);    // for third order moments

  return {
    eta11: centralMoments.mu11 / norm2,
    eta20: centralMoments.mu20 / norm2,
    eta02: centralMoments.mu02 / norm2,
    eta21: centralMoments.mu21 / norm3,
    eta12: centralMoments.mu12 / norm3,
    eta30: centralMoments.mu30 / norm3,
    eta03: centralMoments.mu03 / norm3,
  };
}

/**
 * Calculate Hu's 7 invariant moments
 */
export function calculateHuMoments(eta: NormalizedMoments): HuMoments {
  const { eta20, eta02, eta11, eta30, eta12, eta21, eta03 } = eta;

  // H1 = η20 + η02
  const h1 = eta20 + eta02;

  // H2 = (η20 - η02)² + 4η11²
  const h2 = Math.pow(eta20 - eta02, 2) + 4 * Math.pow(eta11, 2);

  // H3 = (η30 - 3η12)² + (3η21 - η03)²
  const h3 = Math.pow(eta30 - 3 * eta12, 2) + Math.pow(3 * eta21 - eta03, 2);

  // H4 = (η30 + η12)² + (η21 + η03)²
  const h4 = Math.pow(eta30 + eta12, 2) + Math.pow(eta21 + eta03, 2);

  // Helper terms for H5, H6, H7
  const n30_p_n12 = eta30 + eta12;
  const n21_p_n03 = eta21 + eta03;
  const n30_m_3n12 = eta30 - 3 * eta12;
  const n3n21_m_n03 = 3 * eta21 - eta03;

  // H5 = (η30 - 3η12)(η30 + η12)[(η30 + η12)² - 3(η21 + η03)²]
  //    + (3η21 - η03)(η21 + η03)[3(η30 + η12)² - (η21 + η03)²]
  const h5 = n30_m_3n12 * n30_p_n12 * (Math.pow(n30_p_n12, 2) - 3 * Math.pow(n21_p_n03, 2))
           + n3n21_m_n03 * n21_p_n03 * (3 * Math.pow(n30_p_n12, 2) - Math.pow(n21_p_n03, 2));

  // H6 = (η20 - η02)[(η30 + η12)² - (η21 + η03)²]
  //    + 4η11(η30 + η12)(η21 + η03)
  const h6 = (eta20 - eta02) * (Math.pow(n30_p_n12, 2) - Math.pow(n21_p_n03, 2))
           + 4 * eta11 * n30_p_n12 * n21_p_n03;

  // H7 = (3η21 - η03)(η30 + η12)[(η30 + η12)² - 3(η21 + η03)²]
  //    - (η30 - 3η12)(η21 + η03)[3(η30 + η12)² - (η21 + η03)²]
  const h7 = n3n21_m_n03 * n30_p_n12 * (Math.pow(n30_p_n12, 2) - 3 * Math.pow(n21_p_n03, 2))
           - n30_m_3n12 * n21_p_n03 * (3 * Math. pow(n30_p_n12, 2) - Math. pow(n21_p_n03, 2));

  return { h1, h2, h3, h4, h5, h6, h7 };
}

/**
 * Calculate basic shape descriptors
 */
export function calculateBasicShapeDescriptors(
  pixels: Pixel[],
  rawMoments: RawMoments,
  centralMoments: CentralMoments
): BasicShapeDescriptors {
  const activePixels = pixels.filter(p => p.active);
  
  if (activePixels.length === 0) {
    return {
      theta: 0,
      eccentricity: 0,
      perimeter: 0,
      equivalentDiameter: 0,
      circularity: 0,
      aspectRatio: 0
    };
  }

  const { mu11, mu20, mu02 } = centralMoments;
  const area = rawMoments.m00;

  const denominator = mu20 - mu02;
  const theta = denominator === 0 && mu11 === 0 
    ? 0 
    : 0.5 * Math. atan2(2 * mu11, denominator);

  const numerator = (mu20 - mu02) ** 2 + 4 * mu11 ** 2;
  const denominatorEcc = (mu20 + mu02) ** 2;
  const eccentricity = denominatorEcc === 0 ?  0 : numerator / denominatorEcc;

  const perimeter = calculatePerimeter(activePixels);

  const equivalentDiameter = 2 * Math.sqrt(area / Math.PI);

  const circularity = perimeter === 0 ?  0 : (4 * Math.PI * area) / (perimeter ** 2);

  const xs = activePixels.map(p => p.x);
  const ys = activePixels.map(p => p.y);
  const width = Math.max(...xs) - Math.min(...xs) + 1;
  const height = Math.max(...ys) - Math.min(...ys) + 1;
  const aspectRatio = height === 0 ? 0 : width / height;

  return {
    theta,
    eccentricity,
    perimeter,
    equivalentDiameter,
    circularity,
    aspectRatio
  };
}

/**
 * Calculate perimeter using boundary pixel edges
 */
function calculatePerimeter(activePixels: Pixel[]): number {
  if (activePixels.length === 0) return 0;
  if (activePixels.length === 1) return 4;

  const activeSet = new Set(activePixels. map(p => `${p.x},${p. y}`));
  
  let perimeter = 0;
  
  for (const pixel of activePixels) {
    const neighbors = [
      { x: pixel.x + 1, y: pixel.y },
      { x: pixel. x - 1, y: pixel.y },
      { x: pixel.x, y: pixel. y + 1 },
      { x: pixel.x, y: pixel.y - 1 },
    ];
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!activeSet.has(key)) {
        perimeter += 1;
      }
    }
  }
  
  return perimeter;
}
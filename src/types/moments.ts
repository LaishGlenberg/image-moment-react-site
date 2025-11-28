export interface Pixel {
  x: number;
  y: number;
  active: boolean;
}

export interface RawMoments {
  m00: number;
  m10: number;
  m01: number;
}

export interface Centroid {
  x: number;
  y: number;
}

export interface CentralMoments {
  mu11: number;
  mu20: number;
  mu02: number;
  mu21: number;
  mu12: number;
  mu30: number;
  mu03: number;
}

export interface NormalizedMoments {
  eta11: number;
  eta20: number;
  eta02: number;
  eta21: number;
  eta12: number;
  eta30: number;
  eta03: number;
}

export interface BasicShapeDescriptors {
  theta: number;
  eccentricity: number;
  perimeter: number;
  equivalentDiameter: number;
  circularity: number;
  aspectRatio: number;
}

export interface HuMoments {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  h7: number;
}
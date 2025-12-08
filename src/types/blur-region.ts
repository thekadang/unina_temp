export interface BlurRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageId: string;
}

export interface BlurData {
  [pageId: string]: BlurRegion[];
}

// API Types
export interface ImageMetadata {
  name: string;
  url: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}
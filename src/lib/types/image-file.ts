export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  uploadedUrl?: string;
}

export interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  isHighQuality: boolean;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS'
}


export interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  isHighQuality: boolean;
  timestamp: number;
}

export interface AnalysisResult {
  sentiment: string;
  caption: string;
  tags: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS'
}

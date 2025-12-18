export interface GeneratedPostContent {
  title: string;
  content: string;
  tags: string[];
  imagePrompt: string;
}

export interface PostResult {
  id: string;
  originalIdea: string;
  data: GeneratedPostContent | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  timestamp: number;
}

export enum LoadingStage {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
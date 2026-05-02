
export enum SegmentType {
  SPEECH = 'SPEECH',
  SONG = 'SONG',
  JINGLE = 'JINGLE'
}

export interface RadioSegment {
  type: SegmentType;
  title?: string;
  artist?: string;
  duration?: number;
}

export enum AppState {
  SETUP = 'SETUP',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export interface BroadcastShow {
  time: string;
  show: string;
  dj: string;
  days: number[];
}

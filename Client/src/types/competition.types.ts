export interface Area {
  id: number;
  name: string;
  code?: string;
  flag?: string;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday?: number;
  winner?: {
    id: number;
    name: string;
    crest: string;
  };
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string;
  area: Area;
  currentSeason: Season;
  type: 'LEAGUE' | 'CUP';
}

export type CompetitionFormat =
  | 'league'
  | 'knockout'
  | 'group_stage'
  | 'group_knockout'
  | 'unknown';

export class Score {
  winner?: MatchWinner | null;
  fullTime: {
    home: number;
    away: number;
  };
  halfTime: {
    home: number;
    away: number;
  };
}

export enum MatchWinner {
  'DRAW',
  'AWAY_TEAM',
  'HOME_TEAM',
}

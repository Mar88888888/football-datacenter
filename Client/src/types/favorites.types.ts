export interface FavoriteTeam {
  id: number;
  name: string;
  crest: string;
}

export interface FavoriteCompetition {
  id: number;
  name: string;
  emblem: string;
}

export interface FavouritesContextValue {
  favTeams: FavoriteTeam[];
  favComps: FavoriteCompetition[];
  loading: boolean;
  addFavTeam: (team: FavoriteTeam) => Promise<void>;
  removeFavTeam: (teamId: number) => Promise<void>;
  isFavTeam: (teamId: number | string) => boolean;
  addFavComp: (comp: FavoriteCompetition) => Promise<void>;
  removeFavComp: (compId: number) => Promise<void>;
  isFavComp: (compId: number | string) => boolean;
}

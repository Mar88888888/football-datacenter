import React, { createContext, useState, useEffect, useMemo, useCallback, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type { FavoriteTeam, FavoriteCompetition, FavouritesContextValue } from '../types';

const defaultContextValue: FavouritesContextValue = {
  favTeams: [],
  favComps: [],
  loading: false,
  addFavTeam: async () => {},
  removeFavTeam: async () => {},
  isFavTeam: () => false,
  addFavComp: async () => {},
  removeFavComp: async () => {},
  isFavComp: () => false,
};

export const FavouritesContext = createContext<FavouritesContextValue>(defaultContextValue);

interface FavouritesProviderProps {
  children: ReactNode;
}

export const FavouritesProvider: React.FC<FavouritesProviderProps> = ({ children }) => {
  const { user, authToken } = useContext(AuthContext);

  const [favTeams, setFavTeams] = useState<FavoriteTeam[]>([]);
  const [favComps, setFavComps] = useState<FavoriteCompetition[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorites when user is authenticated
  useEffect(() => {
    const abortController = new AbortController();

    const fetchFavourites = async (): Promise<void> => {
      if (!user || !authToken) {
        setFavTeams([]);
        setFavComps([]);
        return;
      }

      setLoading(true);

      try {
        const [teamsRes, compsRes] = await Promise.all([
          api.get<FavoriteTeam[]>(API_ENDPOINTS.USER_FAV_TEAMS, { signal: abortController.signal }),
          api.get<FavoriteCompetition[]>(API_ENDPOINTS.USER_FAV_COMPS, { signal: abortController.signal }),
        ]);

        setFavTeams(teamsRes.data || []);
        setFavComps(compsRes.data || []);
      } catch (error) {
        if ((error as Error).name === 'AbortError' || (error as Error).name === 'CanceledError') {
          return;
        }
        console.error('Failed to fetch favourites:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFavourites();

    return () => {
      abortController.abort();
    };
  }, [user, authToken]);

  // Team favorites
  const addFavTeam = useCallback(async (team: FavoriteTeam): Promise<void> => {
    // Optimistic update
    setFavTeams((prev) => [...prev, team]);

    try {
      await api.post(API_ENDPOINTS.USER_FAV_TEAM(team.id), {});
    } catch (error) {
      // Rollback on error
      setFavTeams((prev) => prev.filter((t) => t.id !== team.id));
      throw error;
    }
  }, []);

  const removeFavTeam = useCallback(async (teamId: number): Promise<void> => {
    // Store for rollback
    const removedTeam = favTeams.find((t) => t.id === teamId);

    // Optimistic update
    setFavTeams((prev) => prev.filter((t) => t.id !== teamId));

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_TEAM(teamId));
    } catch (error) {
      // Rollback on error
      if (removedTeam) {
        setFavTeams((prev) => [...prev, removedTeam]);
      }
      throw error;
    }
  }, [favTeams]);

  const isFavTeam = useCallback(
    (teamId: number | string): boolean => favTeams.some((t) => t.id === +teamId),
    [favTeams]
  );

  // Competition favorites
  const addFavComp = useCallback(async (comp: FavoriteCompetition): Promise<void> => {
    // Optimistic update
    setFavComps((prev) => [...prev, comp]);

    try {
      await api.post(API_ENDPOINTS.USER_FAV_COMP(comp.id), {});
    } catch (error) {
      // Rollback on error
      setFavComps((prev) => prev.filter((c) => c.id !== comp.id));
      throw error;
    }
  }, []);

  const removeFavComp = useCallback(async (compId: number): Promise<void> => {
    // Store for rollback
    const removedComp = favComps.find((c) => c.id === compId);

    // Optimistic update
    setFavComps((prev) => prev.filter((c) => c.id !== compId));

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_COMP(compId));
    } catch (error) {
      // Rollback on error
      if (removedComp) {
        setFavComps((prev) => [...prev, removedComp]);
      }
      throw error;
    }
  }, [favComps]);

  const isFavComp = useCallback(
    (compId: number | string): boolean => favComps.some((c) => c.id === +compId),
    [favComps]
  );

  const contextValue = useMemo<FavouritesContextValue>(
    () => ({
      favTeams,
      favComps,
      loading,
      addFavTeam,
      removeFavTeam,
      isFavTeam,
      addFavComp,
      removeFavComp,
      isFavComp,
    }),
    [favTeams, favComps, loading, addFavTeam, removeFavTeam, isFavTeam, addFavComp, removeFavComp, isFavComp]
  );

  return (
    <FavouritesContext.Provider value={contextValue}>
      {children}
    </FavouritesContext.Provider>
  );
};

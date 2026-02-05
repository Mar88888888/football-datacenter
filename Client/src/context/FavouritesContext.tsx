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
        // Use allSettled to handle partial failures
        const [teamsResult, compsResult] = await Promise.allSettled([
          api.get<FavoriteTeam[]>(API_ENDPOINTS.USER_FAV_TEAMS, { signal: abortController.signal }),
          api.get<FavoriteCompetition[]>(API_ENDPOINTS.USER_FAV_COMPS, { signal: abortController.signal }),
        ]);

        if (teamsResult.status === 'fulfilled') {
          setFavTeams(teamsResult.value.data || []);
        } else if (teamsResult.reason?.name !== 'AbortError' && teamsResult.reason?.name !== 'CanceledError') {
          console.error('Failed to fetch favourite teams:', teamsResult.reason);
        }

        if (compsResult.status === 'fulfilled') {
          setFavComps(compsResult.value.data || []);
        } else if (compsResult.reason?.name !== 'AbortError' && compsResult.reason?.name !== 'CanceledError') {
          console.error('Failed to fetch favourite competitions:', compsResult.reason);
        }
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
    // Capture removed item inside functional update to avoid stale closure
    let removedTeam: FavoriteTeam | undefined;
    setFavTeams((prev) => {
      removedTeam = prev.find((t) => t.id === teamId);
      return prev.filter((t) => t.id !== teamId);
    });

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_TEAM(teamId));
    } catch (error) {
      // Rollback on error
      if (removedTeam) {
        setFavTeams((prev) => [...prev, removedTeam!]);
      }
      throw error;
    }
  }, []);

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
    // Capture removed item inside functional update to avoid stale closure
    let removedComp: FavoriteCompetition | undefined;
    setFavComps((prev) => {
      removedComp = prev.find((c) => c.id === compId);
      return prev.filter((c) => c.id !== compId);
    });

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_COMP(compId));
    } catch (error) {
      // Rollback on error
      if (removedComp) {
        setFavComps((prev) => [...prev, removedComp!]);
      }
      throw error;
    }
  }, []);

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

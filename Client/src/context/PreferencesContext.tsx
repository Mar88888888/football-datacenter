import React, { createContext, useState, useEffect, useMemo, useCallback, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type { FavoriteTeam, FavoriteCompetition, HiddenCompetition, PreferencesContextValue } from '../types';

const defaultContextValue: PreferencesContextValue = {
  // Favorites
  favTeams: [],
  favComps: [],
  loading: false,
  addFavTeam: async () => {},
  removeFavTeam: async () => {},
  isFavTeam: () => false,
  addFavComp: async () => {},
  removeFavComp: async () => {},
  isFavComp: () => false,
  // Hidden
  hiddenComps: [],
  hideComp: async () => {},
  showComp: async () => {},
  isHiddenComp: () => false,
};

export const PreferencesContext = createContext<PreferencesContextValue>(defaultContextValue);

// Legacy alias for backwards compatibility
export const FavouritesContext = PreferencesContext;

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const { user, authToken } = useContext(AuthContext);

  const [favTeams, setFavTeams] = useState<FavoriteTeam[]>([]);
  const [favComps, setFavComps] = useState<FavoriteCompetition[]>([]);
  const [hiddenComps, setHiddenComps] = useState<HiddenCompetition[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all preferences when user is authenticated
  useEffect(() => {
    const abortController = new AbortController();

    const fetchPreferences = async (): Promise<void> => {
      if (!user || !authToken) {
        setFavTeams([]);
        setFavComps([]);
        setHiddenComps([]);
        return;
      }

      setLoading(true);

      try {
        const [teamsResult, compsResult, hiddenResult] = await Promise.allSettled([
          api.get<FavoriteTeam[]>(API_ENDPOINTS.USER_FAV_TEAMS, { signal: abortController.signal }),
          api.get<FavoriteCompetition[]>(API_ENDPOINTS.USER_FAV_COMPS, { signal: abortController.signal }),
          api.get<HiddenCompetition[]>(API_ENDPOINTS.USER_HIDDEN_COMPS, { signal: abortController.signal }),
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

        if (hiddenResult.status === 'fulfilled') {
          setHiddenComps(hiddenResult.value.data || []);
        } else if (hiddenResult.reason?.name !== 'AbortError' && hiddenResult.reason?.name !== 'CanceledError') {
          console.error('Failed to fetch hidden competitions:', hiddenResult.reason);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError' || (error as Error).name === 'CanceledError') {
          return;
        }
        console.error('Failed to fetch preferences:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPreferences();

    return () => {
      abortController.abort();
    };
  }, [user, authToken]);

  // Team favorites
  const addFavTeam = useCallback(async (team: FavoriteTeam): Promise<void> => {
    setFavTeams((prev) => [...prev, team]);

    try {
      await api.post(API_ENDPOINTS.USER_FAV_TEAM(team.id), {});
    } catch (error) {
      setFavTeams((prev) => prev.filter((t) => t.id !== team.id));
      throw error;
    }
  }, []);

  const removeFavTeam = useCallback(async (teamId: number): Promise<void> => {
    let removedTeam: FavoriteTeam | undefined;
    setFavTeams((prev) => {
      removedTeam = prev.find((t) => t.id === teamId);
      return prev.filter((t) => t.id !== teamId);
    });

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_TEAM(teamId));
    } catch (error) {
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
    setFavComps((prev) => [...prev, comp]);

    try {
      await api.post(API_ENDPOINTS.USER_FAV_COMP(comp.id), {});
    } catch (error) {
      setFavComps((prev) => prev.filter((c) => c.id !== comp.id));
      throw error;
    }
  }, []);

  const removeFavComp = useCallback(async (compId: number): Promise<void> => {
    let removedComp: FavoriteCompetition | undefined;
    setFavComps((prev) => {
      removedComp = prev.find((c) => c.id === compId);
      return prev.filter((c) => c.id !== compId);
    });

    try {
      await api.delete(API_ENDPOINTS.USER_FAV_COMP(compId));
    } catch (error) {
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

  // Hidden competitions
  const hideComp = useCallback(async (comp: HiddenCompetition): Promise<void> => {
    setHiddenComps((prev) => [...prev, comp]);

    try {
      await api.post(API_ENDPOINTS.USER_HIDDEN_COMP(comp.id), {});
    } catch (error) {
      setHiddenComps((prev) => prev.filter((c) => c.id !== comp.id));
      throw error;
    }
  }, []);

  const showComp = useCallback(async (compId: number): Promise<void> => {
    let removedComp: HiddenCompetition | undefined;
    setHiddenComps((prev) => {
      removedComp = prev.find((c) => c.id === compId);
      return prev.filter((c) => c.id !== compId);
    });

    try {
      await api.delete(API_ENDPOINTS.USER_HIDDEN_COMP(compId));
    } catch (error) {
      if (removedComp) {
        setHiddenComps((prev) => [...prev, removedComp!]);
      }
      throw error;
    }
  }, []);

  const isHiddenComp = useCallback(
    (compId: number | string): boolean => hiddenComps.some((c) => c.id === +compId),
    [hiddenComps]
  );

  const contextValue = useMemo<PreferencesContextValue>(
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
      hiddenComps,
      hideComp,
      showComp,
      isHiddenComp,
    }),
    [
      favTeams,
      favComps,
      loading,
      addFavTeam,
      removeFavTeam,
      isFavTeam,
      addFavComp,
      removeFavComp,
      isFavComp,
      hiddenComps,
      hideComp,
      showComp,
      isHiddenComp,
    ]
  );

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Legacy alias
export const FavouritesProvider = PreferencesProvider;

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

// Legacy alias for backwards compatibility
export const useFavourites = usePreferences;

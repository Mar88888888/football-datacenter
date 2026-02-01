import { useContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FavouritesContext } from '../context/FavouritesContext';
import type { FavoriteTeam, FavoriteCompetition } from '../types';

type FavoriteType = 'team' | 'competition';
type FavoriteItem = FavoriteTeam | FavoriteCompetition | null;

interface UseFavouriteResult {
  isFavourite: boolean;
  loading: boolean;
  addToFavourite: () => Promise<void>;
  removeFromFavourite: () => Promise<void>;
  toggleFavourite: () => void;
}

/**
 * Hook for managing favourite teams or competitions
 */
const useFavourite = (
  type: FavoriteType,
  id: number | string,
  item: FavoriteItem = null
): UseFavouriteResult => {
  const { user } = useContext(AuthContext);
  const {
    isFavTeam,
    isFavComp,
    addFavTeam,
    removeFavTeam,
    addFavComp,
    removeFavComp,
    loading: contextLoading,
  } = useContext(FavouritesContext);

  const navigate = useNavigate();
  const [mutating, setMutating] = useState(false);

  const isFavourite = type === 'team' ? isFavTeam(id) : isFavComp(id);

  const addToFavourite = useCallback(async (): Promise<void> => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!item) {
      console.error('Item object required for adding to favourites');
      return;
    }

    setMutating(true);
    try {
      if (type === 'team') {
        await addFavTeam(item as FavoriteTeam);
      } else {
        await addFavComp(item as FavoriteCompetition);
      }
    } catch (err) {
      console.error('Error adding to favourites:', err);
      alert((err as Error).message || 'An error occurred. Please try again later.');
    } finally {
      setMutating(false);
    }
  }, [user, navigate, type, item, addFavTeam, addFavComp]);

  const removeFromFavourite = useCallback(async (): Promise<void> => {
    setMutating(true);
    try {
      if (type === 'team') {
        await removeFavTeam(+id);
      } else {
        await removeFavComp(+id);
      }
    } catch (err) {
      console.error('Error removing from favourites:', err);
      alert((err as Error).message || 'An error occurred. Please try again later.');
    } finally {
      setMutating(false);
    }
  }, [type, id, removeFavTeam, removeFavComp]);

  const toggleFavourite = useCallback((): void => {
    if (isFavourite) {
      removeFromFavourite();
    } else {
      addToFavourite();
    }
  }, [isFavourite, addToFavourite, removeFromFavourite]);

  return {
    isFavourite,
    loading: contextLoading || mutating,
    addToFavourite,
    removeFromFavourite,
    toggleFavourite,
  };
};

export default useFavourite;

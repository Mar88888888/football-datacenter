import { useContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FavouritesContext } from '../context/FavouritesContext';

/**
 * Hook for managing favourite teams or competitions
 * @param {'team' | 'competition'} type - Type of favourite
 * @param {number|string} id - ID of the team or competition
 * @param {Object} item - The full item object (team or competition) for optimistic updates
 */
const useFavourite = (type, id, item = null) => {
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

  const addToFavourite = useCallback(async () => {
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
        await addFavTeam(item);
      } else {
        await addFavComp(item);
      }
    } catch (err) {
      console.error('Error adding to favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    } finally {
      setMutating(false);
    }
  }, [user, navigate, type, item, addFavTeam, addFavComp]);

  const removeFromFavourite = useCallback(async () => {
    setMutating(true);
    try {
      if (type === 'team') {
        await removeFavTeam(+id);
      } else {
        await removeFavComp(+id);
      }
    } catch (err) {
      console.error('Error removing from favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    } finally {
      setMutating(false);
    }
  }, [type, id, removeFavTeam, removeFavComp]);

  const toggleFavourite = useCallback(() => {
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

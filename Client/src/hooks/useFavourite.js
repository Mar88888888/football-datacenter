import { useMemo, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAuthApi, useAuthMutation } from './useApi';
import { API_ENDPOINTS } from '../constants';

/**
 * Hook for managing favourite teams or competitions
 * @param {'team' | 'competition'} type - Type of favourite
 * @param {number|string} id - ID of the team or competition
 * @param {string} name - Name for alert messages
 */
const useFavourite = (type, id, name) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const endpoint = type === 'team' ? API_ENDPOINTS.USER_FAV_TEAMS : API_ENDPOINTS.USER_FAV_COMPS;
  const itemEndpoint =
    type === 'team' ? API_ENDPOINTS.USER_FAV_TEAM(id) : API_ENDPOINTS.USER_FAV_COMP(id);

  const { data: favourites, refetch } = useAuthApi(endpoint, {
    enabled: !!user,
  });

  const { post, delete: deleteFav, loading } = useAuthMutation();

  const isFavourite = useMemo(() => {
    if (!favourites || !id) return false;
    return favourites.some((item) => item.id === +id);
  }, [favourites, id]);

  const addToFavourite = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await post(itemEndpoint, {});
      alert(`${name} has been added to your favourites!`);
      refetch();
    } catch (err) {
      console.error('Error adding to favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    }
  }, [user, navigate, post, itemEndpoint, name, refetch]);

  const removeFromFavourite = useCallback(async () => {
    try {
      await deleteFav(itemEndpoint);
      alert(`${name} has been removed from your favourites!`);
      refetch();
    } catch (err) {
      console.error('Error removing from favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    }
  }, [deleteFav, itemEndpoint, name, refetch]);

  const toggleFavourite = useCallback(() => {
    if (isFavourite) {
      removeFromFavourite();
    } else {
      addToFavourite();
    }
  }, [isFavourite, addToFavourite, removeFromFavourite]);

  return {
    isFavourite,
    loading,
    addToFavourite,
    removeFromFavourite,
    toggleFavourite,
  };
};

export default useFavourite;

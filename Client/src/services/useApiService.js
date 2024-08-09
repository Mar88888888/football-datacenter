import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useApiService = () => {
    const { authToken } = useContext(AuthContext);

    const fetchData = async (url) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch data');
        }
    };

    return { fetchData };
};

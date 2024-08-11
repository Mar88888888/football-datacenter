export const useApiService = () => {
    const fetchData = async (url) => {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch data');
        }
    };

    return { fetchData };
};

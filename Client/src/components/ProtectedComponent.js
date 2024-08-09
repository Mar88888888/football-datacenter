import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedComponent = () => {
    const { authToken } = useContext(AuthContext);

    const fetchData = async () => {
        const response = await fetch(process.env.API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h1>Protected Data</h1>
        </div>
    );
};

export default ProtectedComponent;

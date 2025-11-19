const API_BASE_URL = 'https://listallfrompscale.vercel.app';

export async function saveData(id: string, data: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                value: JSON.stringify(data),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

export async function retrieveData(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/retrieve?id=${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to retrieve data');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error;
    }
}

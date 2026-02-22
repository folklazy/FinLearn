const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export const api = {
    getStock: (symbol: string) => fetchAPI<any>(`/api/stocks/${symbol}`),
    searchStocks: (q: string) => fetchAPI<any[]>(`/api/stocks/search?q=${encodeURIComponent(q)}`),
    getPopularStocks: () => fetchAPI<any[]>('/api/stocks/popular'),
    getSP500: (page = 1, limit = 50, sector?: string) => {
        let url = `/api/stocks/sp500?page=${page}&limit=${limit}`;
        if (sector) url += `&sector=${encodeURIComponent(sector)}`;
        return fetchAPI<{ stocks: any[]; total: number; sectors: string[] }>(url);
    },
    getLessons: () => fetchAPI<{ categories: any[]; lessons: any[] }>('/api/lessons'),
    getLesson: (id: string) => fetchAPI<any>(`/api/lessons/${id}`),
};

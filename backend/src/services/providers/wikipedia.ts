// ===== Wikipedia Provider =====
// Free REST API — no API key, no rate limit
// Provides company descriptions as fallback when FMP/Yahoo are unavailable

const SEARCH_URL = 'https://en.wikipedia.org/w/api.php';
const SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

/**
 * Fetch a company description from Wikipedia.
 * Strategy: search for "{companyName} company" → get summary of first result.
 */
export async function getDescription(companyName: string): Promise<string | null> {
    try {
        // Step 1: Search Wikipedia for the company
        const searchParams = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: companyName,
            format: 'json',
            srlimit: '3',
            origin: '*',
        });
        const searchRes = await fetch(`${SEARCH_URL}?${searchParams}`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!searchRes.ok) return null;
        const searchData: any = await searchRes.json();
        const results = searchData?.query?.search;
        if (!Array.isArray(results) || results.length === 0) return null;

        // Pick the best match: prefer titles containing the company name
        const nameLower = companyName.toLowerCase().split(/[,.\s]+/)[0]; // first word
        const bestMatch = results.find((r: any) =>
            r.title.toLowerCase().includes(nameLower)
        ) ?? results[0];
        const title = bestMatch?.title;
        if (!title) return null;

        // Step 2: Get the page summary
        const summaryRes = await fetch(
            `${SUMMARY_URL}/${encodeURIComponent(title)}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!summaryRes.ok) return null;
        const summaryData: any = await summaryRes.json();
        const extract: string | undefined = summaryData?.extract;
        if (!extract || extract.length < 50) return null;

        return extract.slice(0, 1200);
    } catch (err) {
        console.warn(`[Wikipedia] Error for "${companyName}":`, (err as Error).message);
        return null;
    }
}

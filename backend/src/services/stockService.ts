import { mockStocks, mockSearchResults, getPopularStocks } from '../data/mockData';
import { StockData, SearchResult } from '../types/stock';

export class StockService {
    /**
     * Get full stock data by symbol
     */
    async getStockData(symbol: string): Promise<StockData | null> {
        const upperSymbol = symbol.toUpperCase();

        // Try mock data first (always available)
        if (mockStocks[upperSymbol]) {
            return mockStocks[upperSymbol];
        }

        // TODO: In production, try Yahoo Finance API
        // try {
        //   const yahooFinance = require('yahoo-finance2').default;
        //   const quote = await yahooFinance.quoteSummary(upperSymbol, {
        //     modules: ['price', 'summaryProfile', 'defaultKeyStatistics', 
        //               'financialData', 'incomeStatementHistory', 
        //               'balanceSheetHistory', 'cashflowStatementHistory']
        //   });
        //   return transformYahooData(quote);
        // } catch (error) {
        //   console.error(`Yahoo Finance API error for ${upperSymbol}:`, error);
        // }

        return null;
    }

    /**
     * Search stocks by query
     */
    async searchStocks(query: string): Promise<SearchResult[]> {
        const lowerQuery = query.toLowerCase();

        // Search in mock data
        const results = mockSearchResults.filter(
            (s) =>
                s.symbol.toLowerCase().includes(lowerQuery) ||
                s.name.toLowerCase().includes(lowerQuery) ||
                s.sector.toLowerCase().includes(lowerQuery)
        );

        return results;
    }

    /**
     * Get popular/featured stocks
     */
    async getPopularStocks(): Promise<StockData[]> {
        return getPopularStocks();
    }
}

export const stockService = new StockService();

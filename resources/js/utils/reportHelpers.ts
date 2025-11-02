/**
 * Utility functions for report formatting
 */

/**
 * Safely converts a value to a number and formats it as currency
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
    const numericAmount = Number(amount || 0);
    return new Intl.NumberFormat('en-BD', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount);
};

/**
 * Safely converts a value to a number and formats it with specified decimal places
 */
export const formatNumber = (value: number | string | null | undefined, decimals: number = 2): string => {
    const numericValue = Number(value || 0);
    return numericValue.toFixed(decimals);
};

/**
 * Safely converts a value to a number and formats it as percentage
 */
export const formatPercentage = (value: number | string | null | undefined, decimals: number = 2): string => {
    const numericValue = Number(value || 0);
    return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Safely converts any value to a number
 */
export const toNumber = (value: number | string | null | undefined): number => {
    return Number(value || 0);
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Check if a value is zero or empty
 */
export const isEmpty = (value: number | string | null | undefined): boolean => {
    return !value || Number(value) === 0;
};

/**
 * Apply conditional styling based on value
 */
export const getValueClass = (value: number | string | null | undefined, positiveClass: string = 'text-green-600', negativeClass: string = 'text-red-600'): string => {
    const numericValue = Number(value || 0);
    if (numericValue > 0) return positiveClass;
    if (numericValue < 0) return negativeClass;
    return '';
};

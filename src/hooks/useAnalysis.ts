import { useState, useCallback } from 'react';
import { analyzeSnapshot } from '../services/aiClient';

/**
 * Hook for managing analysis state and logic.
 * Handles calling the AI service and managing results/errors.
 */
export function useAnalysis() {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = useCallback(async (content: string) => {
    if (!content.trim()) {
      setError('No snapshot or image provided.');
      setAnalysis('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeSnapshot(content);
      setAnalysis(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMsg);
      setAnalysis('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis('');
    setError(null);
  }, []);

  return {
    analysis,
    isLoading,
    error,
    performAnalysis,
    clearAnalysis,
  };
}

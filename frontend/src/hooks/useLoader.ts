import { useLoading } from "@/contexts/LoadingContext";

// Custom hook for easier loader management
export const useLoader = () => {
  const { isLoading, loadingText, showLoader, hideLoader, setLoading } = useLoading();

  // Wrapper for async operations with automatic loading states
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    loadingMessage: string = "Loading..."
  ): Promise<T> => {
    try {
      showLoader(loadingMessage);
      const result = await asyncFn();
      return result;
    } finally {
      hideLoader();
    }
  };

  return {
    isLoading,
    loadingText,
    showLoader,
    hideLoader,
    setLoading,
    withLoading,
  };
};

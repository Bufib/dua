import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";

export type NewsItemType = {
  id: number;
  created_at: string;
  title?: string;
  body_text?: string;
  image_url?: string[];
  external_url?: string[];
  internal_url?: string[];
  is_pinned?: boolean;
};

const PAGE_SIZE = 10; // Number of items per page

export const useFetchNews = () => {
  const queryClient = useQueryClient();
  const { hasNewNewsData, clearNewNewsFlag } = useSupabaseRealtime();
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update button visibility based on new data flag from context
  useEffect(() => {
    setShowUpdateButton(hasNewNewsData);
  }, [hasNewNewsData]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<NewsItemType[], Error>({
    queryKey: ["news"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      return data as NewsItemType[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    maxPages: 4,
    staleTime: 86400 * 1000, // 24 hours
    gcTime: Infinity,
    // Add these options for better mobile performance
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /**
   * Handle pull-to-refresh
   */ 
  //! might be not needed
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      clearNewNewsFlag();
      setShowUpdateButton(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Handle refresh when new data is available (via update button)
   */
  const handleRefresh = async () => {
    if (hasNewNewsData) {
      // Fetch new data from the server and integrate it into the cache
      await queryClient.invalidateQueries({
        queryKey: ["news"],
        refetchType: "all",
      });
      clearNewNewsFlag(); // Reset the "new data" flag
      setShowUpdateButton(false); // Hide the banner
    }
  };
  

  /**
   * Handle infinite scroll with debouncing
   */
  const handleLoadMore = async () => {
    if (!isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  };

  /**
   * Flatten and deduplicate news items
   */
  const allNews: NewsItemType[] = data?.pages
    .flatMap((page) => page)
    .reduce<NewsItemType[]>((unique, item) => {
      if (!unique.some((existing) => existing.id === item.id)) {
        unique.push(item);
      }
      return unique;
    }, []) ?? [];

  return {
    allNews,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isRefetching,
    isError,
    error,
    isLoading,
    showUpdateButton,
    hasNewNewsData,
    isRefreshing,
    fetchNextPage: handleLoadMore,
    handleRefresh,
    handlePullToRefresh,
  };
};
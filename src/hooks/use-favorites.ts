'use client';

import { useCallback, useMemo } from 'react';
import { useAppStore, DataItem } from '@/lib/stores/app-store';

export function useFavorites(appId?: string) {
  const { dataItems, showFavorites, setShowFavorites, toggleFavorite } = useAppStore();

  const filteredItems = useMemo(() => {
    let items = appId ? dataItems.filter((item) => item.appId === appId) : dataItems;
    if (showFavorites) {
      items = items.filter((item) => item.isFavorite);
    }
    return items;
  }, [dataItems, appId, showFavorites]);

  const favorites = useMemo(
    () => dataItems.filter((item) => item.isFavorite),
    [dataItems]
  );

  const favoritesCount = favorites.length;

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const isFavorite = useCallback(
    (id: string) => dataItems.find((item) => item.id === id)?.isFavorite ?? false,
    [dataItems]
  );

  return {
    items: filteredItems,
    favorites,
    favoritesCount,
    showFavorites,
    setShowFavorites,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
  };
}

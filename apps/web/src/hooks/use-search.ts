import { useState, useMemo } from "react";

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category?: Array<{ name?: string }>;
  author?: Array<{ name?: string }>;
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  searchQuery: string,
) {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();

    return items.filter((item) => {
      // Search in title
      if (item.title?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in description
      if (item.description?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in content
      if (item.content?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in categories
      if (
        item.category?.some((cat) => cat.name?.toLowerCase().includes(query))
      ) {
        return true;
      }

      // Search in authors
      if (
        item.author?.some((author) =>
          author.name?.toLowerCase().includes(query),
        )
      ) {
        return true;
      }

      return false;
    });
  }, [items, searchQuery]);

  return filteredItems;
}

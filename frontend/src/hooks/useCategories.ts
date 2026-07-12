import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/api';
import type { Category, ApiResponse } from '../types/api';

export const useCategories = () => {
  return useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesApi.getAll();
      return data;
    },
  });
};

export const useCategory = (idOrSlug: string) => {
  return useQuery<ApiResponse<Category>>({
    queryKey: ['category', idOrSlug],
    queryFn: async () => {
      const { data } = await categoriesApi.getOne(idOrSlug);
      return data;
    },
    enabled: !!idOrSlug,
  });
};

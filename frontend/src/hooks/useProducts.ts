import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/api';
import type { ProductParams } from '../services/api';
import type { Product, ApiResponse } from '../types/api';

export const useProducts = (params?: ProductParams) => {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await productsApi.getAll(params);
      return data;
    },
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery<ApiResponse<Product>>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await productsApi.getOne(slug);
      return data;
    },
    enabled: !!slug,
  });
};

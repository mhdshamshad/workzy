import { useInfiniteQuery, useQueries, useQuery, type InfiniteData } from '@tanstack/react-query';

import CategoryService from '@/services/category.service';
import { homeService } from '@/services/home.service';
import ServiceManagement from '@/services/service.service';
import type { Category, CategoryLite } from '@/types/category';
import type { CategoryShowcaseContent } from '@/types/home/home.sectionContent';
import type { PublicWorkerListParams, PublicWorkerResponse } from '@/types/worker';

type PublicServicesResponse = {
  categories: Category[];
  nextCursor: string | null;
};

export const usePublicServices = (filters: {
  categoryId?: string;
  sortBy?: string;
  limit?: number;
}) => {
  return useInfiniteQuery<
    PublicServicesResponse,
    Error,
    InfiniteData<PublicServicesResponse>,
    [string, typeof filters],
    string | undefined
  >({
    queryKey: ['public-services', filters],
    queryFn: ({ pageParam }) =>
      CategoryService.getPublicCategories({
        ...filters,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
  });
};
export const useCategorySuggestions = (search: string, searchEnabled?: boolean) => {
  return useQuery({
    queryKey: ['category-suggestions', search],
    queryFn: () => CategoryService.getCategoriesSuggestions(search),
    enabled: searchEnabled,
    staleTime: 1000 * 60,
  });
};

export const useTrendingCategories = (enabled: boolean) => {
  return useQuery({
    queryKey: ['trending-categories'],
    queryFn: CategoryService.getTrendingCategories,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
};

export const useListingServices = (level = 3, parentId: string | null) => {
  return useQuery({
    queryKey: ['services-available', level, parentId],
    queryFn: () => CategoryService.getCategoryLevels(level, parentId),
    enabled: !!parentId,
  });
};

export const useServiceDetails = (serviceId?: string | null) => {
  return useQuery({
    queryKey: ['service-details', serviceId],
    queryFn: () => CategoryService.getCategory(serviceId!),
    enabled: !!serviceId,
  });
};

export const useListWorkers = (serviceId: string | null, params: PublicWorkerListParams) => {
  return useInfiniteQuery<
    PublicWorkerResponse,
    Error,
    InfiniteData<PublicWorkerResponse>,
    [string, string | null, PublicWorkerListParams],
    string | undefined
  >({
    queryKey: ['public-workers-by-service', serviceId, params],
    queryFn: ({ pageParam }) =>
      ServiceManagement.listWorkers(serviceId!, { ...params, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: !!serviceId,
  });
};

export const useCategoryShowcases = () => {
  const { data: topCategories = [] } = useQuery<CategoryLite[]>({
    queryKey: ['categories-level-1'],
    queryFn: () => CategoryService.getCategoryLevels(1),
    staleTime: 60 * 60 * 1000,
  });

  const top5 = topCategories.slice(0, 5);

  const showcaseQueries = useQueries({
    queries: top5.map(cat => ({
      queryKey: ['servicesByCategory', cat.id],
      queryFn: () => homeService.getServicesByCategory(cat.id, 10),
      enabled: top5.length > 0,
      staleTime: 60 * 60 * 1000,
    })),
  });
  const exclude = ['Beauty & Wellness', 'Tech & IT Services'];
  const showcases: CategoryShowcaseContent[] = top5
    .filter(cate => !exclude.includes(cate.name))
    .map((cat, i) => ({
      categoryId: cat.id,
      title: cat.name,
      subTitle: 'Explore the services',
      limit: 10,
      services: showcaseQueries[i].data?.services ?? [],
      isLoading: showcaseQueries[i].isLoading,
    }));

  return { showcases };
};

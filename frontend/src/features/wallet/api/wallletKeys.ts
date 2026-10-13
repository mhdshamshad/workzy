export const walletKeys = {
  all: ['wallet'] as const,
  detail: (id: string) => ['wallet', id] as const,
  worker: (workerId: string) => [...walletKeys.all, 'worker', workerId] as const,
  lists: (scope: string, filters?: object) => [...walletKeys.all, 'list', scope, filters] as const,
};

import { Filter } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import PageHeader from '@/components/molecules/PageHeader';
import SearchInput from '@/components/molecules/SearchInput';
import { STRIPE_ACCOUNT_STATUS, WORKER_STATUS } from '@/constants';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';

import workerColumns from '../components/workerColumns';
import { useAdminWorkers } from '../hooks/useAdminWorkers';

const CUSTOM_PARAMS = [{ key: 'stripStatus', defaultValue: 'all' }];

export default function AdminWorkerManagementPage() {
  const navigate = useNavigate();
  const { pageIndex, pageSize, search, status, updateParams, stripStatus } = useUrlFilterParams<{
    stripStatus: string;
  }>(CUSTOM_PARAMS);

  const { workers, total, isLoading, isError, error, refetch } = useAdminWorkers({
    page: pageIndex,
    limit: pageSize,
    search,
    status,
    stripStatus,
  });
  const isHideButton = search !== '' || status !== 'all' || stripStatus !== 'all';

  const clearAllFilters = useCallback(() => {
    updateParams({
      search: '',
      status: 'all',
      stripStatus: 'all',
      pageIndex: 0,
    });
  }, [updateParams]);

  const handleSearchChange = useCallback(
    (v: string) => {
      updateParams({ search: v, pageIndex: 0 });
    },
    [updateParams]
  );

  return (
    <main className="p-4 lg:p-6">
      <PageHeader title="Worker Management" description="Manage your platform Workers" />
      <div className="bg-card border rounded-xl p-6 pb-0 mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-4">
          <div className="col-span-2 sm:col-span-5">
            <SearchInput
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-span-1 sm:col-span-3">
            <Select
              placeholder="All Status"
              value={status}
              onChange={v => updateParams({ status: v, pageIndex: 0 })}
              leftIcon={<Filter />}
              options={[
                { label: 'All Status', value: 'all' },
                ...Object.values(WORKER_STATUS).map(val => ({
                  label: val.charAt(0).toUpperCase() + val.slice(1),
                  value: val,
                })),
              ]}
            />
          </div>
          <div className="col-span-1 sm:col-span-4">
            <Select
              placeholder="All Status"
              value={stripStatus}
              onChange={v => updateParams({ stripStatus: v, pageIndex: 0 })}
              leftIcon={<Filter />}
              options={[
                { label: 'All Status', value: 'all' },
                ...Object.values(STRIPE_ACCOUNT_STATUS).map(val => ({
                  label: val.charAt(0).toUpperCase() + val.slice(1),
                  value: val,
                })),
              ]}
            />
          </div>
        </div>
      </div>
      <DataList
        data={workers}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        mode="table"
        isLoading={isLoading}
        columns={workerColumns((id, email) => navigate(id, { state: { email } }))}
        onPageChange={v => updateParams({ pageIndex: v })}
        onPageSizeChange={v => updateParams({ pageSize: v, pageIndex: 0 })}
        pageCount={Math.ceil(total / pageSize) || 1}
        isError={isError}
        errorState={<ErrorState onRetry={() => refetch()} description={error?.message} />}
        emptyState={
          <EmptyState
            title="No Workers found"
            description={
              isHideButton ? 'Try adjusting your filters or search' : 'No users available yet'
            }
            action={
              isHideButton ? (
                <Button onClick={clearAllFilters} variant="red" size="sm">
                  Clear Filters
                </Button>
              ) : null
            }
          />
        }
      />
    </main>
  );
}

import {
  Users,
  Briefcase,
  Layers,
  DollarSign,
  MoreHorizontal,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PageHeader from '@/components/molecules/PageHeader';
import StatCard from '@/components/molecules/StatCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/features/booking/components/BookingCard';
import { formatCurrency } from '@/utils/currency';

import { useAdminBookings } from '../../booking/hooks/useAdminBooking';
import AdminDashboardSkeleton from '../components/AdminDashboardSkeleton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();
  const { data: bookings, isLoading: bookingLoading } = useAdminBookings({});
  const revenueData = data?.revenueData ?? [];
  const userGrowth = data?.userGrowth ?? [];
  const categoryDist = data?.categoryDistribution ?? [];
  const topWorkers = data?.topWorkers ?? [];
  const pendingApprovals = data?.pendingApprovals;

  const recentBookings = bookings?.pages?.flatMap(p => p.bookings) ?? [];

  if (isLoading || bookingLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of users, workers, jobs and revenue across the platform."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Users"
          value={data?.totalUsers?.toLocaleString() ?? 0}
          icon={<Users />}
          tone="info"
        />
        <StatCard
          label="Total Workers"
          value={data?.totalWorkers?.toLocaleString() ?? 0}
          tone="primary"
          icon={<UserCheck />}
        />
        <StatCard
          label="Categories"
          value={String(data?.totalCategories ?? 0)}
          tone="neutral"
          icon={<Layers />}
        />
        <StatCard
          label="Active Jobs"
          value={String(data?.activeJobs ?? 0)}
          tone="success"
          icon={<Briefcase />}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(data?.revenue ?? 0)}
          tone="warning"
          icon={<DollarSign />}
        />
        <StatCard
          label="Commission"
          value={formatCurrency(data?.commission ?? 0)}
          tone="info"
          icon={<Wallet />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 min-w-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Revenue & Commission</CardTitle>
              <CardDescription>Monthly platform earnings</CardDescription>
            </div>
            <Button variant="ghost" size="icon" aria-label="More revenue options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={50}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="com" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                    formatter={(v: unknown, name: unknown) => [
                      formatCurrency(Number(v ?? 0)),
                      name === 'revenue' ? 'Revenue' : 'Commission',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#rev)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="commission"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#com)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Total Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" /> Commission
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 min-w-0">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Active jobs by category</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={50}>
                <PieChart>
                  <Pie
                    data={categoryDist}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryDist.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {categoryDist.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 min-w-0">
          <CardHeader>
            <CardTitle>User & Worker Growth</CardTitle>
            <CardDescription>New signups over the year</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={280} minWidth={0} debounce={50}>
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="workersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                    vertical={false}
                  />

                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />

                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    fill="url(#usersFill)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="workers"
                    stroke="hsl(var(--chart-3))"
                    fill="url(#workersFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items awaiting your review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Worker Verifications', count: pendingApprovals?.workers, total: 50 },
              { label: 'Extra Charges', count: pendingApprovals?.extraCharges, total: 20 },
            ].map(it => (
              <div key={it.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="font-medium">{it.count ?? 0}</span>
                </div>
                <Progress value={((it.count ?? 0) / it.total) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest jobs across the platform</CardDescription>
            </div>
            <Link
              to={'/admin/bookings'}
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id.slice(7)}</TableCell>
                    <TableCell className="text-muted-foreground">{b.category.name}</TableCell>
                    <TableCell>{b.user.name}</TableCell>
                    <TableCell>{b.worker.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(b.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60 min-w-0">
          <CardHeader>
            <CardTitle>Top Performing Workers</CardTitle>
            <CardDescription>By completed jobs this month</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={180} minWidth={0} debounce={50}>
                <BarChart data={topWorkers} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={90} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-3">
              {topWorkers.slice(0, 3).map(w => (
                <div key={w.name} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {w.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ★ {w.rating} · {w.jobs} jobs
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(w.earnings)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

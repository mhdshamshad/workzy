import { MapPin, Clock, MoreHorizontal, IndianRupee, CheckCircle2, Briefcase } from 'lucide-react';
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

import { StarRating } from '@/components/atoms/StarRating';
import ProfileImage from '@/components/molecules/ProfileImage';
import StatCard from '@/components/molecules/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useBookings } from '@/features/booking';
import { StatusBadge } from '@/features/booking/components/BookingCard';
import { useWorkerProfile } from '@/features/profile/hooks/useWorkerProfile';
import { useWorkerReviews } from '@/features/review';
import PageError from '@/pages/PageError';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatTime12 } from '@/utils/time.format';

import WorkerDashboardSkeleton from '../components/WorkerDashboardSkeleton';
import { useWorkerDashboard } from '../hooks/useWorkerDashboard';

export default function WorkerDashboard() {
  const { user } = useAppSelector(state => state.auth);

  const { data: reviews, isLoading: reviewsLoading, error } = useWorkerReviews();
  const { data: bookings, isLoading: bookingLoading } = useBookings();
  const { data: worker, isLoading: profileLoading } = useWorkerProfile(user?.worker?.id);
  const { data, isLoading: dashBoardLoading } = useWorkerDashboard();
  const { earningsData, totalEarnings, totalAmount } = data ?? {};

  const { reviewStats, jobStats } = worker ?? {};
  const recentReviews = reviews?.pages?.flatMap(p => p.reviews) ?? [];
  const recentBookings = bookings?.pages?.flatMap(p => p.bookings) ?? [];

  const performanceData = [
    {
      name: 'Completed',
      value: jobStats?.completed ?? 0,
      color: 'var(--color-section-green-text)',
    },
    {
      name: 'Accepted',
      value: (jobStats?.accepted ?? 0) - (jobStats?.completed ?? 0),
      color: 'var(--color-section-blue-text)',
    },
    {
      name: 'No Response',
      value: jobStats?.noResponse ?? 0,
      color: 'var(--color-section-amber-text)',
    },
  ];

  if (reviewsLoading || bookingLoading || profileLoading || dashBoardLoading) {
    return <WorkerDashboardSkeleton />;
  }
  if (error) {
    return <PageError title={error.message} />;
  }

  return (
    <div className="p-4 lg:p-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.worker?.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's an overview of your performance and earnings.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Works"
          value={formatCurrency(totalAmount ?? 0)}
          icon={<IndianRupee />}
          tone="neutral"
        />
        <StatCard
          label="Total Earnings"
          value={formatCurrency(totalEarnings ?? 0)}
          icon={<IndianRupee />}
          tone="neutral"
        />
        <StatCard
          label="Total Jobs"
          value={jobStats?.completed}
          icon={<Briefcase />}
          tone="primary"
        />
        <StatCard
          label="Completion Rate"
          value={jobStats?.complitionRate}
          icon={<CheckCircle2 />}
          tone="success"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Monthly revenue for the current year</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={50}>
                <AreaChart data={earningsData} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--color-popover-foreground)',
                    }}
                    formatter={v => [`₹${Number(v ?? 0)}`, 'Income'] as [string, string]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#incomeFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>{jobStats?.offered} jobs offered</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={200} minWidth={0} debounce={50}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {performanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2.5">
              {performanceData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active/Recent Jobs</CardTitle>
              <CardDescription>Your current and upcoming assignments</CardDescription>
            </div>
            <Link to={'/worker/bookings'}>View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBookings.map(job => (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <ProfileImage src={job.user.profileImage} name={job.user.name} size={35} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{job.category.name}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{job.user.name}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.addressLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{' '}
                      {`${formatDate(job.date)} - ${formatTime12(job.startTime)}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(job.total)}</p>
                  <p className="text-xs text-muted-foreground">{job.bookingId}</p>
                </div>
                <Link to={`/worker/bookings/${job.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="View booking details"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratings & Reviews</CardTitle>
            <CardDescription>{reviewStats?.reviewCount} reviews total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-4xl font-bold">{reviewStats?.averageRating}</p>
                <StarRating rating={reviewStats?.averageRating ?? 0} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {reviewStats?.reviewCount} reviews
                </p>
              </div>
              <Separator orientation="vertical" className="h-20" />
              <div className="flex-1 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map(s => {
                  const count =
                    reviewStats?.breakdown?.[String(s) as '1' | '2' | '3' | '4' | '5'] ?? 0;
                  const totalReviews = reviewStats?.reviewCount ?? 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground">{s}</span>
                      <Progress value={pct} className="h-1.5 flex-1 bg-muted [&>div]:bg-golden" />
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator className="my-5" />
            <div className="space-y-4">
              {recentReviews.map((review, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProfileImage
                        src={review.user.profileImage}
                        name={review.user.name}
                        size={40}
                      />
                      <span className="text-sm font-medium">{review.user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt, 'calendar')}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Jobs Completed per Month</CardTitle>
          <CardDescription>Breakdown of completed jobs throughout the year</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={50}>
              <BarChart data={earningsData} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="jobs" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

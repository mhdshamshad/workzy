import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function formatTime12(time: string): string {
  return dayjs(`2000-01-01 ${time}`).format('h:mm A');
}

export function formatDate(
  date: string | Date,
  mode: 'calendar' | 'relative' = 'relative'
): string {
  const d = dayjs(date);
  const now = dayjs();

  if (mode === 'relative') {
    if (now.diff(d, 'day') < 7) {
      return d.fromNow();
    }
    return d.format('DD MMM YYYY');
  }

  const today = now;
  const tomorrow = now.add(1, 'day');
  const yesterday = now.subtract(1, 'day');

  if (d.isSame(today, 'day')) {
    return 'Today';
  }
  if (d.isSame(tomorrow, 'day')) {
    return 'Tomorrow';
  }
  if (d.isSame(yesterday, 'day')) {
    return 'Yesterday';
  }

  return d.format('dddd, DD MMM');
}

export function formatDuration(minutes: number): string {
  const d = dayjs.duration(minutes, 'minutes');

  const hours = d.hours();
  const mins = d.minutes();

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatSmartDateTime(date: string | Date): string {
  const d = dayjs(date);
  const time = d.format('h:mm A');
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');
  const tomorrow = today.add(1, 'day');

  if (d.isSame(today, 'day')) {
    return `Today · ${time}`;
  }
  if (d.isSame(yesterday, 'day')) {
    return `Yesterday · ${time}`;
  }
  if (d.isSame(tomorrow, 'day')) {
    return `Tomorrow · ${time}`;
  }

  return `${d.format('dddd, DD MMM')} · ${time}`;
}

export function calculateEndTime(startTime: string, durationMins: number): string {
  return dayjs(startTime, 'HH:mm').add(durationMins, 'minutes').format('h:mm A');
}
export function formatDateRangeDuration(start: string | Date, end: string | Date): string {
  const startDate = dayjs(start).startOf('day');
  const endDate = dayjs(end).startOf('day');
  const days = endDate.diff(startDate, 'day') + 1;

  return days === 1 ? '1 day' : `${days} days`;
}

export function formatDateForUrl(date: Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  return dayjs(date).startOf('day').format('YYYY-MM-DD');
}

export const formatTimeRange = (start: string, end: string) =>
  `${formatTime12(start)} → ${formatTime12(end)}`;

export function formatChatDate(
  dateInput: string | Date,
  type: 'label' | 'time' | 'smart' = 'label'
): string {
  const d = dayjs(dateInput);
  const now = dayjs();

  if (type === 'time') {
    return d.format('h:mm A');
  }

  const isToday = d.isSame(now, 'day');
  const isYesterday = d.isSame(now.subtract(1, 'day'), 'day');

  if (type === 'smart') {
    if (isToday) {
      return d.format('h:mm A');
    }
  }
  if (isToday) {
    return 'Today';
  }
  if (isYesterday) {
    return 'Yesterday';
  }

  const diffInDays = now.startOf('day').diff(d.startOf('day'), 'day');

  if (diffInDays > 1 && diffInDays < 7) {
    return d.format('dddd');
  }

  return d.format('DD/MM/YYYY');
}

export function formatLastSeen(lastSeen: string | Date | null | undefined): string {
  if (!lastSeen) {
    return '';
  }
  return dayjs(lastSeen).fromNow();
}

export function formatDaysAgo(date?: string | Date | null): string {
  const days = dayjs().startOf('day').diff(dayjs(date).startOf('day'), 'day');
  if (days <= 0) {
    return 'today';
  }
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function formatSmartActivityDateTime(dateInput: string | Date): string {
  const d = dayjs(dateInput);
  const now = dayjs();
  const time = d.format('h:mm A');

  const isToday = d.isSame(now, 'day');
  const isYesterday = d.isSame(now.subtract(1, 'day'), 'day');

  if (isToday) {
    return `Today · ${time}`;
  }
  if (isYesterday) {
    return `Yesterday · ${time}`;
  }
  return `${d.format('DD-MM-YYYY')} · ${time}`;
}

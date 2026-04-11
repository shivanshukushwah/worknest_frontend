import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Date and time utilities
 */

export const formatDate = (date: string | Date): string => {
  if (!date) return 'Flexible';
  const d = dayjs(date);
  return d.isValid() ? d.format('DD MMM YYYY') : 'Flexible';
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

export const formatTimeAgo = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('hh:mm A');
};

export const isExpired = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

export const formatDeadline = (date: string | Date): string => {
  if (!date) return 'Flexible';
  const d = dayjs(date);
  const now = dayjs();
  
  if (d.isBefore(now)) return 'Expired';
  
  const diffHours = d.diff(now, 'hour');
  const diffMinutes = d.diff(now, 'minute');
  
  if (diffHours < 1) {
    return `${diffMinutes} mins left`;
  } else if (diffHours < 24) {
    return `${diffHours} hours left`;
  }
  
  return d.format('DD MMM YYYY');
};

export const getDaysRemaining = (date: string | Date): number => {
  return dayjs(date).diff(dayjs(), 'day');
};

export const formatSalary = (salary: number, type: 'fixed' | 'hourly' | 'range'): string => {
  if (type === 'hourly') {
    return `₹${salary}/hour`;
  } else if (type === 'range') {
    return `₹${salary}+`;
  }
  return `₹${salary}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatLocation = (location: any): string => {
  if (!location) return 'Not specified';
  if (typeof location === 'string') return location;
  
  const parts = [];
  if (location.address) parts.push(location.address);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && location.country !== 'India') parts.push(location.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Not specified';
};

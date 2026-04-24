import type { BookingStatus } from '../types/database';

const styles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  negotiating: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
  declined: 'bg-red-100 text-red-800',
};

const labels: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  negotiating: 'Negotiating',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
    {labels[status]}
  </span>
);

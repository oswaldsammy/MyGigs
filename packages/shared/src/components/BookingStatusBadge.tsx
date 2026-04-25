import type { BookingStatus } from '../types/database';

const styles: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/100/15 text-amber-300',
  accepted: 'bg-blue-500/15 text-blue-300',
  negotiating: 'bg-indigo-500/15 text-indigo-300',
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  completed: 'bg-line text-gray-300',
  cancelled: 'bg-red-500/100/15 text-red-300',
  declined: 'bg-red-500/100/15 text-red-300',
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

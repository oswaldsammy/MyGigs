import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';
import { formatCurrency } from '../utils/formatters';

export interface MusicianCardProps {
  id: string;
  name: string;
  instruments: string[];
  city: string | null;
  rating: number | null;
  price: number | null;
  avatarUrl: string | null;
}

export const MusicianCard = ({ id, name, instruments, city, rating, price, avatarUrl }: MusicianCardProps) => (
  <Link
    to={`/musician/${id}`}
    className="flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
  >
    <div className="flex items-start gap-3">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
        {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{name}</h3>
        <p className="truncate text-sm text-gray-500">{city ?? '—'}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <StarRating value={rating ?? 0} size="sm" />
          <span className="text-gray-500">{rating ? rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1">
      {instruments.slice(0, 3).map((i) => (
        <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {i}
        </span>
      ))}
    </div>
    <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
      <span className="font-semibold text-brand-600">
        {price != null ? `${formatCurrency(price)}/hr` : '—'}
      </span>
      <span className="text-brand-600 hover:underline">View profile →</span>
    </div>
  </Link>
);

import { Link } from 'react-router-dom';
import { formatCurrency } from '@mygigs/shared';

export const EarningsPage = () => (
  <div className="mx-auto max-w-2xl px-6 py-8">
    <h1 className="mb-4 text-2xl font-bold">Earnings & payouts</h1>

    <div className="rounded-2xl border-2 border-dashed bg-amber-50 p-5 text-sm text-amber-900">
      Payment setup is in progress. Your earnings, payout schedule, and transaction history will appear here once the payment gateway is connected.
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <Stat label="Total earned" value={formatCurrency(0)} />
      <Stat label="Pending payout" value={formatCurrency(0)} />
      <Stat label="Released" value={formatCurrency(0)} />
    </div>

    <Link to="/kyc" className="mt-6 inline-block text-sm text-brand-600 hover:underline">
      Update bank account details →
    </Link>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

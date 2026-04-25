import { Link } from 'react-router-dom';

export const PaymentsPage = () => (
  <div className="mx-auto max-w-lg px-6 py-16">
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">💳</div>
      <h1 className="text-xl font-bold">Payment history</h1>
      <p className="mt-2 text-gray-600">
        Payment integration is being set up. Your booking payment details will appear here once the gateway is connected.
      </p>
      <Link to="/bookings" className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
        Go to my bookings
      </Link>
    </div>
  </div>
);

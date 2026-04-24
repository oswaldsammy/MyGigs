import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@mygigs/shared';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

const NavBar = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-brand-600">MyGigs · Musicians</Link>
        <nav className="flex items-center gap-6 text-sm">
          {user && <Link to="/" className="hover:text-brand-600">Dashboard</Link>}
          {user && <Link to="/gigs" className="hover:text-brand-600">Gigs</Link>}
          {user && <Link to="/messages" className="hover:text-brand-600">Messages</Link>}
          {user && <Link to="/profile" className="hover:text-brand-600">Profile</Link>}
          {user && <Link to="/kyc" className="hover:text-brand-600">KYC</Link>}
          {user
            ? <button onClick={signOut} className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200">Sign out</button>
            : <Link to="/auth/login" className="rounded-lg bg-brand-600 px-3 py-1.5 text-white">Sign in</Link>}
        </nav>
      </div>
    </header>
  );
};

const guarded = (node: React.ReactNode) => (
  <ProtectedRoute requireRole="musician">{node}</ProtectedRoute>
);

export default function App() {
  return (
    <div className="min-h-full">
      <NavBar />
      <main>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />

          <Route path="/onboarding" element={guarded(<PlaceholderPage title="Musician Onboarding" note="6-step wizard" />)} />
          <Route path="/" element={guarded(<PlaceholderPage title="Dashboard" note="Upcoming gigs + stats" />)} />
          <Route path="/gigs" element={guarded(<PlaceholderPage title="Gigs" />)} />
          <Route path="/gigs/:id" element={guarded(<PlaceholderPage title="Gig Detail" />)} />
          <Route path="/quotes/:bookingId" element={guarded(<PlaceholderPage title="Send Quote" />)} />
          <Route path="/messages" element={guarded(<PlaceholderPage title="Messages" />)} />
          <Route path="/messages/:bookingId" element={guarded(<PlaceholderPage title="Chat" />)} />
          <Route path="/profile" element={guarded(<PlaceholderPage title="My Profile" />)} />
          <Route path="/kyc" element={guarded(<PlaceholderPage title="KYC" />)} />
          <Route path="/earnings" element={guarded(<PlaceholderPage title="Earnings" note="Earnings & payout details coming soon" />)} />
          <Route path="/reviews" element={guarded(<PlaceholderPage title="Reviews" />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

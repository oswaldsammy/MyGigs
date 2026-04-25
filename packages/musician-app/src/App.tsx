import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@mygigs/shared';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { GigsPage } from './pages/GigsPage';
import { GigDetailPage } from './pages/GigDetailPage';
import { QuotePage } from './pages/QuotePage';
import { MessagesListPage } from './pages/MessagesListPage';
import { ChatPage } from './pages/ChatPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { KycPage } from './pages/KycPage';
import { EarningsPage } from './pages/EarningsPage';
import { ReviewsPage } from './pages/ReviewsPage';
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
          {user && <Link to="/reviews" className="hover:text-brand-600">Reviews</Link>}
          {user && <Link to="/profile" className="hover:text-brand-600">Profile</Link>}
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

          <Route path="/onboarding" element={guarded(<OnboardingPage />)} />
          <Route path="/" element={guarded(<DashboardPage />)} />
          <Route path="/gigs" element={guarded(<GigsPage />)} />
          <Route path="/gigs/:id" element={guarded(<GigDetailPage />)} />
          <Route path="/quotes/:bookingId" element={guarded(<QuotePage />)} />
          <Route path="/messages" element={guarded(<MessagesListPage />)} />
          <Route path="/messages/:bookingId" element={guarded(<ChatPage />)} />
          <Route path="/profile" element={guarded(<EditProfilePage />)} />
          <Route path="/kyc" element={guarded(<KycPage />)} />
          <Route path="/earnings" element={guarded(<EarningsPage />)} />
          <Route path="/reviews" element={guarded(<ReviewsPage />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

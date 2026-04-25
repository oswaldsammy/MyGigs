import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@mygigs/shared';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MusicianProfilePage } from './pages/MusicianProfilePage';
import { BookingFormPage } from './pages/BookingFormPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { MessagesListPage } from './pages/MessagesListPage';
import { ChatPage } from './pages/ChatPage';
import { ReviewPage } from './pages/ReviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

const NavBar = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-brand-600">MyGigs</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/search" className="hover:text-brand-600">Browse</Link>
          {user && <Link to="/bookings" className="hover:text-brand-600">Bookings</Link>}
          {user && <Link to="/messages" className="hover:text-brand-600">Messages</Link>}
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
  <ProtectedRoute requireRole="client">{node}</ProtectedRoute>
);

export default function App() {
  return (
    <div className="min-h-full">
      <NavBar />
      <main>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/musician/:id" element={<MusicianProfilePage />} />

          <Route path="/book/:musicianId" element={guarded(<BookingFormPage />)} />
          <Route path="/bookings" element={guarded(<MyBookingsPage />)} />
          <Route path="/bookings/:id" element={guarded(<BookingDetailPage />)} />
          <Route path="/messages" element={guarded(<MessagesListPage />)} />
          <Route path="/messages/:bookingId" element={guarded(<ChatPage />)} />
          <Route path="/reviews/new/:bookingId" element={guarded(<ReviewPage />)} />
          <Route path="/profile" element={guarded(<ProfilePage />)} />
          <Route path="/payments" element={guarded(<PaymentsPage />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

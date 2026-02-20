import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const CreateBookingPage = lazy(() => import('./pages/CreateBookingPage'));
const BookingDetailsPage = lazy(() => import('./pages/BookingDetailsPage'));

export const bookingsRoutes = (
  <>
    <Route path={ROUTES.bookings.root} element={<BookingsPage />} />
    <Route path={ROUTES.bookings.create} element={<CreateBookingPage />} />
    <Route path={ROUTES.bookings.details} element={<BookingDetailsPage />} />
  </>
);

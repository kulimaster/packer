import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ArchivePage } from '@/pages/ArchivePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { TripsPage } from '@/pages/TripsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <TripsPage /> },
      { path: 'trips/:tripId', element: <TripDetailPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

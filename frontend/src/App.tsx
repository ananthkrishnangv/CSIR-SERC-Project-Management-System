import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { PageGuard, RoleGuard } from './components/RBACGuard';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProposalPage from './pages/ProposalPage';
import ProposalReviewPage from './pages/ProposalReviewPage';
import FinancePage from './pages/FinancePage';
import StaffPage from './pages/StaffPage';
import RCMeetingsPage from './pages/RCMeetingsPage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import TimelinePage from './pages/TimelinePage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import DGDashboardPage from './pages/DGDashboardPage';
import BulkImportPage from './pages/BulkImportPage';
import ArchivePage from './pages/ArchivePage';
import AccessDeniedPage from './pages/AccessDeniedPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<PageGuard page="dashboard"><DashboardPage /></PageGuard>} />
                    <Route path="dg-dashboard" element={
                        <RoleGuard roles={['ADMIN', 'DIRECTOR']}>
                            <DGDashboardPage />
                        </RoleGuard>
                    } />
                    <Route path="projects" element={<PageGuard page="projects"><ProjectsPage /></PageGuard>} />
                    <Route path="projects/:id" element={<PageGuard page="projects"><ProjectDetailPage /></PageGuard>} />
                    <Route path="proposals" element={<ProposalPage />} />
                    <Route path="proposals/:id" element={<ProposalReviewPage />} />
                    <Route path="finance" element={<PageGuard page="finance"><FinancePage /></PageGuard>} />
                    <Route path="staff" element={<PageGuard page="staff"><StaffPage /></PageGuard>} />
                    <Route path="rc-meetings" element={<PageGuard page="rc-meetings"><RCMeetingsPage /></PageGuard>} />
                    <Route path="documents" element={<PageGuard page="documents"><DocumentsPage /></PageGuard>} />
                    <Route path="reports" element={<PageGuard page="reports"><ReportsPage /></PageGuard>} />
                    <Route path="timeline" element={<PageGuard page="timeline"><TimelinePage /></PageGuard>} />
                    <Route path="settings" element={<PageGuard page="settings"><SettingsPage /></PageGuard>} />
                    <Route path="users" element={
                        <RoleGuard roles={['ADMIN', 'DIRECTOR']}>
                            <UsersPage />
                        </RoleGuard>
                    } />
                    <Route path="profile" element={<PageGuard page="profile"><ProfilePage /></PageGuard>} />
                    <Route path="bulk-import" element={
                        <RoleGuard roles={['ADMIN', 'DIRECTOR', 'SUPERVISOR']}>
                            <BulkImportPage />
                        </RoleGuard>
                    } />
                    <Route path="archive" element={<PageGuard page="archive"><ArchivePage /></PageGuard>} />
                    <Route path="access-denied" element={<AccessDeniedPage />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;


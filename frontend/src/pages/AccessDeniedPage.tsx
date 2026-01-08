import { useNavigate } from 'react-router-dom';
import {
    LockClosedRegular,
    ArrowLeftRegular,
    HomeRegular,
    PersonRegular,
} from '@fluentui/react-icons';
import { useRBAC } from '../hooks/useRBAC';
import { useAuthStore } from '../stores/authStore';

export default function AccessDeniedPage() {
    const navigate = useNavigate();
    const { userRole } = useRBAC();
    const { user } = useAuthStore();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8">
            <div className="max-w-lg w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                    <LockClosedRegular className="w-12 h-12 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-secondary-900 mb-3">
                    Access Denied
                </h1>

                {/* Description */}
                <p className="text-secondary-600 mb-8">
                    You don't have permission to access this page.
                    {userRole && (
                        <span className="block mt-2 text-sm text-secondary-500">
                            Your current role is: <span className="font-medium text-primary-600">{userRole.replace('_', ' ')}</span>
                        </span>
                    )}
                </p>

                {/* User info card */}
                {user && (
                    <div className="bg-secondary-50 rounded-xl p-4 mb-8 inline-flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <PersonRegular className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-secondary-900">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-secondary-500">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <ArrowLeftRegular className="w-5 h-5" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <HomeRegular className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                </div>

                {/* Help text */}
                <p className="mt-8 text-sm text-secondary-500">
                    If you believe you should have access, please contact your administrator.
                </p>
            </div>
        </div>
    );
}

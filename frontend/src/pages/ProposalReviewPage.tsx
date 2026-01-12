import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    ArrowLeftRegular,
    CheckmarkCircleRegular,
    DismissCircleRegular,
    SendRegular,
    PersonRegular,
    CalendarRegular,
    MoneyRegular,
    DocumentTextRegular,
    ChatBubblesQuestionRegular,
} from '@fluentui/react-icons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Proposal {
    id: string;
    title: string;
    description?: string;
    category: string;
    status: string;
    objectives?: string;
    methodology?: string;
    expectedOutcome?: string;
    estimatedBudget?: number;
    proposedStartDate: string;
    proposedEndDate: string;
    vertical?: { name: string; code: string };
    specialArea?: { name: string };
    submittedBy?: { firstName: string; lastName: string; email?: string; designation?: string; department?: string };
    bkmdReviewer?: { firstName: string; lastName: string };
    bkmdReviewedAt?: string;
    bkmdComments?: string;
    directorReviewer?: { firstName: string; lastName: string };
    directorReviewedAt?: string;
    directorComments?: string;
    rcComments?: string;
    rcMeeting?: { title: string; date: string; meetingNumber: string };
    createdAt: string;
    updatedAt: string;
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    BKMD_REVIEW: 'bg-yellow-100 text-yellow-700',
    DIRECTOR_REVIEW: 'bg-orange-100 text-orange-700',
    DIRECTOR_APPROVED: 'bg-green-100 text-green-700',
    DIRECTOR_REJECTED: 'bg-red-100 text-red-700',
    RC_PENDING: 'bg-purple-100 text-purple-700',
    RC_APPROVED: 'bg-emerald-100 text-emerald-700',
    RC_REJECTED: 'bg-rose-100 text-rose-700',
    CONVERTED: 'bg-teal-100 text-teal-700',
};

const statusLabels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    BKMD_REVIEW: 'BKMD Review',
    DIRECTOR_REVIEW: 'Director Review',
    DIRECTOR_APPROVED: 'Director Approved',
    DIRECTOR_REJECTED: 'Director Rejected',
    RC_PENDING: 'RC Pending',
    RC_APPROVED: 'RC Approved',
    RC_REJECTED: 'RC Rejected',
    CONVERTED: 'Converted to Project',
};

export default function ProposalReviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accessToken, user } = useAuthStore();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchProposal();
    }, [id, accessToken]);

    const fetchProposal = async () => {
        try {
            const res = await fetch(`${API_BASE}/proposals/${id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProposal(data);
            } else {
                setError('Failed to load proposal');
            }
        } catch (err) {
            console.error('Failed to fetch proposal:', err);
            setError('Failed to load proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleBkmdReview = async (action: 'forward' | 'return') => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/proposals/${id}/bkmd-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ action, comments }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message);
                fetchProposal();
                setComments('');
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to process review');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process review');
        } finally {
            setProcessing(false);
        }
    };

    const handleDirectorReview = async (action: 'approve' | 'reject') => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/proposals/${id}/director-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ action, comments }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message);
                fetchProposal();
                setComments('');
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to process review');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process review');
        } finally {
            setProcessing(false);
        }
    };

    const handleRcReview = async (action: 'approve' | 'reject') => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/proposals/${id}/rc-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ action, comments }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message);
                fetchProposal();
                setComments('');
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to process review');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process review');
        } finally {
            setProcessing(false);
        }
    };

    const handleConvertToProject = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/proposals/${id}/convert-to-project`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage('Proposal converted to project!');
                setTimeout(() => {
                    navigate(`/projects/${data.project.id}`);
                }, 2000);
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to convert proposal');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to convert proposal');
        } finally {
            setProcessing(false);
        }
    };

    const canBkmdReview = ['BKMD', 'ADMIN', 'SYS_ADMIN'].includes(user?.role || '') &&
        ['SUBMITTED', 'BKMD_REVIEW'].includes(proposal?.status || '');

    const canDirectorReview = ['DIRECTOR', 'ADMIN', 'SYS_ADMIN'].includes(user?.role || '') &&
        proposal?.status === 'DIRECTOR_REVIEW';

    const canRcReview = ['DIRECTOR', 'ADMIN', 'SYS_ADMIN'].includes(user?.role || '') &&
        ['DIRECTOR_APPROVED', 'RC_PENDING'].includes(proposal?.status || '');

    const canConvert = ['DIRECTOR', 'ADMIN', 'SYS_ADMIN'].includes(user?.role || '') &&
        proposal?.status === 'RC_APPROVED';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-secondary-700">Proposal not found</h2>
                    <button onClick={() => navigate('/proposals')} className="btn-primary mt-4">
                        Back to Proposals
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/proposals')}
                        className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-4"
                    >
                        <ArrowLeftRegular className="w-5 h-5" />
                        Back to Proposals
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary-900">{proposal.title}</h1>
                            <span className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColors[proposal.status]}`}>
                                {statusLabels[proposal.status]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-success-100 text-success-700 rounded-lg">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-danger-100 text-danger-700 rounded-lg">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 underline">Dismiss</button>
                    </div>
                )}

                {/* Proposal Details */}
                <div className="card-premium mb-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Proposal Details</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-secondary-600">
                            <PersonRegular className="w-5 h-5" />
                            <span>
                                <strong>Submitted by:</strong> {proposal.submittedBy?.firstName} {proposal.submittedBy?.lastName}
                                {proposal.submittedBy?.designation && ` (${proposal.submittedBy.designation})`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-secondary-600">
                            <CalendarRegular className="w-5 h-5" />
                            <span>
                                <strong>Duration:</strong> {new Date(proposal.proposedStartDate).toLocaleDateString()} - {new Date(proposal.proposedEndDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-secondary-600">
                            <DocumentTextRegular className="w-5 h-5" />
                            <span><strong>Category:</strong> {proposal.category}</span>
                        </div>
                        {proposal.estimatedBudget && (
                            <div className="flex items-center gap-2 text-secondary-600">
                                <MoneyRegular className="w-5 h-5" />
                                <span><strong>Budget:</strong> ₹{(proposal.estimatedBudget / 100000).toFixed(2)} Lakhs</span>
                            </div>
                        )}
                    </div>

                    {proposal.vertical && (
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-accent-50 text-accent-700 rounded text-sm">
                                Thrust Area: {proposal.vertical.name} ({proposal.vertical.code})
                            </span>
                        </div>
                    )}

                    {proposal.description && (
                        <div className="mb-4">
                            <h4 className="font-medium text-secondary-800 mb-1">Description</h4>
                            <p className="text-secondary-600">{proposal.description}</p>
                        </div>
                    )}

                    {proposal.objectives && (
                        <div className="mb-4">
                            <h4 className="font-medium text-secondary-800 mb-1">Objectives</h4>
                            <p className="text-secondary-600 whitespace-pre-wrap">{proposal.objectives}</p>
                        </div>
                    )}

                    {proposal.methodology && (
                        <div className="mb-4">
                            <h4 className="font-medium text-secondary-800 mb-1">Methodology</h4>
                            <p className="text-secondary-600 whitespace-pre-wrap">{proposal.methodology}</p>
                        </div>
                    )}

                    {proposal.expectedOutcome && (
                        <div className="mb-4">
                            <h4 className="font-medium text-secondary-800 mb-1">Expected Outcome</h4>
                            <p className="text-secondary-600 whitespace-pre-wrap">{proposal.expectedOutcome}</p>
                        </div>
                    )}
                </div>

                {/* Review History */}
                {(proposal.bkmdReviewer || proposal.directorReviewer || proposal.rcComments) && (
                    <div className="card-premium mb-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Review History</h3>

                        {proposal.bkmdReviewer && (
                            <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                                <p className="font-medium text-yellow-800">BKMD Review</p>
                                <p className="text-sm text-yellow-700">
                                    Reviewed by {proposal.bkmdReviewer.firstName} {proposal.bkmdReviewer.lastName}
                                    {proposal.bkmdReviewedAt && ` on ${new Date(proposal.bkmdReviewedAt).toLocaleDateString()}`}
                                </p>
                                {proposal.bkmdComments && (
                                    <p className="text-sm text-yellow-600 mt-1">Comments: {proposal.bkmdComments}</p>
                                )}
                            </div>
                        )}

                        {proposal.directorReviewer && (
                            <div className="mb-3 p-3 bg-orange-50 rounded-lg">
                                <p className="font-medium text-orange-800">Director Review</p>
                                <p className="text-sm text-orange-700">
                                    Reviewed by {proposal.directorReviewer.firstName} {proposal.directorReviewer.lastName}
                                    {proposal.directorReviewedAt && ` on ${new Date(proposal.directorReviewedAt).toLocaleDateString()}`}
                                </p>
                                {proposal.directorComments && (
                                    <p className="text-sm text-orange-600 mt-1">Comments: {proposal.directorComments}</p>
                                )}
                            </div>
                        )}

                        {proposal.rcComments && (
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                                <p className="font-medium text-purple-800">RC Review</p>
                                {proposal.rcMeeting && (
                                    <p className="text-sm text-purple-700">
                                        Meeting: {proposal.rcMeeting.meetingNumber} on {new Date(proposal.rcMeeting.date).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="text-sm text-purple-600 mt-1">Comments: {proposal.rcComments}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Review Actions */}
                {(canBkmdReview || canDirectorReview || canRcReview || canConvert) && (
                    <div className="card-premium">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                            <ChatBubblesQuestionRegular className="w-5 h-5" />
                            Review Actions
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Comments (Optional)
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="input-premium resize-none"
                                rows={3}
                                placeholder="Add your review comments..."
                            />
                        </div>

                        <div className="flex gap-3">
                            {canBkmdReview && (
                                <>
                                    <button
                                        onClick={() => handleBkmdReview('forward')}
                                        className="btn-primary flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        <SendRegular className="w-4 h-4" />
                                        Forward to Director
                                    </button>
                                    <button
                                        onClick={() => handleBkmdReview('return')}
                                        className="btn-secondary text-warning-600 flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        Return for Revision
                                    </button>
                                </>
                            )}

                            {canDirectorReview && (
                                <>
                                    <button
                                        onClick={() => handleDirectorReview('approve')}
                                        className="btn-primary bg-success-500 hover:bg-success-600 flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        <CheckmarkCircleRegular className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDirectorReview('reject')}
                                        className="btn-secondary text-danger-600 flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        <DismissCircleRegular className="w-4 h-4" />
                                        Reject
                                    </button>
                                </>
                            )}

                            {canRcReview && (
                                <>
                                    <button
                                        onClick={() => handleRcReview('approve')}
                                        className="btn-primary bg-success-500 hover:bg-success-600 flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        <CheckmarkCircleRegular className="w-4 h-4" />
                                        RC Approve
                                    </button>
                                    <button
                                        onClick={() => handleRcReview('reject')}
                                        className="btn-secondary text-danger-600 flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        <DismissCircleRegular className="w-4 h-4" />
                                        RC Reject
                                    </button>
                                </>
                            )}

                            {canConvert && (
                                <button
                                    onClick={handleConvertToProject}
                                    className="btn-primary bg-teal-500 hover:bg-teal-600 flex items-center gap-2"
                                    disabled={processing}
                                >
                                    <CheckmarkCircleRegular className="w-4 h-4" />
                                    Convert to Project
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

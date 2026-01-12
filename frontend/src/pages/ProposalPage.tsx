import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    AddRegular,
    DocumentBulletListRegular,
    SendRegular,
    ChevronRightRegular,
    ClockRegular,
    CheckmarkCircleRegular,
    DismissCircleRegular,
    ArrowSyncRegular,
    PersonRegular,
    CalendarRegular,
    MoneyRegular,
} from '@fluentui/react-icons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Proposal {
    id: string;
    title: string;
    description?: string;
    category: string;
    status: string;
    estimatedBudget?: number;
    proposedStartDate: string;
    proposedEndDate: string;
    vertical?: { name: string; code: string };
    submittedBy?: { firstName: string; lastName: string; designation?: string };
    createdAt: string;
    updatedAt: string;
}

interface Vertical {
    id: string;
    name: string;
    code: string;
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
    BKMD_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DIRECTOR_REVIEW: 'bg-orange-100 text-orange-700 border-orange-200',
    DIRECTOR_APPROVED: 'bg-green-100 text-green-700 border-green-200',
    DIRECTOR_REJECTED: 'bg-red-100 text-red-700 border-red-200',
    RC_PENDING: 'bg-purple-100 text-purple-700 border-purple-200',
    RC_APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    RC_REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    CONVERTED: 'bg-teal-100 text-teal-700 border-teal-200',
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

const categoryLabels: Record<string, string> = {
    GAP: 'Grant-in-Aid',
    CNP: 'Consultancy',
    OLP: 'Other Lab',
    EFP: 'Ext. Funded',
    BMP: 'Bilateral Mission',
    FBR: 'Focus Basic Research',
    FTC: 'Fast Track Commerc.',
    FTT: 'Fast Track Trans.',
    MMP: 'Mission Mode',
    NCP: 'Niche Creating',
    NMITLI: 'NMITLI',
    MLP: 'Multi Lab',
    SSP: 'Sponsored Scheme',
    STS: 'Short Term Service',
};

export default function ProposalPage() {
    const navigate = useNavigate();
    const { accessToken, user } = useAuthStore();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [verticals, setVerticals] = useState<Vertical[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GAP',
        verticalId: '',
        objectives: '',
        methodology: '',
        expectedOutcome: '',
        proposedStartDate: '',
        proposedEndDate: '',
        estimatedBudget: '',
    });

    useEffect(() => {
        fetchProposals();
        fetchVerticals();
    }, [accessToken]);

    const fetchProposals = async () => {
        try {
            const res = await fetch(`${API_BASE}/proposals`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProposals(data);
            }
        } catch (err) {
            console.error('Failed to fetch proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVerticals = async () => {
        try {
            const res = await fetch(`${API_BASE}/verticals`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setVerticals(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch verticals:', error);
        }
    };

    const handleCreateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.verticalId || !formData.proposedStartDate || !formData.proposedEndDate) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccessMessage('Proposal created successfully!');
                setTimeout(() => setSuccessMessage(''), 5000);
                setShowCreateModal(false);
                resetForm();
                fetchProposals();
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to create proposal');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create proposal');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitProposal = async (proposalId: string) => {
        try {
            const res = await fetch(`${API_BASE}/proposals/${proposalId}/submit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (res.ok) {
                setSuccessMessage('Proposal submitted for review!');
                setTimeout(() => setSuccessMessage(''), 5000);
                fetchProposals();
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to submit proposal');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit proposal');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'GAP',
            verticalId: '',
            objectives: '',
            methodology: '',
            expectedOutcome: '',
            proposedStartDate: '',
            proposedEndDate: '',
            estimatedBudget: '',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DRAFT': return <DocumentBulletListRegular className="w-4 h-4" />;
            case 'SUBMITTED': return <SendRegular className="w-4 h-4" />;
            case 'BKMD_REVIEW':
            case 'DIRECTOR_REVIEW':
            case 'RC_PENDING': return <ClockRegular className="w-4 h-4" />;
            case 'DIRECTOR_APPROVED':
            case 'RC_APPROVED':
            case 'CONVERTED': return <CheckmarkCircleRegular className="w-4 h-4" />;
            case 'DIRECTOR_REJECTED':
            case 'RC_REJECTED': return <DismissCircleRegular className="w-4 h-4" />;
            default: return <ArrowSyncRegular className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Project Proposals</h1>
                        <p className="text-secondary-600 mt-1">Create and manage project proposals</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <AddRegular className="w-5 h-5" />
                        New Proposal
                    </button>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-success-100 text-success-700 rounded-lg border border-success-200">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-danger-100 text-danger-700 rounded-lg border border-danger-200">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 underline">Dismiss</button>
                    </div>
                )}

                {/* Proposals Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : proposals.length === 0 ? (
                    <div className="card-premium text-center py-12">
                        <DocumentBulletListRegular className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-700">No proposals yet</h3>
                        <p className="text-secondary-500 mt-1">Create your first project proposal</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary mt-4"
                        >
                            Create Proposal
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {proposals.map(proposal => (
                            <div
                                key={proposal.id}
                                className="card-premium hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/proposals/${proposal.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-secondary-900">
                                                {proposal.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                                                {getStatusIcon(proposal.status)}
                                                <span className="ml-1">{statusLabels[proposal.status] || proposal.status}</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                                            <span className="flex items-center gap-1">
                                                <PersonRegular className="w-4 h-4" />
                                                {proposal.submittedBy?.firstName} {proposal.submittedBy?.lastName}
                                            </span>
                                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">
                                                {categoryLabels[proposal.category] || proposal.category}
                                            </span>
                                            {proposal.vertical && (
                                                <span className="px-2 py-0.5 bg-accent-50 text-accent-700 rounded text-xs">
                                                    {proposal.vertical.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <CalendarRegular className="w-4 h-4" />
                                                {new Date(proposal.proposedStartDate).toLocaleDateString()} - {new Date(proposal.proposedEndDate).toLocaleDateString()}
                                            </span>
                                            {proposal.estimatedBudget && (
                                                <span className="flex items-center gap-1">
                                                    <MoneyRegular className="w-4 h-4" />
                                                    ₹{(proposal.estimatedBudget / 100000).toFixed(2)} Lakhs
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {proposal.status === 'DRAFT' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSubmitProposal(proposal.id);
                                                }}
                                                className="btn-secondary text-sm flex items-center gap-1"
                                            >
                                                <SendRegular className="w-4 h-4" />
                                                Submit
                                            </button>
                                        )}
                                        <ChevronRightRegular className="w-5 h-5 text-secondary-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Proposal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-secondary-200">
                            <h2 className="text-2xl font-bold text-secondary-900">New Project Proposal</h2>
                            <p className="text-secondary-500 mt-1">Fill in the details to create a new proposal</p>
                        </div>

                        <form onSubmit={handleCreateProposal} className="p-6">
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Proposal Title <span className="text-danger-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input-premium"
                                        placeholder="Enter proposal title"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-premium resize-none"
                                        placeholder="Brief description of the project"
                                        rows={3}
                                    />
                                </div>

                                {/* Category and Thrust Area */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            Category <span className="text-danger-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-premium"
                                            required
                                        >
                                            <option value="GAP">Grant-in-Aid (GAP)</option>
                                            <option value="CNP">Consultancy (CNP)</option>
                                            <option value="OLP">Other Lab (OLP)</option>
                                            <option value="EFP">Externally Funded (EFP)</option>
                                            <option value="BMP">Bilateral Mission (BMP)</option>
                                            <option value="FBR">Focus Basic Research (FBR)</option>
                                            <option value="FTC">Fast Track Commercialization (FTC)</option>
                                            <option value="FTT">Fast Track Translation (FTT)</option>
                                            <option value="MMP">Mission Mode Project (MMP)</option>
                                            <option value="NCP">Niche Creating Projects (NCP)</option>
                                            <option value="NMITLI">NMITLI</option>
                                            <option value="MLP">Multi Lab Projects (MLP)</option>
                                            <option value="SSP">Sponsored Scheme Projects (SSP)</option>
                                            <option value="STS">Short Term Service (STS)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            Thrust Area <span className="text-danger-500">*</span>
                                        </label>
                                        <select
                                            value={formData.verticalId}
                                            onChange={(e) => setFormData({ ...formData, verticalId: e.target.value })}
                                            className="input-premium"
                                            required
                                        >
                                            <option value="">Select thrust area...</option>
                                            {verticals.map(v => (
                                                <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Dates and Budget */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            Start Date <span className="text-danger-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.proposedStartDate}
                                            onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                                            className="input-premium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            End Date <span className="text-danger-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.proposedEndDate}
                                            onChange={(e) => setFormData({ ...formData, proposedEndDate: e.target.value })}
                                            className="input-premium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            Estimated Budget (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.estimatedBudget}
                                            onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                                            className="input-premium"
                                            placeholder="e.g., 1000000"
                                        />
                                    </div>
                                </div>

                                {/* Objectives */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Objectives</label>
                                    <textarea
                                        value={formData.objectives}
                                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                        className="input-premium resize-none"
                                        placeholder="Main objectives of the project"
                                        rows={3}
                                    />
                                </div>

                                {/* Methodology */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Methodology</label>
                                    <textarea
                                        value={formData.methodology}
                                        onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                                        className="input-premium resize-none"
                                        placeholder="Proposed methodology"
                                        rows={3}
                                    />
                                </div>

                                {/* Expected Outcome */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Expected Outcome</label>
                                    <textarea
                                        value={formData.expectedOutcome}
                                        onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                                        className="input-premium resize-none"
                                        placeholder="Expected outcomes and deliverables"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="btn-secondary"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Creating...' : 'Create Proposal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

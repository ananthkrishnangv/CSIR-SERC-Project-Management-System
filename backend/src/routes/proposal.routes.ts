import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ProposalStatus, UserRole } from '@prisma/client';

const router = Router();

// Get all proposals (filtered by role)
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { status, category } = req.query;

        let where: any = {};

        // Filter by status if provided
        if (status) {
            where.status = status as ProposalStatus;
        }

        // Filter by category if provided
        if (category) {
            where.category = category;
        }

        // Role-based filtering
        if (user.role === UserRole.EMPLOYEE || user.role === UserRole.PROJECT_HEAD) {
            // Scientists/Employees see only their own proposals
            where.submittedById = user.id;
        } else if (user.role === UserRole.BKMD) {
            // BKMD sees SUBMITTED proposals and those they've reviewed
            where.OR = [
                { status: ProposalStatus.SUBMITTED },
                { bkmdReviewerId: user.id },
                { status: ProposalStatus.BKMD_REVIEW },
            ];
        } else if (user.role === UserRole.DIRECTOR) {
            // Director sees DIRECTOR_REVIEW and approved proposals
            where.OR = [
                { status: ProposalStatus.DIRECTOR_REVIEW },
                { status: ProposalStatus.DIRECTOR_APPROVED },
                { status: ProposalStatus.DIRECTOR_REJECTED },
                { directorReviewerId: user.id },
            ];
        }
        // ADMIN and SYS_ADMIN see all proposals

        const proposals = await prisma.projectProposal.findMany({
            where,
            include: {
                vertical: true,
                specialArea: true,
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true, designation: true }
                },
                bkmdReviewer: {
                    select: { id: true, firstName: true, lastName: true }
                },
                directorReviewer: {
                    select: { id: true, firstName: true, lastName: true }
                },
                rcMeeting: {
                    select: { id: true, title: true, date: true, meetingNumber: true }
                },
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(proposals);
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});

// Get proposals pending RC approval (for RC meetings page)
router.get('/pending-rc', authenticate, async (req: Request, res: Response) => {
    try {
        const proposals = await prisma.projectProposal.findMany({
            where: {
                status: {
                    in: [ProposalStatus.DIRECTOR_APPROVED, ProposalStatus.RC_PENDING]
                }
            },
            include: {
                vertical: true,
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true, designation: true }
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json(proposals);
    } catch (error) {
        console.error('Error fetching RC pending proposals:', error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});

// Get single proposal by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
            include: {
                vertical: true,
                specialArea: true,
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true, designation: true, department: true }
                },
                bkmdReviewer: {
                    select: { id: true, firstName: true, lastName: true }
                },
                directorReviewer: {
                    select: { id: true, firstName: true, lastName: true }
                },
                rcMeeting: true,
                documents: true,
            },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        res.json(proposal);
    } catch (error) {
        console.error('Error fetching proposal:', error);
        res.status(500).json({ error: 'Failed to fetch proposal' });
    }
});

// Create new proposal
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const {
            title,
            description,
            category,
            verticalId,
            specialAreaId,
            objectives,
            methodology,
            expectedOutcome,
            proposedStartDate,
            proposedEndDate,
            estimatedBudget,
        } = req.body;

        if (!title || !category || !verticalId || !proposedStartDate || !proposedEndDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const proposal = await prisma.projectProposal.create({
            data: {
                title,
                description,
                category,
                verticalId,
                specialAreaId: specialAreaId || null,
                submittedById: user.id,
                objectives,
                methodology,
                expectedOutcome,
                proposedStartDate: new Date(proposedStartDate),
                proposedEndDate: new Date(proposedEndDate),
                estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
                status: ProposalStatus.DRAFT,
            },
            include: {
                vertical: true,
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true }
                },
            },
        });

        res.status(201).json(proposal);
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
});

// Update proposal (only drafts can be updated by submitter)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        const updateData = req.body;

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        // Only submitter can update drafts
        if (proposal.submittedById !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SYS_ADMIN) {
            return res.status(403).json({ error: 'Not authorized to update this proposal' });
        }

        if (proposal.status !== ProposalStatus.DRAFT) {
            return res.status(400).json({ error: 'Only draft proposals can be edited' });
        }

        const updated = await prisma.projectProposal.update({
            where: { id },
            data: {
                ...updateData,
                proposedStartDate: updateData.proposedStartDate ? new Date(updateData.proposedStartDate) : undefined,
                proposedEndDate: updateData.proposedEndDate ? new Date(updateData.proposedEndDate) : undefined,
                estimatedBudget: updateData.estimatedBudget ? parseFloat(updateData.estimatedBudget) : undefined,
            },
            include: {
                vertical: true,
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true }
                },
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating proposal:', error);
        res.status(500).json({ error: 'Failed to update proposal' });
    }
});

// Submit proposal for BKMD review
router.post('/:id/submit', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.submittedById !== user.id) {
            return res.status(403).json({ error: 'Only the submitter can submit the proposal' });
        }

        if (proposal.status !== ProposalStatus.DRAFT) {
            return res.status(400).json({ error: 'Only draft proposals can be submitted' });
        }

        const updated = await prisma.projectProposal.update({
            where: { id },
            data: { status: ProposalStatus.SUBMITTED },
        });

        res.json({ message: 'Proposal submitted for BKMD review', proposal: updated });
    } catch (error) {
        console.error('Error submitting proposal:', error);
        res.status(500).json({ error: 'Failed to submit proposal' });
    }
});

// BKMD review - forward to Director
router.post('/:id/bkmd-review', authenticate, authorize([UserRole.BKMD, UserRole.ADMIN, UserRole.SYS_ADMIN]), async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        const { comments, action } = req.body; // action: 'forward' or 'return'

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status !== ProposalStatus.SUBMITTED && proposal.status !== ProposalStatus.BKMD_REVIEW) {
            return res.status(400).json({ error: 'Proposal is not pending BKMD review' });
        }

        const newStatus = action === 'forward' ? ProposalStatus.DIRECTOR_REVIEW : ProposalStatus.DRAFT;

        const updated = await prisma.projectProposal.update({
            where: { id },
            data: {
                status: newStatus,
                bkmdReviewerId: user.id,
                bkmdReviewedAt: new Date(),
                bkmdComments: comments,
            },
        });

        const message = action === 'forward'
            ? 'Proposal forwarded to Director for review'
            : 'Proposal returned to submitter for revision';

        res.json({ message, proposal: updated });
    } catch (error) {
        console.error('Error in BKMD review:', error);
        res.status(500).json({ error: 'Failed to process BKMD review' });
    }
});

// Director review - approve or reject
router.post('/:id/director-review', authenticate, authorize([UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SYS_ADMIN]), async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        const { comments, action } = req.body; // action: 'approve' or 'reject'

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status !== ProposalStatus.DIRECTOR_REVIEW) {
            return res.status(400).json({ error: 'Proposal is not pending Director review' });
        }

        const newStatus = action === 'approve' ? ProposalStatus.DIRECTOR_APPROVED : ProposalStatus.DIRECTOR_REJECTED;

        const updated = await prisma.projectProposal.update({
            where: { id },
            data: {
                status: newStatus,
                directorReviewerId: user.id,
                directorReviewedAt: new Date(),
                directorComments: comments,
            },
        });

        const message = action === 'approve'
            ? 'Proposal approved by Director - pending RC approval'
            : 'Proposal rejected by Director';

        res.json({ message, proposal: updated });
    } catch (error) {
        console.error('Error in Director review:', error);
        res.status(500).json({ error: 'Failed to process Director review' });
    }
});

// RC approval
router.post('/:id/rc-review', authenticate, authorize([UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SYS_ADMIN]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { comments, action, rcMeetingId } = req.body; // action: 'approve' or 'reject'

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status !== ProposalStatus.DIRECTOR_APPROVED && proposal.status !== ProposalStatus.RC_PENDING) {
            return res.status(400).json({ error: 'Proposal is not pending RC review' });
        }

        const newStatus = action === 'approve' ? ProposalStatus.RC_APPROVED : ProposalStatus.RC_REJECTED;

        const updated = await prisma.projectProposal.update({
            where: { id },
            data: {
                status: newStatus,
                rcMeetingId: rcMeetingId || null,
                rcComments: comments,
            },
        });

        const message = action === 'approve'
            ? 'Proposal approved by Research Council'
            : 'Proposal rejected by Research Council';

        res.json({ message, proposal: updated });
    } catch (error) {
        console.error('Error in RC review:', error);
        res.status(500).json({ error: 'Failed to process RC review' });
    }
});

// Convert approved proposal to project
router.post('/:id/convert-to-project', authenticate, authorize([UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SYS_ADMIN]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
            include: { vertical: true },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status !== ProposalStatus.RC_APPROVED) {
            return res.status(400).json({ error: 'Only RC-approved proposals can be converted to projects' });
        }

        // Generate project code
        const year = new Date().getFullYear();
        const verticalCode = proposal.vertical?.code || 'GEN';
        const lastProject = await prisma.project.findFirst({
            where: {
                code: { startsWith: `${proposal.category}-${year}-${verticalCode}` }
            },
            orderBy: { code: 'desc' },
        });

        let sequence = 1;
        if (lastProject) {
            const parts = lastProject.code.split('-');
            sequence = parseInt(parts[parts.length - 1]) + 1;
        }

        const projectCode = `${proposal.category}-${year}-${verticalCode}-${sequence.toString().padStart(3, '0')}`;

        // Create the project
        const project = await prisma.project.create({
            data: {
                code: projectCode,
                title: proposal.title,
                description: proposal.description,
                category: proposal.category,
                verticalId: proposal.verticalId,
                specialAreaId: proposal.specialAreaId,
                projectHeadId: proposal.submittedById,
                objectives: proposal.objectives,
                methodology: proposal.methodology,
                expectedOutcome: proposal.expectedOutcome,
                startDate: proposal.proposedStartDate,
                endDate: proposal.proposedEndDate,
                status: 'ACTIVE',
            },
        });

        // Update proposal to mark as converted
        await prisma.projectProposal.update({
            where: { id },
            data: {
                status: ProposalStatus.CONVERTED,
                convertedProjectId: project.id,
            },
        });

        res.json({ message: 'Proposal converted to project', project });
    } catch (error) {
        console.error('Error converting proposal to project:', error);
        res.status(500).json({ error: 'Failed to convert proposal to project' });
    }
});

// Delete proposal (only drafts by submitter)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;

        const proposal = await prisma.projectProposal.findUnique({
            where: { id },
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.submittedById !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SYS_ADMIN) {
            return res.status(403).json({ error: 'Not authorized to delete this proposal' });
        }

        if (proposal.status !== ProposalStatus.DRAFT && user.role !== UserRole.ADMIN && user.role !== UserRole.SYS_ADMIN) {
            return res.status(400).json({ error: 'Only draft proposals can be deleted' });
        }

        await prisma.projectProposal.delete({
            where: { id },
        });

        res.json({ message: 'Proposal deleted successfully' });
    } catch (error) {
        console.error('Error deleting proposal:', error);
        res.status(500).json({ error: 'Failed to delete proposal' });
    }
});

export default router;

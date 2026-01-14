import { Router } from 'express';
import * as rcMeetingController from '../controllers/rc-meeting.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Meetings
router.get('/', rcMeetingController.getMeetings);
router.get('/members', rcMeetingController.getRCMembers);
router.get('/:id', rcMeetingController.getMeeting);
router.post('/', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.createMeeting);
router.put('/:id', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.updateMeeting);

// Agenda items - with alias routes for frontend compatibility
router.get('/:id/agenda', rcMeetingController.getAgendaItems);
router.post('/:id/agenda', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.addAgendaItem);
router.put('/:id/agenda/:itemId', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.updateAgendaItem);
router.delete('/:id/agenda/:itemId', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.deleteAgendaItem);

// Alias routes for frontend (/agenda-items instead of /agenda)
router.get('/:id/agenda-items', rcMeetingController.getAgendaItems);
router.post('/:id/agenda-items', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.addAgendaItem);
router.put('/:id/agenda-items/:itemId', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.updateAgendaItem);
router.delete('/:id/agenda-items/:itemId', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.deleteAgendaItem);

// Agenda item comments (RC members, Director, BKMD can comment)
router.get('/:id/agenda/:itemId/comments', rcMeetingController.getAgendaComments);
router.post('/:id/agenda/:itemId/comments', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR', 'RC_MEMBER'), rcMeetingController.addAgendaComment);
router.delete('/:id/agenda/:itemId/comments/:commentId', rcMeetingController.deleteAgendaComment);

// Finalize agenda item
router.post('/:id/agenda/:itemId/finalize', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.finalizeAgendaItem);

// Minutes
router.post('/:id/minutes', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.recordMinutes);

// Meeting pack / PDF generation
router.get('/:id/pack', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.generateMeetingPack);
router.get('/:id/agenda-pdf', authorize('ADMIN', 'DIRECTOR', 'SUPERVISOR'), rcMeetingController.generateAgendaPDF);

export default router;


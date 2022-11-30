const express = require('express');
const clientsController = require('./clients.controller');
const clientsValidation = require('./clients.validation');
const uploadMiddleware = require('../upload/upload.middleware');
const { forRoles } = require('../auth/auth.middleware');
const { Roles } = require('../../util/globalConstants');
const { UnauthorizedError } = require('../../util/httpErrors');

const router = express.Router();

// router.use((req, res, next) => {
//     if (!req.user) {
//         throw new UnauthorizedError('Unauthorized');
//     }
//
//     return next();
// });

router.post('/portal-invite', clientsController.inviteToPortal);
router.post('/reset-portal-password', clientsController.resetClientPassword);
router.post('/clients-by-ids', clientsController.getClientsById);
router.post('/client-license', uploadMiddleware.upload.single('file'), clientsController.uploadClientLicense);
router.post('/create', clientsValidation.validateCreateClient, clientsController.createClient);
router.post('/:client_id/appointments', clientsController.getClientAppointmentsByClientId);
router.post('/:client_id/client-files', clientsController.getClientFilesByClientId);
router.post('/:client_id/shared-files', clientsController.getSharedFilesByClientId);
router.post('/:client_id/save-counselors', clientsController.saveCounselors);
router.post('/', clientsController.getList);

router.get('/portal-token', forRoles([Roles.ALL]), clientsController.getPortalToken);
router.get('/get-counselors', clientsController.getCounselors);
router.get('/active-clients', clientsController.get_active_clients);
router.get('/:client_id/counselors', clientsController.getClientCounselorsByClientId);
router.get('/:client_id/general-info', clientsController.getGeneralInfo);
router.get('/:client_id/contact-permissions', clientsController.getContactPermissions);
router.get('/:client_id/:contact_type/details', clientsController.getContactDetailsByType);
router.get('/:client_id/referral-info', clientsController.getReferralInfo);
router.get('/:client_id/mandate-info', clientsController.getClientMandateInfo);
router.get('/:client_id/medical-info', clientsController.getMedicalInfo);
router.get('/:client_id/info', clientsController.getClientInfo);
router.get('/:client_id/appointment-reminder-settings', clientsController.getAppointmentReminderSettings);
router.get('/:client_id/insurances', clientsController.getInsurancesByClientId);

router.put('/save-partial-info/:client_id', clientsController.save_partial_info);
router.put('/:client_id/general-info', clientsValidation.validateGeneralInfo, clientsController.saveGeneralInfo);
router.put('/:client_id/contact-permissions', clientsController.saveContactPermissions);
router.put(
    '/:client_id/:contact_type/details',
    clientsValidation.validateContactDetailsByType,
    clientsController.saveContactDetails
);
router.put('/:client_id/referrer-info', clientsController.saveReferrerInfo); // clientsValidation.validateReferrerInfo
router.put(
    '/:client_id/mandate-info',
    clientsValidation.validateClientMandateInfo,
    clientsController.saveClientMandateInfo
);
router.put('/:client_id/medical-info', clientsValidation.validateMedicalInfo, clientsController.saveMedicalInfo);
router.put(
    '/:client_id/:contact_type/appointment-reminder-settings',
    clientsValidation.validateContactAppointmentReminderSettingsByType,
    clientsController.saveContactAppointmentReminderSettings
);

//router.patch(`/:client_id/update-primary-contact`, clientsValidation.validatePrimaryContactId, clientsController.updatePrimaryContact)
router.delete('/contacts/:contact_id', clientsController.deleteContact);
router.delete('/check-delete-eligibility/:client_id',forRoles([Roles.ALL]), clientsController.checkDeleteClientEligibility);
router.delete('/:client_id', forRoles([Roles.ALL]), clientsController.deleteClient);


/**
 * These routes may be prone to criteria
 */



router.put('/:client_id/save-memo', clientsController.saveMemo);

router.put('/:client_id/update-record', clientsController.updateRecord);

module.exports = router;

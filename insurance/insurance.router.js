const express = require('express');
const insuranceController = require('./insurance.controller');
// const insuranceValidation = require('./insurance.validation');
const uploadMiddleware = require('../upload/upload.middleware');

const router = express.Router();

router.post('/save-claim/:id', insuranceController.save_claim) // don't think we'll be doing this from here - just update client, services, etc + re-submit or maybe we will
router.post('/upload-card/:side', uploadMiddleware.upload.single('file'), insuranceController.saveInsurancePhoto)
//TODO - Add Delete Route
// router.delete('/:insuranceId', insuranceController.)
router.post('/verify_eligibility', insuranceController.verify_eligibility)
router.post('/submit_claim', insuranceController.submit_claim)
router.post('/update_eras', insuranceController.update_eras)
router.post('/echo_test', insuranceController.echo_test)

router.post('/list_claims', insuranceController.list_claims)
router.post('/list_eras', insuranceController.list_eras)
router.post('/list_verifications', insuranceController.list_verifications)


router.get('/submit2api/:id', insuranceController.submit2api)
router.get('/check_claim_errors/:id', insuranceController.check_claim_errors)
router.get('/claim/:id', insuranceController.get_claim)
router.get('/era/:id', insuranceController.get_era)
router.get('/verification/:id', insuranceController.get_verification)
router.get('/primary_verification/:id', insuranceController.getPrimaryInsuranceVerification)

router.get('/invoice2claim/:id', insuranceController.invoice2claim)


router.put('/insurance-details', insuranceController.saveInsurance);
router.put('/insurance-contact-info', insuranceController.saveInsuranceContactInformation)

router.delete('/insurance-card/:insurance_id', insuranceController.deleteInsurance);
router.delete('/delete2api/:id', insuranceController.delete2api)
// router.put('/era/:id', insuranceController.save_era) // should never be doing this - read only, data comes from insurance clearinghouse api service

// the cron to run and poll eras will be on AWS Amazon EventBridge
// Events
// Rules
// insurance_eras_poll
// runs lambda function insurance_eras_updates that grabs updates and posts them here

module.exports = router;
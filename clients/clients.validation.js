const Joi = require('joi');
const { BadRequestError } = require('../../util/httpErrors');
const snakecaseKeys = require('snakecase-keys');

const emptyValues = [null, ''];

const generalInfoSchema = Joi.object({
    status: Joi.string()
        .max(255)
        // .required()
    ,
    dob: Joi.date().allow(...emptyValues, '0000-00-00 00:00:00'),
    firstName: Joi.string()
        .min(1)
        .max(255)
        // .required()
    ,
    middleName: Joi.string()
        .max(60)
        .allow(...emptyValues),
    lastName: Joi.string()
        .min(1)
        .max(255)
        // .required()
    ,
    preferredName: Joi.string()
        .max(60)
        .allow(...emptyValues),
    gender: Joi.string()
        .min(1)
        .max(255)
        .allow(...emptyValues),
    identifiedGender: Joi.string()
        .max(255)
        .allow(...emptyValues),
    race: Joi.string()
        .max(50)
        .allow(...emptyValues),
    maritalStatus: Joi.string()
        .max(30)
        .allow(...emptyValues),
    employmentStatus: Joi.string()
        .max(30)
        .allow(...emptyValues),
    meansOfIncome: Joi.string()
        .max(255)
        .allow(...emptyValues),
    email: Joi.string()
        .max(60)
        .required()
        .allow(...emptyValues),
    phone: Joi.string()
        // .required()
        .allow(...emptyValues),
    altPhone: Joi.string()
        // .required()
        .allow(...emptyValues),
    streetAddress: Joi.string().allow(...emptyValues),
    streetAddress2: Joi.string().allow(...emptyValues),
    street_address: Joi.string().allow(...emptyValues),
    street_address2: Joi.string().allow(...emptyValues),
    city: Joi.string()
        // .required()
        .allow(...emptyValues),
    state: Joi.string()
        // .required()
        .allow(...emptyValues),
    zip: Joi.string()
        // .required()
        .allow(...emptyValues),
    externalId: Joi.string().allow(...emptyValues),
    financial_class: Joi.string().allow(...emptyValues),
    guardian_email: Joi.string()
        .max(60)
        .allow(...emptyValues),
    driversLicenseNumber: Joi.string()
        .max(40)
        .allow(...emptyValues),
    preferredLanguage: Joi.string()
        .max(40)
        .allow(...emptyValues),
    religion: Joi.string()
        .max(40)
        .allow(...emptyValues),
    education: Joi.string()
        .max(40)
        .allow(...emptyValues),
    annualIncomeDollars: Joi.number()
        .allow(...emptyValues),
    disability: Joi.string()
        .max(40)
        .allow(...emptyValues),
    veteranStatus: Joi.string()
        .max(40)
        .allow(...emptyValues),
    contact_methods: Joi.string()
        .allow(...emptyValues),
    portal_data: Joi.string()
        .max(2000)
        .allow(...emptyValues),
});

const createClientSchema = Joi.object({
    status: Joi.string()
        .max(255)
        .required(),
    firstName: Joi.string()
        .min(1)
        .max(255)
        .required(),
    middleName: Joi.string()
        .max(60)
        .allow(...emptyValues),
    lastName: Joi.string()
        .min(1)
        .max(255)
        .required(),
    email: Joi.string()
        .max(60)
        .required(),
    phone: Joi.string().allow(...emptyValues),
    altPhone: Joi.string().allow(...emptyValues),
    streetAddress: Joi.string().allow(...emptyValues),
    streetAddress2: Joi.string().allow(...emptyValues),
    city: Joi.string().allow(...emptyValues),
    state: Joi.string().allow(...emptyValues),
    zip: Joi.string().allow(...emptyValues),
    gender: Joi.string()
        .max(255)
        .allow(...emptyValues),
    dob: Joi.date().allow(...emptyValues, '0000-00-00 00:00:00'),
    guardian_email: Joi.string()
        .max(60)
        .allow(...emptyValues),
    driversLicenseNumber: Joi.string()
        .max(40)
        .allow(...emptyValues),
    preferredLanguage: Joi.string()
        .max(40)
        .allow(...emptyValues),
    religion: Joi.string()
        .max(40)
        .allow(...emptyValues),
    education: Joi.string()
        .max(40)
        .allow(...emptyValues),
    annualIncomeDollars: Joi.number()
        .allow(...emptyValues),
    disability: Joi.string()
        .max(40)
        .allow(...emptyValues),
    veteranStatus: Joi.string()
        .max(40)
        .allow(...emptyValues),
    contact_methods: Joi.string()
        .allow(...emptyValues),
    primaryCounselor: Joi.number()
        .allow(...emptyValues),
});

function convertCreateClientToDBSchema(req, sanitized) {
    req.body = snakecaseKeys(sanitized);
}

/**
 * Validates req.body before sending request to clients.controller.saveContactDetails
 * @param req
 * @param res
 * @param next
 * @returns {void}
 */
function validateCreateClient(req, res, next) {
    const result = createClientSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    const sanitized = result.value;

    convertCreateClientToDBSchema(req, sanitized);

    return next();
}

/**
 * Validates req.body before sending request to clients.controller.saveGeneralInfo
 * @param req
 * @param res
 * @param next
 * @returns {void}
 */
function validateGeneralInfo(req, res, next) {
    if (req.body.id) {
        delete req.body.id;
    }
    const result = generalInfoSchema.validate(req.body, { abortEarly: false });
    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertGeneralInfoToDBSchema(req);

    return next();
}

function convertGeneralInfoToDBSchema(req) {
    req.body = snakecaseKeys(req.body);
}

// TODO: Beef up validation... primaryPhone should not contain an email, etc.
const contactDetailsSchemas = {
    client: Joi.object({
        firstName: Joi.string().allow(null),
        lastName: Joi.string().allow(null),
        primaryPhone: Joi.string().allow(null, ''),
        altPhone: Joi.string().allow(null, ''),
        email: Joi.string().allow(null),
        streetAddress: Joi.string().allow(null),
        streetAddress2: Joi.string().allow(null, ''),
        city: Joi.string().allow(null),
        state: Joi.string().allow(null),
        zip: Joi.string().allow(null),
        relationshipToClient: Joi.string().allow(null),
        id: Joi.number().required()
    }),
    guardian: Joi.object({
        // firstName: Joi.string().required(),
        // lastName: Joi.string().required(),
        // primaryPhone: Joi.string().required(),
        // altPhone: Joi.string().allow(null).required(),
        // email: Joi.string().required(),
        // streetAddress: Joi.string().required(),
        // city: Joi.string().required(),
        // state: Joi.string().required(),
        // zip: Joi.string().required(),
        // relationshipToClient: Joi.string().required(),
        // id: Joi.number().required()
        firstName: Joi.string().allow(null, ''),
        lastName: Joi.string().allow(null, ''),
        primaryPhone: Joi.string().allow(null, ''),
        altPhone: Joi.string().allow(null, ''),
        email: Joi.string().allow(null, ''),
        streetAddress: Joi.string().allow(null, ''),
        streetAddress2: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        zip: Joi.string().allow(null, ''),
        relationshipToClient: Joi.string().allow(null, ''),
        id: Joi.number().allow(null, '')
    }),
    emergency: Joi.object({
        firstName: Joi.string().allow(null, ''),
        lastName: Joi.string().allow(null, ''),
        primaryPhone: Joi.string().allow(null, ''),
        altPhone: Joi.string().allow(null, ''),
        email: Joi.string().allow(null, ''),
        streetAddress: Joi.string().allow(null, ''),
        streetAddress2: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        zip: Joi.string().allow(null, ''),
        relationshipToClient: Joi.string().allow(null, ''),
        id: Joi.number().allow(null, '')
    })
};

/**
 * Validates req.body before sending request to clients.controller.saveContactDetails
 * @param req
 * @param res
 * @param next
 * @returns {void}
 */
function validateContactDetailsByType(req, res, next) {
    const result = contactDetailsSchemas[req.params.contact_type].validate(req.body, { abortEarly: false });
    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertContactToDBSchema(req, req.params.contact_type);

    return next();
}

function convertContactToDBSchema(req, type) {
    req.body = snakecaseKeys(req.body);
    req.body.contact_type = type;
    req.body.client_id = req.params.client_id;

    verifyId(req);
}

function verifyId(req) {
    if (req.body.id === 0) {
        // 0 is not an id
        delete req.body.id;
    }
}

function separateFirstAndLastName(name) {
    let firstName = '';
    let lastName = '';
    if (name) {
        let splitName = name.split(' ');
        firstName = splitName[0];
        lastName = splitName.slice(1).join(' ');
    }
    return { firstName: firstName, lastName: lastName };
}

const primaryContactIdSchema = Joi.object({
    contact_id: Joi.number()
        .greater(0)
        .required()
});

function validatePrimaryContactId(req, res, next) {
    const result = primaryContactIdSchema.validate(req.body, { abortEarly: false });

    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    return next();
}

const referrerInfoSchema = Joi.object({
    // id: Joi.number().required(),
    name: Joi.string().allow(null, ''),
    employer: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, '')
});

function validateReferrerInfo(req, res, next) {
    const result = referrerInfoSchema.validate(req.body, { abortEarly: false });

    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertReferrerInfoToDBSchema(req);

    return next();
}

function convertReferrerInfoToDBSchema(req) {
    req.body = snakecaseKeys(req.body);
    // req.body.client_id = req.params.client_id;
    verifyId(req);
}

const clientMandateInfoSchema = Joi.object({
    isMandated: Joi.boolean().required(),
    caseNumber: Joi.string(),
    divisionJudge: Joi.string(),
    nextCourtDate: Joi.string()
});

function validateClientMandateInfo(req, res, next) {
    let result = {};
    if (req.body.isMandated) {
        //readd if requirements change to make this mandatory.
        //result = clientMandateInfoSchema.validate(req.body, { abortEarly: false });
    } else {
        req.body.caseNumber = '';
        req.body.divisionJudge = '';
        req.body.nextCourtDate = '';
    }
    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertClientMandateInfoToDBSchema(req);

    return next();
}

function convertClientMandateInfoToDBSchema(req) {
    req.body = snakecaseKeys(req.body);
}

const prescription = Joi.object().keys({
    dataId: Joi.string().required(),
    name: Joi.string().allow(null, ''),
    dosage: Joi.string().allow(null, ''),
    prescriber: Joi.string().allow(null, '')
});

const medicalInfoSchema = Joi.object({
    allergies: Joi.string()
        .max(500)
        .allow(...emptyValues),
    prescriptions: Joi.array().items(prescription)
});

/**
 * Validates req.body before sending request to clients.controller.saveMedicalInfo
 * @param req
 * @param res
 * @param next
 * @returns {void}
 */
function validateMedicalInfo(req, res, next) {
    const result = medicalInfoSchema.validate(req.body.medicalInfo, { abortEarly: false });

    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertMedicalInfoToDBSchema(req);

    return next();
}

function convertMedicalInfoToDBSchema(req) {
    req.body.medicalInfo = {
        allergies: req.body.medicalInfo.allergies,
        prescriptions: JSON.stringify(req.body.medicalInfo.prescriptions)
    };
}

const contactAppointmentReminderSettingsSchemas = {
    client: Joi.object({
        sendEmailReminders: Joi.boolean().required(),
        sendVoicemailReminders: Joi.boolean().required(),
        id: Joi.number().required()
    }),
    guardian: Joi.object({
        sendEmailReminders: Joi.boolean().required(),
        sendVoicemailReminders: Joi.boolean().required(),
        id: Joi.number().required()
    }),

    other_voicemail: Joi.object({
        sendVoicemailReminders: Joi.boolean().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        primaryPhone: Joi.string().required(),
        relationshipToClient: Joi.string().allow(null),
        id: Joi.number().required()
    }),
    other_email: Joi.object({
        sendEmailReminders: Joi.boolean().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        relationshipToClient: Joi.string().allow(null),
        id: Joi.number().required()
    })
};

/**
 * Validates req.body before sending request to clients.controller.saveContactDetails
 * @param req
 * @param res
 * @param next
 * @returns {void}
 */
function validateContactAppointmentReminderSettingsByType(req, res, next) {
    if (req.body.sendVoicemailReminders == false && req.params.contact_type == 'other_voicemail') {
        contactAppointmentReminderSettingsSchemas.other_voicemail = Joi.object({
            sendVoicemailReminders: Joi.boolean().required(),
            firstName: Joi.string()
                .required()
                .allow(null, ''),
            lastName: Joi.string()
                .required()
                .allow(null, ''),
            primaryPhone: Joi.string()
                .required()
                .allow(null, ''),
            relationshipToClient: Joi.string().allow(null, ''),
            id: Joi.number().required()
        });
    }
    if (req.body.sendEmailReminders == false && req.params.contact_type == 'other_email') {
        contactAppointmentReminderSettingsSchemas.other_email = Joi.object({
            sendEmailReminders: Joi.boolean().required(),
            firstName: Joi.string()
                .required()
                .allow(null, ''),
            lastName: Joi.string()
                .required()
                .allow(null, ''),
            email: Joi.string()
                .required()
                .allow(null, ''),
            relationshipToClient: Joi.string().allow(null, ''),
            id: Joi.number().required()
        });
    }
    const result = contactAppointmentReminderSettingsSchemas[req.params.contact_type].validate(req.body, {
        abortEarly: false
    });
    if (result.error) {
        throw BadRequestError.fromValidationFailure(result);
    }

    convertContactToDBSchema(req, req.params.contact_type);

    return next();
}

module.exports = {
    validateCreateClient,
    validateGeneralInfo,
    validateContactDetailsByType,
    validatePrimaryContactId,
    validateReferrerInfo,
    validateClientMandateInfo,
    validateMedicalInfo,
    validateContactAppointmentReminderSettingsByType
};

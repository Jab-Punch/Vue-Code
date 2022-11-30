const clientService = require('./clients.service');
const fileService = require('../file/file.service');
const uploadService = require('../upload/upload.service');
const mime = require('mime-types');
const { UnauthorizedError, BadRequestError, InternalServerError } = require('../../util/httpErrors');
const snakecaseKeys = require('snakecase-keys');

async function getList(req, res) {
    const listData = await clientService.getList(req.body.criteria, req.company.id);

    return res.status(200).json(listData);
}

async function saveGeneralInfo(req, res) {
    const result = await clientService.saveGeneralInfo(
        req.user.company_id,
        req.params.client_id,
        req.body,
        req.user.id
    );
    return res.status(200).json(result);
}

async function save_partial_info(req, res) {
    const result = await clientService.save_partial_info(
        req.user.company_id,
        req.params.client_id,
        snakecaseKeys(req.body),
        req.user.id
    );
    return res.status(200).json(result);
}

async function getGeneralInfo(req, res) {
    const generalInfo = await clientService.getGeneralInfo(req.user.company_id, req.params.client_id);

    return res.status(200).json(generalInfo);
}

async function getContactDetailsByType(req, res) {
    // Types currently include: clients, guardians, emergency, other
    const contactInfo = await clientService.getContactDetailsByType(
        req.user.company_id,
        req.params.client_id,
        req.params.contact_type
    );

    return res.status(200).json(contactInfo);
}

async function saveContactDetails(req, res) {
    let result = null;
    let company_id = req.user.company_id;
    let contact = req.body
    let client_id = contact.client_id
    // Don't duplicate the data, save contact details for the client in the client table, nowhere else
    if (contact.contact_type == 'client' && client_id) {
        result = await clientService.updateClient(company_id, client_id, {
            street_address: contact.street_address,
            street_address2: contact.street_address2,
            city: contact.city,
            state: contact.state,
            zip: contact.zip,
            phone: contact.primary_phone,
            alt_phone: contact.alt_phone
        });
    }

    result = await clientService.saveContactDetails(company_id, contact);

    if (contact.contact_type == 'guardian') {
        // update guardians table, match by email address bm-1090 - afv
        if (contact.email) {
            // check if have email address in guardian_email in guardians table
            // if so, update clients.guardian_id,
            // if not, create guardian, then update clients.guardian_id
            const guardian_id = await clientService.save_guardian(company_id, contact.email, contact);
            if (guardian_id) {
                let update_client = {
                    guardian_id: guardian_id,
                    guardian_relationship_to_client: contact.relationship_to_client,
                    guardian_email: contact.email,
                }
                const happy_client = await clientService.saveGeneralInfo(company_id, client_id, update_client)
                // @todo guardian_email will be eliminated in the future - afv - bm-1090
            }
        }
    }

    return res.status(200).json(result);
}

async function updatePrimaryContact(req, res) {
    const result = await clientService.updatePrimaryContact(
        req.user.company_id,
        req.params.client_id,
        req.body.contact_id
    );

    return res.status(200).json(result);
}

async function deleteContact(req, res) {
    const result = await clientService.deleteContact(req.user.company_id, req.params.contact_id);

    return res.status(200).json(result);
}

async function getContactPermissions(req, res) {
    const generalInfo = await clientService.getContactPermissions(req.user.company_id, req.params.client_id);

    return res.status(200).json(generalInfo);
}

async function saveContactPermissions(req, res) {
    const result = await clientService.saveContactPermissions(
        req.user.company_id,
        req.params.client_id,
        req.body
    );
    return res.status(200).json(result);
}

async function saveMedicalInfo(req, res) {
    const client_id = await clientService.saveMedicalInfo(
        req.user.company_id,
        req.params.client_id,
        req.body.medicalInfo
    );

    return res.status(200).json({
        clientId: client_id
    });
}
async function getMedicalInfo(req, res) {
    const medicalInfo = await clientService.getMedicalInfo(req.user.company_id, req.params.client_id);
    const info = {
        ...medicalInfo,
        prescriptions: JSON.parse(medicalInfo.prescriptions)
    };
    return res.status(200).json(info);
}

async function saveContactAppointmentReminderSettings(req, res) {
    const result = await clientService.saveContactAppointmentReminderSettings(req.user.company_id, req.body);
    return res.status(200).json(result);
}
async function getAppointmentReminderSettings(req, res) {
    const appointmentReminderSettings = await clientService.getAppointmentReminderSettings(
        req.user.company_id,
        req.params.client_id
    );

    return res.status(200).json(appointmentReminderSettings);
}

async function saveReferrerInfo(req, res) {
    const result = await clientService.saveReferrerInfo(req.user.company_id, req.params.client_id, req.body);
    return res.status(200).json(result);
}
async function saveClientMandateInfo(req, res) {
    const result = await clientService.saveClientMandateInfo(req.user.company_id, req.params.client_id, req.body);
    return res.status(200).json(result);
}
async function getReferralInfo(req, res) {
    const referralInfo = await clientService.getReferralInfo(req.user.company_id, req.params.client_id);
    return res.status(200).json(referralInfo);
}

async function getClientMandateInfo(req, res) {
    const referralInfo = await clientService.getClientMandateInfo(req.user.company_id, req.params.client_id);
    return res.status(200).json(referralInfo);
}

async function getInsurancesByClientId(req, res) {
    const { user } = req;
    const clientInsurances = await clientService.getInsurancesByClientId(user.company_id, req.params.client_id);

    return res.status(200).json({ insurances: clientInsurances });
}

async function getClientCounselorsByClientId(req, res) {
    const { user } = req;
    const counselors = await clientService.getClientCounselors(user.company_id, req.params.client_id);
    return res.status(200).json({ counselors: counselors });
}

async function saveCounselors(req, res) {
    const { user } = req;
    const { counselors } = req.body;
    if (!counselors.primary_counselor && (counselors.secondary_counselor || counselors.tertiary_counselor)) {
        throw InternalServerError('Must have a primary counselor');
    }
    if (counselors.primary_counselor && !counselors.secondary_counselor && counselors.tertiary_counselor) {
        throw InternalServerError('Must have a secondary counselor');
    }
    if (!counselors.primary_counselor && !counselors.secondary_counselor && counselors.tertiary_counselor) {
        throw InternalServerError('Must have a primary counselor and secondary counselor');
    }

    console.log(counselors);
    // console.log(req.body);
    let ids = Object.keys(counselors).map((key) => {
        return counselors[key];
    });
    console.log(ids);
    //Now we have the ids that the user actually has access to, also preventing from adding deleted ones etc.
    const getValidUsers = await clientService.getClientCounselors(user.company_id, req.params.client_id, ids);
    console.log(getValidUsers);
    counselors.primary_counselor = getValidUsers.find((user) => user.id == counselors?.primary_counselor)?.id ?? null;
    counselors.secondary_counselor =
        getValidUsers.find((user) => user.id == counselors?.secondary_counselor)?.id ?? null;
    counselors.tertiary_counselor = getValidUsers.find((user) => user.id == counselors?.tertiary_counselor)?.id ?? null;
    console.log(counselors);

    let response = await clientService.saveClientCounselors(user.company_id, req.params.client_id, counselors);
    return res.status(200).json(response);
}

async function getClientAppointmentsByClientId(req, res) {
    const { user } = req;
    const appointments = await clientService.getAppointments(user.company_id, req.params.client_id);
    return res.status(200).json({ appointments: appointments });
}

async function getClientFilesByClientId(req, res) {
    const { user } = req;
    const clientFiles = await clientService.getClientFiles(user.company_id, req.params.client_id);
    return res.status(200).json({ files: clientFiles });
}

async function getSharedFilesByClientId(req, res) {
    const { user } = req;
    const sharedFiles = await clientService.getSharedFiles(user.company_id, req.params.client_id);
    return res.status(200).json({ shared_files: sharedFiles });
}

async function getClientInfo(req, res) {
    const { user } = req;
    const client = await clientService.getClientInfo(user.company_id, req.params.client_id);
    return res.status(200).json(client);
}

async function saveMemo(req, res) {
    const { user } = req;
    let response = await clientService.saveMemo(user.company_id, req.params.client_id, req.body.memo);
    return res.status(200).json(response);
}

//TODO - move to counelors
async function getCounselors(req, res) {
    const { user } = req;
    const counselors = await clientService.getCounselors(user.company_id);
    return res.status(200).json({ counselors: counselors });
}

async function getClientsById(req, res) {
    const { user } = req;
    const { ids } = req.body;
    const clients = await clientService.getClientsById(user.company_id, ids);
    return res.status(200).json(clients);
}

async function createClient(req, res) {
    const company_id = req.user.company_id;
    const { user } = req;

    const response = await clientService.saveGeneralInfo(company_id, 'new', req.body, req.user.id);
    //after client is successfully created add contact information to DB

    //await clientService.
    await clientService.saveContactDetails(company_id, {
        contact_type: 'client',
        primary_phone: req.body.phone,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        relationship_to_client: 'self',
        street_address: req.body.street_address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        client_id: response[0],
        office_id: user.office_id,
        user_id: req.user.id,
        user_id_create: req.user.id
    });
    return res.status(200).json(response);
}

async function updateRecord(req, res) {
    const { user } = req;
    const { client } = req.body;
    //Prevent manipulating fields that may cause unexpected changes
    delete client?.company_id;
    delete client?.office_id;
    delete client?.deleted;
    delete client?.imported_client_db_id;
    delete client?.imported_client_db_field_name;
    delete client?.user_id_create;
    delete client?.dayt_create;
    delete client?.id;
    const response = await clientService.updateClient(user.company_id, req.params.client_id, client);
    return res.status(200).json(response);
}

async function uploadClientLicense(req, res) {
    let { user } = req;
    let file = req.file;
    let { kind, fileId, client } = req.body;
    try {
        client = JSON.parse(req.body.client);
    } catch (e) {
        client = null;
    }
    // if (!fileId || fileId == 'undefined' || fileId == 'null') {
    fileId = await fileService.create({
        file_kind: kind,
        company_id: user.company_id,
        office_id: user.office_id,
        user_id_create: user.id,
        client_id: client?.id ? client.id : 0,
        file_name: file.originalname,
        file_type: mime.extension(file.mimetype)
    });
    // }
    file.originalname = fileId + '.' + mime.extension(file.mimetype);
    let result = await uploadService.uploadFile('files/', file);
    await fileService.updateById(fileId, user.company_id, { s3_link: result.Key });
    //Here we can do a read if we're about to put the license id on a different client
    let clients = await clientService.getList({ filter: { license_id: [String(fileId)] } }, req.company.id);
    if (clients.rows.filter((c) => c.id !== client.id).length > 0) {
        /*don't continue uploading throw error message */

        throw new BadRequestError('Could not upload license');
    }
    const recId = await clientService.updateClient(user.company_id, client?.id ? client.id : 0, { license_id: fileId });

    // const recId = await mainService.saveRecord({logo: fileId}, req.company.id);
    return res.status(200).json({ fileId: fileId, ...recId });
}

async function inviteToPortal(req, res) {
    const companyId = req.company.id;
    const { clientId } = req.body;

    if (!companyId) {
        throw new UnauthorizedError('Unauthorized');
    }

    if (!clientId) {
        throw new BadRequestError('Client ID is required', [{ name: 'client_id', message: 'Client ID is required' }]);
    }

    await clientService.inviteClientToPortal(clientId, companyId);

    return res.status(204).send();
}

async function resetClientPassword(req, res) {
    const companyId = req.company.id;
    const { clientId } = req.body;

    if (!companyId) {
        throw new UnauthorizedError('Unauthorized');
    }

    if (!clientId) {
        throw new BadRequestError('Client ID is required', [{ name: 'clientId', message: 'Client ID is required' }]);
    }

    await clientService.resetClientPassword(clientId, companyId);

    return res.status(204).send();
}

async function getPortalToken(req, res) {
    const companyId = req.company.id;
    const { c: clientId } = req.query;

    if (!companyId) {
        throw new UnauthorizedError('Unauthorized');
    }

    if (!clientId) {
        throw new BadRequestError('Client ID is required', [{ name: 'c', message: 'Client ID is required' }]);
    }

    const link = await clientService.getPortalToken(clientId, companyId);

    return res.status(200).json({ link });
}

async function get_active_clients(req, res) {
    const listData = await clientService.get_active_clients(req.company.id);

    return res.status(200).json(listData);
}

async function checkDeleteClientEligibility(req, res) {
    const { client_id } = req.params;
    const { company_id } = req.user;
    const response = await clientService.checkClientDeleteEligibility(company_id, client_id);
    return res.status(200).json(response);
}

async function deleteClient(req, res) {

    const { user } = req;
    const { client_id } = req.params;
    const response = await clientService.deleteClient(req.company.id, client_id);
    return res.status(200).json(response);
}


module.exports = {
    getList,
    saveGeneralInfo,
    save_partial_info,
    getGeneralInfo,
    saveContactDetails,
    updatePrimaryContact,
    getContactDetailsByType,
    deleteContact,
    getContactPermissions,
    saveContactPermissions,
    saveMedicalInfo,
    getMedicalInfo,
    saveContactAppointmentReminderSettings,
    getAppointmentReminderSettings,
    saveReferrerInfo,
    saveClientMandateInfo,
    getReferralInfo,
    getClientMandateInfo,
    getInsurancesByClientId,
    getClientCounselorsByClientId,
    saveCounselors,
    getClientFilesByClientId,
    getSharedFilesByClientId,
    getClientAppointmentsByClientId,
    getCounselors,
    getClientInfo,
    saveMemo,
    getClientsById,
    updateRecord,
    uploadClientLicense,
    createClient,
    inviteToPortal,
    resetClientPassword,
    getPortalToken,
    get_active_clients,
    checkDeleteClientEligibility,
    deleteClient
};

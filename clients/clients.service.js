const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const clientRepo = require('./clients.repository');
const portalAuthService = require('../portal/auth/auth.service');
const companyService = require('../companies/companies.service');
const emailService = require('../email/email.service');
const { hashPassword } = require('../../util/passwordUtil');
const dayjs = require('../../util/dayjs');
const { NotFoundError } = require('../../util/httpErrors');
const { getClientById } = require('./clients.repository');
const alerter = require('../../util/alerter');
const settingsRepo = require("../settings/settings.repository");

async function getList(criteria, company_id) {
    const listData = await clientRepo.getList(criteria, company_id);
    return listData;
}

async function get_guardian_by_id(company_id, id) {
    const guardian = await clientRepo.get_guardian_by_id(company_id, id)
    return guardian
}

async function save_guardian(company_id, email, info) {
    let guardian_id = 0;
    const guardian = await clientRepo.get_guardian(company_id, email)
    if (guardian.id) {
        guardian_id = guardian.id
        await clientRepo.save_guardian(company_id, email, info, guardian_id)
    } else {
        guardian_id = await clientRepo.save_guardian(company_id, email, info, 0)
    }
    return guardian_id
}

async function saveGeneralInfo(company_id, client_id, generalInfo, user_id = 0) {
    const result = await clientRepo.saveGeneralInfo(company_id, client_id, generalInfo, user_id);
    if ((client_id === 'new' || client_id === 0) && result && result.length && result[0]) {
        let client_id_new = result[0]
        await alerter.new_client_forms2complete(company_id, client_id_new);
    }
    return result
}

async function save_partial_info(company_id, client_id, generalInfo, user_id = 0) {
    delete(generalInfo.email);
    let result = {}
    if (client_id && generalInfo) {
        result = await clientRepo.saveGeneralInfo(company_id, client_id, generalInfo, user_id);
    }
    return result
}

async function getGeneralInfo(company_id, client_id) {
    return await clientRepo.getGeneralInfo(company_id, client_id);
}

async function saveContactDetails(company_id, contactDetails) {
    return clientRepo.saveContactDetails(company_id, contactDetails);
}
async function updatePrimaryContact(company_id, client_id, contact_id) {
    return clientRepo.updatePrimaryContact(company_id, client_id, contact_id);
}
async function getContactDetailsByType(company_id, client_id, type) {
    return await clientRepo.getContactDetailsByType(company_id, client_id, type);
}
async function deleteContact(company_id, contact_id) {
    return await clientRepo.deleteContact(company_id, contact_id);
}

async function getContactPermissions(company_id, client_id) {
    return await clientRepo.getContactPermissions(company_id, client_id);
}

async function saveContactPermissions(company_id, client_id, generalInfo) {
    const result = await clientRepo.saveContactPermissions(company_id, client_id, generalInfo);
    return result
}

async function saveReferrerInfo(company_id, client_id, info) {
    return await clientRepo.saveReferrerInfo(company_id, client_id, info);
}

async function saveClientMandateInfo(company_id, client_id, info) {
    return await clientRepo.saveClientMandateInfo(company_id, client_id, info);
}

async function getReferralInfo(company_id, client_id) {
    return await clientRepo.getReferralInfo(company_id, client_id);
}

async function getClientMandateInfo(company_id, client_id) {
    return await clientRepo.getClientMandateInfo(company_id, client_id);
}

async function saveMedicalInfo(company_id, client_id, medicalInfo) {
    return await clientRepo.saveMedicalInfo(company_id, client_id, medicalInfo);
}

async function getMedicalInfo(company_id, client_id) {
    return await clientRepo.getMedicalInfo(company_id, client_id);
}

async function saveContactAppointmentReminderSettings(company_id, info) {
    return clientRepo.saveContactAppointmentReminderSettings(company_id, info);
}
async function getAppointmentReminderSettings(company_id, client_id) {
    let appointmentReminderSettings = await clientRepo.getAppointmentReminderSettings(company_id, client_id);
    return appointmentReminderSettings;
}

async function getInsurancesByClientId(companyId, clientId) {
    return clientRepo.getInsurancesByClientId(companyId, clientId);
}

async function getClientCounselors(companyId, clientId, ids) {
    if (ids) {
        return clientRepo.getUsersInCounselors(companyId, clientId, ids);
    } else {
        return clientRepo.getClientCounselors(companyId, clientId);
    }
}

//get appointments by id
async function getAppointments(companyId, clientId) {
    return clientRepo.getAppointments(companyId, clientId);
}

//get client files by id
async function getClientFiles(companyId, clientId) {
    return clientRepo.getClientFiles(companyId, clientId);
}

//get the shared files
async function getSharedFiles(companyId, clientId) {
    return clientRepo.getSharedFiles(companyId, clientId);
}

async function auth_get_client_info(company_id, client_id) {
    return clientRepo.auth_get_client_info(company_id, client_id);
}

async function getClientInfo(companyId, clientId) {
    return clientRepo.getClientInfo(companyId, clientId);
}

async function getCounselors(companyId) {
    return clientRepo.getCounselors(companyId);
}

async function saveClientCounselors(companyId, clientId, counselors) {
    return clientRepo.saveClientCounselors(companyId, clientId, counselors);
}

async function saveMemo(companyId, clientId, memo) {
    return clientRepo.saveMemo(companyId, clientId, memo);
}

async function getClientsById(companyId, ids) {
    return clientRepo.getClientsById(companyId, ids);
}

/**
 * The general update function for clients
 *
 * @param {String} company_id
 */
async function updateClient(companyId, clientId, clientInfo) {
    return clientRepo.updateClient(companyId, clientId, clientInfo);
}

async function inviteClientToPortal(clientId, companyId) {
    // 1. Get client by ID where client.company_id === req.company.id
    // 2. Update client record with random password, password update token, password update token exp date
    //    and set has_portal_acct to true
    // 3. Send welcome email to client with link to portal's update password page
    // 4. Client updates password and can use portal forthwith
    const password = await hashPassword(crypto.randomBytes(12).toString('base64'));

    const linkExpires = await settingsRepo.getSetting( 'days_link_account_creation_expires', 'company', null , companyId);

    const token = await portalAuthService.savePasswordResetToken(clientId, companyId, linkExpires.value*24);

    await updateClient(companyId, clientId, {
        password,
        has_portal_acct: true
    });

    await emailClientPortalInvite(clientId, companyId, token);
}

async function emailClientPortalInvite(clientId, companyId, token) {
    const client = await clientRepo.getClientById(clientId, companyId);
    const company = await companyService.getCompanyById(companyId);

    if (!client || !company) {
        throw new NotFoundError('Could not find client');
    }

    let email_address = client.email;
    if (client.guardian_email) {
        email_address = client.guardian_email;
    }

    const link = portalAuthService.getResetPasswordLink(token, companyId, 'welcome');
    let html = fs.readFileSync(path.resolve(__dirname, 'portalWelcome.html')).toString();
    html = html.replace('{{ fullName }}', `${client.first_name} ${client.last_name}`);
    html = html.replace('{{ companyName }}', company.company_name);
    html = html.replace('{{ link }}', link);

    const email = emailService.compileEmail(
        {
            to: email_address,
            subject: `Welcome to ${company.company_name}!`,
            html
        },
        []
    );

    await emailService.sendEmail(email, company.company_name);
}

async function resetClientPassword(clientId, companyId) {
    const token = await portalAuthService.savePasswordResetToken(clientId, companyId);
    await portalAuthService.emailTokenLink(clientId, companyId, token);
}

async function getPortalToken(clientId, companyId) {
    const client = await getClientById(clientId, companyId);

    if (!client) {
        throw new NotFoundError('Could not find client');
    }

    const linkExpires = await settingsRepo.getSetting( 'days_link_account_creation_expires', 'company', null , companyId);

    const tokenExp = dayjs
        .utc()
        .add(linkExpires.value*24, 'hours')
        .toDate();
    const token = portalAuthService.encryptResetToken(
        JSON.stringify({
            id: clientId,
            exp: tokenExp
        })
    );

    return portalAuthService.getTokenSignInLink(token, companyId);
}

async function getClientMetadata(clientId, companyId) {
    const [client] = await clientRepo.getClientInfo(companyId, clientId);

    if (!client) {
        return null;
    }

    return {
        clientName: `${client.first_name} ${client.last_name}`,
        clientStreet: client.street_address,
        clientCityStateZip:
            `${client.city ? client.city + ', ' : ''}${client.state ? client.state + ' ' : ''}${client.zip ? client.zip : ''}`
    };
}

async function getPrimaryCounselorId(clientId, companyId) {
    return clientRepo.getPrimaryCounselorId(clientId, companyId);
}

async function get_active_clients(company_id) {
    const listData = await clientRepo.get_active_clients(company_id);
    return listData;
}

async function getClientsByEmail(emails, companyId) {
    const clients = await clientRepo.getClientsByEmail(emails, companyId);
    return clients;
}

async function checkClientDeleteEligibility(clientId, companyId){
    return clientRepo.checkClientDeleteEligibility(clientId, companyId);
}

async function deleteClient(companyId, clientId) {
    return clientRepo.deleteClient(companyId, clientId);
}

module.exports = {
    getList,
    get_guardian_by_id,
    save_guardian,
    saveGeneralInfo,
    save_partial_info,
    getGeneralInfo,
    saveContactDetails,
    updatePrimaryContact,
    deleteContact,
    getContactPermissions,
    saveContactPermissions,
    getContactDetailsByType,
    saveReferrerInfo,
    saveClientMandateInfo,
    getReferralInfo,
    getClientMandateInfo,
    saveMedicalInfo,
    getMedicalInfo,
    saveContactAppointmentReminderSettings,
    getAppointmentReminderSettings,
    getInsurancesByClientId,
    getClientCounselors,
    getAppointments,
    getClientFiles,
    getSharedFiles,
    auth_get_client_info,
    getClientInfo,
    getCounselors,
    saveClientCounselors,
    saveMemo,
    getClientsById,
    updateClient,
    inviteClientToPortal,
    resetClientPassword,
    getPortalToken,
    getClientMetadata,
    getPrimaryCounselorId,
    get_active_clients,
    getClientsByEmail,
    checkClientDeleteEligibility,
    deleteClient
};

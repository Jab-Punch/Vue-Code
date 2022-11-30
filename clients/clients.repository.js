const { getBuilder, execute, makeAssociative, mainDb } = require('../../config/database');
const { apply_criteria, get_count, get_schema } = require('../../util/criteria.js');
const workflows = require('../../util/workflows.js');
const { HttpError, InternalServerError } = require('../../util/httpErrors');
const MainDbTable = 'clients';
const client_balance_acct_number = 4;

function getCurrency(amount) {
    amount = amount / 100;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(amount);
}

async function get_client_credits(company_id) {
    const builder = getBuilder('ledger', company_id)
        .where('to_acct_id', client_balance_acct_number)
        .select('client_id')
        .sum('amount as total')
        .groupBy('client_id');
    const data = await execute(builder);
    return makeAssociative('client_id', data);
}

async function get_client_owes(company_id) {
    const builder = getBuilder('ledger', company_id)
        .where('from_acct_id', client_balance_acct_number)
        .select('client_id')
        .sum('amount as total')
        .groupBy('client_id');
    const data = await execute(builder);
    for (let k in data) {
        data[k]['total'] = -data[k]['total'];
    }
    return makeAssociative('client_id', data);
}

async function get_client_guardian_email(company_id) {
    const builder = getBuilder('clients', company_id)
        .select('id')
        .select('guardian_email')
    const data = await execute(builder);
    return makeAssociative('id', data);
}

async function getList(criteria, company_id) {
    let schema = {};
    const select_cols = [
        'clients.id',
        'clients.first_name',
        'clients.last_name',
        'clients.status',
        'clients.email',
        'users.first_name as counselor',
        'clients.active as client_balance',
        'clients.dob',
        // wth is "Services Assigned" ? service codes from tx plan? latest tx plan?
        'settings_data.value as tags',
        'clients.guardian_email',

    ];
    if (criteria && criteria.search) {
        schema = await get_schema(MainDbTable, select_cols);
    }
    const builder = apply_criteria(criteria, schema, MainDbTable, company_id);
    builder
        .leftJoin('users', 'clients.primary_counselor', 'users.id')
        .whereRaw('IFNULL(users.company_id, ?) = ?', [company_id, company_id])
        .leftJoin(
            mainDb('settings_data')
                .where('company_id', company_id)
                .where('deleted', 0)
                .where('settings_id', 88)
                .where('level', 'client')
                .as('settings_data'),
            'settings_data.client_id',
            'clients.id'
        )
        .joinRaw('left join (select client_id, sum(amount) as total from ledger where from_acct_id = ? and ledger.company_id = ? and ledger.deleted = 0 group by client_id) as client_owes on client_owes.client_id = clients.id',[client_balance_acct_number, company_id])
        .joinRaw('left join (select client_id, sum(amount) as total from ledger where to_acct_id = ? and ledger.company_id = ? and ledger.deleted = 0 group by client_id) as client_credits on client_credits.client_id = clients.id',[client_balance_acct_number, company_id])
        //.select(select_cols)
        .select(
            'clients.id',
            'clients.first_name',
            'clients.last_name',
            'clients.status',
            'users.first_name as counselor',
            'clients.dob',
            'settings_data.value as tags',)
        .select(mainDb.raw('if(IFNULL(clients.guardian_email, "") = "", clients.email, clients.guardian_email) as email'))
        .select(mainDb.raw('((IFNULL(client_owes.total, 0) * -1) - IFNULL(client_credits.total, 0)) as client_balance'))
        .groupBy('clients.id');
    /*
    to get sort by balance working,
    conert this sql to stupid knex :
    SELECT clients.id, clients.first_name, SUM(ledger.amount ) / -100 AS balance
    FROM clients LEFT JOIN ledger ON ledger.client_id = clients.id
    WHERE clients.company_id =1 AND clients.deleted = 0
      AND
      ledger.company_id =1 AND ledger.deleted = 0
      AND (ledger.from_acct_id = 4 -- owes
          OR ledger.to_acct_id = 4 -- credit
          )
      GROUP BY clients.id
     */
    const data = await execute(builder);
    const total_count = await get_count(criteria, schema, MainDbTable, company_id, builder);
    /*let client_id, credits, owes, credit, owe, guardians;
    credits = await get_client_credits(company_id);
    owes = await get_client_owes(company_id);
    guardians = await get_client_guardian_email(company_id);
    data.forEach((v, k) => {
        client_id = data[k]['id'];
        credit = credits[client_id] ? credits[client_id].total : 0;
        owe = owes[client_id] ? owes[client_id].total : 0;
        data[k]['client_balance'] = (owe - credit);
        //Replace email of client to guardian's if that client is a dependent
        if (guardians[client_id].guardian_email) {
            data[k]['email'] = guardians[client_id].guardian_email;
        }
    });*/
    let result = {
        total_count: total_count,
        rows: data
    };
    return result;
}

async function save_guardian(company_id, email, info, guardian_id) {
    let guardian  = {
        first_name : info.first_name,
        last_name : info.last_name,
    }
    let builder, result
    if (guardian_id == 0) {
        guardian.company_id = company_id;
        guardian.email = email;
        builder = getBuilder('guardians', company_id, {isInsert: true});
        builder.insert(guardian);
        result = await execute(builder);
        if (result && result.length) {
            guardian_id = result[0]
        }
    } else {
        builder = getBuilder('guardians', company_id);
        builder.update(guardian).where('id', guardian_id);
        result = await execute(builder);
    }

    return guardian_id
}

async function get_guardian(company_id, email) {
    let guardian = {id:0};
    const builder = getBuilder('guardians', company_id);
    builder
        .where('email', email)
    const result = await execute(builder);
    if (result && result.length) {
        guardian = result[0]
    }
    return guardian
}

async function get_guardian_by_id(company_id, id) {
    let guardian = {id:id};
    const builder = getBuilder('guardians', company_id);
    builder
        .where('id', id)
    const result = await execute(builder);
    if (result && result.length) {
        guardian = result[0]
    }
    return guardian
}

async function saveGeneralInfo(company_id, client_id, info, user_id = 0) {
    let builder;
    info.company_id = company_id;
    let client_id_new = 0
    try {
        if (client_id === 'new' || client_id === 0) {
            delete info.id;
            builder = getBuilder('clients', company_id, {isInsert: true});
            builder.insert(info);
        } else {
            builder = getBuilder('clients', company_id);
            builder.update(info).where('id', client_id);
        }
        let result = await execute(builder);

        let table = 'clients';
        if ((client_id === 'new' || client_id === 0) && result[0]) {
            client_id_new = result[0]
            if (info.primary_counselor) {
                user_id = info.primary_counselor
            }
            await workflows.trigger('new_client', client_id_new, table, user_id, company_id);
        } else {
            await workflows.trigger('update_client', result[0], table, user_id, company_id);
        }

        return result;
    } catch (err) {
        if (err.message.toLowerCase().includes('duplicate')) {
            throw new HttpError(409, 'Conflict', 'Duplicate record found');
        } else {
            throw err;
        }
    }
}

async function getGeneralInfo(company_id, client_id) {
    const builder = getBuilder('clients', company_id);

    builder
        .where('id', client_id)
        .select(
            'id',
            'status',
            'dob',
            'first_name as firstName',
            'middle_name as middleName',
            'last_name as lastName',
            'preferred_name as preferredName',
            'gender',
            'identified_gender as identifiedGender',
            'race',
            'marital_status as maritalStatus',
            'employment_status as employmentStatus',
            'means_of_income as meansOfIncome',
            'email',
            'phone',
            'alt_phone as altPhone',
            'street_address',
            'street_address2',
            'street_address as streetAddress',
            'street_address2 as streetAddress2',
            'city',
            'state',
            'zip',
            'external_id as externalId',
            'financial_class',
            'guardian_email',
            'guardian_id',
            'guardian_relationship_to_client',
            'primary_counselor',
            'drivers_license_number as driversLicenseNumber',
            'preferred_language as preferredLanguage',
            'religion',
            'education',
            'annual_income_dollars as annualIncomeDollars',
            'disability',
            'veteran_status as veteranStatus',
            'contact_methods',
            'portal_data',
        );

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    return result;
}

async function updatePrimaryContact(company_id, client_id, contact_id) {
    const builder = getBuilder('clients', company_id);

    builder.where('id', client_id).update('primary_contact_id', contact_id);

    const result = await execute(builder);

    return result;
}

async function saveContactDetails(company_id, contactDetails) {
    const builder = getBuilder('contacts', company_id, {isInsert: true});

    contactDetails.company_id = company_id;

    builder
        .insert(contactDetails)
        .onConflict()
        .merge();

    return execute(builder);
}

async function getContactDetailsByType(company_id, client_id, type) {
    let table = 'contacts';
    if (type === 'client') {
        table = 'clients';
    }
    const builder = getBuilder(table, company_id);

    if (type === 'client') {
        builder
            .where('id', client_id)
            .select(
                'id',
                'phone as primaryPhone',
                'alt_phone as altPhone',
                'first_name as firstName',
                'last_name as lastName',
                'email as email',
                'street_address as streetAddress',
                'street_address2 as streetAddress2', // seriously? snake -> camel can be calculated and does not need to be typed in
                'city as city',
                'state as state',
                'zip as zip'
            )
            .select(mainDb.raw('"self" as relationshipToClient'));
    } else {
        builder
            .where('client_id', client_id)
            .where('contact_type', type)
            .select(
                'id',
                'primary_phone as primaryPhone',
                'alt_phone as altPhone',
                'first_name as firstName',
                'last_name as lastName',
                'email as email',
                'street_address as streetAddress',
                'street_address2 as streetAddress2',
                'city as city',
                'state as state',
                'zip as zip',
                'relationship_to_client as relationshipToClient'
            );
    }

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    //console.log(result);

    return result;
}

async function deleteContact(company_id, contact_id) {
    const builder = getBuilder('contacts', company_id);

    builder.where('id', contact_id).update('deleted', 1);

    return await execute(builder);
}

async function getContactPermissions(company_id, client_id) {
    const builder = getBuilder('clients', company_id);

    builder
        .where('id', client_id)
        .select(
            'contact_methods',
            'email',
            'id',
            'portal_data'
        );

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    result[0].contact_methods = JSON.parse(result[0].contact_methods);

    return result;
}

async function saveContactPermissions(company_id, client_id, info) {
    if (info) {
        stringy = JSON.stringify(info);
        info = stringy;
    }

    const builder = getBuilder('clients', company_id);

    builder.where('id', client_id).update('contact_methods', info);

    return await execute(builder);
}

async function saveClientMandateInfo(company_id, client_id, info) {
    const builder = getBuilder('clients', company_id);

    builder.where('id', client_id).update(info);

    return await execute(builder);
}

async function saveReferrerInfo(company_id, client_id, info) {
    const builder = getBuilder('clients', company_id);
    builder.where('id', client_id).update(info);
    return await execute(builder);
}

async function getReferralInfo(company_id, client_id) {
    const builder = getBuilder('clients', company_id);

    builder
        .select(
            `referrals.id`,
            `referrals.name`,
            `referrals.employer`,
            `referrals.phone`,
            `referrals.email`,
            `referrals.referring_provider_npi`
        )
        .joinRaw('left join referrals on (clients.referral_id = referrals.id and referrals.deleted = 0)')
        .where('clients.id', client_id);

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    return result;
}

async function getClientMandateInfo(company_id, client_id) {
    const builder = getBuilder('clients', company_id);

    builder
        .select(
            `clients.is_mandated as isMandated`,
            `clients.case_number as caseNumber`,
            `clients.division_judge as divisionJudge`,
            `clients.next_court_date as nextCourtDate`
        )
        .where('clients.id', client_id);

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    return result;
}

async function saveMedicalInfo(company_id, client_id, info) {
    const builder = getBuilder('clients', company_id);

    builder.where('id', client_id).update(info);

    return await execute(builder);
}

async function getMedicalInfo(company_id, client_id) {
    const builder = getBuilder('clients', company_id);

    builder.where('id', client_id).select('allergies', 'prescriptions');

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    //console.log(result);

    return result[0];
}

async function saveContactAppointmentReminderSettings(company_id, info) {
    const builder = getBuilder('contacts', company_id, {isInsert: true});

    info.company_id = company_id;

    builder
        .insert(info)
        .onConflict()
        .merge();

    const result = await execute(builder);

    return result;
}
async function getAppointmentReminderSettings(company_id, client_id) {
    const builder = getBuilder('contacts', company_id);

    builder
        .where('client_id', client_id)
        .whereIn('contact_type', ['guardian', 'client', 'other_email', 'other_voicemail'])
        .select(
            'id',
            'contact_type as contactType',
            'send_email_reminders as sendEmailReminders',
            'send_voicemail_reminders as sendVoicemailReminders',
            'email',
            'primary_phone as primaryPhone',
            'relationship_to_client as relationshipToClient',
            'first_name as firstName',
            'last_name as lastName'
        );

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    //console.log(result);

    return result;
}

/**
 *
 * @param {number} id
 * @param {number} customerId
 * @param {number} locationId
 * @returns {Promise<InsuranceCard>}
 *
 * Grab the insurance cards along with the verification of eligiliby and benefits
 * insurance_verifications
 */
async function getInsurancesByClientId(company_id, client_id) {
    const builder = getBuilder('insurance_cards', company_id);
    builder
        .select(
            'insurance_cards.*',
            'insurance_cards.id as cardId',
            'insurance_cards.insurance_payers_vob_id as card_insurance_payers_vob_id',
            'insurance_verifications.*',
            'insurance_verifications.id as veriId'
        )
        .leftJoin('insurance_verifications', 'insurance_verifications.insurance_cards_id', 'insurance_cards.id')
        // @todo make left join probably
        // .join('insurance_verifications', 'insurance_cards.id','insurance_verifications.insurance_cards_id')
        .where('insurance_cards.client_id', client_id)
        .whereRaw('IFNULL(insurance_verifications.company_id, ?) = ?', [company_id, company_id])
        .whereRaw('IFNULL(insurance_verifications.deleted, 0) = 0');

    const insurances = await execute(builder);
    return insurances;
}

/**
 * Get the services
 */

async function getClientCounselors(company_id, client_id) {
    const builder = getBuilder('users', company_id);
    builder
        .select(
            'users.id',
            'users.first_name',
            'users.last_name',
            'users.provider_type',
            'clients.primary_counselor',
            'clients.secondary_counselor',
            'clients.tertiary_counselor'
        )
        .join('clients', 'users.id', '=', 'clients.primary_counselor')
        .where('clients.id', client_id)
        .union((qb) => {
            console.log(client_id);
            qb.from('users')
                .select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.provider_type',
                    'clients.primary_counselor',
                    'clients.secondary_counselor',
                    'clients.tertiary_counselor'
                )
                .join('clients', 'users.id', '=', 'clients.secondary_counselor')
                .where('clients.id', client_id);
        })
        .union((qb) => {
            qb.from('users')
                .select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.provider_type',
                    'clients.primary_counselor',
                    'clients.secondary_counselor',
                    'clients.tertiary_counselor'
                )
                .join('clients', 'users.id', '=', 'clients.tertiary_counselor')
                .where('clients.id', client_id);
        });

    let clientCounselorsResult = await execute(builder);
    const clientCounselors = { primary_counselor: null, secondary_counselor: null, tertiary_counselor: null };
    for (const counselor of clientCounselorsResult) {
        if (counselor.primary_counselor == counselor.id) {
            clientCounselors.primary_counselor = counselor;
        }
        if (counselor.secondary_counselor == counselor.id) {
            clientCounselors.secondary_counselor = counselor;
        }
        if (counselor.tertiary_counselor == counselor.id) {
            clientCounselors.tertiary_counselor = counselor;
        }
    }
    return clientCounselors;
}

//TODO - move to counselors
async function getCounselors(company_id) {
    const builder = getBuilder('users', company_id);
    builder.select('users.id', 'users.first_name', 'users.last_name', 'users.provider_type');
    //  .where('type', 'counselor')
    return execute(builder);
}

//TODO - move to counselors
async function getUsersInCounselors(company_id, client_id, ids) {
    const builder = getBuilder('users', company_id);
    console.log('made it here');
    console.log(ids);
    builder.select('users.id', 'users.first_name', 'users.last_name', 'users.provider_type').whereIn('id', ids);
    return execute(builder);
}

async function update_alerts(company_id, client_id, counselors) {
    if (counselors.primary_counselor) {
        const builder = getBuilder('alerts', company_id)
        builder
            .update({
                user_id: counselors.primary_counselor
            })
            .where('client_id', client_id)
            .whereIn('alert_type', ['missing_document', 'client_action', 'outstanding_balance'])
        let result = await execute(builder);
    }
    return
}

async function saveClientCounselors(company_id, client_id, counselors) {
    const builder = getBuilder('clients', company_id);

    builder
        .update({
            primary_counselor: counselors.primary_counselor,
            secondary_counselor: counselors.secondary_counselor,
            tertiary_counselor: counselors.tertiary_counselor
        })
        .where('id', client_id);
    let result = await execute(builder);

    await update_alerts(company_id, client_id, counselors);

    return result;
}

async function saveMemo(company_id, client_id, memo) {
    const builder = getBuilder('clients', company_id);

    builder
        .update({
            memo: memo
        })
        .where('id', client_id);
    return execute(builder);
}

//get appointments by id
async function getAppointments(company_id, client_id) {
    const builder = getBuilder('appts', company_id);

    builder.where('client_id', client_id);

    return execute(builder);
}

//get client files by id
async function getClientFiles(company_id, client_id) {
    const builder = getBuilder('files', company_id);

    builder.where('client_id', client_id);

    return execute(builder);
}

//get the shared files
async function getSharedFiles(company_id, client_id) {
    const builder = getBuilder('files', company_id);

    builder.where('client_id', client_id).where('shared_to_portal', 1);
    return execute(builder);
}

async function auth_get_client_info(company_id, client_id) {
    const builder = getBuilder('clients', company_id);
    builder.where('id', client_id);
    return execute(builder);
}

async function getClientInfo(companyId, clientId) {
    const builder = getBuilder('clients', companyId);
    builder
        .select (
    'id',
    'company_id',
    'office_id',
    'dayt_create',
    'user_id_create',
    'dayt_mod',
    'user_id_mod',
    'active',
    'first_name',
    'middle_name',
    'last_name',
    'preferred_name',
    'email',
    'guardian_email',
    'tags',
    'gender',
    'identified_gender',
    'status',
    'episodes',
    'default_payment_method_id',
    'auto_pay',
    'allergies',
    'prescriptions',
    'medical_other',
    'race',
    'marital_status',
    'employment_status',
    'means_of_income',
    'is_mandated',
    'case_number',
    'division_judge',
    'next_court_date',
    'primary_contact_id',
    'primary_counselor',
    'secondary_counselor',
    'tertiary_counselor',
    'memo',
    'license_id',
    'street_address',
    'city',
    'state',
    'zip',
    'phone',
    'alt_phone',
    'has_portal_acct',
    'referral_id',
    'financial_class',
    'external_id',
    'street_address2',
    'tym_last_failed',
    'login_locked',
    'login_fails'
        )
    .select(mainDb.raw('DATE_ADD(dob, INTERVAL 719 MINUTE ) as dob'))
    .where('id', clientId);

    return execute(builder);
}

async function getClientsById(company_id, ids) {
    console.log(ids);
    const builder = getBuilder('clients', company_id);
    builder.whereIn('id', ids);
    return execute(builder);
}

async function updateClient(company_id, client_id, clientInfo) {
    const builder = getBuilder('clients', company_id);
    builder.update({ ...clientInfo }).where('id', client_id);
    return execute(builder);
}

async function getClientById(clientId, companyId) {
    const builder = getBuilder('clients', companyId).where('id', clientId);

    const [client] = await execute(builder);

    if (!client) {
        return null;
    }

    return client;
}

async function getPrimaryCounselorId(clientId, companyId) {
    const builder = getBuilder('clients', companyId).where('id', clientId);
    const [res] = await execute(builder);
    return res?.primary_counselor || 0;
}

async function get_active_clients(company_id) {
    const builder = getBuilder(MainDbTable, company_id);

    builder
        .select('clients.id')
        .select(mainDb.raw('CONCAT_WS(" ", clients.first_name, clients.last_name) AS name'))
        .whereIn('status', ['Active', 'Lead', 'Intake', 'active'])
        .orderBy('clients.first_name', 'asc')
        .orderBy('clients.last_name', 'asc');

    const result = await execute(builder);

    return result;
}

async function getClientsByEmail(emails, companyId) {
    const builder = getBuilder('clients', companyId);
    builder.whereIn('email', emails);
    const result = await execute(builder);
    return result;
}


async function checkClientDeleteEligibility(companyId, clientId) {
    //Deleting a client means a bunch of things need to occur.
    //1. One a check needs to happen if a client is eligible for deletion.
    //1a. If the client has any appointments, they cannot be deleted.
    const appts = getBuilder('appts', companyId)
    appts.where('client_id', clientId);
    const apptsResult = await execute(appts);
    if (apptsResult.length > 0) {
        throw new HttpError(500, 'Appointments found','Client has appointments and cannot be deleted.');
    }
    //1b. If the client has any payments, they cannot be deleted.
    const payments = getBuilder('payments', companyId).where('client_id', clientId);
    const paymentsResult = await execute(payments);
    if (paymentsResult.length > 0) {
        throw new HttpError(500, 'Payments found','Client has payments and cannot be deleted.');
    }
    //1c. If the client has any files, they cannot be deleted.
    const files = getBuilder('files', companyId).where('client_id', clientId);
    //where file_kind is not 'client_license' and not 'insurance'
    files.whereNotIn('file_kind', ['client_license', 'insurance']);
    const filesResult = await execute(files);
    if (filesResult.length > 0) {
        throw new HttpError(500, 'Files found','Client has files and cannot be deleted.');
    }
    //1d. If the client has any notes, they cannot be deleted.
    const notes =  getBuilder('notes', companyId).where('client_id', clientId);
    const notesResult = await execute(notes);
    if (notesResult.length > 0) {
        throw new HttpError(500, 'Notes found','Client has notes and cannot be deleted.');
    }
    //1g. If the client has any claims, they cannot be deleted.
    const insuranceClaims =  getBuilder('insurance_claims', companyId).where('client_id', clientId);
    const insuranceClaimsResult = await execute(insuranceClaims);
    if (insuranceClaimsResult.length > 0) {
        throw new HttpError(500, 'Insurance claims found','Client has insurance claims and cannot be deleted.');
    }
    //1i. If the client has any insurance events, they cannot be deleted.
    const insuranceEvents =  getBuilder('insurance_events', companyId).where('client_id', clientId);
    const insuranceEventsResult = await execute(insuranceEvents);
    if (insuranceEventsResult.length > 0) {
        throw new HttpError(500, 'Insurance events found','Client has insurance events and cannot be deleted.');
    }

    //1k. If the client has any invoices, they cannot be deleted.
    const invoices =  getBuilder('invoices', companyId).where('client_id', clientId);
    const invoicesResult = await execute(invoices);
    if (invoicesResult.length > 0) {
        throw new HttpError(500, 'Invoices found','Client has invoices and cannot be deleted.');
    }
    //1l. If the client has any ledger entries, they cannot be deleted.
    const ledgerEntries =  getBuilder('ledger', companyId).where('client_id', clientId);
    const ledgerEntriesResult = await execute(ledgerEntries);
    if (ledgerEntriesResult.length > 0) {
        throw new HttpError(500, 'Ledger entries found','Client has ledger entries and cannot be deleted.');
    }

    //1j. If the client has any form data, they cannot be deleted.
    const formData =  getBuilder('form_data', companyId).where('client_id', clientId);
    const formDataResult = await execute(formData);
    if (formDataResult.length > 0) {
        throw new HttpError(500, 'Form data found','Client has form data and cannot be deleted.');
    }

    //1m. If the client has any emails with a user_id that is not null or has any emails with a client_id that is not null, they cannot be deleted.
    const emails =  getBuilder('emails', companyId).where('client_id', clientId).whereNotNull('user_id_create');
    const emailsResult = await execute(emails);
    if (emailsResult.length > 0) {
        throw new HttpError(500, 'Emails found','Client has emails that are not auto-generated and cannot be deleted.');
    }



    return true;
}


async function deleteClient(companyId, clientId) {
        await checkClientDeleteEligibility(companyId, clientId);
        //2.
        // 2b. If the client is eligible for deletion, then all the client's insurance data needs to be deleted.
            //soft delete
            const insurance = getBuilder('insurance_cards', companyId).where('client_id', clientId).update({ deleted: 1 });
            await execute(insurance);
        //2c. If the client is eligible for deletion, then all the client's insurance verification data needs to be deleted.
            //soft delete
            const insuranceVerification = getBuilder('insurance_verifications', companyId).where('client_id', clientId).update({ deleted: 1 });
            await execute(insuranceVerification);
        // 2g. If the client is eligible for deletion, then all the client's alerts data needs to be deleted.
            //soft delete
            const alerts = getBuilder('alerts', companyId).where('client_id', clientId).update({ deleted: 1 });
            await execute(alerts);
        // 2h. If the client is eligible for deletion, then all the client's contacts data needs to be deleted.
            //soft delete
            const contacts = getBuilder('contacts', companyId).where('client_id', clientId).update({ deleted: 1 });
            await execute(contacts);
        // 2i. If the client is eligible for deletion, then the client data needs to be deleted.
            //soft delete
            const clients = getBuilder('clients', companyId).where('id', clientId).update({ deleted: 1 });
            await execute(clients);
        // 2j. If the client is eligible for deletion, then all the client's files and file_kind data = 'insurance' and 'license' needs to be deleted.
            //soft delete
            const files = getBuilder('files', companyId).where('client_id', clientId).whereIn('file_kind', ['insurance', 'client_license']).update({ deleted: 1 });
            await execute(files);
        // 2k. If the client is eligible for deletion, then all the client's prescriptions data needs to be deleted.

}

module.exports = {
    getList,
    save_guardian,
    get_guardian,
    get_guardian_by_id,
    saveGeneralInfo,
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
    getSharedFiles,
    getClientFiles,
    getAppointments,
    getClientCounselors,
    auth_get_client_info,
    getClientInfo,
    getCounselors,
    getUsersInCounselors,
    saveClientCounselors,
    saveMemo,
    getClientsById,
    updateClient,
    getClientById,
    get_client_credits,
    get_client_owes,
    getPrimaryCounselorId,
    get_active_clients,
    getClientsByEmail,
    deleteClient,
    checkClientDeleteEligibility
};

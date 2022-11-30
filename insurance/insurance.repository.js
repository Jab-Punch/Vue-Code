const { getBuilder, execute, mainDb } = require('../../config/database');
const { get_schema, apply_criteria, get_count, date_ranger, date2normal } = require('../../util/criteria.js');
const settingsRepo = require('../settings/settings.repository');
const axios = require('axios');
const { merge } = require('lodash');
const formatCurrency = require('../../util/formatCurrency');
const { getUsStateAbbreviation } = require('../../util/getUsState');
const dayjs = require('dayjs');
const invoiceService = require('../invoices/invoices.service');
const { BadRequestError } = require('../../util/httpErrors');

async function createInsurance(user_id, client_id, company_id, insurance) {
    const cardBuilder = getBuilder('insurance_cards', company_id, { isInsert: true });

    cardBuilder.insert({
        ...insurance,
        company_id: company_id,
        client_id: client_id,
        user_id_create: user_id,
    });
    const [cardId] = await execute(cardBuilder);
    return { cardId: cardId, veriId: null };
    // insurance_verification.start_date_auth =
    //     dayjs.utc(insurance_verification?.start_date_auth).format('YYYY-MM-DD HH:mm:ss') ?? null;
    // insurance_verification.end_date_auth =
    //     dayjs.utc(insurance_verification?.end_date_auth).format('YYYY-MM-DD HH:mm:ss') ?? null;
    // insurance_verification.start_date_policy =
    //     dayjs.utc(insurance_verification?.start_date_policy).format('YYYY-MM-DD HH:mm:ss') ?? null;
    // insurance_verification.end_date_policy =
    //     dayjs.utc(insurance_verification?.end_date_policy).format('YYYY-MM-DD HH:mm:ss') ?? null;
    // //Temporary until I can get more details for the next ticket.
    // insurance.primary_insurance_card = 1;
    // const veriBuilder = getBuilder('insurance_verifications', company_id, true).insert({
    //     company_id: company_id,
    //     user_id_create: user_id,
    //     client_id: client_id,
    //     insurance_cards_id: cardId,
    //     ...insurance_verification
    // });
    // const [veriId] = await execute(veriBuilder);
    //
    // return { cardId: cardId, veriId: veriId };
}

//WIP
async function createInsuranceVerification(user_id, client_id, company_id, insurance, insurance_verification) {}

//WIP
async function updateInsuranceVerification(
    company_id,
    insurance_card_id,
    insurance,
    insurance_verification,
    insurance_veri_id
) {}

async function updateInsuranceDetailsByID(
    company_id,
    insurance_card_id,
    insurance,
    insurance_verification,
    insurance_veri_id,
    whichSave,
    user_id,
    client_id
) {
    if (whichSave === 'insurance_card') {
        const cardBuilder = getBuilder('insurance_cards', company_id);

        cardBuilder
            .update({
                insurance_type: insurance.insurance_type,
                insurance_payers_id: insurance.insurance_payers_id,
                insurance_payers_vob_id: insurance.insurance_payers_vob_id,
                plan_type: insurance.plan_type,
                group_id: insurance.group_id,
                member_id: insurance.member_id,
                name_insured: insurance.name_insured,
                relationship: insurance.relationship,
                dob_insured: insurance.dob_insured,
                card_front_file_id: insurance.card_front_file_id,
                more_info: insurance.info,
            })
            .where('id', insurance_card_id);

        await execute(cardBuilder);
    }
    // if(whichSave == 'insurance_verification' &&){
    //
    // }
    if (whichSave === 'insurance_coverage' && insurance_veri_id) {
        const veriBuilder = getBuilder('insurance_verifications', company_id)
            .update({
                co_pay: insurance_verification.co_pay,
                co_insurance: insurance_verification.co_insurance,
                is_provide_in_network: insurance_verification.is_provide_in_network,
                out_of_network_benefits: insurance_verification.out_of_network_benefits,
                preauth_require: insurance_verification.preauth_require,
            })
            .where('id', insurance_veri_id);
        await execute(veriBuilder);
    } else if (whichSave === 'insurance_coverage' && !insurance_veri_id) {
        const veriBuilder = getBuilder('insurance_verifications', company_id, { isInsert: true }).insert({
            co_pay: insurance_verification.co_pay,
            co_insurance: insurance_verification.co_insurance,
            is_provide_in_network: insurance_verification.is_provide_in_network,
            out_of_network_benefits: insurance_verification.out_of_network_benefits,
            preauth_require: insurance_verification.preauth_require,
            company_id: company_id,
            user_id_create: user_id,
            client_id: client_id,
            insurance_cards_id: insurance_card_id,
        });
        const [veriId] = await execute(veriBuilder);
        return { cardId: insurance_card_id, veriId: veriId };
    }
    if (whichSave === 'insurance_verification' && insurance_veri_id) {
        insurance_verification.start_date_auth = insurance_verification?.start_date_auth
            ? dayjs.utc(insurance_verification?.start_date_auth).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.end_date_auth = insurance_verification?.end_date_auth
            ? dayjs.utc(insurance_verification?.end_date_auth).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.start_date_policy = insurance_verification?.start_date_policy
            ? dayjs.utc(insurance_verification?.start_date_policy).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.end_date_policy = insurance_verification?.end_date_policy
            ? dayjs.utc(insurance_verification?.end_date_policy).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.date_verification_call = insurance_verification?.date_verification_call
            ? dayjs.utc(insurance_verification?.date_verification_call).format('YYYY-MM-DD HH:mm:ss')
            : null;

        const veriBuilder = getBuilder('insurance_verifications', company_id)
            .update({
                auth_num: insurance_verification.auth_num,
                start_date_auth: insurance_verification.start_date_auth,
                end_date_auth: insurance_verification.end_date_auth,
                date_verification_call: insurance_verification.date_verification_call,
                name_of_rep: insurance_verification.name_of_rep,
                ref_num_for_call: insurance_verification.ref_num_for_call,
            })
            .where('id', insurance_veri_id);
        await execute(veriBuilder);
    } else if (whichSave === 'insurance_verification' && !insurance_veri_id) {
        insurance_verification.start_date_auth = insurance_verification?.start_date_auth
            ? dayjs.utc(insurance_verification?.start_date_auth).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.end_date_auth = insurance_verification?.end_date_auth
            ? dayjs.utc(insurance_verification?.end_date_auth).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.start_date_policy = insurance_verification?.start_date_policy
            ? dayjs.utc(insurance_verification?.start_date_policy).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.end_date_policy = insurance_verification?.end_date_policy
            ? dayjs.utc(insurance_verification?.end_date_policy).format('YYYY-MM-DD HH:mm:ss')
            : null;

        insurance_verification.date_verification_call = insurance_verification?.date_verification_call
            ? dayjs.utc(insurance_verification?.date_verification_call).format('YYYY-MM-DD HH:mm:ss')
            : null;

        const veriBuilder = getBuilder('insurance_verifications', company_id, { isInsert: true }).insert({
            auth_num: insurance_verification.auth_num,
            start_date_auth: insurance_verification.start_date_auth,
            end_date_auth: insurance_verification.end_date_auth,
            date_verification_call: insurance_verification.date_verification_call,
            name_of_rep: insurance_verification.name_of_rep,
            ref_num_for_call: insurance_verification.ref_num_for_call,
            company_id: company_id,
            user_id_create: user_id,
            client_id: client_id,
            insurance_cards_id: insurance_card_id,
        });
        const [veriId] = await execute(veriBuilder);
        return { cardId: insurance_card_id, veriId: veriId };
    }

    return { cardId: insurance_card_id, veriId: insurance_veri_id };
}

async function updateInsuranceContactInfoByID(company_id, insurance_card_id, insurance, insurance_veri_id) {
    const cardBuilder = getBuilder('insurance_cards', company_id);
    cardBuilder
        .update({
            phone: insurance.phone,
            fax: insurance.fax,
            email: insurance.email,
            insurance_payers_id: insurance.insurance_payers_id,
            mailing_address: insurance.mailing_address,
        })
        .where('id', insurance_card_id);
    await execute(cardBuilder);

    return { cardId: insurance_card_id, veriId: insurance_veri_id };
}

async function updateInsurancePhotoByID(company_id, insurance_card_id, insurance, insurance_veri_id) {
    const cardBuilder = getBuilder('insurance_cards', company_id);
    cardBuilder
        .update({
            ...insurance,
        })
        .where('id', insurance_card_id);
    await execute(cardBuilder);

    return { cardId: insurance_card_id, veriId: insurance_veri_id };
}

async function verify_eligibility(card_id, verif_id, company_id, user_id, client_id) {
    // get card info (assume saved card info of course)
    // get npi from clients.primary_counselor OR from company.npi ?
    // got with primary_counselor for now
    // send it to clearinghouse
    // parse response
    // save new insurance_verifications record w/ request, + response
    // return insurance_verifications record
    let response = { data: null };
    const builder = getBuilder('insurance_cards', company_id);
    builder
        .join('clients', 'insurance_cards.client_id', 'clients.id')
        .where('clients.company_id', company_id)
        .where('clients.deleted', 0)
        .join('users', 'clients.primary_counselor', 'users.id')
        .where('users.company_id', company_id)
        .where('users.deleted', 0)
        .join('insurance_payers_vob', 'insurance_cards.insurance_payers_vob_id', 'insurance_payers_vob.id')
        .where('insurance_payers_vob.deleted', 0)
        .where('insurance_cards.id', card_id)
        .select(
            'users.npi AS npi',
            'users.last_name AS provider',
            'insurance_cards.member_id',
            'insurance_cards.insurance_payers_id',
            'insurance_payers_vob.payer_id',
            'clients.first_name',
            'clients.last_name'
        )
        .select(mainDb.raw("DATE_FORMAT(clients.dob,'%Y-%m-%d') AS dob"));
    const sql = builder.toString();

    const db_data = await execute(builder);
    const row = db_data[0];

    const checks = [
        {
            field: 'npi',
            msg: "Primary Counselor's NPI is required",
        },
        {
            field: 'provider',
            msg: 'Provider is required',
        },
        {
            field: 'payer_id',
            msg: 'Payer ID is required',
        },
        {
            field: 'dob',
            msg: 'Date of Birth is required',
        },
        {
            field: 'first_name',
            msg: 'First name is required',
        },
        {
            field: 'last_name',
            msg: 'Last name is required',
        },
    ];

    for (let i of checks) {
        if (!row[i.field]) {
            throw new BadRequestError(i.msg);
        }
    }

    const default_service_code = 'CF'; // '30' // 2 - char code w/ "30" = default line of business type
    const default_procedure_code = '90791'; // = BioPsychoSoc or '90837' = Psytx W Pt 60 Minutes  '99051' // idk what to do here - this pops up in the bio assessment - maybe pick a basic code?
    const today = new Date();
    const unique_transaction_id =
        company_id.toString() + user_id.toString() + today.getTime() + Math.random().toString(16).slice(2);
    const service_date = date2normal(today);
    // determine active coverage
    // responses :
    //  triple A error message = NO PATIENT HAS THIS INSURANCE or npi is NOT in database
    //  INACTIVE = expired

    /*
    {
  "eligibilityRequest": {
    "provider": {
      "npi": 1902846306,
      "lastName": "Some Community Hospital"
    },
    "subscriber": {
      "memberIdentifier": "QA0010"
    },
    "dependent": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1959-01-01"
    },
    "serviceDates": {
      "start": "2013-11-15"
    },
    "serviceTypeCodes": {
      "serviceTypeCode": ["30"]
    },
    "procedureCodes": {
      "procedureCode": [
        "77057",
        "80061",
        "82270",
        "82465"
      ],
      "type": "HC"
    },
    "altParams": [
      {
        "name": "PROVIDERPIN",
        "value": "6111111"
      }
    ],
    "payerIdentifier": 13173,
    "submitterId": "12121212",
    "transactionId": "2015071700"
  }
}
     */
    let api_request_json = {
        eligibilityRequest: {
            provider: {
                npi: parseInt(row['npi'], 10),
                // npi: 1902846306,
                lastName: row['provider'],
            },
            subscriber: {
                // memberId entifier: 'QA0001', // card #
                memberIdentifier: row['member_id'], // card #
                "firstName": row['first_name'],
                "lastName": row['last_name'],
                "dateOfBirth": row['dob'], // "1959-01-01"
            },
            // dependent: {
            //     firstName: row['first_name'],
            //     lastName: row['last_name'],
            //     dateOfBirth: row['dob'], // "1959-01-01"
            // },
            serviceDates: {
                // start: date_ranger()['today'] // just leave today here, response will have coverage date range
                start: service_date, // '2022-03-14' // just leave today here, response will have coverage date range
                // could have "end" date too
            },
            serviceTypeCodes: {
                // serviceTypeCode: [default_service_code],
                serviceTypeCode: ['30'],
                // CF = Mental Health Provider - Outpatient
                // CH Mental Health Facility - Outpatient
                // CJ Substance Abuse Facility - Outpatient
                // 30 = basic request phase 2 stuff to get better info
            },
            // procedureCodes: {
            // //     // procedureCode: [default_procedure_code] // YES make default
            //     procedureCode: ['77057'], // YES make default
            // //     // idk what to do here - this pops up in the bio assessment - maybe pick a basic code
            // //     //     "type": "HC" // idk ? professional vs institutional ? yes - optional
            //     type: 'HC',
            // },
            // altParams: [
            //     {
            //         name: 'PROVIDERPIN',
            //         value: row['npi'], // '6111111'
            //     },
            // ],
            // payerIdentifier: row['payer_id'], // from the insurance_payers database table YES
            payerIdentifier: parseInt(row['payer_id']), // '13173' from the insurance_payers_vob database table YES
            // submitterId: `${user_id}`, // '12121212', //user_id, // "12121212", // ? user id
            // transactionId: unique_transaction_id, // "2015071700" // create unique id, and store in insurance_verifications.transaction_id //  insurance_verifications.id ? random ? unique? maybe some amalgam - like customer_id,user_id, insurance_verifications?
            // transactionId: unique_transaction_id, // '2015071700' // "2015071700" // create unique id, and store in insurance_verifications.transaction_id //  insurance_verifications.id ? random ? unique? maybe some amalgam - like customer_id,user_id, insurance_verifications?
        },
    };

    if (process.env.AWS_ENV !== 'prod') {
        api_request_json = {
            "eligibilityRequest": {
                "provider": {
                    "npi": 1184258832,
                    "lastName": "1184258832"
                },
                "subscriber": {
                    "memberIdentifier": "9488302232",
                    "firstName": "GINA",
                    "lastName": "DIAZ",
                    "dateOfBirth": "1986-11-05"
                },
                "serviceDates": {
                    "start": "2022-10-27"
                },
                "serviceTypeCodes": {
                    "serviceTypeCode": [
                        "30"
                    ]
                },
                "payerIdentifier": 13272
            }
            //Permission given from Wayne
            /*"eligibilityRequest": {
                "provider": {
                    "npi": 1184258832,
                    "lastName": "1184258832"
                },
                "subscriber": {
                    "memberIdentifier": "H44605964",
                    "firstName": "WAYNE",
                    "lastName": "LEROUX",
                    "dateOfBirth": "07-26-1942"
                },
                "serviceDates": {
                    "start": "2022-10-27"
                },
                "serviceTypeCodes": {
                    "serviceTypeCode": [
                        "30"
                    ]
                },
                "payerIdentifier": 10353
            }*/
            /*"eligibilityRequest": {
                "provider": {
                    "npi": 1902846306,
                    "lastName": "Some Community Hospital"
                },
                "subscriber": {
                    "memberIdentifier": "QA0010",
                    "firstName": "John",
                    "lastName": "Doe",
                    "dateOfBirth": "1959-01-01"
                },
                "serviceDates": {
                    "start": "2021-11-15"
                },
                "serviceTypeCodes": {
                    "serviceTypeCode": [
                        "30"
                    ]
                },
                procedureCodes: {
                    //     // procedureCode: [default_procedure_code] // YES make default
                    procedureCode: ['77057', '80061', '82270', '82465'], // YES make default
                    //     // idk what to do here - this pops up in the bio assessment - maybe pick a basic code
                    //     //     "type": "HC" // idk ? professional vs institutional ? yes - optional
                    type: 'HC',
                },
                "payerIdentifier": 13173,
                // transactionId: unique_transaction_id, // it doesn't like this field. perhaps add to response?
            }*/
        }
    }

    response.api_request_json = api_request_json;
    const token = await get_access_token('', '', true);
    response.token = token;
    if (token) {
        const url = process.env.INSURANCE_API_URL + '/eligibilities';
        ``;
        const acct_key = await get_acct_key(company_id);
        response.acct_key = acct_key;
        let api_response_json = await post2api(url, response, token, acct_key, process.env.AWS_ENV !== 'dev');
        // console.log('our api response: ', api_response_json.headers);
        if (api_response_json.status !== 200){
            throw new Error ("Could not verify eligibility")
        }

        response.api_response_json = api_response_json;
        try {

            if (api_response_json && api_response_json.data.eligibilityResponse && !api_response_json.data.eligibilityResponse.requestErrors.requestError[0]) {

                let start_date_policy = null
                let end_date_policy = null;
                let policy_active = 0;

                if (api_response_json.data.eligibilityResponse.eligibilityBenefits.eligibilityBenefit) {
                    const eBenefit = api_response_json.data.eligibilityResponse.eligibilityBenefits.eligibilityBenefit;
                    for (let b in eBenefit) {
                        if (eBenefit[b].hasOwnProperty('benefitInfoCodeDefinition')) {
                            if (eBenefit[b].serviceTypeCode == 30 && eBenefit[b].benefitInfoCodeDefinition == "Active Coverage") {
                                policy_active = 1;
                                /*if (eBenefit[b].dateRanges.dateRange) {
                                    for (let d of eBenefit[b].dateRanges.dateRange) {
                                        if (d.qualifierCode == "346") {
                                            start_date_policy = d.start;
                                        }
                                        if (d.qualifierCode == "347") {
                                            end_date_policy = d.end;
                                        }
                                    }
                                }*/
                            }
                        }
                    }
                }

                if (api_response_json.data.eligibilityResponse.payer?.providers?.provider?.subscribers?.subscriber?.dateRanges?.dateRange) {
                    for (let d of api_response_json.data.eligibilityResponse.payer?.providers?.provider?.subscribers?.subscriber?.dateRanges.dateRange) {
                        if (d.qualifierCode == "346") {
                            start_date_policy = d.start;
                        }
                        if (d.qualifierCode == "347") {
                            end_date_policy = d.start;
                        }
                    }
                }

                let api_response_list = {
                    service: []
                }

                if (api_response_json.data.eligibilityResponse.eligibilityBenefits.eligibilityBenefit) {
                    const eBenefit = api_response_json.data.eligibilityResponse.eligibilityBenefits.eligibilityBenefit;
                    const servCodes = [];
                    for (let b in eBenefit) {
                        if (eBenefit[b].hasOwnProperty('serviceTypeCode') && eBenefit[b].serviceTypeCode == '30') {
                            if (!servCodes.includes('30')) {
                                servCodes.push(eBenefit[b].serviceTypeCode);
                                api_response_list.service.push({
                                    code: eBenefit[b].serviceTypeCode,
                                    name: eBenefit[b].serviceTypeCodeDefinition,
                                    active: false,
                                    plan_name: '',
                                    insurance_type: null,
                                    messages: [],
                                    primary_care_provider: {},
                                    copayment: [],
                                    coinsurance: [],
                                    deductible: [],
                                    deductible_remaining: [],
                                    out_of_pocket: [],
                                    out_of_pocket_remaining: [],
                                    limitations: [],
                                    limitations_remaining: [],
                                });
                            }
                            let idx = api_response_list.service.findIndex(s => s.code === '30');
                            if (eBenefit[b].hasOwnProperty('benefitInfoCode') && (eBenefit[b].benefitInfoCode == '1' || eBenefit[b].benefitInfoCode == '6')) {
                                if (eBenefit[b].benefitInfoCode == '1') {
                                    api_response_list.service[idx].active = true;
                                }
                                api_response_list.service[idx].plan_name = eBenefit[b].insuranceDescription ?? '';
                                if (eBenefit[b].hasOwnProperty('insuranceTypeCodeDefinition')) {
                                    api_response_list.service[idx].insurance_type = eBenefit[b].insuranceTypeCodeDefinition ?? null;
                                }
                                if (eBenefit[b].textMessages.textMessage) {
                                    for (let msg in eBenefit[b].textMessages.textMessage) {
                                        api_response_list.service[idx].messages.push(eBenefit[b].textMessages.textMessage[msg].message ?? '');
                                    }
                                }
                                if (eBenefit[b].relatedEntities.relatedEntity) {
                                    for (let ren in eBenefit[b].relatedEntities.relatedEntity) {
                                        if (eBenefit[b].relatedEntities.relatedEntity[ren].typeCode == "P3") {
                                            api_response_list.service[idx].primary_care_provider = {
                                                last_name: eBenefit[b].relatedEntities.relatedEntity[ren].lastOrOrgName ?? '',
                                                first_name: eBenefit[b].relatedEntities.relatedEntity[ren].firstName ?? '',
                                                npi: eBenefit[b].relatedEntities.relatedEntity[ren].providerIdentifier ?? '',
                                            };
                                        }
                                    }
                                }
                            }
                            if (eBenefit[b].hasOwnProperty('benefitInfoCode') && eBenefit[b].benefitInfoCode != '1' && eBenefit[b].benefitInfoCode != '6') {
                                let inNet;
                                if (eBenefit[b].inNetwork) {
                                    if (eBenefit[b].inNetwork == 'Y') {
                                        inNet = 'In';
                                    } else if (eBenefit[b].inNetwork == 'N') {
                                        inNet = 'Out';
                                    } else {
                                        inNet = 'N/A';
                                    }
                                } else {
                                    inNet = 'N/A';
                                }
                                let beginWord, beginDate;
                                if (eBenefit[b].dateRanges.dateRange && eBenefit[b].dateRanges.dateRange.length > 0) {
                                    for (let dr of eBenefit[b].dateRanges.dateRange) {
                                        if (dr.qualifierCodeDefinition && dr.qualifierCodeDefinition.includes("Begin")) {
                                            beginWord = dr.qualifierCodeDefinition;
                                            beginDate = dr.start;
                                            break;
                                        }
                                    }
                                }
                                let msgs = [];
                                if (eBenefit[b].textMessages.textMessage) {
                                    for (let msg in eBenefit[b].textMessages.textMessage) {
                                        msgs.push(eBenefit[b].textMessages.textMessage[msg].message ?? '');
                                    }
                                }

                                if (eBenefit[b].benefitInfoCode == 'B') {
                                    api_response_list.service[idx].copayment.push({
                                        amount: eBenefit[b].monetaryAmount ?? 0,
                                        in_network: inNet,
                                        cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                        authorization_required: eBenefit[b].authRequired ?? null,
                                        begin_word: beginWord,
                                        begin_date: beginDate,
                                        description: eBenefit[b].insuranceDescription ?? null,
                                        messages: msgs,
                                    });
                                }
                                if (eBenefit[b].benefitInfoCode == 'A') {
                                    api_response_list.service[idx].coinsurance.push({
                                        amount: eBenefit[b].percent ?? 0,
                                        in_network: inNet,
                                        cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                        authorization_required: eBenefit[b].authRequired ?? null,
                                        begin_word: beginWord,
                                        begin_date: beginDate,
                                        description: eBenefit[b].insuranceDescription ?? null,
                                        messages: msgs,
                                    });
                                }
                                if (eBenefit[b].benefitInfoCode == 'C') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        api_response_list.service[idx].deductible.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                            authorization_required: eBenefit[b].authRequired ?? null,
                                            begin_word: beginWord,
                                            begin_date: beginDate,
                                            description: eBenefit[b].insuranceDescription ?? null,
                                            messages: msgs,
                                        });
                                    } else {
                                        api_response_list.service[idx].deductible_remaining.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        });
                                    }
                                }
                                if (eBenefit[b].benefitInfoCode == 'G') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        api_response_list.service[idx].out_of_pocket.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                            authorization_required: eBenefit[b].authRequired ?? null,
                                            begin_word: beginWord,
                                            begin_date: beginDate,
                                            description: eBenefit[b].insuranceDescription ?? null,
                                            messages: msgs,
                                        });
                                    } else {
                                        api_response_list.service[idx].out_of_pocket_remaining.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        });
                                    }
                                }
                                if (eBenefit[b].benefitInfoCode == 'F') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        if (eBenefit[b].quantityQualifierCode == "") {
                                            api_response_list.service[idx].limitations.push({
                                                amount: eBenefit[b].monetaryAmount ?? 0,
                                                in_network: inNet,
                                                cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                                period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                                authorization_required: eBenefit[b].authRequired ?? null,
                                                begin_word: beginWord,
                                                begin_date: beginDate,
                                                description: eBenefit[b].insuranceDescription ?? null,
                                                messages: msgs,
                                            });
                                        }
                                    } else {
                                        if (eBenefit[b].quantityQualifierCode == "") {
                                            api_response_list.service[idx].limitations_remaining.push({
                                                amount: eBenefit[b].monetaryAmount ?? 0,
                                                in_network: inNet,
                                                cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let b in eBenefit) {
                        if (eBenefit[b].hasOwnProperty('serviceTypeCode') && eBenefit[b].serviceTypeCode != '30') {
                            if (!servCodes.includes(eBenefit[b].serviceTypeCode)) {
                                servCodes.push(eBenefit[b].serviceTypeCode);
                                api_response_list.service.push({
                                    code: eBenefit[b].serviceTypeCode,
                                    name: eBenefit[b].serviceTypeCodeDefinition,
                                    active: false,
                                    plan_name: '',
                                    insurance_type: null,
                                    messages: [],
                                    primary_care_provider: {},
                                    copayment: [],
                                    coinsurance: [],
                                    deductible: [],
                                    deductible_remaining: [],
                                    out_of_pocket: [],
                                    out_of_pocket_remaining: [],
                                    limitations: [],
                                    limitations_remaining: [],
                                });
                            }
                            let idx = api_response_list.service.findIndex(s => s.code === eBenefit[b].serviceTypeCode);
                            if (eBenefit[b].hasOwnProperty('benefitInfoCode') && (eBenefit[b].benefitInfoCode == '1' || eBenefit[b].benefitInfoCode == '6')) {
                                if (eBenefit[b].benefitInfoCode == '1') {
                                    api_response_list.service[idx].active = true;
                                }
                                api_response_list.service[idx].plan_name = eBenefit[b].insuranceDescription ?? '';
                                if (eBenefit[b].hasOwnProperty('insuranceTypeCodeDefinition')) {
                                    api_response_list.service[idx].insurance_type = eBenefit[b].insuranceTypeCodeDefinition ?? null;
                                }
                                if (eBenefit[b].textMessages.textMessage) {
                                    for (let msg in eBenefit[b].textMessages.textMessage) {
                                        api_response_list.service[idx].messages.push(eBenefit[b].textMessages.textMessage[msg].message ?? '');
                                    }
                                }
                                if (eBenefit[b].relatedEntities.relatedEntity) {
                                    for (let ren in eBenefit[b].relatedEntities.relatedEntity) {
                                        if (eBenefit[b].relatedEntities.relatedEntity[ren].typeCode == "P3") {
                                            api_response_list.service[idx].primary_care_provider = {
                                                last_name: eBenefit[b].relatedEntities.relatedEntity[ren].lastOrOrgName ?? '',
                                                first_name: eBenefit[b].relatedEntities.relatedEntity[ren].firstName ?? '',
                                                npi: eBenefit[b].relatedEntities.relatedEntity[ren].providerIdentifier ?? '',
                                            };
                                        }
                                    }
                                }
                            }
                            if (eBenefit[b].hasOwnProperty('benefitInfoCode') && eBenefit[b].benefitInfoCode != '1' && eBenefit[b].benefitInfoCode != '6') {
                                let inNet;
                                if (eBenefit[b].inNetwork) {
                                    if (eBenefit[b].inNetwork == 'Y') {
                                        inNet = 'In';
                                    } else if (eBenefit[b].inNetwork == 'N') {
                                        inNet = 'Out';
                                    } else {
                                        inNet = 'N/A';
                                    }
                                } else {
                                    inNet = 'N/A';
                                }
                                let beginWord, beginDate;
                                if (eBenefit[b].dateRanges.dateRange && eBenefit[b].dateRanges.dateRange.length > 0) {
                                    for (let dr of eBenefit[b].dateRanges.dateRange) {
                                        if (dr.qualifierCodeDefinition && dr.qualifierCodeDefinition.includes("Begin")) {
                                            beginWord = dr.qualifierCodeDefinition;
                                            beginDate = dr.start;
                                            break;
                                        }
                                    }
                                }
                                let msgs = [];
                                if (eBenefit[b].textMessages.textMessage) {
                                    for (let msg in eBenefit[b].textMessages.textMessage) {
                                        msgs.push(eBenefit[b].textMessages.textMessage[msg].message ?? '');
                                    }
                                }

                                if (eBenefit[b].benefitInfoCode == 'B') {
                                    api_response_list.service[idx].copayment.push({
                                        amount: eBenefit[b].monetaryAmount ?? 0,
                                        in_network: inNet,
                                        cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                        authorization_required: eBenefit[b].authRequired ?? null,
                                        begin_word: beginWord,
                                        begin_date: beginDate,
                                        description: eBenefit[b].insuranceDescription ?? null,
                                        messages: msgs,
                                    });
                                }
                                if (eBenefit[b].benefitInfoCode == 'A') {
                                    api_response_list.service[idx].coinsurance.push({
                                        amount: eBenefit[b].percent ?? 0,
                                        in_network: inNet,
                                        cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                        authorization_required: eBenefit[b].authRequired ?? null,
                                        begin_word: beginWord,
                                        begin_date: beginDate,
                                        description: eBenefit[b].insuranceDescription ?? null,
                                        messages: msgs,
                                    });
                                }
                                if (eBenefit[b].benefitInfoCode == 'C') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        api_response_list.service[idx].deductible.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                            authorization_required: eBenefit[b].authRequired ?? null,
                                            begin_word: beginWord,
                                            begin_date: beginDate,
                                            description: eBenefit[b].insuranceDescription ?? null,
                                            messages: msgs,
                                        });
                                    } else {
                                        api_response_list.service[idx].deductible_remaining.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        });
                                    }
                                }
                                if (eBenefit[b].benefitInfoCode == 'G') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        api_response_list.service[idx].out_of_pocket.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                            authorization_required: eBenefit[b].authRequired ?? null,
                                            begin_word: beginWord,
                                            begin_date: beginDate,
                                            description: eBenefit[b].insuranceDescription ?? null,
                                            messages: msgs,
                                        });
                                    } else {
                                        api_response_list.service[idx].out_of_pocket_remaining.push({
                                            amount: eBenefit[b].monetaryAmount ?? 0,
                                            in_network: inNet,
                                            cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                        });
                                    }
                                }
                                if (eBenefit[b].benefitInfoCode == 'F') {
                                    if (eBenefit[b].benefitTimePeriodCode != '29') {
                                        if (eBenefit[b].quantityQualifierCode == "") {
                                            api_response_list.service[idx].limitations.push({
                                                amount: eBenefit[b].monetaryAmount ?? 0,
                                                in_network: inNet,
                                                cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                                period: eBenefit[b].benefitTimePeriodCodeDefinition ?? null,
                                                authorization_required: eBenefit[b].authRequired ?? null,
                                                begin_word: beginWord,
                                                begin_date: beginDate,
                                                description: eBenefit[b].insuranceDescription ?? null,
                                                messages: msgs,
                                            });
                                        }
                                    } else {
                                        if (eBenefit[b].quantityQualifierCode == "") {
                                            api_response_list.service[idx].limitations_remaining.push({
                                                amount: eBenefit[b].monetaryAmount ?? 0,
                                                in_network: inNet,
                                                cover: eBenefit[b].coverageLevelCodeDefinition ?? '-',
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                let insurance_verification = {
                    // ins_num: 1, // ins_member_id
                    // group_num: 2,
                    // service_code: 3,
                    // name_of_rep: 'joe',
                    // insurance_payer_id: row['payer_id'],
                    // insurance_cards_id: card_id,
                    // ref_num_for_call: '',
                    policy_active: policy_active,
                    // deductible_met: '',
                    // is_there_deductible: '',
                    // deductible_remain: '',
                    // visits_allowed: 1,
                    // visits_used: 1,
                    // visits_remain: 1,
                    // co_pay: 2000,
                    // co_insurance: '',
                    // is_provide_in_network: '',
                    // out_of_network_benefits: '',
                    // preauth_require: '',
                    // auth_num: '',
                    // start_date_auth: '',
                    // end_date_auth: '',
                    // ref_required: '',
                    // service_or_treatment_exclude: '',
                    // limit_exclude_docum_requirement: '',
                    // notes: '',
                    start_date_policy: (start_date_policy ? dayjs.utc(start_date_policy).format('YYYY-MM-DD HH:mm:ss') : null),
                    end_date_policy: (end_date_policy ? dayjs.utc(end_date_policy).format('YYYY-MM-DD HH:mm:ss') : null),
                    api_request_json: JSON.stringify(api_request_json),
                    api_response_json: JSON.stringify(api_response_json.data),
                };

                let date_verif;

                if (verif_id) {
                    date_verif = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');

                    const veriBuilder = getBuilder('insurance_verifications', company_id)
                        .update({
                            ...insurance_verification,
                            report_list: JSON.stringify(api_response_list),
                            date_verified: date_verif
                        })
                        .where('id', verif_id);
                    await execute(veriBuilder);
                } else if (card_id) {
                    date_verif = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');

                    const veriBuilder = getBuilder('insurance_verifications', company_id, { isInsert: true }).insert({
                        ...insurance_verification,
                        report_list: JSON.stringify(api_response_list),
                        date_verified: date_verif,
                        company_id: company_id,
                        user_id_create: user_id,
                        client_id: client_id,
                        insurance_cards_id: card_id,
                    });
                    const [veriId] = await execute(veriBuilder);
                    response = {
                        ...insurance_verification,
                        report_list: JSON.stringify(api_response_list),
                        date_verified: date_verif,
                        cardId: card_id,
                        veriId: veriId
                    };
                    return response;
                }
                // save record to database table, insurance_verifications
                /*const veriBuilder = getBuilder('insurance_verifications', company_id, { isInsert: true }).insert({
                    ...insurance_verification,
                    company_id: company_id,
                    user_id_create: user_id,
                    client_id: client_id,
                    insurance_cards_id: cardId,
                });
                const [veriId] = await execute(veriBuilder);*/
                // return this same data
                response = {
                    ...insurance_verification,
                    report_list: api_response_list,
                    date_verified: date_verif,
                    cardId: null,
                    veriId: null
                };
            }
        } catch (error) {
            throw new Error ("Could not read eligibility details");
        }
    }

    return response;
}

function empty_claim_api_request() {
    const json = {
        ClaimID: { ClaimNo: '', MedicalRecNo: '' },
        BillType: '131',
        Services: [
            {
                LineNo: '',
                RevenueCode: '0001',
                Charge: '',
                // Description: '',
                FromDate: '',
                ThroughDate: '',
                Modifier1: '',
                Modifier2: '',
                Modifier3: '',
                Modifier4: '',
                PlaceService: '11', // cms1500
                Emergency: 'N', // cms1500
                RenderingProvID: { NPI: '' },
                DiagnosisPointer: '', // cms1500
                Units: '1',
                // ServiceID: '',
                RenderingFirst: '',
                RenderingLast: '',
            },
        ],
        DestInsNo: '',
        MediaCode: '',
        TransType: 'INST_CLAIM',
        BillingZip: '',
        ClaimDate: {},
        Insurances: [
            {
                PayerID: { ID: '' },
                PayerZip: '',
                PayerCity: '',
                PayerName: '',
                PayerAddr1: '',
                PayerAddr2: '',
                PayerSeqNo: '',
                PayerState: '',
                GroupNumber: '',
                // InsuranceID: '',
                ClaimIndCode: '',
                PayerSeqCode: '',
                SubscriberID: { MemberID: '' },
                SubscriberDOB: '',
                SubscriberZip: '',
                AssignBenefits: 'N',
                SubscriberCity: '',
                SubscriberLast: '',
                ReleaseInfoCode: '',
                SubscriberAddr1: '',
                SubscriberAddr2: '',
                SubscriberFirst: '',
                SubscriberMiddle: '',
                SubscriberState: '',
                SubscriberGender: '',
                PatientRelateCode: '',
            },
        ],
        PatientDOB: '',
        PatientZip: '',
        Attachments: [],
        BillingCity: '',
        BillingName: '',
        ClaimCharge: '',
        PatientCity: '',
        PatientLast: '',
        PatientPaid: '',
        RelatedAuto: '',
        BillingAddr1: '',
        BillingState: '',
        PatientAddr1: '',
        PatientAddr2: '',
        PatientCtlNo: '',
        PatientFirst: '',
        PatientMiddle: '',
        PatientState: '',
        PatientStatus: '01',
        RelatedOther: '',
        StatementEnd: '',
        BillingProvID: { NPI: '', EIN: '' },
        PatientGender: '',
        RenderingLast: '',
        BillingEntType: '',
        RenderingFirst: '',
        StatementStart: '',
        RenderingProvID: { NPI: '' },
        SignatureOnFile: '',
        AcceptAssignment: '',
        DiagnosisCodes10: { Principal: { Code: '', POA: '' } },
        ConditionCodes: {
            Code1: '',
            Code2: '',
            Code3: '',
            Code4: '',
            Code5: '',
            Code6: '',
            Code7: '',
            Code8: '',
            Code9: '',
            Code10: '',
            Code11: '',
        },
        AdmissionSource: '2',
        AdmissionType: '3',
        DiagnosisVersion: '',
        RenderingEntType: '',
        RelatedEmployment: '',

        PayToName: '',
        PayToAddr1: '',
        PayToAddr2: '',
        PayToCity: '',
        PayToState: '',
        PayToZip: '',
        PayToProvID: { NPI: '' },
        // PatientID: { SSN: '123456789' } // if people don't want to give out their ssn for insurance claims even though they give all their info to facebook + the world, so be it, and if their claims don't pay - tough kitty!!!
    };
    return json;
}

function dollas(pennies) {
    let dollars = parseInt(pennies) / 100;
    return dollars.toFixed(2);
}

async function auto_populate_claim_api_request(invoice_id, company_id, client_id, card_id, progress_note) {
    let ability_api_claims_data = {};
    let errs = '',
        builder,
        db_data,
        final_api_request;

    try {
        builder = getBuilder('insurance_cards', company_id);
        builder
            .join('insurance_payers', 'insurance_cards.insurance_payers_id', 'insurance_payers.id')
            .where('insurance_payers.deleted', 0)
            .where('insurance_cards.id', card_id);
        const all_insurance_cards = await execute(builder);
        const ins_card = all_insurance_cards[0];

        builder = getBuilder('users', company_id);
        builder.where('id', progress_note.provider_id);
        db_data = await execute(builder);
        const user = db_data[0];

        builder = getBuilder('clients', company_id);
        builder.where('id', client_id);
        db_data = await execute(builder);
        const client = db_data[0];

        builder = getBuilder('referrals', company_id);
        builder.where('id', client.referral_id);
        db_data = await execute(builder);
        const referrer = db_data[0];

        if (!referrer) {
            errs += ', no referrer';
        }

        builder = getBuilder('invoices', company_id);
        builder.where('id', invoice_id);
        db_data = await execute(builder);
        const invoice = db_data[0];

        // builder = getBuilder('ledger', company_id);
        // builder.where('invoice_id', invoice_id).where('client_id', client_id);
        // db_data = await execute(builder);
        // const ledger = db_data[0];

        builder = getBuilder('companies', company_id); // or office later
        db_data = await execute(builder);
        const company_info = db_data[0];

        // get services on invoice
        builder = getBuilder('service_items', company_id);
        builder.where('invoice_id', invoice_id);
        db_data = await execute(builder);
        const service_items = db_data;

        if (!service_items) {
            errs += ', no service_items';
        }

        let total_charges = '0.00';
        let total_paid = '0.00';

        const total_paid_pennies = await invoiceService.getAmountPaidForInvoice(invoice_id, company_id);
        total_paid = dollas(total_paid_pennies);

        const total_charges_pennies = service_items.reduce((out, cur) => out + cur.retail_cost, 0);
        total_charges = dollas(total_charges_pennies);

        // get service codes for items
        const service_code_ids = service_items.map((val) => val.service_code_id);
        builder = getBuilder('service_codes', company_id);
        builder.whereIn('service_codes.id', service_code_ids);
        db_data = await execute(builder);
        const service_codes = db_data;

        // get dx codes
        const dx_code_ids = service_items.map((val) => val.service_code_id);
        builder = getBuilder('service_codes');
        builder.where('service_codes.code_type', 'diagnosis');
        db_data = await execute(builder);
        const dx_codes = db_data;

        const client_signature_on_file = 'Y';
        // builder = getBuilder('signatures', company_id);
        // builder
        //     .where('client_id', client_id);
        // db_data = await execute(builder);
        // const client_signature_on_file = db_data.length > 0 ? 'Y' : 'N';

        // builder = getBuilder('insurance_cards', company_id);
        // builder
        //     .where('client_id', client_id)
        //     .where('primary_insurance_card', 1)
        //     .limit(1)  // multi cards way down the road
        // db_data = await execute(builder);
        // const all_insurance_cards = db_data;  // ??

        // const newBuilder = getBuilder('insurance_claims', company_id, false, true);
        // newBuilder.select('id').count('id as claim_count');

        // db_data = await execute(newBuilder);
        // const currentClaimCount = db_data[0]['claim_count'];
        const nextClaimNo =
            new Date().getTime().toString().substring(0, 11) + (invoice_id % 10000).toString().padStart(4, '0'); //  . process.hrtime() // 1000 + currentClaimCount + 2;  // @todo this might not work if 2 claims come here simultaneously -afv2do
        // console.log('our next claim COUNT: ', nextClaimNo);

        let tax_id_ssn = '',
            company_npi = '';
        tax_id_ssn = await settingsRepo.getSetting('tax_id_ssn', 'company', company_id, company_id);
        company_npi = await settingsRepo.getSetting('company_npi', 'company', company_id, company_id);

        const company_insurance_payers_setting = await settingsRepo.getSetting(
            'insurance_payers',
            'company',
            company_id,
            company_id
        );
        const company_insurance_payers_array = JSON.parse(company_insurance_payers_setting.value);

        if (!company_insurance_payers_array) {
            errs += ', company_insurance_payers_array';
        } else {
            errs += ', company_insurance_payers_array ok';
        }

        const user_npi = user.npi;
        const progress_note_diagnosis = JSON.parse(progress_note.diags);

        //get our appointment date
        builder = getBuilder('appts', company_id);
        builder.where('id', progress_note.appt_id);
        db_data = await execute(builder);
        const appointment = db_data[0];

        //  get insurance verifications from primary ins card
        let ins_verification = {
            auth_num: '',
        };
        // builder = getBuilder('insurance_verifications', company_id);
        // builder.where('insurance_cards_id', ins_card.id);
        // db_data = await execute(builder);
        // if (db_data && db_data[0]) {
        //     ins_verification = db_data[0];
        // }

        // use progress note primary counselor name if set else use user.name
        let renderingProviderFirst = user.first_name;
        let renderingProviderLast = user.last_name;
        let renderingProviderNpi = user_npi;
        if ('counselors' in progress_note) {
            const counselorsArray = JSON.parse(progress_note.counselors);
            for (const counselor of counselorsArray) {
                if (counselor.isPrimary) {
                    builder = getBuilder('users', company_id);
                    builder.where('id', counselor.id);
                    db_data = await execute(builder);
                    const renderingProviderUser = db_data[0];
                    if (renderingProviderUser && renderingProviderUser.npi) {
                        renderingProviderFirst = renderingProviderUser.first_name;
                        renderingProviderLast = renderingProviderUser.last_name;
                        renderingProviderNpi = renderingProviderUser.npi;
                    }
                }
            }
        }

        const principle_diagnosis_code = progress_note_diagnosis.find((diag) => diag.primary);
        let principle_diagnosis_code_selected_service_code = '';
        if (principle_diagnosis_code && principle_diagnosis_code.selected) {
            const dx_code = dx_codes.filter((code) => code.id === principle_diagnosis_code.selected)[0];
            principle_diagnosis_code_selected_service_code = dx_code.service_code;
        }

        const service_array = [];
        // const allProgressNoteServices = JSON.parse(progress_note.services); // bye
        let serviceCnt = 0;
        for (const service of service_items) {
            ++serviceCnt;
            const service_code = service_codes.filter((code) => code.id === service.service_code_id)[0];
            // const progressNoteService = allProgressNoteServices.filter((progService) => progService.service_code_id === service.service_code_id)[0];
            let progressNoteService = {
                cost: 0,
                name: 'BioPsychoSoc',
                units: 0,
                append: false,
                deleted: false,
                revenue: null,
                modifiers: ['J1', 'F2', 'F3', 'F4'],
                service_code: '90791',
                service_code_id: 4,
            };
            progressNoteService.name = service_code.abbrev;
            progressNoteService.service_code = service_code.service_code;
            progressNoteService.service_code_id = service_code.id;
            progressNoteService.modifiers = service.modifier;
            progressNoteService.revenue = service.revenue_code;
            progressNoteService.units = service.units;

            let modsObject = [];
            if (progressNoteService && progressNoteService.modifiers && progressNoteService.modifiers.length) {
                let modifiers_array = JSON.parse(progressNoteService.modifiers);
                modsObject = modifiers_array.reduce((lastProp, curProp, idx) => {
                    const newProp = {};
                    const modNum = idx + 1;
                    newProp[`Modifier${modNum}`] = curProp;
                    return !lastProp ? { ...newProp } : { ...lastProp, ...newProp };
                }, 0);
            }

            let ourPlaceOfService = '11';
            if (progress_note.place_of_service) {
                const findOurPlaceOfService = JSON.parse(progress_note.place_of_service);
                if (
                    findOurPlaceOfService.id &&
                    (findOurPlaceOfService.id == '11' || findOurPlaceOfService.id == '02')
                ) {
                    ourPlaceOfService = findOurPlaceOfService.id;
                }
            }
            let code_revenue = '';
            let pn_units = 1;
            if (progressNoteService) {
                if (progressNoteService.revenue) {
                    code_revenue = progressNoteService.revenue;
                }
                if (progressNoteService.units) {
                    pn_units = progressNoteService.units;
                }
            }

            const service_details = {
                RevenueCode: code_revenue,
                PlaceService: ourPlaceOfService,
                Emergency: 'N', // requested no as default value
                Charge: dollas(service.retail_cost ?? 0),
                Description: service_code.long_descrip,
                HCPC: service_code.service_code,
                LineNo: serviceCnt,
                Units: pn_units,
                // DiagnosisPointer: principle_diagnosis_code_selected_service_code,
                FromDate: date2normal(appointment.dayt_appt_start),
                ThroughDate: date2normal(appointment.dayt_appt_end),
                RenderingFirst: renderingProviderFirst,
                RenderingLast: renderingProviderLast,
                RenderingProvID: {
                    NPI: renderingProviderNpi,
                },
                ...modsObject,
            };
            service_array.push(service_details);
        }

        const insurance_array = [];
        const relationshipCodesAndLabels = [
            { code: '18', label: 'Self' },
            { code: '01', label: 'Spouse' },
            { code: '32', label: 'Mother' },
            { code: '33', label: 'Father' },
            { code: '19', label: 'Child' },
            { code: '20', label: 'Employee' },
            { code: 'G8', label: 'Other Relationship' },
            { code: '21', label: 'Unknown' },

            { code: '40', label: 'Cadaver Donor' },
            { code: '53', label: 'Life Partner' },
            { code: '39', label: 'Organ Donor' },
        ];
        for (const insurance_card of all_insurance_cards) {
            const relationToInsured = relationshipCodesAndLabels.find(
                (opt) => opt.label === insurance_card.relationship
            );
            let relationToInsuredCode = '';
            if (relationToInsured && relationToInsured.code) {
                relationToInsuredCode = relationToInsured.code;
            }
            const ins_payer = company_insurance_payers_array.filter(
                (payer) => parseInt(payer.id) === insurance_card.insurance_payers_id
            )[0];
            const ins_subscriber =
                insurance_card.client_id === client_id
                    ? client
                    : await get_alternate_ins_subscriber(insurance_card.client_id, company_id);
            const insurance_details = {
                AssignBenefits: 'N', // requested no as default value
                PatientRelateCode: relationToInsuredCode,
                PayerAddr1: ins_payer.payer_street_one,
                PayerAddr2: ins_payer.payer_street_two,
                PayerCity: ins_payer.payer_city,
                PayerState: ins_payer.payer_state ? getUsStateAbbreviation(ins_payer.payer_state) : '',
                PayerZip: ins_payer.payer_zip,

                PayerID: {
                    Local: ins_payer.payer_id, // ins_payer.id.toString(),
                    ID: ins_payer.payer_id,
                },
                PayerName: ins_payer.payer_name,
                ReleaseInfoCode: 'Y', // todo where & what is this?
                SubscriberAddr1: ins_subscriber.street_address,
                SubscriberAddr2: ins_subscriber.street_address2,
                SubscriberCity: ins_subscriber.city,
                SubscriberDOB: insurance_card.dob_insured, //needs date format yyyy-mm-dd
                SubscriberFirst: ins_subscriber.first_name,
                SubscriberGender: ins_subscriber.gender.charAt(0), // "M"
                SubscriberID: {
                    MemberID: insurance_card.member_id,
                },
                SubscriberLast: ins_subscriber.last_name,
                SubscriberMiddle: ins_subscriber.middle_name || '',
                SubscriberState: ins_subscriber.state ? getUsStateAbbreviation(ins_subscriber.state) : '',
                SubscriberZip: ins_subscriber.zip,
                PayerSeqNo: '1', // todo where & what is this?
                PayerSeqCode: 'A', // todo where & what is this?
                ClaimIndCode: '', // selects claim industry code, e.g. MC for Medicaid
                GroupNumber: insurance_card.group_id || '',
                GroupName: '', // todo is there data source for groups containing the name?
                PriorAuthNo: ins_verification.auth_num,
                SubscriberCountry: 'US', // todo can clients be international? or just US addresses?
                PayerCountry: 'US', // todo can insurance payers be international? or just US addresses?
            };
            insurance_array.push(insurance_details);
        }

        const other_diagnosis_codes = {};
        let other_cnt = 0;
        for (const diag of progress_note_diagnosis) {
            if (!diag.primary) {
                ++other_cnt;
                const string_name = `Other${other_cnt}`;
                const dx_code = dx_codes.filter((code) => code.id === diag.selected)[0];
                other_diagnosis_codes[string_name] = { Code: dx_code.service_code };
            }
        }

        const maritalStatusCodes = [
            { value: 'D', text: 'Divorced' },
            { value: 'M', text: 'Married' },
            { value: 'O', text: 'Other' },
            { value: 'S', text: 'Single' },
            { value: 'U', text: 'Unknown' },
            { value: 'W', text: 'Widow' },
        ];
        let patientMaritalStatus = 'U';
        const patientMaritalStatus2code = maritalStatusCodes.find((love) => love.text === client.marital_status);
        if (!patientMaritalStatus2code) {
            errs += ', no patientMaritalStatus2code';
        } else {
            errs += ', patientMaritalStatus2code ok';
            patientMaritalStatus = patientMaritalStatus2code.value;
        }

        const raceLabels = [
            { value: '04', text: 'Asian' },
            { value: '02', text: 'Black or African American' },
            { value: '03', text: 'Native American or Alaskan Native' },
            { value: '05', text: 'Native Hawaiian or Other Pacific Islander' },
            { value: '88', text: 'Other Race' },
            { value: '99', text: 'Unknown' },
            { value: '01', text: 'White' },
        ];

        let patientRace = '99';
        const patientRace2code = raceLabels.find((race) => race.text === client['race']);
        if (!patientRace2code) {
            errs += ', no patientRace2code';
        } else {
            errs += ', patientRace2code ok';
            patientRace = patientRace2code.value;
        }

        const employmentLabels = [
            { value: 'E', text: 'Employed' },
            { value: 'F', text: 'Full-Time Student' },
            { value: 'P', text: 'Part-Time Student' },
        ];

        let patientEmployment = 'E';
        const patientEmployment2code = employmentLabels.find((job) => job.text === client.employment_status);
        if (!patientEmployment2code) {
            errs += ', no patientEmployment2code';
        } else {
            errs += ', patientEmployment2code ok';
            patientEmployment = patientEmployment2code.value;
        }

        let row = {
            ClaimNo: nextClaimNo,
            StatementStart: date2normal(invoice.dayt_create), // format YYYY-MM-DD, //  "2021-09-15", // invoice date?
            StatementEnd: date2normal(invoice.dayt_create), // format YYYY-MM-DD, // "2021-09-15", // invoice date?

            BillingEntType: 'FACILITY', // todo Should this be a string room type[ Office |  Telehealth ] or just room_id??
            BillingName: company_info.company_name, // "SQUARE ONE CLINICS",
            BillingAddr1: company_info.address, // "1022 NEBRASKA AVE.",
            BillingCity: company_info.city, //  "PALM HARBOR", // company address?
            BillingState: getUsStateAbbreviation(company_info.state), // "FL",
            BillingZip: company_info.zip, // 9 digits  "346834353",
            BillingProvID: {
                NPI: company_npi.value, // "1184258832", // @todo get this from company / office settings, not company table / this must be 10 digits
                EIN: tax_id_ssn.value, //  "844746480" // @todo get this from company / office settings, not company table / this must be 9 digits
            },

            // PatID: client_id, // "0", maybe this is our pat id
            PatientCtlNo: `${client_id}`, // chirp db client id must be string
            PatientFirst: client.first_name, // "ROBERT",
            PatientMiddle: client.middle_name ? client.middle_name : '', // "ROBERT",
            PatientLast: client.last_name, // "BARBER",
            PatientDOB: date2normal(client.dob), // "1983-10-28",
            PatientGender: client.gender.charAt(0), //  "M",
            PatientAddr1: client.street_address, // "945 FALMOTH DR.",
            PatientAddr2: client.street_address2, // "945 FALMOTH DR.",
            PatientCity: client.city, // "PALM HARBOR
            PatientState: getUsStateAbbreviation(client.state), // "FL",
            PatientZip: client.zip, // "34684",
            PatientPaid: total_paid, // "25.00"
            PatientSigOnFile: client_signature_on_file,
            PatientMaritalStatus: patientMaritalStatus,
            PatientRace: patientRace,
            PatientEmploymentStatus: patientEmployment,
            PatientStatus: '01',
            SubscriberFirst: client.first_name, // "ROBERT", // patient again ? probably the insurance holder
            SubscriberLast: client.last_name, // "BARBER",
            SubscriberDOB: date2normal(client.dob), // "1983-10-28",
            SubscriberGender: client.gender.charAt(0), // "M",
            SubscriberAddr1: client.street_address, // "945 FALMOTH DR.",
            SubscriberAddr2: client.street_address2, // "945 FALMOTH DR.",
            SubscriberCity: client.city, // "PALM HARBOR",
            SubscriberState: client.state, // "FL",
            SubscriberZip: client.zip, // "34684",
            RenderingEntType: user.provider_type,
            RenderingFirst: renderingProviderFirst, // "MEAGAN",
            RenderingLast: renderingProviderLast, // "LINDSAY, LMHC, MCAP",

            ClaimCharge: total_charges,

            GroupNumber: ins_card.group_id, // "10971802000201",
            MemberID: ins_card.member_id, // W247681516

            ins_payer_id: ins_card.insurance_payers_id, // "60054"
            ins_payer_name: ins_card.payer_name, // AETNA
            ins_payer_addr: ins_card.ins_payer_addr,
            ins_payer_city: ins_card.payer_city,
            ins_payer_state: ins_card.payer_state,
            ins_payer_zip: ins_card.payer_zip,
            ins_payer_partner_id: ins_card.payer_id,
            insurance_payers: 'idkyet', // todo what is this? we already have a name, addy, id, etc.

            notes_diagnosis: {
                principal: { Code: principle_diagnosis_code_selected_service_code, POA: '' }, // for each diag icd 10 code ?
                others: {
                    ...other_diagnosis_codes,
                },
            },
        };

        // There has to be a better way to do this
        // todo update referrals table to have First, Middle, and Last Name fields since they're required by the API.
        let refFirstName = '';
        let refMiddleName = '';
        let refLastName = '';
        let referring_provider_npi = '';
        if (referrer) {
            const referrerNameArray = referrer.name.split(' ');

            switch (referrerNameArray.length) {
                case 0:
                    refFirstName = '';
                    refMiddleName = '';
                    refLastName = '';
                    break;
                case 1:
                    refFirstName = referrerNameArray[0];
                    refMiddleName = '';
                    refLastName = '';
                    break;
                case 2:
                    refFirstName = referrerNameArray[0];
                    refMiddleName = '';
                    refLastName = referrerNameArray[1];
                    break;
                case 3:
                    refFirstName = referrerNameArray[0];
                    refMiddleName = referrerNameArray[1];
                    refLastName = referrerNameArray[2];
                    break;
                default:
                    refFirstName = '';
                    refMiddleName = '';
                    refLastName = '';
                    break;
            }
            referring_provider_npi = referrer.referring_provider_npi;
        }

        ability_api_claims_data = {
            ClaimID: {
                ClaimNo: row.ClaimNo,
            },
            BillType: '131',
            ImportBatchID: '0',
            // "AssignedToID": "743474",
            // "SourceFileID": null,
            // "TransStatus": "VALIDATED",

            AdmissionSource: '2',
            AdmissionType: '3',
            MediaCode: 'E',
            // "InsuranceLastID": 1,
            // "EditByID": null,
            // "CreateMode": "DATA ENTRY",

            StatementStart: row.StatementStart,
            StatementEnd: row.StatementEnd,
            // "EditDate": null, // ?
            // "TransmitDate": null, // ?
            // "adj_icn": "",
            AcceptAssignment: 'A',
            DestInsNo: 1,
            SignatureOnFile: row.PatientSigOnFile,
            TransType: 'INST_CLAIM', // todo what is trans claim and where is it stored??
            RelatedAuto: 'N',
            RelatedOther: 'N',
            RelatedEmployment: 'N',

            // "BillingEntType": row.BillingEntType,
            BillingName: row.BillingName,
            BillingAddr1: row.BillingAddr1,
            // BillingAddr2: 'row 2 addy.',
            BillingCity: row.BillingCity,
            BillingState: row.BillingState,
            BillingZip: row.BillingZip,
            BillingCountry: 'US',
            BillingProvID: row.BillingProvID,

            PayToName: row.BillingName,
            PayToAddr1: row.BillingAddr1,
            // PayToAddr2:'',
            PayToCity: row.BillingCity,
            PayToState: row.BillingState,
            PayToZip: row.BillingZip,
            PayToProvID: { NPI: company_npi.value },

            // PatientID: {
            //     SSN: '123456789' // todo where do we get Patients SSN // if people don't want to give out their ssn for insurance claims even though they give all their info to facebook + the world, so be it, and if their claims don't pay - tough kitty!!!
            // },
            PatientCtlNo: row.PatientCtlNo,
            PatientFirst: row.PatientFirst,
            PatientMiddle: row.PatientMiddle,
            PatientLast: row.PatientLast,
            PatientDOB: row.PatientDOB,
            PatientGender: row.PatientGender,
            PatientMS: row.PatientMaritalStatus,
            PatientRace: row.PatientRace,
            EmploymentStatus: row.PatientEmploymentStatus,
            PatientAddr1: row.PatientAddr1,
            PatientAddr2: row.PatientAddr2,
            PatientCity: row.PatientCity,
            PatientState: row.PatientState,
            PatientZip: row.PatientZip,
            PatientPaid: row.PatientPaid,

            // "RenderingEntType": row.RenderingEntType,
            RenderingFirst: row.RenderingFirst,
            RenderingLast: row.RenderingLast,
            RenderingProvID: {
                NPI: renderingProviderNpi,
            },
            ReferringFirst: refFirstName,
            ReferringMiddle: refMiddleName,
            ReferringLast: refLastName,
            ReferringProvID: {
                NPI: referring_provider_npi,
            },

            ClaimCharge: row.ClaimCharge,

            DiagnosisVersion: '10', // todo what is & where is it stored??
            // todo double check DiagnosisCodes10, refer to example scratch
            DiagnosisCodes10: {
                Principal: principle_diagnosis_code_selected_service_code, // for each diag icd 10 code ?
                ...row.notes_diagnosis.others,
            },
            Services: service_array,

            Insurances: insurance_array,
        };
    } catch (error) {
        console.log(error);
        errs += ', ' + error.message;
    }
    const empty_claim = empty_claim_api_request();
    final_api_request = merge(empty_claim, ability_api_claims_data);
    final_api_request.errs = errs;

    return final_api_request;
}

async function gather_claim_info(invoice_id, company_id) {
    // get invoice
    // get client from invoice
    // get default insurance card from client
    // put together the api request json
    // insert all this into insurance claims table
    let result = {
        id: 0,
        company_id: company_id,
        office_id: 1,
        insurance_payer_id: 0,
        claim_status: 'new',
        npi: 0,
        insurance_era_id: 0,
        invoice_id: invoice_id,
        client_id: 0,
        api_request_json: empty_claim_api_request(),
        api_response_json: {},
        api_claim_id: 0,
    };
    let builder = getBuilder('invoices', company_id);
    builder
        .where('invoices.id', invoice_id)
        .join('clients', 'invoices.client_id', 'clients.id')
        .where('clients.company_id', company_id)
        .where('clients.deleted', 0)

        .join('insurance_cards', 'invoices.client_id', 'insurance_cards.client_id')
        .where('insurance_cards.company_id', company_id)
        .where('insurance_cards.deleted', 0)
        .where('insurance_cards.primary_insurance_card', 1)

        .select('invoices.client_id', 'insurance_cards.id AS card_id', 'insurance_cards.insurance_payers_id')
        .limit(1);
    const ins_card = await execute(builder);

    builder = getBuilder('notes', company_id);
    builder
        .join('clients', 'notes.client_id', 'clients.id')
        .where('clients.company_id', company_id)
        .where('clients.deleted', 0)

        .join('users', 'notes.provider_id', 'users.id')
        .where('users.company_id', company_id)
        .where('users.deleted', 0)

        .join('invoices', 'notes.invoice_id', 'invoices.id')
        .where('invoices.company_id', company_id)
        .where('invoices.deleted', 0)

        .where('notes.note_type', 'progress')
        .where('notes.invoice_id', invoice_id);
    const progress_note = await execute(builder);

    if (ins_card && ins_card.length && ins_card[0]['card_id'] && progress_note && progress_note.length) {
        let api_request_json = await auto_populate_claim_api_request(
            invoice_id,
            company_id,
            ins_card[0].client_id,
            ins_card[0].card_id,
            progress_note[0]
        );
        let errs = api_request_json.errs;
        delete api_request_json.errs;
        result = {
            id: 0,
            company_id: company_id,
            office_id: 1,
            insurance_payer_id: ins_card[0].insurance_payers_id || 0,
            claim_status: 'new',
            npi: 0,
            insurance_era_id: 0,
            invoice_id: invoice_id,
            client_id: ins_card[0].client_id,
            api_request_json: api_request_json,
            api_response_json: {},
            api_claim_id: 0,
            errs: errs,
        };
    } else {
        result.errs = 'NO Primary Insurance Card and/or Progress Note for this invoice';
    }
    return result;
}

async function validate_claim(claim_api_id, company_id) {
    try {
        const token = await get_access_token();
        if (token && claim_api_id) {
            const claim_url = `${process.env.INSURANCE_API_URL}/claims/${claim_api_id}/events`;
            const acct_key = await get_acct_key(company_id);
            const get_claim_events = await get2api(claim_url, null, token, acct_key);
            const claim_info = get_claim_events.data.info;

            // Status CREATED means validation is not complete yet, lets check again
            if (claim_info) {
                switch (claim_info.status) {
                    case 'CREATED':
                        return validate_claim(claim_api_id, company_id);
                    case 'ERROR':
                        return {
                            validationSucceeded: false,
                            errors: get_claim_events.data.errors,
                            events: get_claim_events.data,
                        };
                    case 'VALIDATED':
                        return {
                            validationSucceeded: true,
                            errors: ['No validation Errors found.'],
                            events: get_claim_events.data,
                        };
                    default:
                        return {
                            validationSucceeded: false,
                            errors: ['No valid event status found.'],
                            events: get_claim_events.data,
                        };
                }
            }
            console.log('our claim ID in validate bot: ', claim_api_id);
            return {
                validationSucceeded: false,
                errors: ['Claim validation timed out. Please revalidate claim.'],
                events: ['No events found due to claim validation timed out. Please revalidate claim.'],
            };
        }
    } catch (err) {
        console.log(`error caught validating api claim id ${claim_api_id}: `, err);
    }
}

async function submit_claim(claim_info, company_id, claim_id) {
    console.log('our claim ID in submit top: ', claim_id);
    let result = { claimRecord: 0, err: 0 };
    // // assume claim_info has at least ins card id + invoice id (invoice will have counselor / user / therapist / provider id
    // // card client id should be same as invoice client id
    // // grab progress note by the invoice id to get dx, + service codes, client, and provider id
    // // if claim_id is null, 0, or new, then a new claim, else
    // // UPDATE & RESUBMIT the insurance_claims record where id = claim_id
    // // parse claim_info
    // // save insurance_claims
    // // send it to clearinghouse
    // // parse response
    // // update insurance_claim
    // // return insurance_claim record
    try {
        const token = await get_access_token();
        if (token) {
            let url = `${process.env.INSURANCE_API_URL}/claims`;
            // const getClaimUrl = `${url}/${claim_id}`; // old = api_request_json.ClaimID.ClaimNo
            const acct_key = await get_acct_key(company_id);

            let claimInfoBody = JSON.parse(claim_info[0].api_request_json);

            if (claim_info[0].api_response_json) {
                // @todo make sure this alters the record at the right ime
                if (claimInfoBody.TransType === 'PROF_CLAIM') {
                    // cms 1500
                    if ('PatientStatus' in claimInfoBody) {
                        delete claimInfoBody.PatientStatus;
                    }
                    if ('AdmissionType' in claimInfoBody) {
                        delete claimInfoBody.AdmissionType;
                    }
                    if ('AdmissionSource' in claimInfoBody) {
                        delete claimInfoBody.AdmissionSource;
                    }
                    if ('Services' in claimInfoBody) {
                        for (const service of claimInfoBody.Services) {
                            if ('RevenueCode' in service) {
                                delete service.RevenueCode;
                            }
                        }
                    }

                    if ('DiagnosisCodes10' in claimInfoBody) {
                        const newDiagShape = {};
                        for (const diag in claimInfoBody.DiagnosisCodes10) {
                            if (claimInfoBody.DiagnosisCodes10[diag].Code !== undefined) {
                                newDiagShape[diag] = claimInfoBody.DiagnosisCodes10[diag].Code;
                            } else {
                                newDiagShape[diag] = claimInfoBody.DiagnosisCodes10[diag];
                            }
                        }
                        claimInfoBody.DiagnosisCodes10 = newDiagShape;
                    }

                    if (claimInfoBody.ConditionCodes) {
                        delete claimInfoBody.ConditionCodes;
                    }
                }

                // no null kids
                if (claimInfoBody.ClaimDate && Object.keys(claimInfoBody.ClaimDate).length) {
                    for (const [k, v] of Object.entries(claimInfoBody.ClaimDate)) {
                        if (!v) {
                            delete claimInfoBody.ClaimDate[k];
                        }
                    }
                }

                // check if claimDate is empty
                if (claimInfoBody.ClaimDate && Object.keys(claimInfoBody.ClaimDate).length === 0) {
                    // cannot submit empty claim date object, remove it.
                    delete claimInfoBody.ClaimDate;
                }

                // we need to scrub additional properties from claim if type is UBO4/INST_CLAIM
                if (claimInfoBody['TransType'] === 'INST_CLAIM') {
                    // ub-04
                    // remove additional property RenderingEntType
                    if ('RenderingEntType' in claimInfoBody) {
                        delete claimInfoBody.RenderingEntType;
                    }
                    // remove additional property EmploymentStatus
                    if ('EmploymentStatus' in claimInfoBody) {
                        delete claimInfoBody.EmploymentStatus;
                    }
                    // remove additional property BillingEntType
                    if ('BillingEntType' in claimInfoBody) {
                        delete claimInfoBody.BillingEntType;
                    }

                    // services do not have a ThroughDate or a FromDate for INST_CLAIM type
                    if ('Services' in claimInfoBody) {
                        for (const service of claimInfoBody.Services) {
                            // remove additional property ThroughDate
                            if ('ThroughDate' in service) {
                                delete service.ThroughDate;
                            }
                            // remove additional property FromDate
                            if ('FromDate' in service) {
                                delete service.FromDate;
                            }

                            // remove additional property Emergency
                            if ('Emergency' in service) {
                                delete service.Emergency;
                            }

                            // remove additional property PlaceService
                            if ('PlaceService' in service) {
                                delete service.PlaceService;
                            }

                            if ('DiagnosisPointer' in service) {
                                delete service.DiagnosisPointer;
                            }
                        }
                    }

                    // mutate data based on requirements for INST_CLAIM type
                    // the shape of DiagnosisCodes10 needs to change
                    // todo this is required, without it the ub04 "Submit Claim to Clearinghouse" will fail.
                    //  I tested resubmitting the claim and that worked with this too.
                    if ('DiagnosisCodes10' in claimInfoBody) {
                        const newDiagShape = {};
                        for (const diag in claimInfoBody.DiagnosisCodes10) {
                            if (typeof claimInfoBody.DiagnosisCodes10[diag] === 'string') {
                                newDiagShape[diag] = { Code: claimInfoBody.DiagnosisCodes10[diag] };
                            }
                        }
                        if (Object.entries(newDiagShape).length) {
                            claimInfoBody.DiagnosisCodes10 = newDiagShape;
                        }
                    }
                }
                if (claim_info[0].claim_status == 'new') {
                    claimInfoBody.ClaimID.ClaimNo =
                        new Date().getTime().toString().substring(0, 11) +
                        (claim_info[0].invoice_id % 10000).toString().padStart(4, '0');
                    claim_info[0].api_claim_id = claimInfoBody.ClaimID.ClaimNo;
                    await update_claim(claim_id, claim_info[0], company_id);
                }
                claim_info[0].api_request_json = JSON.stringify(claimInfoBody);
            }
            let postClaimResult;
            try {
                // console.log('our claim_info: ', claim_info[0]);
                if (claim_info[0].claim_status == 'new') {
                    // post new claims
                    url += '?validationOverride=all';
                    postClaimResult = await post2api(url, claim_info[0], token, acct_key);
                } else {
                    // await update_claim(claim_id, claim_info[0], company_id)
                    // let claim_data_redo = claimInfoBody
                    // put to update / re-submit old claims // resubmit
                    // first get the claim via api to grab importbatchid
                    // "ImportBatchID": "28451220323268554306",
                    // "DestInsNo": 1,
                    // "TransID": "440896915",
                    // "SourceFileID": "28451220323268554306",
                    const getClaimUrl = `${url}/${claimInfoBody.ClaimID.ClaimNo}`;
                    const claimDataFromApi = await get2api(getClaimUrl, null, token, acct_key);
                    if (claimDataFromApi && claimDataFromApi.data) {
                        claimInfoBody.ImportBatchID = '0';
                        // claimInfoBody = merge(claimInfoBody, claimDataFromApi.data)
                        // claimInfoBody.ImportBatchID = claimDataFromApi.data.ImportBatchID
                        // claimInfoBody.TransID = claimDataFromApi.data.TransID
                        // claimInfoBody.SourceFileID = claimDataFromApi.data.SourceFileID
                        url += `/batch?overwriteClaims=true&validationOverride=all`; // ${claim_info[0].api_claim_id}
                        let one_claim_batch = [claimInfoBody];
                        claim_info[0].api_request_json = JSON.stringify(one_claim_batch);
                        postClaimResult = await post2api(url, claim_info[0], token, acct_key, 0);
                    }
                }
                // console.log('our post result: ', postClaimResult);
                // const claimDataFromApi = await get2api(getClaimUrl, null, token, acct_key);
                // console.log('our get2Api res in submit claim: ', claimDataFromApi);

                if (postClaimResult && postClaimResult.headers) {
                    result = { xTraceId: postClaimResult.headers['x-traceid'], claimRecord: claim_info[0] };
                } else {
                    result.err = postClaimResult;
                }
                console.log('our claim ID in submit bottom: ', result);
            } catch (e) {
                result.err = e.message;
            }
        }
    } catch (e) {
        console.log(e); // .response.status, e.response.statusText, e.response.data.errors);
        result.err = e.message;
    }

    return result;
}

async function update_eras(eras, company_id) {
    const response = {
        data: {
            recordsAdded: 0,
            data: {},
        },
    };

    const token = await get_access_token();
    if (token) {
        const currentTime = new Date();
        const today = new Date(currentTime.getTime()).toISOString();
        const pastTime = new Date(currentTime.setDate(currentTime.getDate() - 1));
        const yesterday = new Date(pastTime.getTime()).toISOString();

        let remitsClaimsUrl = `${process.env.INSURANCE_API_URL}/remits/claims`;
        const getRemitClaimsQuery = {
            created: `${yesterday.split('T')[0]},${today.split('T')[0]}`,
            offset: '0',
            limit: '99',
        };
        const acct_key = await get_acct_key(company_id); // each acct key = remits for ONLY certain child accounts (company)

        const remitsResult = await get2api(remitsClaimsUrl, getRemitClaimsQuery, token, acct_key);
        response.data.data = remitsResult.data;

        if (
            response &&
            'data' in response &&
            'data' in response.data &&
            'records' in response.data.data &&
            response.data.data.records.length
        ) {
            const builder = getBuilder('insurance_eras', company_id, { isInsert: true });
            const builder_detail = getBuilder('insurance_era_service_items', company_id, { isInsert: true });
            const builderSelect = getBuilder('insurance_eras', company_id);
            builderSelect.whereBetween('dayt_create', [yesterday, today]);
            const existingEraRemits = await execute(builderSelect);

            for (const remit of response.data.data.records) {
                const existingRecords = existingEraRemits.some((rem) => rem.era_id === remit.id.toString());
                if (!existingRecords) {
                    const remitClaimUrl = `${remitsClaimsUrl}/${remit.id}`;
                    const remitEraData = await get2api(remitClaimUrl, '', token, acct_key);
                    const era_detail = remitEraData.data;
                    let insertData = {
                        company_id: company_id, // birch
                        office_id: 1, // birch
                        deleted: 0, // birch
                        active: 1, // birch
                        insurance_payer_id: remit.payer_icn, // birch on ability payer_icn
                        payer_name: remit.payer_name, // ability
                        check_num: remit.check_number, // ability
                        era_id: `${remit.id}`, // ability
                        paid_date: remit.pay_date,
                        paid_amount: remit.claim_payment * 100, // ability claim_payment - convert to pennies
                        api_response_json: JSON.stringify(era_detail)
                    };

/* remit:
{
  "_id": "474774505",
  "create_date": "2022-06-08T09:32:19Z",
  "create_mode": "IMPORT",
  "patient_control_no": "560",
  "patient_ctl_no": "560",
  "patient": "LAST, FIRSTNAME",
  "patient_name": "LAST, FIRSTNAME",
  "member_id": "7802891990",
  "claim_charge": "495.00",
  "claim_payment": "0.00",
  "statement_start": "2021-10-12T00:00:00Z",
  "statement_end": "2021-10-12T00:00:00Z",
  "payer_name": "SUNSHINE STATE AND TANGO HEALTHPLANS",
  "pay_date": "2022-06-07T00:00:00",
  "payee_name": "SQUARE 1 CLINICS, INC JCQ1",
  "check_number": "X307528639",
  "payer_control_no": "V151FLEB4158",
  "payer_icn": "V151FLEB4158",
  "payee_npi": "1184258832",
  "trans_id": 474774505,
  "id": 474774505
}
 */
                    builder.insert(insertData);
                    const result = await execute(builder);
                    result.length && ++response.data.recordsAdded;
                    let result_detail;
                    const insurance_eras_id = result[0];
                    const service_lines = era_detail.Services; // wth does this look like when there are multiple claims per era/eob/remittance/remitpayment ?!?!?
                    for (const service_line of service_lines) {
                        /*                         service line
                        {
                          "Charge": "495",
                          "RevenueCode": "0905",
                          "Adjustments": [
                            {
                              "AdjAmount": "495",
                              "AdjQuantity": "",
                              "GroupCode": "CO",
                              "ReasonCode": "5"
                            }
                          ],
                          "RenderingProvID": {
                            "NPI": "1184258832"
                          },
                          "ReimbursementAmount": null,
                          "Units": "1",
                          "UnitsPaid": "1",
                          "Payment": "0",
                          "ServiceStart": "2021-10-12",
                          "UnderpaymentAmount": 0,
                          "RemarkCodes": [
                            {
                              "RemarkCode": "M77",
                              "RemarkType": "HE"
                            }
                          ],
                          "Balanced": "Y",
                          "Modifier1": "",
                          "Modifier2": "",
                          "Underpayment": "N",
                          "LineNo": 1,
                          "Modifier3": "",
                          "Modifier4": ""
                        }
                         */
                        let insert_detail = {
                            company_id: company_id, // birch
                            office_id: 1, // birch
                            deleted: 0, // birch
                            active: 1, // birch
                            insurance_eras_id: insurance_eras_id,
                            api_insurance_payer_id: remit.payer_icn, // birch on ability payer_icn
                            payer_name: remit.payer_name, // ability
                            check_num: remit.check_number, // ability
                            api_era_id: `${remit.id}`, // ability
                            paid_date: remit.pay_date,
                            paid_amount_service_line: 0, // who knows how much of the total paid_amount: remit.claim_payment * 100 from above will be allocated to this item - it's a manual entry
                            api_response_json: JSON.stringify(remitEraData.data),
                            api_patid: era_detail.PatID,
                            api_TransID: era_detail.TransID,
                            client_id: era_detail.PatientCtlNo, // we will start off here and hopefully this is correct, but may require manual match up
                            api_patientctlno: era_detail.PatientCtlNo, // "402", // should be the same as birch.client.id
                            api_payerctlno: era_detail.PayerCtlNo,
                            api_renderingprovid_taxid: era_detail.RenderingProvID.TaxID,
                            api_lineno: service_line.LineNo,
                            api_hcpc: service_line.HCPC ?? "",
                            api_units: service_line.Units,
                            api_service_line_raw_json: JSON.stringify(service_line),
                            api_charge: service_line.Charge * 100, // convert text /w decimal to pennies function?
                            api_allowed: (service_line.Allowed ?? 0) * 100, // convert text /w decimal to pennies function?
                            api_payment: (service_line.Payment ?? 0) * 100, // convert text /w decimal to pennies function?
                            // add some more here
                        }
                        builder_detail.insert(insert_detail);
                        result_detail = await execute(builder_detail);
                    }
                }
            }
        }
    }

    return response;
}

// get remits/payments = edi 835

// async function get_claims(company_id) {
//     // list claims
//     let response = {};
//     const token = await get_access_token();
//     if (token) {
//         const url = process.env.INSURANCE_API_URL + '/claims';
//         let query = `?offset=0&limit=999`;
//         const acct_key = await get_acct_key(company_id);
//         response.data = await get2api(url, query, token, acct_key);
//     }
//     return response;
// }

// -async function get_claim(claim_id, company_id) {
//     -    // 1 claim detail info // get /remits/claims/{id} id = CLAIM_ID
//         -    let response = {};
//     -    const token = await get_access_token();
//     -    if (token) {
//         -        const url = process.env.INSURANCE_API_URL + '/claims/' + claim_id;
//         -        const acct_key = await get_acct_key(company_id);
//         -        let query = `?offset=0&limit=999`;
//         -        response.data = await get2api(url, query, token, acct_key);
//         -    }
//     -
//         -    return response;
//     -}
// -

async function echo_test(data, company_id) {
    // let claim_id = "365789843"
    let response = {
        r: 'no tolkien',
    };
    const token = await get_access_token();
    if (token) {
        const url = process.env.INSURANCE_API_URL + '/test/echo';
        const acct_key = await get_acct_key(company_id);
        delete response.r;
        response.data = await post2api(url, data, token, acct_key);
    }

    // const url = process.env.INSURANCE_API_URL + '/claims/' + claim_id
    // response.url = url
    // const token = await get_access_token()
    // response.token = token
    // const acct_key = await get_acct_key(company_id)
    // response.acct_key = acct_key
    // if (token) {
    //     let query = `?offset=0&limit=999`
    //     response.data = await get2api(url, query, token, acct_key)
    // }
    return response;
}

async function get_acct_num(company_id) {
    // const builder = getBuilder('companies', company_id)
    // this is where we hit the db and get the acct num from company
    // probably good idea to make this ONLY accessible from hq site
    const response = process.env.INSURANCE_ACCT_NUM;
    return response;
}

async function get_acct_key(company_id) {
    // const builder = getBuilder('companies', company_id)
    // this is where we hit the db and get the acct num from company
    // probably good idea to make this ONLY accessible from hq site
    let response = process.env.INSURANCE_ACCT_KEY;
    const ability_network_id = await settingsRepo.getSetting('ability_network_id', 'company', company_id, company_id);
    if (ability_network_id && ability_network_id.value) {
        response = ability_network_id.value;
    }
    return response;
}

async function get_user(isEligibility = false) {
    // idk maybe this is what's different for each customer?
    // maybe store in company settings or hq db ?
    // ability, "Access Key"
    const user = isEligibility ? process.env.INSURANCE_ELIGIBILITY_KEY : process.env.INSURANCE_USER;
    return user;
}

async function get_pass(isEligibility = false) {
    // goes with get_user - encrypt in db + decrypt for here?
    // maybe store in company settings or hq db ?
    // ability, "Access Key Secret"
    const pass = isEligibility ? process.env.INSURANCE_ELIGIBILITY_SECRET : process.env.INSURANCE_PASS;
    return pass;
}

async function get_access_token(user = '', pass = '', isEligibility = false) {
    // if (key =='') {
    let key = process.env.INSURANCE_CLIENT_ID;
    // }
    // if (secret =='') {
    let secret = process.env.INSURANCE_CLIENT_SECRET;
    // }
    let result_token = 0; // 'sorry_no_token'
    /*
Client ID - Unique ID assigned to the account. = Account Number?
• Client Secret – Secret value assigned to the account. = Account Key?
• Access Key - myABILITY® Access Key for the user represented in the JWT
• Access Secret - Access Secret of myABILITY user represented in the JWT
     */

    if (user == '') {
        user = await get_user(isEligibility); // this can separate each "child" = our customer, OR user x-account-number
    }
    if (pass == '') {
        pass = await get_pass(isEligibility); // this can separate each "child" = our customer, OR user x-account-number
    }

    const x_account_key = 'X-AccountKey';
    let client_id = key; // given by secret implementation conversation w/ Craig
    let client_secret = secret; // given by secret implementation conversation w/ Craig
    let auth_value = client_id + ':' + client_secret;
    let buff = new Buffer(auth_value);
    let base64data = buff.toString('base64');
    /*
curl -X POST \
 https://idp.myabilitynetwork.com/connect/token \
 -H 'authorization: Basic <base64 of client username : client password>' \
 -H 'content-type: application/x-www-form-urlencoded' \
 -d 'grant_type=password&username=<username>&password=<password>&scope=openid%20ability%3Aaccessapi'

success response :
{"access_token":"lotsachars","expires_in":3600,"token_type":"Bearer"}%
*/
    const data = `grant_type=password&username=${user}&password=${pass}&scope=openid%20ability%3Aaccessapi`;

    let token_obj = 'none';
    let headers = {
        authorization: 'Basic ' + base64data,
        accept: 'application/json',
        'accept-language': 'en_US',
        'content-type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
    };
    try {
        const res2 = await axios.post(process.env.INSURANCE_IDP_URL, data, { headers: headers });
        token_obj = res2.data;
        if (token_obj.access_token) {
            result_token = token_obj.access_token;
        }
    } catch (error) {
        console.log(error);
    }

    return result_token; //  { u:user, p:pass, a:auth, d:data, url:process.env.INSURANCE_IDP_URL, toke:token_obj }
}

async function post2api(api_url, data, token, acct_key, vob = 0, extra_headers = '') {
    let response;
    const options = {
        headers: {
            Authorization: `Bearer  ${token}`,
            // 'X-Request-Mode': process.env.INS_TEST_MODE, // ? 'T' : 'P', // test or production mode
            'X-AccountKey': acct_key,
            accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
    // try {
        // const convertToXML = (obj) => {
        //     const iterator = (obj) => {
        //         if (typeof obj === 'string' || typeof obj === 'number') {
        //             return obj;
        //         }
        //
        //         if (Array.isArray(obj)) {
        //             return obj.map(iterator).join('');
        //         }
        //
        //         return Object.entries(obj)
        //             .map(([key, value]) => {
        //                 return `<${key}>${iterator(value)}</${key}>`;
        //             })
        //             .join('');
        //     };
        //     return '<?xml version="1.0" encoding="UTF-8"?>' + iterator(obj);
        // };

        // data.api_request_json = convertToXML(data.api_request_json);
    // } catch (error) {
    //     console.log(error);
    // }
    if (!vob) {
        options.headers['X-Request-Mode'] = process.env.INS_TEST_MODE; // ? 'T' : 'P' // test or production mode
    }

    if (extra_headers) {
        options.headers = merge(options.headers, extra_headers);
    }

    console.log({ url: api_url, postBody: data.api_request_json, options: options });

    try {
        response = await axios.post(api_url, data.api_request_json, options);
    } catch (e) {
        response = e.message;
        console.log([e.response.status, e.response.statusText, e.response.data, e.response.data.errors]);
    }

    return response;
}

async function put2api(api_url, data, token, acct_key, vob = 0) {
    let response;
    const options = {
        headers: {
            Authorization: `Bearer  ${token}`,
            'X-AccountKey': acct_key,
            accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };

    if (!vob) {
        options.headers['X-Request-Mode'] = process.env.INS_TEST_MODE; // ? 'T' : 'P' // test or production mode
    }

    console.log({ url: api_url, postBody: data.api_request_json, options: options });

    try {
        response = await axios.put(api_url, data.api_request_json, options);
    } catch (e) {
        response = e.message;
        console.log([e.response.status, e.response.statusText, e.response.data, e.response.data.errors]);
    }

    return response;
}

async function get2api(api_url, query, token, acct_key) {
    let response;

    const request_options = {
        headers: {
            Authorization: `Bearer  ${token}`,
            'X-Request-Mode': process.env.INS_TEST_MODE, //  ? 'T' : 'P', // test or production mode
            'X-AccountKey': acct_key,
            accept: 'application/json',
            'content-type': 'application/json',
        },
        params: {
            ...query,
        },
    };

    try {
        response = await axios.get(api_url, request_options);
    } catch (e) {
        console.log([e.response.status, e.response.statusText, e.response.data.errors]);
    }

    return response;
}

async function list_claims(criteria, company_id) {
    let schema = {};
    const MainDbTable = 'insurance_claims';
    const select_cols = [
        'insurance_claims.id as id',
        'insurance_claims.id as claim_id',
        'insurance_claims.invoice_id',
        'insurance_claims.api_claim_id as claim_number',
        'insurance_claims.submit_dayt as submission_date',
        'insurance_claims.claim_status',
        'ip.payer_name as payer',
        'insurance_claims.form_type as form_type',
        'clients.first_name',
        'clients.last_name',
        'service_codes.service_code',
    ];

    try {
        if (criteria && criteria.search) {
            schema = await get_schema(MainDbTable, select_cols);
        }

        const newBuilder = apply_criteria(criteria, schema, MainDbTable, company_id);
        newBuilder
            .where('insurance_claims.deleted', 0)
            .join('clients', 'insurance_claims.client_id', 'clients.id')
            .where('clients.company_id', company_id)
            .where('clients.deleted', 0)
            .joinRaw(
                'left join (select invoice_id, service_code_id, actual_cost from service_items where deleted = 0 and company_id = :company_id) serv on insurance_claims.invoice_id = serv.invoice_id',
                { company_id }
            )
            .leftJoin('service_codes', 'serv.service_code_id', 'service_codes.id')
            .joinRaw(
                'left join (select payer_name, deleted, id from insurance_payers where deleted = 0) ip on insurance_claims.insurance_payer_id = ip.id'
            )
            .where('service_codes.deleted', 0)
            .groupBy('insurance_claims.id')
            .select(
                'insurance_claims.id as id',
                'insurance_claims.id as claim_id',
                'insurance_claims.invoice_id',
                'insurance_claims.api_claim_id as claim_number',
                'insurance_claims.submit_dayt as submission_date',
                'insurance_claims.claim_status',
                'ip.payer_name as payer',
                'insurance_claims.api_request_json'
            )
            .select(mainDb.raw('CONCAT_WS(" ", clients.first_name, clients.last_name) AS client'))
            .select(mainDb.raw('sum(serv.actual_cost) as total_charge'))
            .select(mainDb.raw('GROUP_CONCAT(service_codes.service_code) as services'))
            .select(
                mainDb.raw('JSON_UNQUOTE(JSON_EXTRACT(insurance_claims.api_request_json, "$.TransType")) AS form_type')
            );
        const claimsData = await execute(newBuilder);

        const formType = { PROF_CLAIM: 'CMS-1500', INST_CLAIM: 'UB-04' };
        const newRowData = [];
        for (const row of claimsData) {
            const claimSubmitBody = JSON.parse(row.api_request_json);

            let services = ['None Listed'];
            if (
                'Services' in claimSubmitBody &&
                claimSubmitBody.Services.length &&
                'HCPC' in claimSubmitBody.Services[0]
            ) {
                services = claimSubmitBody.Services.map((ser) => ser.HCPC);
            }

            const ourResult = {
                id: row.id,
                claim_id: row.claim_id,
                claim_number: row.claim_number,
                submission_date: row.submission_date,
                client: row.client,
                payer: row.payer || 'No Payer',
                claim_status: row.claim_status,
                total_charge: row.total_charge || 0,
                form_type: formType[row.form_type] || '',
                services: row.services || 'None Listed',
            };
            newRowData.push(ourResult);
        }

        let total_count = 0;
        if (schema) {
            total_count = await get_count(criteria, schema, MainDbTable, company_id, newBuilder);
        }

        return {
            total_count: total_count,
            rows: newRowData,
        };
    } catch (e) {
        console.log('our error: ', e);
    }
}

/*
Client ERA ID	Paid Date		Payer	Payer ICN	Service Date	Services Associated (CPT) 	Total Charge	Amount Paid
 */
async function list_eras(criteria, company_id) {
    let MainDbTable = 'insurance_eras';
    let schema = {};
    const select_cols = [
        'insurance_eras.id',
        'insurance_eras.era_id',
        'insurance_eras.paid_date as create_date',
        'insurance_eras.paid_date',
        'insurance_eras.payer_name as payer',
        'insurance_eras.insurance_payer_id as icn',
        'insurance_eras.dayt_create as service_date',
        'insurance_eras.paid_amount as paid_amount',
        'insurance_eras.api_response_json',
    ];
    if (criteria && criteria.search) {
        schema = await get_schema(MainDbTable, select_cols);
    }
    const builder = apply_criteria(criteria, schema, MainDbTable, company_id);
    builder.select(select_cols);
    const data = await execute(builder);

    if (Array.isArray(data) && data.length) {
        for (const era of data) {
            if ('paid_amount' in era) {
                era.paid_amount = formatCurrency(era.paid_amount);
            }

            if ('api_response_json' in era) {
                const responseJson = JSON.parse(era.api_response_json);

                if ('CreateDate' in responseJson) {
                    era.create_date = responseJson.CreateDate;
                }

                if ('ClaimPayment' in responseJson) {
                    era.paid_amount = formatCurrency(responseJson.ClaimPayment);
                }

                if ('ClaimCharge' in responseJson) {
                    era.total_charge = formatCurrency(responseJson.ClaimCharge);
                }
            }
        }
    }

    const total_count = await get_count(criteria, schema, MainDbTable, company_id);
    return {
        total_count: total_count,
        rows: data,
    };
}

async function list_verifications(criteria, company_id) {
    let MainDbTable = 'insurance_verifications';
    let schema = {};
    const select_cols = [
        // afv - diff w/ stage
        'insurance_verifications.id',
        'insurance_cards.member_id as member_id',
        'insurance_cards.group_id as group_id',
        'insurance_payers.payer_name as payer',
        'insurance_verifications.start_date_auth as coverage_start_date',
        'insurance_verifications.end_date_auth as coverage_end_date', // afv - diff w/ stage
    ]; // afv - diff w/ stage
    if (criteria && criteria.search) {
        schema = await get_schema(MainDbTable, select_cols);
    }
    const builder = apply_criteria(criteria, schema, MainDbTable, company_id);
    let sqlToMod = builder._statements?.find((s) => s.type == 'whereRaw');
    let statementsIndexToMod = builder._statements?.findIndex((s) => s.type == 'whereRaw');
    if (statementsIndexToMod !== -1) {
        builder._statements[statementsIndexToMod].value.sql = sqlToMod.value?.sql.replace(
            ',',
            ',`clients`.`first_name`, `clients`.`last_name`,'
        );
    }

    // afv - diff w/ stage
    builder
        .join('clients', 'insurance_verifications.client_id', 'clients.id')
        .where('clients.company_id', company_id)
        .where('clients.deleted', 0)
        .leftJoin('insurance_cards', 'insurance_cards.id', 'insurance_verifications.insurance_cards_id')
        .where('insurance_cards.company_id', company_id)
        .where('insurance_cards.deleted', 0)
        .leftJoin('insurance_payers', 'insurance_payers.id', 'insurance_cards.insurance_payers_id')
        .where('insurance_payers.deleted', 0)
        .select(mainDb.raw('CONCAT_WS(" ", clients.first_name, clients.last_name) AS client'))
        .select(select_cols); // afv - diff w/ stage
    // afv - diff w/ stage
    const data = await execute(builder);
    const total_count = await get_count(criteria, schema, MainDbTable, company_id, builder);
    let result = {
        total_count: total_count,
        rows: data,
    };
    return result;
}

async function get_claim(id, company_id, check_saved = true) {
    let MainDbTable = 'insurance_claims';
    const builder = getBuilder(MainDbTable, company_id);

    builder
        .where('id', id)
        .select(
            'insurance_claims.id',
            'insurance_claims.active',
            'insurance_claims.insurance_payer_id',
            'insurance_claims.claim_status',
            'insurance_claims.npi',
            'insurance_claims.insurance_era_id',
            'insurance_claims.submit_dayt',
            'insurance_claims.claim_fee',
            'insurance_claims.client_id',
            'insurance_claims.api_request_json',
            'insurance_claims.api_response_json',
            'insurance_claims.api_claim_id',
            'insurance_claims.invoice_id',
            'insurance_claims.form_type'
        );
    if (check_saved) {
        builder.select(mainDb.raw('IF(insurance_claims.dayt_create = insurance_claims.dayt_mod,0,1) as saved'));
    }

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    return result;
}

async function delete2api(claim_id, company_id) {
    const claim_info = await get_claim(claim_id, company_id);
    let response = 'idk';
    if (claim_info && claim_info[0] && claim_info[0].api_request_json && claim_info[0].api_response_json)
        try {
            const token = await get_access_token();
            if (token) {
                let url = `${process.env.INSURANCE_API_URL}/claims`;
                const acct_key = await get_acct_key(company_id);
                let claimInfoBody = JSON.parse(claim_info[0].api_request_json);
                if (claimInfoBody.ClaimID && claimInfoBody.ClaimID.ClaimNo) {
                    // get api first + if this api_request_json is the same, then ok to delete
                    // otherwise is was "worked" in ability portal, and do NOT delete
                    // hide delete button on the client too

                    const api_url = `${url}/${claimInfoBody.ClaimID.ClaimNo}`;

                    const request_options = {
                        headers: {
                            Authorization: `Bearer  ${token}`,
                            'X-Request-Mode': process.env.INS_TEST_MODE, // ? 'T' : 'P',
                            'X-AccountKey': acct_key,
                            accept: 'application/json',
                            'content-type': 'application/json',
                        },
                    };
                    try {
                        response = await axios.delete(api_url, request_options);
                        if (response.status >= 200 && response.status <= 201) {
                            claim_info[0].claim_status = 'new';
                            await update_claim(claim_id, claim_info[0], company_id);
                            response = 'Claim Deleted';
                        }
                    } catch (e) {
                        response = e.response.data;
                    }
                } else {
                    response = 'no ClaimNo';
                }
            }
        } catch (e) {
            response = e.message;
        }
    return response;
}

async function submit2api(claim_id, company_id) {
    const claim_data = await get_claim(claim_id, company_id, false);
    let result = -1;
    let claim_api_response; // , claim_validation;

    if (claim_data) {
        claim_api_response = await submit_claim(claim_data, company_id, claim_id);
        console.log('our claim api response: ', claim_api_response);
    }

    if (claim_api_response.claimRecord) {
        const claimRequestData = JSON.parse(claim_api_response.claimRecord.api_request_json);
        console.log('our claim request data: ', claimRequestData);
        claim_data[0].api_claim_id = claimRequestData.ClaimID.ClaimNo;
        result = 'Claim submitted # ' + claim_data[0].api_claim_id;
        claim_data[0].claim_status = 'submitted';
        // claim_validation = await validate_claim(claim_data[0].api_claim_id, company_id);

        // if (!claim_validation.validationSucceeded) {
        //     claim_data[0].claim_status = 'error';
        //     claim_data[0].api_response_json = JSON.stringify(claim_validation.errors);
        //     result = 'Claim submitted with validation errors, please refresh to see errors.';
        // }

        // if (claim_validation.validationSucceeded) {
        //     result = 'Claim submitted successfully, without validation errors.';
        // }

        await update_claim(claim_id, claim_data[0], company_id);

        const ourDate = new Date();
        const eventData = {
            company_id: company_id,
            office_id: 1,
            deleted: 0,
            dayt_create: ourDate,
            dayt_mod: ourDate,
            active: claim_data[0].active,
            claim_id: claim_id,
            claim_status: claim_data[0].claim_status,
            submit_dayt: claim_data[0].submit_dayt,
            invoice_id: claim_data[0].invoice_id,
            client_id: claim_data[0].client_id,
            user_id_create: claim_data[0].user_id_create,
            user_id_mod: claim_data[0].user_id_mod,
            api_url: process.env.INSURANCE_API_URL,
            api_request_json: claim_data[0].api_request_json,
            api_response_json: JSON.stringify(claim_api_response),
        };
        await insert_claim_event(claim_id, eventData, company_id);
    } else {
        result = claim_api_response.err;
    }

    return result;
}

async function check_claim_errors(claim_id, company_id) {
    const claim_data = await get_claim(claim_id, company_id, false);
    let result = -1;
    let claim_validation = await validate_claim(claim_data[0].api_claim_id, company_id);

    if (claim_validation) {
        if (!claim_validation.validationSucceeded) {
            claim_data[0].claim_status = 'error';
            claim_data[0].api_response_json = JSON.stringify(claim_validation.errors);
            result = 'Claim submitted with validation errors, please refresh to see errors.';
        }

        if (claim_validation.validationSucceeded) {
            result = 'Claim submitted successfully, without validation errors.';
        }

        await update_claim(claim_id, claim_data[0], company_id);

        const ourDate = new Date();
        const eventData = {
            company_id: company_id,
            office_id: 1,
            deleted: 0,
            dayt_create: ourDate,
            dayt_mod: ourDate,
            active: claim_data[0].active,
            claim_id: claim_id,
            claim_status: claim_data[0].claim_status,
            submit_dayt: claim_data[0].submit_dayt,
            invoice_id: claim_data[0].invoice_id,
            client_id: claim_data[0].client_id,
            user_id_create: claim_data[0].user_id_create,
            user_id_mod: claim_data[0].user_id_mod,
            api_url: process.env.INSURANCE_API_URL,
            api_request_json: claim_data[0].api_request_json,
            api_response_json: JSON.stringify(claim_validation.events),
        };
        await insert_claim_event(claim_id, eventData, company_id);
    }
    return result;
}

async function get_era(id, company_id) {
    let MainDbTable = 'insurance_eras';
    const builder = getBuilder(MainDbTable, company_id);

    builder
        .where('id', id)
        .select(
            'insurance_eras.id',
            'insurance_eras.deleted',
            'insurance_eras.dayt_create',
            'insurance_eras.payer_name',
            'insurance_eras.insurance_payer_id',
            'insurance_eras.check_num',
            'insurance_eras.era_id',
            'insurance_eras.paid_date',
            'insurance_eras.paid_amount',
            'insurance_eras.api_response_json'
        );

    try {
        const result = await execute(builder);
        if (result.length === 0) {
            return null;
        }

        return result;
    } catch (e) {
        console.error('our error: ', e);
    }
}

async function get_verification(id, company_id) {
    let MainDbTable = 'insurance_verifications';

    const builder = getBuilder(MainDbTable, company_id);

    builder
        .where('insurance_verifications.id', id)
        .join('clients', 'insurance_verifications.client_id', 'clients.id')
        .where('clients.company_id', company_id)
        .where('clients.deleted', 0)
        .select(
            'insurance_verifications.id',
            'insurance_verifications.ins_num',
            'insurance_verifications.group_num',
            'insurance_verifications.api_request_json',
            'insurance_verifications.api_response_json',
            'insurance_verifications.start_date_auth',
            'insurance_verifications.end_date_auth'
        )
        .select(mainDb.raw('CONCAT_WS(" ", clients.first_name, clients.last_name) AS client'));

    const result = await execute(builder);

    if (result.length === 0) {
        return null;
    }

    return result;
}

async function getPrimaryInsuranceVerification(company_id, client_id) {
    const builder = getBuilder('insurance_cards', company_id);
    builder
        .select(
            'insurance_verifications.*',
        )
        .leftJoin('insurance_verifications', 'insurance_verifications.insurance_cards_id', 'insurance_cards.id')
        // @todo make left join probably
        // .join('insurance_verifications', 'insurance_cards.id','insurance_verifications.insurance_cards_id')
        .where('insurance_cards.client_id', client_id)
        .where('insurance_cards.plan_type', 'Primary')
        .orderBy('insurance_cards.dayt_create','asc')
        .limit(1);

    const insurances = await execute(builder);
    return insurances;
}

async function get_alternate_ins_subscriber(subscriber_client_id, company_id) {
    const builder = getBuilder('clients', company_id).where('id', subscriber_client_id);
    const result = await execute(builder);
    return result[0];
}

async function invoice2claim(invoice_id, company_id) {
    // find existing claim by invoice id
    // if none, then gather_claim + create new record
    // return  insurance_claims.id
    let claim_id = 0;
    let errs = '';
    let MainDbTable = 'insurance_claims';
    const builder = getBuilder(MainDbTable, company_id);

    builder.where('insurance_claims.invoice_id', invoice_id).select('insurance_claims.id');

    const result = await execute(builder);

    if (result.length && result[0].id) {
        claim_id = result[0].id;
    } else {
        try {
            const claim_data = await gather_claim_info(invoice_id, company_id);

            errs = claim_data.errs;
            delete claim_data.errs;

            // let claim_api_response;
            // if (claim_data) {
            //     claim_api_response = await submit_claim(claim_data, company_id);
            // }
            //
            // if (claim_api_response) {
            //     claim_data.api_response_json = claim_api_response;
            //     claim_data.api_claim_id = claim_api_response.claimRecord.ClaimID.ClaimNo;
            // }

            if (claim_data.client_id) {
                claim_id = await save_claim(0, claim_data, company_id);
            }
            // let claim_validation;
            // if (claim_id) {
            //     claim_validation = await validate_claim(claim_api_response.claimRecord.ClaimID.ClaimNo, company_id);
            // }
            //
            // if (!claim_validation.validationSucceeded) {
            //     claim_data.claim_status = 'error'
            //     claim_data.api_response_json = JSON.stringify(claim_validation.errors)
            //     await update_claim(claim_id, claim_data, company_id);
            // }
            //
            // if (claim_validation.validationSucceeded) {
            //     console.log('success!!! WE HAVE A VALID Claim!!!!!!');
            // }
        } catch (err) {
            console.log('error caught in invoice 2 claim: ', err);
        }
    }

    return { claimd_id: claim_id, errs: errs };
}

async function update_claim(id, info, company_id) {
    const db_table = 'insurance_claims';
    const builder = getBuilder(db_table, company_id);
    builder.update(info).where('id', id);
    return await execute(builder);
}

async function save_claim(id, info, company_id) {
    let MainDbTable = 'insurance_claims';
    let builder = {},
        wth;
    let response, stringy;
    info.company_id = company_id;
    if (info.api_request_json) {
        stringy = JSON.stringify(info.api_request_json);
        info.api_request_json = stringy;
    }
    // else {
    //     info.api_request_json = '"{}"';
    // }
    if (info.api_response_json) {
        stringy = JSON.stringify(info.api_response_json);
        info.api_response_json = stringy;
    }
    // else {
    //     info.api_response_json = '"{}"';
    // }
    if (id === 'new' || id === 0) {
        delete info.id;
        builder = getBuilder(MainDbTable, company_id, { isInsert: true });
        builder.insert(info);
        response = await execute(builder);
        response = response[0];
    } else {
        builder = getBuilder(MainDbTable, company_id);
        builder.update(info).where('id', id);
        let result = await execute(builder);
        response = id;
    }

    return response;
}

async function insert_claim_event(id, info, company_id) {
    const MainDbTable = 'insurance_events';
    const builder = getBuilder(MainDbTable, company_id, { isInsert: true });
    builder.insert({ ...info, company_id });
    const response = await execute(builder);

    return response[0];
}

async function update_claim_event(id, info, company_id) {
    const db_table = 'insurance_events';
    const builder = getBuilder(db_table, company_id);
    builder.update(info).where('id', id);

    return await execute(builder);
}

async function deleteInsurance(insurance_id, company_id) {
    const builder = getBuilder('insurance_cards', company_id);
    builder.where('id', insurance_id).update('deleted', 1);

    return await execute(builder);
}

module.exports = {
    createInsurance,
    updateInsuranceDetailsByID,
    updateInsuranceContactInfoByID,
    updateInsurancePhotoByID,
    verify_eligibility,
    submit_claim,
    update_eras,
    list_claims,
    list_eras,
    list_verifications,
    get_claim,
    submit2api,
    delete2api,
    check_claim_errors,
    get_era,
    get_verification,
    getPrimaryInsuranceVerification,
    echo_test,
    invoice2claim,
    save_claim,
    deleteInsurance,
};

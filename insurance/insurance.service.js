const insuranceRepo = require('./insurance.repository');

async function createInsurance(userId, clientId, companyId, insurance) {
    //Append fields that are insurance verification here, and then remove them off insurance object

    let {
        ins_num,
        group_num,
        service_code,
        name_of_rep,
        ref_num_for_call,
        date_verification_call,
        policy_active,
        deductible_met,
        is_there_deductible,
        deductible_remain,
        visits_allowed,
        visits_used,
        visits_remain,
        co_pay,
        co_insurance,
        is_provide_in_network,
        out_of_network_benefits,
        preauth_require,
        auth_num,
        start_date_auth,
        end_date_auth,
        ref_required,
        service_or_treatment_exclude,
        limit_exclude_docum_requirement,
        notes,
        start_date_policy,
        end_date_policy,
        report_list,
        //Here is the insurance card info
        ...insuranceCardRow
    } = insurance;

    //insurance verification information
    let insurance_verification = {
        ins_num,
        group_num,
        service_code,
        name_of_rep,
        ref_num_for_call,
        date_verification_call,
        policy_active,
        deductible_met,
        is_there_deductible,
        deductible_remain,
        visits_allowed,
        visits_used,
        visits_remain,
        co_pay,
        co_insurance,
        is_provide_in_network,
        out_of_network_benefits,
        preauth_require,
        auth_num,
        start_date_auth,
        end_date_auth,
        ref_required,
        service_or_treatment_exclude,
        limit_exclude_docum_requirement,
        notes,
        start_date_policy,
        end_date_policy,
        report_list
    };

    return insuranceRepo.createInsurance(
        userId,
        clientId,
        companyId,
        insuranceCardRow
    );
}

async function updateInsuranceContactInfoById(companyId, insuranceId, insurance, insuranceVeriId) {
    let insuranceForDB = {
        phone: insurance.phone ?? '',
        fax: insurance.fax ?? '',
        email: insurance.email ?? '',
        insurance_payers_id: insurance.insurancePayersId ?? '',
        mailing_address: insurance.mailingAddress ?? ''
    };
    return insuranceRepo.updateInsuranceContactInfoByID(companyId, insuranceId, insuranceForDB, insuranceVeriId);
}

async function updateInsuranceDetailsById(
    companyId,
    insuranceCardId,
    insurance,
    insuranceVeriId,
    whichSave,
    userId,
    clientId
) {
    let {
        ins_num,
        group_num,
        service_code,
        name_of_rep,
        ref_num_for_call,
        date_verification_call,
        policy_active,
        deductible_met,
        is_there_deductible,
        deductible_remain,
        visits_allowed,
        visits_used,
        visits_remain,
        co_pay,
        co_insurance,
        is_provide_in_network,
        out_of_network_benefits,
        preauth_require,
        auth_num,
        start_date_auth,
        end_date_auth,
        ref_required,
        service_or_treatment_exclude,
        limit_exclude_docum_requirement,
        notes,
        start_date_policy,
        end_date_policy,
        //Here is the insurance card info
        ...insuranceCardRow
    } = insurance;

    //insurance verification information
    let insurance_verification = {
        ins_num,
        group_num,
        service_code,
        name_of_rep,
        ref_num_for_call,
        date_verification_call,
        policy_active,
        deductible_met,
        is_there_deductible,
        deductible_remain,
        visits_allowed,
        visits_used,
        visits_remain,
        co_pay,
        co_insurance,
        is_provide_in_network,
        out_of_network_benefits,
        preauth_require,
        auth_num,
        start_date_auth,
        end_date_auth,
        ref_required,
        service_or_treatment_exclude,
        limit_exclude_docum_requirement,
        notes,
        start_date_policy,
        end_date_policy
    };
    return insuranceRepo.updateInsuranceDetailsByID(
        companyId,
        insuranceCardId,
        insuranceCardRow,
        insurance_verification,
        insuranceVeriId,
        whichSave,
        userId,
        clientId
    );
}

async function updateInsurancePhotoById(companyId, insuranceId, insurance, insuranceVeriId) {
    return insuranceRepo.updateInsurancePhotoByID(companyId, insuranceId, insurance, insuranceVeriId);
}

async function prepareForFrontEnd() {}

async function verify_eligibility(id, verif_id, company_id, user_id, client_id) {
    const response = insuranceRepo.verify_eligibility(id, verif_id, company_id, user_id, client_id);
    return response;
}

async function submit_claim(id, info, company_id, user_id) {
    const response = insuranceRepo.submit_claim(id, info, company_id, user_id);
    return response;
}

async function update_eras(eras, company_id) {
    const response = insuranceRepo.update_eras(eras, company_id);
    return response;
}

async function echo_test(data, company_id) {
    const response = insuranceRepo.echo_test(data, company_id);
    return response;
}

async function list_claims(criteria, company_id) {
    const listData = insuranceRepo.list_claims(criteria, company_id);
    return listData;
}

async function list_eras(criteria, company_id) {
    const listData = insuranceRepo.list_eras(criteria, company_id);
    return listData;
}

async function list_verifications(criteria, company_id) {
    const listData = insuranceRepo.list_verifications(criteria, company_id);
    return listData;
}

async function get_claim(id, company_id) {
    const generalInfo = insuranceRepo.get_claim(id, company_id);
    return generalInfo;
}

async function submit2api(id, company_id) {
    const generalInfo = insuranceRepo.submit2api(id, company_id);
    return generalInfo;
}

async function delete2api(id, company_id) {
    const generalInfo = insuranceRepo.delete2api(id, company_id);
    return generalInfo;
}

async function check_claim_errors(id, company_id) {
    const generalInfo = insuranceRepo.check_claim_errors(id, company_id);
    return generalInfo;
}

async function get_era(id, company_id) {
    const generalInfo = insuranceRepo.get_era(id, company_id);
    return generalInfo;
}

async function get_verification(id, company_id) {
    const generalInfo = insuranceRepo.get_verification(id, company_id);
    return generalInfo;
}

async function getPrimaryInsuranceVerification(company_id, client_id) {
    const generalInfo = insuranceRepo.getPrimaryInsuranceVerification(company_id, client_id);
    return generalInfo;
}

async function invoice2claim(id, company_id) {
    const generalInfo = insuranceRepo.invoice2claim(id, company_id);
    return generalInfo;
}
async function save_claim(id, data, company_id) {
    let info = {
        api_request_json: data
    };
    const generalInfo = insuranceRepo.save_claim(id, info, company_id);
    return generalInfo;
}

async function deleteInsurance(insuranceId, companyId) {
    return await insuranceRepo.deleteInsurance(insuranceId, companyId);
}

module.exports = {
    createInsurance,
    updateInsuranceDetailsById,
    updateInsuranceContactInfoById,
    updateInsurancePhotoById,
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
    deleteInsurance
};

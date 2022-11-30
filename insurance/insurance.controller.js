const insuranceService = require('./insurance.service');
const mime = require('mime-types');
const fileService = require('../file/file.service');
const uploadService = require('../upload/upload.service');
const { InternalServerError } = require('../../util/httpErrors');

async function saveInsurance(req, res) {
    let { user } = req;
    let { insurance, whichSave } = req.body;
    let response;

    if (insurance.cardId) {
        //Update
        response = await insuranceService.updateInsuranceDetailsById(
            user.company_id,
            insurance.cardId,
            insurance,
            insurance.veriId,
            whichSave,
            user.id,
            insurance.client_id
        );
    } else {
        //Create
        response = await insuranceService.createInsurance(user.id, insurance.client_id, user.company_id, insurance);
    }

    return res.status(200).json(response);
}

async function saveInsuranceContactInformation(req, res) {
    let { user } = req;
    let { insurance } = req.body;
    let response;

    if (insurance.cardId) {
        //Update
        response = await insuranceService.updateInsuranceContactInfoById(
            user.company_id,
            insurance.cardId,
            insurance,
            insurance.veriId
        );
    } else {
        //Convert to DB friendly format
        delete Object.assign(insurance, { ['insurance_payers_id']: insurance['insurancePayersId'] })[
            'insurancePayersId'
        ];
        delete Object.assign(insurance, { ['mailing_address']: insurance['mailingAddress'] })['mailingAddress'];

        response = await insuranceService.createInsurance(user.id, insurance.client_id, user.company_id, insurance);
    }
    return res.status(200).json(response);
}

async function saveInsurancePhoto(req, res) {
    let { user } = req;
    let { side } = req.params;
    let { cardId, veriId } = req.query;
    let { client, kind, fileId } = req.body;
    let file = req.file;
    let response;
    if (side == 'front' || side == 'back') {
        side = `card_${side}_file_id`;
    } else {
        throw new InternalServerError('No side specified');
    }
    try {
        client = JSON.parse(req.body.client);
    } catch (e) {
        client = null;
    }

    // if (!fileId || fileId == 'undefined') {
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
    //Then update for s3 bucket link
    await fileService.updateById(fileId, user.company_id, { s3_link: result.Key });
    if (cardId && cardId !== 'undefined') {
        response = await insuranceService.updateInsurancePhotoById(user.company_id, cardId, { [side]: fileId }, veriId);
    } else {
        response = await insuranceService.createInsurance(user.id, client.id, user.company_id, { [side]: fileId });
    }
    return res.status(200).json({ fileId: fileId, ...response });
}

async function verify_eligibility(req, res) {
    const response = await insuranceService.verify_eligibility(req.body.id, req.body.verif_id, req.company.id, req.user.id, req.body.client_id);

    return res.status(200).json({
        response
    });
}

async function submit_claim(req, res) {
    const response = await insuranceService.submit_claim(req.params.id, req.body, req.company.id, req.user.id);

    return res.status(200).json({
        response
    });
}

async function echo_test(req, res) {
    const response = await insuranceService.echo_test(req.body, req.company.id);

    return res.status(200).json({
        response
    });
}

async function update_eras(req, res) {
    const response = await insuranceService.update_eras(req.body, req.company.id);

    return res.status(200).json({
        response: response.data
    });
}

async function list_claims(req, res) {
    const listData = await insuranceService.list_claims(req.body.criteria, req.company.id);
    return res.status(200).json(listData);
}

async function list_eras(req, res) {
    const listData = await insuranceService.list_eras(req.body.criteria, req.company.id);
    return res.status(200).json(listData);
}

async function list_verifications(req, res) {
    const listData = await insuranceService.list_verifications(req.body.criteria, req.company.id);
    return res.status(200).json(listData);
}

async function get_claim(req, res) {
    const info = await insuranceService.get_claim(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function submit2api(req, res) {
    const info = await insuranceService.submit2api(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function delete2api(req, res) {
    const info = await insuranceService.delete2api(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function check_claim_errors(req, res) {
    const info = await insuranceService.check_claim_errors(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function get_era(req, res) {
    const info = await insuranceService.get_era(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function get_verification(req, res) {
    const info = await insuranceService.get_verification(req.params.id, req.company.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function getPrimaryInsuranceVerification(req, res) {
    const info = await insuranceService.getPrimaryInsuranceVerification(req.company.id, req.params.id);

    if (info) {
        return res.status(200).json({
            info: info
        });
    } else {
        return res.status(404);
    }
}

async function invoice2claim(req, res) {
    const rec = await insuranceService.invoice2claim(req.params.id, req.company.id);

    return res.status(200).json({
        rec: rec
    });
}

async function save_claim(req, res) {
    const recId = await insuranceService.save_claim(req.params.id, req.body, req.company.id);

    return res.status(200).json({
        recId: recId
    });
}

async function deleteInsurance(req, res) {
    const result = await insuranceService.deleteInsurance(req.params.insurance_id, req.user.company_id);

    return res.status(200).json(result);
}

module.exports = {
    saveInsurance,
    saveInsurancePhoto,
    saveInsuranceContactInformation,
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

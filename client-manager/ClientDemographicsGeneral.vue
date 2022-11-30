<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo general">
                    <h2>General Information</h2>

                    <div class="fullwidth bottom-15">
                        <span>Client is a dependent</span>
                        <Toggle
                            class="toggle-switch"
                            v-model="is_dependent"
                            :disabled="!userAllowedEdit"
                            :labelClass="'switch'"
                            :spanClass="'slider'"
                            @input="check_guardianess"
                        />
                        <span> {{ is_dependent ? 'Yes' : 'No' }}</span>
                    </div>

                    <template v-if="is_dependent">
                        <div id="guardian_contact_info">
                            <h3>Guardian</h3>
                            <div class="flex colx2 wrap">
                                <Input
                                    label="Parent / Guardian First Name"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.firstName"
                                    :disabled="!userAllowedEdit"
                                    :required="is_dependent"
                                    name="Parent / Guardian First Name"
                                />
                                <Input
                                    label="Parent / Guardian Last Name"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.lastName"
                                    :disabled="!userAllowedEdit"
                                    :required="is_dependent"
                                    name="Parent / Guardian Last Name"
                                />
                                <Input
                                    label="Relationship to Client"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.relationshipToClient"
                                    :disabled="!userAllowedEdit"
                                    :required="is_dependent"
                                    name='Relationship to Client'
                                />
                                <Input
                                    label="Primary Phone"
                                    type="text"
                                    rules="phone"
                                    placeholder="000-000-0000"
                                    class="field-container"
                                    v-model="contactInfo.guardian.primaryPhone"
                                    :disabled="!userAllowedEdit"
                                    name="Primary Phone"
                                />
                            </div>
                            <Input
                                label="Guardian Email"
                                type="email"
                                rules="email"
                                class="field-container fullwidth bottom-15"
                                v-model="generalInfo.guardian_email"
                                :required="is_dependent"
                                :disabled="!userAllowedEdit"
                            />
                            <div class="flex colx2 wrap">
                                <Input
                                    label="Street Address"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.streetAddress"
                                    :disabled="!userAllowedEdit"
                                />
                                <Input
                                    label="Street Address 2"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.streetAddress2"
                                    :disabled="!userAllowedEdit"
                                />
                                <Input
                                    label="City"
                                    type="text"
                                    class="field-container"
                                    v-model="contactInfo.guardian.city"
                                    :disabled="!userAllowedEdit"
                                />
                                <div class="flex colx2 space-between">
                                    <Dropdown
                                        label="State"
                                        :options="stateInitials"
                                        class="field-container"
                                        :disabled="!userAllowedEdit"
                                        v-model="contactInfo.guardian.state"
                                    />
                                    <Input
                                        label="Zip"
                                        type="text"
                                        class="field-container"
                                        v-model="contactInfo.guardian.zip"
                                        :disabled="!userAllowedEdit"
                                    />
                                </div>
                            </div>
                            <hr class="" />
                        </div>
                        
                    </template>

                    <!-- Client status* - editable drop down -->
                    <h3>Client</h3>
                    <div class="flex colx4 wrap">
                        <Dropdown
                            name="Client Status"
                            id="statusDropdown_verification"
                            label="Client Status"
                            :options="statusOptions"
                            required
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.status"
                        />
                        <!-- Client ID - not editable autofilled -->
                        <!--                    <Input-->
                        <!--                        label='Client ID'-->
                        <!--                        name='Client ID'-->
                        <!--                        type='text'-->
                        <!--                        id='clientIdInput'-->
                        <!--                        :value='clientId.toString()'-->
                        <!--                        disabled-->
                        <!--                    />-->
                        <!--Add this in after external id column is added-->
                        <Input
                            label="External ID (Optional)"
                            name="External ID"
                            type="text"
                            id="clientExternalIdInput"
                            v-model="generalInfo.externalId"
                        />
                        <!-- Date of Birth* - editable MM/DD/YYYY -->
                        <Input
                            label="Date of Birth"
                            name="Date of Birth"
                            type="date"
                            id="dateOfBirthInput"
                            v-model="generalInfo.dob"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="dob"
                        />
                        <Input
                            label="Age"
                            name="Age"
                            type="number"
                            id="age"
                            v-model="clientAge"
                            :disabled="true"
                        />
                    </div>
                    <div class="flex colx3 wrap">
                        <!-- First Name* - editable -->
                        <Input
                            label="First Name"
                            type="text"
                            name="First Name"
                            id="firstNameInput_verification"
                            required
                            v-model="generalInfo.firstName"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="firstName"
                        />
                        <!-- Middle Name - editable -->
                        <Input
                            label="Middle Name"
                            type="text"
                            name="Middle Name"
                            id="middleNameInput"
                            v-model="generalInfo.middleName"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="middleName"
                        />
                        <!-- Last Name* - editable -->
                        <Input
                            label="Last Name"
                            type="text"
                            name="Last Name"
                            id="lastNameInput_verification"
                            required
                            v-model="generalInfo.lastName"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="lastName"
                        />
                        <!-- Preferred Name - text should be editable -->
                        <Input
                            label="Preferred Name"
                            type="text"
                            name="Preferred Name"
                            id="preferredNameInput"
                            v-model="generalInfo.preferredName"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="preferredName"
                        />
                        <!-- Marital Status - editable drop down -->
                        <Dropdown
                            label="Marital Status"
                            name="Marital Status"
                            id="maritalStatusDropdown"
                            :options="maritalStatusOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.maritalStatus"
                            :portal_data="portal_data"
                            field_name="maritalStatus"
                        />
                        <!-- Driver License Number - editable -->
                        <Input
                            label="Driver License Number"
                            type="text"
                            name="Driver License Number"
                            id="driverLicenseInput"
                            v-model="generalInfo.driversLicenseNumber"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="driversLicenseNumber"
                        />
                    </div>

                    <Input
                        label="Mental and/or Physical Disability"
                        type="text"
                        name="disability"
                        id="disabilityInput"
                        class="bottom-15"
                        v-model="generalInfo.disability"
                        :disabled="!userAllowedEdit"
                        :portal_data="portal_data"
                        field_name="disability"
                    />

                    <Input
                        label="Client Email"
                        type="email"
                        name="Email"
                        id="loginEmailInput_verification"
                        class="bottom-30"
                        rules="email"
                        required
                        v-model="generalInfo.email"
                        :disabled="!userAllowedEdit"
                    />

                    <div v-if="userAllowedEdit" class="button-wrap align-right">
                        <input v-if="portal_data && merge_portal_button" class="secondary right-15" type="button" :value="merge_portal_button == 2?'Show Client Portal Edits':'Show Original Data'" @click.prevent="do_merge_portal_data(generalInfo)" />
                        <input type="submit" value="Save" />
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
    import { ValidationObserver } from 'vee-validate';
    import { clients } from '@/util/apiRequests';
    import { stateInitials } from '@/util/options';
    import Input from '@/components/general/validatedInputs/Input.vue';
    import Dropdown from '../general/validatedInputs/Dropdown';
    import {camelCase, merge} from 'lodash';
    import { dryalex } from '@/mixins/dryalex';

    const emptyContact = {
        firstName: '',
        lastName: '',
        relationshipToClient: '',
        primaryPhone: '',
        altPhone: '',
        email: '',
        streetAddress: '',
        streetAddress2: '',
        city: '',
        state: '',
        zip: '',
        id: 0
    };

    const emptyContactInfo = {
        guardian: { ...emptyContact }
    };

    export default {
        name: 'ClientDemographicsGeneral',
        components: { Dropdown, ValidationObserver, Input },
        props: {
            clientId: {
                type: [Number, String],
                default: 0
            },
            newLicense: {
                default: null
            }
        },
        data() {
            return {
                contactInfo: { ...emptyContactInfo },
                originalContactInfo: { ...emptyContactInfo },
                generalInfo: {
                    email: '',
                    status: null,
                    dob: '',
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    preferredName: '',
                    maritalStatus: '',
                    externalId: '',
                    guardian_email:'',
                    driversLicenseNumber:'',
                    disability:'',
                },
                portal_data:{data:{}, original_data:{}, snake_case:{}, pokeme: 0},
                merge_portal_button: 0,
                statusOptions: ['Active', 'Inactive', 'Intake', 'Lead'],
                maritalStatusOptions: ['Single', 'Married', 'Separated', 'Divorced', 'Widowed', 'In a Relationship'],
                org_is_dependent:false,
                is_dependent : false,
                stateInitials,
            };
        },
        async created() {
            await this.fillData();
        },
        methods: {
            async check_guardianess() {
              if (this.is_dependent && !this.org_is_dependent && !this.generalInfo.guardian_email) {
                  this.generalInfo.guardian_email = this.generalInfo.email
              }
            },
            do_merge_portal_data(data) {
                if (this.portal_data && this.merge_portal_button) {
                    if (this.merge_portal_button == 2) {
                        data = merge(data, this.portal_data.data)
                    } else {
                        data = merge(data, this.portal_data.original_data)
                    }
                    this.merge_portal_button = 3 - this.merge_portal_button
                }
                this.portal_data.pokeme ++
            },
            async fillData() {
                if (this.clientId !== 'new') {
                    let result = await this.getDataFromEndpoint(
                        clients.getClientGeneralInfo(this.clientId),
                        this.generalInfo
                    );
                    this.generalInfo = this.getGeneralInfoFromResult(result);

                    if (this.generalInfo.guardian_email) {
                        this.is_dependent = true
                        this.org_is_dependent = true
                    }
                    await this.fillContactInfo()
                    // this.do_portal_data(this.generalInfo, result)
                    let xthis = await dryalex.do_portal_data(result, this)
                    merge(this, xthis);
                }
            },
            async fillContactInfo() {
                let contactType = 'guardian'

                this.contactInfo[contactType] = await this.getRawContactDetailsByType(contactType);
                this.originalContactInfo[contactType] = this.contactInfo[contactType];

                for (let key of Object.keys(this.contactInfo.guardian)) {
                    if (this.contactInfo.guardian[key] && key !== 'id') {
                        this.isMinor = true;
                        break;
                    }
                }

            },
            async getRawContactDetailsByType(contactType) {
                let endpoint = clients.getContactDetailsByType(this.clientId, contactType);
                let data = await this.getDataFromEndpoint(endpoint, this.contactInfo[contactType]);
                return data[data.length - 1];
            },
            getGeneralInfoFromResult(result) {
                let generalInfo = result[0];
                //model exactly what is allowed right now.
                generalInfo = {
                    id: result[0].id,
                    email: result[0].email,
                    status: result[0].status,
                    dob: result[0].dob,
                    externalId: result[0].externalId,
                    financial_class: result[0].financial_class,
                    firstName: result[0].firstName,
                    middleName: result[0].middleName,
                    lastName: result[0].lastName,
                    maritalStatus: result[0].maritalStatus,
                    phone: result[0].phone,
                    preferredName: result[0].preferredName,
                    city: result[0].city,
                    state: result[0].state,
                    zip: result[0].zip,
                    guardian_email : result[0].guardian_email,
                    driversLicenseNumber: result[0].driversLicenseNumber,
                    disability: result[0].disability,
                };
                // delete generalInfo?.street_address2;
                generalInfo.dob = generalInfo.dob ? generalInfo.dob.split('T')[0] : '';
                return generalInfo;
            },
            async setupPage() {
                this.generalInfo.dob = this.generalInfo.dob.split('T')[0];
            },
            async assignId(id) {
                this.$emit('assignId', id);
            },
            async getDataFromEndpoint(endpoint, original = null) {
                try {
                    const res = await this.$api.get(endpoint);

                    if (res.status === 200) {
                        return res.data ? res.data : [original];
                    }
                } catch (err) {
                    //this.$toasted.error(`Could not get data from ${endpoint}`);
                    return [original];
                }
            },
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();

                if (!isValid) {
                    //this.$toasted.error('Invalid fields');
                    return;
                }

                if (this.is_dependent) {
                    this.contactInfo.guardian.email = this.generalInfo.guardian_email
                    // if (!this.org_is_dependent) {
                    //     this.generalInfo.email = await this.$email_alias(this.generalInfo.guardian_email, this.clientId)
                    // }
                } else {
                    this.generalInfo.guardian_email = ''
                    this.contactInfo.guardian.email = this.generalInfo.guardian_email // yes redundant - but leave here until bm-981 is done - afv
                }

                let xthis = await dryalex.do_save_portal_data(this);
                merge(this, xthis);

                let result = await this.hitPutEndpointWithData(clients.putClientGeneralInfo(this.clientId), this.generalInfo);
                let result2 = await this.$api.put(clients.updateContactDetailsByType(this.clientId, 'guardian'), this.contactInfo.guardian);
                if (this.newLicense) {
                    let data = new FormData();
                    data.append('file', this.newLicense);
                    data.append('file_kind', 'client_license');
                    data.append('client', JSON.stringify({ id: this.clientId }));
                    await this.$api.post('/clients/client-license?fileId=null', data);
                }
                this.$nextTick(() => {
                    this.$store.commit('persistClientId', this.clientId);
                    this.$store.dispatch('clientOverview/getClient');
                    this.$store.dispatch('clientOverview/getAppointments');
                }, 100);

                // let data = new FormData();
                // data.append('file', this.newLicense);
                // let response = await this.$api.post(this.urlToUpload, data);

                // console.log(result);
                // if (result[0] && (this.clientId === 'new' || this.clientId === 0)) {
                //     await this.$router.push({ name: 'ClientOverview', params: { record_id: result[0] } })
                // }
                // TODO: Add alert for user that it saved successfully
            },
            async hitPutEndpointWithData(endpoint, data) {
                const form = this.$refs.form;
                try {
                    //delete data.street
                    const res = await this.$api.put(endpoint, data);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    }
                    if(res.status === 409) {
                        this.$toasted.error('Unable to save info, email is already in use.');
                        //return res.data;
                    }
                    else {
                        if (this.$route.params?.client_id == 'new') {
                            this.assignId(res.data[0]);
                        }
                        this.$toasted.success('Saved general information successfully.');
                    }

                    return res.data;
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                    return null;
                }
            }
        },
        computed: {
            userAllowedEdit: () => {
                // TODO: check user permissions
                return true;
            },
            clientAge() {
                let age = 0;
                if (this.generalInfo.dob) {
                    let today = new Date();
                    let birthDate = new Date(this.generalInfo.dob);
                    age = today.getFullYear() - birthDate.getFullYear();
                    let m = today.getFullYear() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }
                return age;
            }
        }
    };
</script>

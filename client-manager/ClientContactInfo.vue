<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="">
                    <template v-if="1">
                    <h2>Client Contact Information</h2>

                    <div v-if='0' class="fullwidth">
                        <span>Client is a minor</span>
                        <Toggle
                            id="isMonorToggle"
                            class="toggle-switch"
                            v-model="isMinor"
                            :disabled="!userAllowedEdit"
                            :labelClass="'switch'"
                            :spanClass="'slider'"
                        />
                        <span> {{ isMinor ? 'Yes' : 'No' }}</span>
                    </div>

                    <div id="guardian_contact_info" v-if="0">
                        <h3>Parent/Guardian Contact Information</h3>
                        <!-- Parent/guardian is primary contact - checkbox -->
                        <!-- <label v-show="false">
                        <input type="checkbox" v-model="guardianIsPrimaryContact" :readonly="!userAllowedEdit" />
                        Parent/guardian is primary contact
                        </label> -->
                        <!-- <label v-show="true">
                        <input type="checkbox" v-model="guardianIsPrimaryContact" :readonly="!userAllowedEdit" />
                        Parent/Guardian is primary contact
                        </label> -->

                        <!-- Parent or Guardian Name* - editable text field -->
                        <Input
                            label="Parent or Guardian First Name"
                            type="text"
                            name="Parent or Guardian First Name"
                            id="guardianFirstNameInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.firstName"
                            :disabled="!userAllowedEdit"
                        />
                        <Input
                            label="Parent or Guardian Last Name"
                            type="text"
                            name="Parent or Guardian Last Name"
                            id="guardianLastNameInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.lastName"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Relationship to client* - editable text field -->
                        <Input
                            label="Relationship to Client"
                            type="text"
                            name="Relationship to Client"
                            id="guardianRelationshipToClientInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.relationshipToClient"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Primary Phone* - editable numeric phone number -->
                        <Input
                            label="Primary Phone"
                            type="text"
                            name="Primary Phone"
                            id="guardianPrimaryPhoneInput"
                            rules="phone"
                            placeholder="000-000-0000"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.primaryPhone"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Alternate Phone - editable numeric phone number -->
                        <!-- <Input
                            label="Alternate Phone"
                            type="text"
                            name="Alternate Phone"
                            id="guardianAltPhoneInput"
                            rules="phone"
                            placeholder="000-000-0000"
                            v-model="contactInfo.guardian.altPhone"
                            :disabled="!userAllowedEdit"
                        /> -->

                        <!-- Email* - editable email address -->
                        <Input
                            label="Email"
                            type="email"
                            name="Email"
                            id="guardianEmailInput"
                            rules="email"
                            class="field-container fullwidth"
                            required
                            v-model="contactInfo.guardian.email"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Street Address* - editable text field -->
                        <Input
                            label="Street Address"
                            type="text"
                            name="Street Address"
                            id="guardianStreetAddressInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.streetAddress"
                            :disabled="!userAllowedEdit"
                        />

                        <Input
                            label="Street Address 2"
                            type="text"
                            name="Street Address 2"
                            id="guardianStreetAddressInput2"
                            class="field-container"
                            v-model="contactInfo.guardian.streetAddress2"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- City* - editable text field -->
                        <Input
                            label="City"
                            type="text"
                            name="City"
                            id="guardianCityInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.city"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- State* - editable drop down with state initials -->
                        <Dropdown
                            label="State"
                            name="State"
                            id="guardianStateDropdown"
                            :options="stateInitials"
                            class="field-container"
                            required
                            :disabled="!userAllowedEdit"
                            v-model="contactInfo.guardian.state"
                        />

                        <!-- Zip* - editable 5 digit numeric -->
                        <Input
                            label="Zip"
                            type="text"
                            name="Zip"
                            id="guardianZipInput"
                            class="field-container"
                            required
                            v-model="contactInfo.guardian.zip"
                            :disabled="!userAllowedEdit"
                        />
                        <hr class="fullwidth top-10 bottom-10" />
                    </div>

                    </template>
                    <div id="client_contact_info" class="bottom-10">
                        <!-- <h3>Client Contact Information</h3> -->
                        <!-- <label v-show="false">
                        <input type="checkbox"
                            v-model="clientIsPrimaryContact"
                            :disabled="!userAllowedEdit"
                        />
                    Client is primary contact
                    </label> -->
                        <!-- Primary, alt phone, and email are only required if not a minor -->
                        <!-- Primary Phone* - editable numeric phone number -->

                        <div class="flex colx2 space-between bottom-15">
                            <Input
                                label="Primary Phone"
                                type="text"
                                name="Primary Phone"
                                id="clientPrimaryPhoneInput"
                                class="field-container"
                                rules="phone"
                                required
                                placeholder="000-000-0000"
                                v-model="contactInfo.client.primaryPhone"
                                :disabled="!userAllowedEdit"
                                :portal_data="portal_data"
                                field_name="primaryPhone"
                            />
                            <!-- Alternate Phone - editable numeric phone number -->
                            <Input
                                label="Alternate Phone"
                                type="text"
                                name="Alternate Phone"
                                id="clientAltPhoneInput"
                                class="field-container"
                                rules="phone"
                                placeholder="000-000-0000"
                                v-model="contactInfo.client.altPhone"
                                :disabled="!userAllowedEdit"
                                :portal_data="portal_data"
                                field_name="altPhone"
                            />
                        </div>

                        <!-- Email* - editable email address -->
                        <!-- <Input
                            label="Email"
                            type="email"
                            name="Email"
                            id="clientEmailInput"
                            class="field-container fullwidth"
                            rules="email"
                            required
                            v-model="contactInfo.client.email"
                            :disabled="!userAllowedEdit"
                        /> -->

                        <!-- street, city, state, zip only show if client is NOT a minor -->
                        <div id="clientAddress" class="flex colx2 wrap">
                            <!-- Street Address* - editable text field -->
                            <Input
                                label="Street Address"
                                type="text"
                                name="Street Address"
                                id="clientStreetAddressInput"
                                class="field-container"
                                required
                                v-model="contactInfo.client.streetAddress"
                                :disabled="!userAllowedEdit"
                                :portal_data="portal_data"
                                field_name="streetAddress"
                            />

                            <Input
                                label="Street Address 2"
                                type="text"
                                name="Street Address 2"
                                id="clientStreetAddressInput2"
                                class="field-container"
                                v-model="contactInfo.client.streetAddress2"
                                :disabled="!userAllowedEdit"
                                :portal_data="portal_data"
                                field_name="streetAddress2"
                            />

                            <!-- City* - editable text field -->
                            <Input
                                label="City"
                                type="text"
                                name="City"
                                id="clientCityInput"
                                class="field-container"
                                required
                                v-model="contactInfo.client.city"
                                :disabled="!userAllowedEdit"
                                :portal_data="portal_data"
                                field_name="city"
                            />

                            <!-- State* - editable drop down with state initials -->
                            <div class="flex colx2 space-between">
                                <Dropdown
                                    label="State"
                                    name="State"
                                    id="clientStateDropdown"
                                    class="field-container"
                                    :options="stateInitials"
                                    required
                                    :disabled="!userAllowedEdit"
                                    v-model="contactInfo.client.state"
                                    :portal_data="portal_data"
                                    field_name="state"
                                />
                                <!-- Zip* - editable 5 digit numeric -->
                                <Input
                                    label="Zip"
                                    type="text"
                                    name="Zip"
                                    id="clientZipInput"
                                    class="field-container"
                                    required
                                    v-model="contactInfo.client.zip"
                                    :disabled="!userAllowedEdit"
                                    :portal_data="portal_data"
                                    field_name="zip"
                                />
                            </div>
                        </div>
                    </div>

                    <hr class="fullwidth top-20" />

                    <div class="fullwidth bottom-10">
                        <span><b>Add an Emergency Contact</b></span>
                        <Toggle
                            id="emergencyContactToggle"
                            class="toggle-switch"
                            v-model="emergencyContactVisible"
                            :disabled="!userAllowedEdit"
                            :labelClass="'switch'"
                            :spanClass="'slider'"
                        />
                    </div>

                    <!-- Show emergency contact info if toggle for it is true -->
                    <div id="emergency_contact_info" class="flex colx2 wrap" v-if="emergencyContactVisible">
                        <!-- <h3>Emergency Contact Information</h3> -->

                        <Input
                            label="First Name"
                            type="text"
                            name="First Name"
                            id="emergencyFirstNameInput"
                            v-model="contactInfo.emergency.firstName"
                            :disabled="!userAllowedEdit"
                        />

                        <Input
                            label="Last Name"
                            type="text"
                            name="Last Name"
                            id="emergencyLastNameInput"
                            v-model="contactInfo.emergency.lastName"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Relationship to client* - editable text field -->
                        <Input
                            label="Relationship to Client"
                            type="text"
                            name="Relationship to Client"
                            id="emergencyRelationshipToClientInput"
                            v-model="contactInfo.emergency.relationshipToClient"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Primary Phone - editable numeric phone number -->
                        <Input
                            label="Primary Phone"
                            type="text"
                            name="Primary Phone"
                            id="emergencyPrimaryPhoneInput"
                            rules="phone"
                            placeholder="000-000-0000"
                            v-model="contactInfo.emergency.primaryPhone"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- Email - editable email address -->
                        <Input
                            label="Email"
                            type="email"
                            name="Email"
                            id="emergencyEmailInput"
                            class=""
                            rules="email"
                            v-model="contactInfo.emergency.email"
                            :disabled="!userAllowedEdit"
                        />
                    </div>

                    <!-- Buttons - "Edit" gets replaced with "Cancel" and "Save" buttons and makes
                                editable fields !disabled when clicked. Only visible to users who can edit-->
                    <div v-if="userAllowedEdit" class="button-wrap align-right">
                        <input v-if="portal_data && merge_portal_button" class="secondary right-15" type="button" :value="merge_portal_button == 2?'Show Client Portal Edits':'Show Original Data'" @click.prevent="do_merge_portal_data(contactInfo.client)" />
                        <input type="submit" value="Save" />
                    </div>
                </div>
            </form>
        </ValidationObserver>
<!--        <ClientAppointmentReminderPermissions-->
<!--            :client-id="clientId"-->
<!--            v-if="clientId !== 'new' && loaded"-->
<!--            :clientContactInfo="contactInfo.client"-->
<!--            :guardianContactInfo="contactInfo.guardian"-->
<!--            :originalClientContactInfo="originalContactInfo.client"-->
<!--            :originalGuardianContactInfo="originalContactInfo.guardian"-->
<!--            :isGuardianOn="isMinor"-->
<!--        />-->
    </div>
</template>

<script>
    import { ValidationObserver } from 'vee-validate';
    import { clients } from '@/util/apiRequests';
    import { stateInitials } from '@/util/options';
    import Input from '@/components/general/validatedInputs/Input.vue';
    import Dropdown from '../general/validatedInputs/Dropdown';
    import Toggle from '../general/inputs/Toggle';
    import ClientAppointmentReminderPermissions from '@/components/client-manager/ClientAppointmentReminders';
    import {merge} from 'lodash';
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

    const emptyContactAsNull = {
        firstName: null,
        lastName: null,
        relationshipToClient: null,
        primaryPhone: null,
        altPhone: null,
        email: null,
        streetAddress: null,
        streetAddress2: null,
        city: null,
        state: null,
        zip: null,
        id: 0
    };

    const emptyContactInfo = {
        client: { ...emptyContact },
        guardian: { ...emptyContact },
        emergency: { ...emptyContact }
    };

    export default {
        name: 'ClientContactInfo',
        components: { ValidationObserver, Dropdown, Input, Toggle, ClientAppointmentReminderPermissions },
        props: {
            clientId: {
                type: [Number, String],
                default: 0
            }
        },
        data() {
            return {
                contactInfo: { ...emptyContactInfo },
                primaryContactId: 0,
                emergencyContactVisible: false,
                stateInitials,
                isMinor: false,
                loaded: false,
                originalContactInfo: { ...emptyContactInfo },
                generalInfo:{
                    email: '',
                    primaryPhone: '',
                    altPhone: '',
                    streetAddress: '',
                    streetAddress2: '',
                    city: '',
                    state: '',
                    zip: '',
                },
                portal_data:{data:{}, original_data:{}, snake_case:{}, pokeme: 0},
                merge_portal_button: 0,
            };
        },
        async created() {
            this.emergencyContactVisible = false;
            await this.fillData();
        },
        methods: {
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
            getGeneralInfoFromResult(result) {
                let generalInfo = {
                    id: result[0].id,
                    email: result[0].email,
                    primaryPhone: this.contactInfo.client.primaryPhone,
                    altPhone: this.contactInfo.client.altPhone,
                    streetAddress: this.contactInfo.client.streetAddress,
                    streetAddress2: this.contactInfo.client.streetAddress2,
                    city: this.contactInfo.client.city,
                    state: this.contactInfo.client.state,
                    zip: this.contactInfo.client.zip,
                };
                return generalInfo;
            },
            async fillData() {
                await this.fillContactInfo();
                if (this.clientId !== 'new') {
                    let result = await this.getDataFromEndpoint(
                        clients.getClientGeneralInfo(this.clientId),
                        this.generalInfo
                    );
                    this.generalInfo = this.getGeneralInfoFromResult(result);
                    let xthis = await dryalex.do_portal_data(result, this)
                    merge(this, xthis);
                }
                this.primaryContactId = this.getPrimaryContactId();
                this.loaded = true;
            },
            async fillContactInfo() {
                for (let contactType in this.contactInfo) {
                    this.contactInfo[contactType] = await this.getRawContactDetailsByType(contactType);
                    this.originalContactInfo[contactType] = this.contactInfo[contactType];
                    //did this in this for loop since await will still execute code below it

                    if (contactType == 'guardian') {
                        //Find anything that represents a guardian being filled out
                        for (let key of Object.keys(this.contactInfo.guardian)) {
                            if (this.contactInfo.guardian[key] && key !== 'id') {
                                this.isMinor = true;
                                break;
                            }
                        }
                    } else if (contactType == 'emergency') {
                        for (let key of Object.keys(this.contactInfo.emergency)) {
                            if (this.contactInfo.emergency[key] && key !== 'id') {
                                this.emergencyContactVisible = true;
                                break;
                            }
                        }
                    }
                }
            },
            getPrimaryContactId() {
                return 0; // TODO : get the primary contact id
            },
            async getRawContactDetailsByType(contactType) {
                let endpoint = clients.getContactDetailsByType(this.clientId, contactType);
                let data = await this.getDataFromEndpoint(endpoint, this.contactInfo[contactType]);
                return data[data.length - 1];
            },
            async getDataFromEndpoint(endpoint, original = null) {
                try {
                    const res = await this.$api.get(endpoint);

                    if (res.status === 200) {
                        let empty = {};
                        for (let key in original) {
                            //console.log(key);
                            empty[key] = '';
                            if (key == 'id') {
                                empty[key] = 0;
                            }
                        }

                        return res.data ? res.data : [empty];
                    }
                } catch (err) {
                    //this.$toasted.error(`Could not get data from ${endpoint}`);
                    return [original];
                }
            },
            async submit() {
                //This gets around a weird error vee validate does on non-input fields. that clear its out.
                let tempClient = { ...this.contactInfo.client };
                let tempGuardian = { ...this.contactInfo.guardian };
                let tempEmergency = { ...this.contactInfo.emergency };

                const form = this.$refs.form;
                const isValid = await form.validate();
                this.$nextTick(() => {
                    this.contactInfo.client.id = tempClient.id;
                    this.contactInfo.guardian.id = tempGuardian.id;
                    this.contactInfo.emergency.id = tempEmergency.id;
                }, 500);

                if (!isValid) {
                    //this.$toasted.error('Invalid fields');
                    return;
                }

                await this.handleClientContactSubmission();

                merge(this.generalInfo, this.contactInfo.client)
                let xthis = await dryalex.do_save_portal_data(this);
                merge(this, xthis);
                let gi = this.generalInfo;
                gi.phone = gi.primaryPhone
                delete(gi.primaryPhone)
                delete(gi.id)
                delete(gi.relationshipToClient)
                let result = await this.hitPutEndpointWithData(clients.putClientGeneralInfo(this.clientId), gi);

                //Find anything that represents a guardian being filled out
                for (let key of Object.keys(this.contactInfo.guardian)) {
                    if (this.contactInfo.guardian[key] && key !== 'id') {
                        await this.handleGuardianContactSubmission();
                        break;
                    }
                }

                for (let key of Object.keys(this.contactInfo.emergency)) {
                    if (this.contactInfo.emergency[key] && key !== 'id') {
                        await this.handleEmergencyContactSubmission();
                        break;
                    }
                }
                this.$toasted.success('Successfully Saved');
            },
            async handleClientContactSubmission() {
                let dataToSend = this.contactInfo.client;
                dataToSend.firstName = this.$store.getters['clientOverview/client']?.first_name;
                dataToSend.lastName = this.$store.getters['clientOverview/client']?.last_name;
                dataToSend.relationshipToClient = 'self';
                dataToSend.id = 0;
                let result = await this.hitPutEndpointWithData(
                    clients.updateContactDetailsByType(this.clientId, 'client'),
                    dataToSend
                );
                this.contactInfo.client.id = result[0];
                this.originalContactInfo.client = this.contactInfo.client;
            },
            async handleGuardianContactSubmission() {
                //Reset
                let dataToSend = this.contactInfo.guardian;
                dataToSend.id = 0;

                if (this.isMinor == false) {
                    dataToSend = await this.resetFields();
                }
                const result = await this.hitPutEndpointWithData(
                    clients.updateContactDetailsByType(this.clientId, 'guardian'),
                    dataToSend
                );
                this.contactInfo.guardian.id = result[0];
                this.originalContactInfo.guardian = this.contactInfo.guardian;
            },
            async handleEmergencyContactSubmission() {
                let dataToSend = this.contactInfo.emergency;
                dataToSend.id = 0;
                if (this.emergencyContactVisible == false) {
                    dataToSend = await this.resetFields();
                }
                const result = await this.hitPutEndpointWithData(
                    clients.updateContactDetailsByType(this.clientId, 'emergency'),
                    dataToSend
                );
                this.contactInfo.emergency.id = result[0];
                this.originalContactInfo.emergency = this.contactInfo.emergency;
            },
            async hitPutEndpointWithData(endpoint, data) {
                const form = this.$refs.form;
                try {
                    const res = await this.$api.put(endpoint, data);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    }

                    return res.data;
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                    return null;
                }
            },
            async hitPatchEndpointWithData(endpoint, data) {
                const form = this.$refs.form;
                try {
                    const res = await this.$api.patch(endpoint, data);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    }
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                }
            },
            async hitDeleteEndpoint(endpoint) {
                const form = this.$refs.form;
                try {
                    const res = await this.$api.delete(endpoint);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    }
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                }
            },
            async updatePrimaryContact(id) {
                this.primaryContactId = id;
                //await this.hitPatchEndpointWithData(clients.updatePrimaryContact(this.clientId), {contact_id: id});
            },

            async resetFields() {
                let data = emptyContactAsNull;
                return data;
            }
        },
        computed: {
            isDirty() {
                return Object.keys(this.contactInfo.guardian).some((key) => this.contactInfo.guardian[key].dirty);
            },
            userAllowedEdit: function() {
                // TODO: check user permissions
                return true;
            }

            // clientIsPrimaryContact: {
            //     get: function () {
            //         return this.primaryContactId === this.contactInfo.client.id;
            //     },
            //     set: function () {
            //         if (this.clientIsPrimaryContact) {
            //             this.primaryContactId = this.contactInfo.guardian.id;
            //             // TODO: If the guardian contact doesn't exist yet (id == 0), the server will have to link the newly created guardian's id to the client's primary_contact_id column
            //         } else {
            //             this.primaryContactId = this.contactInfo.client.id;
            //         }
            //     }
            // },
            // guardianIsPrimaryContact: {
            //     get: function() {
            //         return !this.clientIsPrimaryContact;
            //     },
            //     set: function() {
            //         this.clientIsPrimaryContact = !this.clientIsPrimaryContact;
            //     }
            // }
        }
    };
</script>

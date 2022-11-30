<template>
    <div>
        <ValidationObserver ref='form'>
            <form @submit.prevent='submit'>
                <div class='client-demo appointments'>
                    <h2 class='bottom-20'>Appointment Reminders</h2>

                    <div v-if="0" class='bottom-20'>
                        <h4 class='bottom-10'>Send auto email reminders to</h4>
                        <label class='bottom-5 font-14'>
                            <input
                                type='checkbox'
                                v-model='appointmentReminderSettings.client.sendEmailReminders'
                                :disabled='!userAllowedEdit'
                            />
                            Client
                        </label>
                        <label class='bottom-5 font-14'>
                            <input
                                type='checkbox'
                                v-model='appointmentReminderSettings.guardian.sendEmailReminders'
                                :disabled='!userAllowedEdit'
                            />
                            Guardian
                        </label>
                        <div class='flex'>
                            <label class='font-14 bottom-5 right-30'>
                                <input
                                    type='checkbox'
                                    v-model='appointmentReminderSettings.other_email.sendEmailReminders'
                                    :disabled='!userAllowedEdit'
                                />
                                Other
                            </label>
                            <div class='top-5 left-15 flex-1'>
                                <Input
                                    label='Email'
                                    type='email'
                                    name='Email'
                                    id='otherEmailInput'
                                    class='bottom-10 block'
                                    rules='email'
                                    :required='!!appointmentReminderSettings.other_email.sendEmailReminders'
                                    v-model='appointmentReminderSettings.other_email.email'
                                    :disabled='!userAllowedEdit'
                                    v-if='appointmentReminderSettings.other_email.sendEmailReminders'
                                />
                                <Input
                                    label='First Name of contact'
                                    type='text'
                                    name='First Name of contact'
                                    id='otherEmailFirstNameInput'
                                    class='bottom-10 block'
                                    :required='!!appointmentReminderSettings.other_email.sendEmailReminders'
                                    v-model='appointmentReminderSettings.other_email.firstName'
                                    :disabled='!userAllowedEdit'
                                    v-if='appointmentReminderSettings.other_email.sendEmailReminders'
                                />
                                <Input
                                    label='Last Name of contact'
                                    type='text'
                                    name='Last Name of contact'
                                    id='otherEmailLastNameInput'
                                    class='bottom-10 block'
                                    :required='!!appointmentReminderSettings.other_email.sendEmailReminders'
                                    v-model='appointmentReminderSettings.other_email.lastName'
                                    :disabled='!userAllowedEdit'
                                    v-if='appointmentReminderSettings.other_email.sendEmailReminders'
                                />
                                <Input
                                    label='Relation to client'
                                    type='text'
                                    name='Relation to client'
                                    id='otherEmailRelationToClientInput'
                                    class='bottom-10 block'
                                    v-model='appointmentReminderSettings.other_email.relationshipToClient'
                                    :disabled='!userAllowedEdit'
                                    v-if='appointmentReminderSettings.other_email.sendEmailReminders'
                                />
                            </div>
                        </div>
                    </div>

                    <h4 class='top-30 bottom-10'>Okay to leave a voicemail reminder with</h4>
                    <label class='bottom-5 font-14'>
                        <input
                            type='checkbox'
                            v-model='appointmentReminderSettings.client.sendVoicemailReminders'
                            :disabled='!userAllowedEdit'
                        />
                        Client
                    </label>
                    <label class='bottom-5 font-14'>
                        <input
                            type='checkbox'
                            v-model='appointmentReminderSettings.guardian.sendVoicemailReminders'
                            :disabled='!userAllowedEdit'
                        />
                        Guardian
                    </label>
                    <div class='flex'>
                        <label class='font-14 bottom-5 right-30'>
                            <input
                                type='checkbox'
                                v-model='appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                                :disabled='!userAllowedEdit'
                            />
                            Other
                        </label>
                        <div class='top-5 left-15 flex-1'>
                            <Input
                                label='Phone'
                                type='text'
                                name='Phone'
                                id='otherVoicemailPhoneInput'
                                class='block bottom-10'
                                rules='phone'
                                :required='!!appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                                v-model='appointmentReminderSettings.other_voicemail.primaryPhone'
                                :disabled='!userAllowedEdit'
                                v-if='appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                            />
                            <Input
                                label='First Name of contact'
                                type='text'
                                name='First Name of contact'
                                id='otherVoicemailFirstNameInput'
                                class='block bottom-10'
                                :required='!!appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                                v-model='appointmentReminderSettings.other_voicemail.firstName'
                                :disabled='!userAllowedEdit'
                                v-if='appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                            />
                            <Input
                                label='Last Name of contact'
                                type='text'
                                name='Last Name of contact'
                                id='otherVoicemailLastNameInput'
                                class='block bottom-10'
                                :required='!!appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                                v-model='appointmentReminderSettings.other_voicemail.lastName'
                                :disabled='!userAllowedEdit'
                                v-if='appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                            />
                            <Input
                                label='Relation to client'
                                type='text'
                                name='Relation to client'
                                id='otherVoicemailRelationToClientInput'
                                class='block bottom-10'
                                v-model='appointmentReminderSettings.other_voicemail.relationshipToClient'
                                :disabled='!userAllowedEdit'
                                v-if='appointmentReminderSettings.other_voicemail.sendVoicemailReminders'
                            />
                        </div>
                    </div>

                    <!-- Buttons - "Edit" gets replaced with "Cancel" and "Save" buttons and makes
                                   editable fields !readonly when clicked. Only visible to users who can edit-->
                    <div v-if='userAllowedEdit' class='button-wrap'>
                        <input type='submit' value='Save' />
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
    import { ValidationObserver } from 'vee-validate';
    import { clients } from '@/util/apiRequests';
    import Input from '@/components/general/validatedInputs/Input.vue';

    export default {
        name: 'ClientAppointmentReminders',
        components: { ValidationObserver, Input },
        props: {
            clientId: {
                type: [Number, String],
                default: 0,
            },
            clientContactInfo: {},
            guardianContactInfo: {},
            emergencyContactInfo: {},
            originalClientContactInfo: {},
            originalGuardianContactInfo: {},
            isGuardianOn: {}
        },
        data() {
            return {
                appointmentReminderSettings: {
                    client: {
                        sendEmailReminders: false,
                        sendVoicemailReminders: false,
                        id: this.clientContactInfoId,
                    },
                    guardian: {
                        sendEmailReminders: false,
                        sendVoicemailReminders: false,
                        id: 0,
                    },
                    other_voicemail: {
                        sendVoicemailReminders: false,
                        primaryPhone: '',
                        firstName: '',
                        lastName: '',
                        relationshipToClient: '',
                        id: 0,
                    },
                    other_email: {
                        sendEmailReminders: false,
                        email: '',
                        firstName: '',
                        lastName: '',
                        relationshipToClient: '',
                        id: 0,
                    },
                    guardianOnAndSubmitted: false
                },
            };
        },
        async created() {
            await this.fillData();
        },
        methods: {
            async fillData() {
                let data = await this.getDataFromEndpoint(clients.getAppointmentReminderSettings(this.clientId));

                if (data[0]) {
                    try {
                        for (let element in data) {
                            let contactType = data[element].contactType;
                            for (let prop in this.appointmentReminderSettings[contactType]) {
                                if (prop === 'sendVoicemailReminders' || prop === 'sendEmailReminders') {
                                    this.appointmentReminderSettings[contactType][prop] = Boolean(data[element][prop]);
                                } else {
                                    this.appointmentReminderSettings[contactType][prop] = data[element][prop];
                                }
                            }
                        }
                    } catch (err) {
                        //throw new Error('Error in appointment reminders data');
                    }
                }
            },
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();

                if (!isValid) {
                    return;
                }
                let errors = [];
                // console.log(this.appointmentReminderSettings);
                for (let contactType in this.appointmentReminderSettings) {
                    if (contactType == 'client') {
                        if (
                            this.appointmentReminderSettings[contactType].sendEmailReminders == false &&
                            this.appointmentReminderSettings[contactType].sendVoicemailReminders == false
                        ) {
                            if (this.appointmentReminderSettings[contactType].id) {
                                let result = await this.hitPutEndpointWithData(
                                    clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                    this.appointmentReminderSettings[contactType],
                                    contactType
                                );
                            } else {
                                this.appointmentReminderSettings[contactType].id = 0;
                                let result = await this.hitPutEndpointWithData(
                                    clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                    this.appointmentReminderSettings[contactType],
                                    contactType
                                );
                                this.appointmentReminderSettings.id = result[0];
                                //this.appointmentReminderSettings[contactType].id = 0;

                            }
                        }
                        let invalid = false;
                        for (let key of Object.keys(this.originalClientContactInfo)) {
                            //Whenever you add a new input to ContactInformation make sure to edit this if statement only if you've added
                            //a not required input
                            //optimize this solution when you get the chance -- thanks JC

                            //Find any field that is required not being filled out
                            if (!this.originalClientContactInfo[key] && key !== 'id' && key !== 'altPhone' && key !== 'streetAddress2') {
                                //throw error

                                invalid = true;
                                break;
                            }
                        }
                        if (invalid == false) {
                            // let result = await this.hitPutEndpointWithData(
                            //     clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                            //     this.appointmentReminderSettings[contactType],
                            //     contactType
                            // );
                            if (this.appointmentReminderSettings[contactType].id) {
                                let result = await this.hitPutEndpointWithData(
                                    clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                    this.appointmentReminderSettings[contactType],
                                    contactType
                                );
                            } else {
                                this.appointmentReminderSettings[contactType].id = 0;
                                let result = await this.hitPutEndpointWithData(
                                    clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                    this.appointmentReminderSettings[contactType],
                                    contactType
                                );
                                this.appointmentReminderSettings.id = result[0];
                                //this.appointmentReminderSettings[contactType].id = 0;

                            }
                        }
                    } else if (contactType == 'guardian') {

                        if (
                            this.appointmentReminderSettings[contactType].sendEmailReminders == false &&
                            this.appointmentReminderSettings[contactType].sendVoicemailReminders == false
                        ) {
                            let result = await this.hitPutEndpointWithData(
                                clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                this.appointmentReminderSettings[contactType],
                                contactType
                            );
                        }
                        let invalid = false;
                        for (let key of Object.keys(this.originalGuardianContactInfo)) {
                            //Whenever you add a new input to ContactInformation make sure to edit this if statement only if you've added
                            //a not required input
                            //optimize this solution when you get the chance -- thanks JC

                            //Find any field that is required not being filled out
                            if (!this.originalGuardianContactInfo[key] && key !== 'id' && key !== 'altPhone' && key !== 'streetAddress2') {
                                //throw error
                                invalid = true;
                                break;
                            }
                        }
                        if (invalid == false) {
                            let result = await this.hitPutEndpointWithData(
                                clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                                this.appointmentReminderSettings[contactType],
                                contactType
                            );
                        }
                    } else if (contactType == 'other_voicemail') {
                        let result = await this.hitPutEndpointWithData(
                            clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                            this.appointmentReminderSettings[contactType],
                            contactType
                        );
                    } else if (contactType == 'other_email') {
                        let result = await this.hitPutEndpointWithData(
                            clients.putAppointmentReminderSettingsByContactType(this.clientId, contactType),
                            this.appointmentReminderSettings[contactType],
                            contactType
                        );
                    }
                }
                //
                this.$toasted.success(`Sucessfully saved appointment reminders.`);
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
            // eslint-disable-next-line no-unused-vars
            async hitPutEndpointWithData(endpoint, data, contactType) {
                const form = this.$refs.form;

                try {
                    const res = await this.$api.put(endpoint, data);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    } else {
                        //
                        //this.$toasted.success(`Sucessfully saved ${contactType} appointment reminders.`);

                    }

                    return res.data;
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                    return null;
                }

                //return {};
            },
        },
        computed: {
            userAllowedEdit: function() {
                // TODO: check user permissions
                return true;
            },
            clientContactInfoId: {
                get() {
                    return this.clientContactInfo.id;
                },
            },
        },
        watch: {
            'clientContactInfo.id': {
                async handler(newVal, oldVal) {
                    if (oldVal !== 0) {
                        this.appointmentReminderSettings['client'].id = newVal;

                        await this.hitPutEndpointWithData(
                            clients.putAppointmentReminderSettingsByContactType(this.clientId, 'client'),
                            this.appointmentReminderSettings['client']
                        );
                    }
                },
            },
            'guardianContactInfo.id': {
                async handler(newVal) {
                    if (newVal !== 0) {
                        this.appointmentReminderSettings['guardian'].id = newVal;

                        if (this.isGuardianOn == false) {
                            this.appointmentReminderSettings['guardian'].sendEmailReminders = false;
                            this.appointmentReminderSettings['guardian'].sendVoicemailReminders = false;
                        }
                        await this.hitPutEndpointWithData(
                            clients.putAppointmentReminderSettingsByContactType(this.clientId, 'guardian'),
                            this.appointmentReminderSettings['guardian']
                        );

                    }
                },
            },
        },
    };
    /**
     * Ways we could make this work correctly....
     *
     * copy the original object
     * modify "originalObject" upon every successful save to be a copy of the last successful save.
     *
     * use that originalObject to determine whether guardian can check field can saved or not.
     */
</script>

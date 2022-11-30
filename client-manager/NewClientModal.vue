<template>
    <NoButtonModal :open="open" @close="resetForm" id="the_new_client_dropdown_modal">
        <button class="close-x" type="button" @click.prevent="resetForm">
            <span class="material-icons-outlined dark-text">close</span>
        </button>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit" class="new-client-modal" id="the_new_client_dropdown_modal_form">
                <h1>Create New Client</h1>
                <div class="d">
                    <div class="fullwidth bottom-20">
                        <span>Client is a dependent</span>
                        <Toggle
                            class="toggle-switch"
                            v-model="is_dependent"
                            :disabled="!userAllowedEdit"
                            :labelClass="'switch'"
                            :spanClass="'slider'"
                            id="the_is_dependent_toggle_button"
                        />
                        <span> {{ is_dependent ? 'Yes' : 'No' }}</span>
                    </div>
                    <template v-if="is_dependent">
                        <div class="flex colx3 space-between bottom-15">
                            <Input
                                label="Parent / Guardian First Name"
                                type="text"
                                class="field-container"
                                :required="is_dependent"
                                v-model="contactInfo.guardian.firstName"
                                :disabled="!userAllowedEdit"
                            />
                            <Input
                                label="Parent / Guardian Last Name"
                                type="text"
                                class="field-container"
                                :required="is_dependent"
                                v-model="contactInfo.guardian.lastName"
                                :disabled="!userAllowedEdit"
                            />

                            <Input
                                label="Relationship to Client"
                                type="text"
                                class="field-container"
                                :required="is_dependent"
                                v-model="contactInfo.guardian.relationshipToClient"
                                :disabled="!userAllowedEdit"
                            />
                        </div>
                        <div class="flex bottom">
                            <Input
                                label="Guardian Email"
                                type="email"
                                name="Email"
                                id="guardianloginEmailInput"
                                class="right-15 flex-1"
                                rules="email"
                                :required="is_dependent"
                                v-model="generalInfo.guardian_email"
                                :disabled="!userAllowedEdit"
                            />
                            <button
                                class="primary nowrap margin-0 right-15 no-email"
                                type="button"
                                @click.prevent="guardian2email_alias"
                            >
                                No dependent email
                            </button>
                        </div>
                        
                        <div class="new-client-dependant-note flex top">
                            <span class="material-icons-outlined block top-5 right-10">tips_and_updates</span>
                            <div><b>Note:</b> If dependent does not have their own email address, utilize the "No dependent email" button. If the dependent has their own email separate to the guardian email, enter below in Client Email.</div>
                        </div>
                        <hr>
                    </template>
                    <!-- Client status* - editable drop down -->
                    <div class="flex colx3 space-between bottom-15">
                        <Dropdown
                            name="Client Status"
                            id="statusDropdown"
                            label="Client Status"
                            :options="statusOptions"
                            required
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.status"
                            :value="generalInfo.status"
                        />
                        <!-- First Name* - editable -->
                        <Input
                            label="First Name"
                            type="text"
                            name="First Name"
                            id="firstNameInput"
                            mode='passive'
                            required
                            v-model="generalInfo.firstName"
                            :disabled="!userAllowedEdit"
                            :hidden='true'
                        />
                        <!-- Last Name* - editable -->
                        <Input
                            label="Last Name"
                            type="text"
                            name="Last Name"
                            id="lastNameInput"
                            mode='passive'
                            required
                            v-model="generalInfo.lastName"
                            :disabled="!userAllowedEdit"
                            :hidden='true'
                        />
                    </div>
                </div>
                <div class="flex bottom colx3">
                    <!-- Primary Phone* - editable numeric phone number -->
                    <Input
                        label="Primary Phone"
                        type="text"
                        name="Primary Phone"
                        id="clientPrimaryPhoneInput"
                        class="flex-1 right-15"
                        rules="phone"
                        placeholder="000-000-0000"
                        v-model="generalInfo.phone"
                        :disabled="!userAllowedEdit"
                    />
                    <div class="flex bottom flex-2">
                        <Input
                            label="Client Email"
                            type="email"
                            name="Email"
                            id="loginEmailInput"
                            mode='passive'
                            class="flex-4 right-15"
                            rules="email"
                            required
                            v-model="generalInfo.email"
                            :disabled="!userAllowedEdit"
                            :hidden='true'
                        />
                        <button v-if="!is_dependent"
                            class="flex-1 primary nowrap no-email bottom-0"
                            type="submit"
                            @click.prevent="email_alias"
                        >
                            No Email
                        </button>
                    </div>
                </div>

                <div>
                    <span class="dark-red">{{ noButtonError }}</span>
                </div>

                <div id="clientAddress" class="flex fullwidth">
                    <!-- Street Address* - editable text field -->
                    <Input
                        label="Street Address"
                        type="text"
                        name="Street Address"
                        id="clientStreetAddressInput"
                        class="flex-1 right-15"
                        v-model="generalInfo.streetAddress"
                        :disabled="!userAllowedEdit"
                    />
                    <div class="flex-1 flex">
                        <!-- City* - editable text field -->
                        <Input
                            label="City"
                            type="text"
                            name="City"
                            id="clientCityInput"
                            class="flex-3 right-15"
                            v-model="generalInfo.city"
                            :disabled="!userAllowedEdit"
                        />

                        <!-- State* - editable drop down with state initials -->
                        <Dropdown
                            label="State"
                            name="State"
                            id="clientStateDropdown"
                            class="flex-1 right-15"
                            :options="stateInitials"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.state"
                        />

                        <!-- Zip* - editable 5 digit numeric -->
                        <Input
                            label="Zip"
                            type="text"
                            name="Zip"
                            id="clientZipInput"
                            class="flex-1"
                            v-model="generalInfo.zip"
                            :disabled="!userAllowedEdit"
                        />
                    </div>
                </div>

                <div class="flex bottom-0 colx2">
                    <!-- Client DOB -->
                    <Input
                        label="Date of Birth"
                        type="date"
                        name="Date of Birth"
                        id="clientDobInput"
                        class="flex-1 right-15 bottom-0"
                        v-model="generalInfo.dob"
                        :disabled="!userAllowedEdit"
                    />
                    <!-- Primary Counselor -->
                    <Dropdown
                        label="Primary Counselor"
                        name="Primary Counselor"
                        id="clientCounselorDropdown"
                        class="flex-1 bottom-0"
                        :options="counselorOptions"
                        :disabled="!userAllowedEdit"
                        v-model="generalInfo.primaryCounselor"
                    />
                    <!-- <span>{{noButtonError}}</span> -->
                </div>

                <div id="clientstuff" class="flex fullwidth">
                    <!-- <Dropdown
                            label="Gender"
                            type="text"
                            name="Gender"
                            id="clientGenderInput"
                            v-model="generalInfo.gender"
                            :disabled="!userAllowedEdit"
                            :options="['Male', 'Female']"
                        /> -->
                    <!-- <div class=""> -->
                    <!-- <Input
                                type="date"
                                label="DOB"
                                name="DOB"
                                id="clientDOBInput"
                                class="flex-1 space-l"
                                v-model="generalInfo.dob"
                                :disabled="!userAllowedEdit"
                            /> -->
                    <!-- </div> -->
                </div>

                <div class="fullwidth align-right bottom-0">
                    <button class="secondary" type="button" @click.prevent="resetForm">Cancel</button>
                    <button class="primary left-15" type="submit" id="the_create_new_client_submit__button">Create</button>
                </div>
            </form>
        </ValidationObserver>
    </NoButtonModal>
</template>

<script>
    import { clients, companies, settings } from '@/util/apiRequests';
    import { statusOptions, stateInitials } from '@/util/options';
    import { ValidationObserver } from 'vee-validate';
    import NoButtonModal from '@/components/general/modals/NoButtonModal';

    import { mapState } from 'vuex';

    export default {
        name: 'NewClientModal',
        props: {
            open: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                generalInfo: {
                    status: 'Active',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    dob: '',
                    gender: '',
                    guardian_email:'',
                    primaryCounselor: '',
                },
                statusOptions,
                stateInitials,
                noButtonError: '',
                is_dependent:false,
                contactInfo : {
                    guardian: {
                        firstName: '',
                        lastName: '',
                        relationshipToClient: '',
                        email: '',
                    }
                },
                counselorOptions: [],
                client_id : 0
            }
        },
        components: { ValidationObserver, NoButtonModal },

        methods: {
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();

                if (!this.generalInfo.status) {
                    this.$toasted.error('New client must have a valid status');
                    return;
                }

                if (!isValid) {
                    //this.$toasted.error('Invalid fields');
                    return;
                }
                if (this.is_dependent) {
                    // this.generalInfo.guardian_email = this.generalInfo.email
                    this.contactInfo.guardian.email = this.generalInfo.guardian_email
                    // this.generalInfo.email = await this.$email_alias(this.generalInfo.guardian_email, this.generalInfo.firstName)
                } else {
                    this.generalInfo.guardian_email = ''
                    this.contactInfo.guardian.email = this.generalInfo.guardian_email // yes redundant - but leave here until bm-981 is done - afv
                }
                try {
                    let result = await this.$api.post(clients.createClient(), this.generalInfo);
                    if (result.status == 200) {
                        this.client_id = result.data[0]
                        if (this.is_dependent) {
                            let result2 = await this.$api.put(clients.updateContactDetailsByType(this.client_id, 'guardian'), this.contactInfo.guardian);
                        }
                        this.resetForm();

                        // getting the updated list of active clients for the scheduler
                        this.$store.dispatch('scheduler/getActiveClientList');

                        if (
                            [
                                'ClientOverview',
                                'ClientDemographics',
                                'ClientInsurance',
                                'ClientClinical',
                                'ClientBilling',
                                'ClientDocuments'
                            ].includes(this.$route.name) == true
                        ) {
                            await this.$router.replace({
                                name: 'ClientDemographics',
                                params: { client_id: result.data[0] }
                            });
                            this.$forceUpdate();
                        } else {
                            await this.$router.replace({
                                name: 'ClientDemographics',
                                params: { client_id: result.data[0] }
                            });
                        }
                    } else if (result.status === 409) {
                        this.$toasted.error('Client has already been created with this email address');
                    } else {
                        this.$toasted.error('Could not create client');
                    }
                } catch (error) {
                    //this.$toasted.error('Could not create client');
                }
            },
            resetForm() {
                this.$refs.form.reset();
                this.generalInfo = {
                    status: 'Active',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    dob: '',
                    gender: '',
                    guardian_email:'',
                    primaryCounselor: '',
                };
                this.contactInfo = {
                    guardian: {
                        firstName: '',
                        lastName: '',
                        relationshipToClient: '',
                        email: '',
                    }
                };
                this.is_dependent = false;
                this.$emit('close');
            },
            email_alias() {
                if (this.generalInfo?.firstName && this.generalInfo?.lastName) {
                    let temp_email = this.$email_alias(this.$store.state.user.email)
                    this.$set(this.generalInfo, 'email', temp_email);
                    this.noButtonError = '';
                    this.$forceUpdate();
                } else {
                    this.noButtonError = 'Please add a first name or last name, then try again.';
                }
            },
            guardian2email_alias() {
                let temp_email = this.$email_alias(this.generalInfo.guardian_email)
                this.$set(this.generalInfo, 'email', temp_email);
                this.noButtonError = '';
                this.$forceUpdate();
            },
            fill_in_fields(data) {
                for (const [index, row] of Object.entries(data)) {
                    this.generalInfo[index] = data[index];
                }
            },
            async getCounselorOptions() {
                try {
                    let result = await this.$api.get(companies.getClinicians(this.$store.state.user.company_id));
                    this.counselorOptions = result.data.map((element) => {
                        return { text: `${element?.first_name} ${element?.last_name}`, value: element.id };
                    });
                    //Prevent standard clinicians from being blocked when creating client.
                    if (this.$store.state.user.role_id == 12) {
                        this.generalInfo.primaryCounselor = this.$store.state.user.id;
                    }
                } catch (err) {
                    //this.$toasted.error('Could not retrieve list of counselors.');
                }
            },
        },
        computed: {
            userAllowedEdit: () => {
                // TODO: check user permissions
                return true;
            },
            payload() {
                return this.$store.state.newResourceModal.new_client_data;
            }
            // ...mapState(
            //     {
            //         payload:"newResourceModal/new_client_data"
            //     }
            // )
        },
        async created() {
            this.getCounselorOptions();
        },
        watch: {
            payload: {
                deep: true,
                async handler() {
                    if (this.payload.new_hit && this.payload.new_hit > 0) {
                        this.payload.new_hit = 0;
                        this.fill_in_fields(this.payload);
                        this.$store.commit('newResourceModal/openNewClientModal2', { new_hit: 0 });
                    }
                }
            }
        }
    };
</script>

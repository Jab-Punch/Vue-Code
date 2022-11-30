<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo referral client-mandated">
                    <h2>Mandated Client Information</h2>
                    <div class="fullwidth bottom-10">
                        <span>Client is mandated</span>
                        <Toggle
                            name="Client is mandated"
                            id="clientIsMandatedToggle"
                            class="toggle-switch"
                            :labelClass="'switch'"
                            :spanClass="'slider'"
                            v-model="client.isMandated"
                            :disabled="!userAllowedEdit"
                        />
                      <span> {{client.isMandated ? 'Yes' : 'No'}}</span>
                    </div>

                    <!-- Case Number, Division Judge, and Next Court Date are shown if "Client is mandated" is enabled -->
                    <div v-if="client.isMandated == true" class="flex colx3 space-between bottom-30">
                        <!-- Case Number - editable text field -->
                        <Input
                            label="Case Number"
                            type="text"
                            id="caseNumberInput"
                            v-model="client.caseNumber"
                            :disabled="!userAllowedEdit"
                        />
                        <!-- Division Judge - editable text field -->
                        <Input
                            label="Division Judge"
                            type="text"
                            id="divisionJudgeInput"
                            v-model="client.divisionJudge"
                            :disabled="!userAllowedEdit"
                        />
                        <!-- Next Court Date - editable date selector MM/DD/YYYY-->
                        <Input
                            label="Next Court Date"
                            type="date"
                            id="nextCourtDateInput"
                            v-model="client.nextCourtDate"
                            :disabled="!userAllowedEdit"
                        />
                    </div>

                    <!-- Buttons - "Edit" gets replaced with "Cancel" and "Save" buttons and makes
                                   editable fields !disabled when clicked. Only visible to users who can edit-->
                    <div v-if="userAllowedEdit" class="button-wrap">
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
    import Input from '@/components/general/validatedInputs/Input.vue';
    import Toggle from '../general/inputs/Toggle';

    export default {
        name: 'ClientMandateInfo',
        components: { Toggle, ValidationObserver, Input },
        props: {
            clientId: {
                type: [Number, String],
                default: 0,
            },
        },
        data() {
            return {
                client: {
                    isMandated: false,
                    caseNumber: '',
                    divisionJudge: '',
                    nextCourtDate: '',
                },
            };
        },
        async created() {
            await this.fillData();
        },
        methods: {
            async fillData() {
                await this.fillReferralInfo();
            },
            async fillReferralInfo() {
                let data = await this.getDataFromEndpoint(clients.getClientMandateInfo(this.clientId), {
                    ...this.client,
                });

                this.client = {
                    isMandated: Boolean(data[0].isMandated),
                    caseNumber: data[0].caseNumber,
                    divisionJudge: data[0].divisionJudge,
                    nextCourtDate: (data[0].nextCourtDate ?? '').split('T')[0],
                };
            },
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();
        
                if (!isValid) {
                    //this.$toasted.error('Invalid fields');
                    return;
                }

                // if (this.client.isMandated) {
                await this.hitPutEndpointWithData(clients.putClientMandateInfo(this.clientId), this.client);
                //}
            },
            async getDataFromEndpoint(endpoint, original = null) {
                try {
                    const res = await this.$api.get(endpoint);

                    if (res.status === 200) {
                        return res.data ?? [original];
                    }
                } catch (err) {
                    //this.$toasted.error(`Could not get data from ${endpoint}`);
                    return [original];
                }
            },
            async hitPutEndpointWithData(endpoint, data) {
                const form = this.$refs.form;
                try {
                    const res = await this.$api.put(endpoint, data);

                    if (res.status === 400) {
                        form.setErrors(res.data);
                    } else {
                        this.$toasted.success('Successfully saved mandate information.');
                    }

                    return res.data;
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                    return null;
                }
            },
        },
        computed: {
            userAllowedEdit: () => {
                // TODO: check user permissions
                return true;
            },
        },
    };
</script>

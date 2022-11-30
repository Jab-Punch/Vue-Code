<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo work">
                    <h2>Work, School & Veteran Status</h2>
                    <div class="flex colx3 wrap">
                        <!-- Education - editable dropdown -->
                        <Dropdown
                            label="Highest Level of Education"
                            name="Education"
                            id="educationDropdown"
                            :options="educationOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.education"
                            :portal_data="portal_data"
                            field_name="education"
                        />
                        <!-- Employment Status - editable drop down -->
                        <Dropdown
                            label="Employment Status"
                            name="Employment Status"
                            id="employmentStatusDropdown"
                            :options="employmentStatusOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.employmentStatus"
                            :portal_data="portal_data"
                            field_name="employmentStatus"
                        />
                        <!-- Preferred Language - editable -->
                        <Input
                            label="Annual Income (Dollars)"
                            type="number"
                            name="Annual Income"
                            id="annualIncomeInput"
                            v-model="generalInfo.annualIncomeDollars"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="annualIncomeDollars"
                        />
                    </div>
                    <Input
                        label="Means of Income"
                        type="text"
                        name="meansOfIncome"
                        id="meansOfIncome"
                        class="bottom-15"
                        v-model="generalInfo.meansOfIncome"
                        :disabled="!userAllowedEdit"
                        :portal_data="portal_data"
                        field_name="meansOfIncome"
                    />
                    <Radios
                        label="Client is a veteran"
                        name="veteranStatus"
                        id="veteranStatus"
                        class="bottom-15"
                        :options="veteranOptions"
                        v-model="generalInfo.veteranStatus"
                        :disabled="!userAllowedEdit"
                        :portal_data="portal_data"
                        field_name="veteranStatus"
                    />
                    <div v-if="userAllowedEdit" class="button-wrap align-right">
                        <input v-if="portal_data && merge_portal_button" class="secondary right-15" type="button" :value="merge_portal_button == 2?'Show Client Portal Edits':'Show Original Data'" @click.prevent="do_merge_portal_data(generalInfo)" />
                        <input  type="submit" value="Save" />
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
    import Dropdown from '../general/validatedInputs/Dropdown';
    import Radios from '../general/validatedInputs/Radios';
    import {merge} from 'lodash';
    import { dryalex } from '@/mixins/dryalex';

    export default {
        name: 'ClientDemographicsWork',
        components: { Dropdown, Radios, ValidationObserver, Input },
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
                generalInfo: {
                    employmentStatus: '',
                    meansOfIncome: '',
                    education:'',
                    annualIncomeDollars:'',
                    veteranStatus:'',
                },
                employmentStatusOptions: ['Employed', 'Self Employed', 'Unemployed', 'Retired'],
                educationOptions: [
                    'No formal education',
                    'Primary education',
                    'Secondary education or high school',
                    'GED',
                    'Vocational qualifications',
                    'Bachelors degree',
                    'Masters degree',
                    'Doctorate or higher'
                ],
                meansOfIncomeOptions: [
                    'Employment',
                    'Unemployment Benefits',
                    'Disability Benefits',
                    'Receiving Spouse/Family/Friend Support',
                    'Retirement',
                    'None'
                ],
                veteranOptions: [
                    'No',
                    'Yes'
                ],
                portal_data:{data:{}, original_data:{}, snake_case:{}, pokeme: 0},
                merge_portal_button: 0,
            };
        },
        async created() {
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
            async fillData() {
                if (this.clientId !== 'new') {
                    let result = await this.getDataFromEndpoint(
                        clients.getClientGeneralInfo(this.clientId),
                        this.generalInfo
                    );
                    this.generalInfo = this.getGeneralInfoFromResult(result);
                    let xthis = await dryalex.do_portal_data(result, this)
                    merge(this, xthis);
                }
            },
            getGeneralInfoFromResult(result) {
                let generalInfo = result[0];
                //model exactly what is allowed right now.
                generalInfo = {
                    id: result[0].id,
                    employmentStatus: result[0].employmentStatus,
                    meansOfIncome: result[0].meansOfIncome,
                    education: result[0].education,
                    annualIncomeDollars: result[0].annualIncomeDollars,
                    veteranStatus: result[0].veteranStatus,
                };
                return generalInfo;
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

                let xthis = await dryalex.do_save_portal_data(this);
                merge(this, xthis);

                let result = await this.hitPutEndpointWithData(clients.put_client_partial_info(this.clientId), this.generalInfo);

                this.$nextTick(() => {
                    this.$store.commit('persistClientId', this.clientId);
                    this.$store.dispatch('clientOverview/getClient');
                    this.$store.dispatch('clientOverview/getAppointments');
                }, 100);
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
            }
        }
    };
</script>

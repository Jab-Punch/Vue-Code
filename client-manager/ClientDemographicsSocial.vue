<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo social">
                    <h2>Social, Cultural & Self Identifiers</h2>
                    <div class="flex colx3 wrap">
                        <!-- Gender* - editable dropdown -->
                        <Dropdown
                            label="Gender"
                            name="Gender"
                            id="genderDropdown"
                            :options="genderOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.gender"
                            :portal_data="portal_data"
                            field_name="gender"
                        />
                        <!-- Identified Gender - editable dropdown-->
                        <Dropdown
                            label="Identified Gender"
                            name="Identified Gender"
                            id="identifiedGenderDropdown"
                            :options="identifiedGenderOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.identifiedGender"
                            :portal_data="portal_data"
                            field_name="identifiedGender"
                        />
                        <!-- Preferred Language - editable -->
                        <Input
                            label="Preferred Language"
                            type="text"
                            name="Preferred Language"
                            id="preferredLanguageInput"
                            v-model="generalInfo.preferredLanguage"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="preferredLanguage"
                        />
                    </div>
                    <div class="flex colx2 wrap">
                        <!-- Race - editable dropdown -->
                        <Dropdown
                            label="Race"
                            name="Race"
                            id="raceDropdown"
                            :options="raceOptions"
                            :disabled="!userAllowedEdit"
                            v-model="generalInfo.race"
                            :portal_data="portal_data"
                            field_name="race"
                        />
                        <!-- Religion - editable -->
                        <Input
                            label="Religion"
                            type="text"
                            name="Religion"
                            id="religionInput"
                            v-model="generalInfo.religion"
                            :disabled="!userAllowedEdit"
                            :portal_data="portal_data"
                            field_name="religion"
                        />
                    </div>
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
    import Input from '@/components/general/validatedInputs/Input.vue';
    import Dropdown from '../general/validatedInputs/Dropdown';
    import {merge} from 'lodash';
    import { dryalex } from '@/mixins/dryalex';

    export default {
        name: 'ClientDemographicsSocial',
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
                generalInfo: {
                    gender: '',
                    identifiedGender: '',
                    race: '',
                    preferredLanguage:'',
                    religion:'',
                },
                genderOptions: ['Male', 'Female'],
                identifiedGenderOptions: [
                    'Male',
                    'Female',
                    'Nonbinary',
                    'Genderfluid',
                    'Transgender',
                    'Intersex',
                    'Agender',
                    'Transitioning',
                    'Questioning'
                ],
                raceOptions: [
                    'American Indian or Alaska Native',
                    'Asian',
                    'Black or African American',
                    'Hispanic or Latino',
                    'Native Hawaiian or Other Pacific Islander',
                    'White'
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
                    gender: result[0].gender,
                    identifiedGender: result[0].identifiedGender,
                    race: result[0].race,
                    preferredLanguage: result[0].preferredLanguage,
                    religion: result[0].religion,
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

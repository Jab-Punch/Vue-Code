<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo contact-permissions">
                    <h2>Contact Permissions</h2>
                    <Radios
                        label="Okay to contact via email"
                        name="contactEmail"
                        id="contactEmail"
                        class="bottom-15"
                        :options="yesNoOptions"
                        v-model="contactInfo.contact_methods.byemail"
                        :disabled="!userAllowedEdit"
                        :portal_data="portal_data"
                        field_name="byemail"
                    />
                    <Radios
                        label="Okay to contact via phone"
                        name="contactPhone"
                        id="contactPhone"
                        class="bottom-15"
                        :options="yesNoOptions"
                        v-model="contactInfo.contact_methods.byphone"
                        :disabled="!userAllowedEdit"
                        :portal_data="portal_data"
                        field_name="byphone"
                    />
                    <Input
                        label="Notes"
                        type="text"
                        name="notes"
                        id="clientContactNotes"
                        class="bottom-15"
                        v-model="contactInfo.contact_methods.notes"
                        :disabled="!userAllowedEdit"
                    />
                    <div v-if="userAllowedEdit" class="button-wrap align-right">
                        <input v-if="portal_data && merge_portal_button" class="secondary right-15" type="button" :value="merge_portal_button == 2?'Show Client Portal Edits':'Show Original Data'" @click.prevent="do_merge_portal_data(contactInfo.contact_methods)" />
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
    import Radios from '../general/validatedInputs/Radios';
    import {merge} from 'lodash';
    import { dryalex } from '@/mixins/dryalex';

    export default {
        name: 'ClientContactPermissions',
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
                contactInfo: {
                    contact_methods: {
                        byphone:'Yes',
                        byemail:'Yes',
                        notes:''
                    },
                },
                yesNoOptions: [
                    'No',
                    'Yes'
                ],
                stateInitials,
                generalInfo: {
                    byemail: '',
                    byphone: '',
                    contact_methods: {
                        byphone:'',
                        byemail:'',
                        notes:''
                    },
                },
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
            getGeneralInfoFromResult(result) {
                let generalInfo = {
                    id: this.clientId,
                    contact_methods: result[0].contact_methods ?? {byphone:'Yes',byemail:'Yes'},
                    byphone: result[0].contact_methods.byphone ?? 'Yes',
                    byemail: result[0].contact_methods.byemail ?? 'Yes',
                };
                return generalInfo;
            },
            async fillData() {
                if (this.clientId !== 'new') {
                    let result = await this.getDataFromEndpoint(
                        `/clients/${this.clientId}/contact-permissions`,
                        this.contactInfo
                    );
                    if (result && result[0].email) {
                        if (!result[0].contact_methods) {
                            result[0].contact_methods = this.$clone_obj(this.contactInfo.contact_methods)
                        }
                        this.contactInfo = this.getContactInfoFromResult(result);
                        this.generalInfo = this.getGeneralInfoFromResult(result);
                        let xthis = await dryalex.do_portal_data(result, this);
                        merge(this, xthis);
                    }
                }
            },
            getContactInfoFromResult(result) {
                let contactInfo = result[0];
                //model exactly what is allowed right now.
                contactInfo = {
                    contact_methods: {
                        byphone: result[0].contact_methods.byphone ?? 'Yes',
                        byemail: result[0].contact_methods.byemail ?? 'Yes',
                        notes: result[0].contact_methods.notes,
                    }
                };
                return contactInfo;
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
                let result = await this.hitPutEndpointWithData(`/clients/${this.clientId}/contact-permissions`, this.contactInfo.contact_methods);
                merge(this.generalInfo, this.contactInfo.contact_methods)
                let xthis = await dryalex.do_save_portal_data(this);
                merge(this, xthis);
                let gi = this.generalInfo;
                delete(gi.id)
                delete(gi.notes)
                delete(gi.contact_methods)
                delete(gi.byemail)
                delete(gi.byphone)
                let result2 = await this.hitPutEndpointWithData(clients.put_client_partial_info(this.clientId), gi);
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
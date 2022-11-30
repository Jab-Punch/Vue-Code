<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="client-demo referral">
                    <h2>Referral Source Information</h2>

                    <div class="template fullwidth">
                        <label for="referralsource">Referral Source</label>
                        <select id="referralsource" @change="pick_one($event.target.value)">
                            <option value="0">Choose Referral Source</option>
                            <option v-for="(option, index) in list_dropdown" :key="index" :value="option.id">
                                {{ option.name }}
                            </option>
                        </select>
                    </div>

                    <div class="flex wrap colx2 space-between top-15">
                        <div>
                            <label class="bottom-5 dark-text weight-600 font-14">Referrer's Name</label>
                            <span class="block referral-info disabled-content">{{ this.referrer.name }}</span>
                        </div>
                        <div>
                            <label class="bottom-5 dark-text weight-600 font-14">Referrer's Company or Employer</label>
                            <span class="block referral-info disabled-content">{{ this.referrer.employer }}</span>
                        </div>
                        <div>
                            <label class="bottom-5 dark-text weight-600 font-14">Referrer's Phone</label>
                            <span class="block referral-info disabled-content">{{ this.referrer.phone }}</span>
                        </div>
                        <div>
                            <label class="bottom-5 dark-text weight-600 font-14">Referrer's NPI Number</label>
                            <span class="block referral-info disabled-content">{{ this.referrer.referring_provider_npi }}</span>
                        </div>
                    </div>
                    <div>
                        <label class="bottom-5 dark-text weight-600 font-14">Referrer's Email</label>
                        <span class="block referral-info disabled-content">{{ this.referrer.email }}</span>
                    </div>

                    <div class="bottom-20 fullwidth"></div>

                    <div v-if="userAllowedEdit" class="button-wrap align-right">
                        <router-link class="right-15" :to='{name:"ReferralDetail", params: {"record_id" : "new"}}' >
                            <button class="secondary">Create New Referral</button>
                        </router-link>
                        <input type="submit" value="Save">
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
    const api_root = 'referrals';

    import { ValidationObserver } from 'vee-validate';
    import { clients } from '@/util/apiRequests';

    export default {
        name: 'ClientReferralInfo',
        components: { ValidationObserver },
        props: {
            clientId: {
                type: [Number, String],
                default: 0,
            },
        },
        data() {
            return {
                referrer: {
                    id: 0,
                    name: '',
                    employer: '',
                    email: '',
                    phone: '',
                    referring_provider_npi: ''
                },
                list_dropdown: [],
            };
        },
        async created() {
            await this.fillData();
        },
        methods: {
            async fillData() {
                await this.get_list_dropdown();
                await this.fillReferralInfo();
            },
            async fillReferralInfo() {
                let data = await this.getDataFromEndpoint(clients.getClientReferralInfo(this.clientId), {
                    ...this.referrer,
                });

                if (data[0] && data[0].id) {
                    this.referrer = data[0];
                }
            },
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();

                if (!isValid) {
                    //this.$toasted.error('Invalid fields');
                    return;
                }
                await this.hitPutEndpointWithData(`/clients/${this.clientId}/referrer-info`, {
                    referral_id: this.referrer.id,
                });
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

                    if (res.status >= 400) {
                        form.setErrors(res.data);
                    } else {
                        this.$toasted.success('Successfully saved referral information.');
                    }

                    return res.data;
                } catch (err) {
                    //this.$toasted.error('Could not save data.');
                    return null;
                }
            },
            async get_list_dropdown() {
                const body = {
                    criteria: { page: { num_per_page: 1000, page_num: 1 } },
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.list_dropdown = res.data.rows;
            },
            async pick_one(ndx) {
                if (ndx) {
                    this.referrer = this.list_dropdown.find(x => x.id == ndx);
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


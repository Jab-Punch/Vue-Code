<template>
    <div v-if="!loading" class="forms-for-client-sigs completed-forms simple-chirp-table">
        <h3>Forms for Client Signature</h3>
        <table class="simple">
            <tr><th class="full-width">Form Name</th><th class="nowrap">Share to portal</th></tr>
            <tr
                v-for="(row, rowIndex) in rows"
                :key="row.id"
            >
                <td class="fullwidth" ><div>
                    <router-link :to="{ name: `${row.component_name}`, params: { record_id: 0 } }">
                        {{ row.menu_txt }}
                    </router-link>
                </div></td>
                <td class="align-right">
                    <input @click="create_portal2sign(rowIndex, row, $event)" type="checkbox" :checked="row.send_to_portal" :disabled="!!row.send_to_portal" v-show='!row.loading'>
                    <div v-show='row.loading' class='purple'>
                        Loading...
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>

    const api_root = 'documents';
    import ChirpList from '@/components/general/list/ChirpList';
    import qs from 'qs';

    export default {
        name: 'ClientToSignForms',
        components: { ChirpList },
        data() {
            return {
                clientId: this.$route.params.client_id,
                rows: [],
                loading: true,
                portalling:false,
            };
        },
        methods: {
            async load_data() {
                const body = {
                    page: 'forms-for-client-sigs',
                    client_id:this.clientId
                };
                const res = await this.$api.post(`/forms/list-create-portal2sign`, body);
                this.rows = res.data.rows
                this.$nextTick(() => {
                    this.loading = false;
                });
            },
            async init() {
                await this.load_data();
            },
            async create_portal2sign(rowIndex, row, event) {
                event.preventDefault();
                if(this.rows.find((r) => r.loading)) {
                    return;
                }
                row.loading = true;
                this.$set(this.rows, rowIndex, row);
                if (!this.portalling) {
                    this.portalling = true;
                    const update_record_data = {
                        user_id: parseInt(this.$store.state.user.id),
                        client_id: parseInt(this.clientId),
                        page_id: row.id,
                        component_name: row.component_name,
                        page_url: row.page,
                    }
                    const res = await this.$api.put(`/form_data/create-portal2sign/${row.id}`, update_record_data);

                    // this.rows[row.id]['send_to_portal'] = 1
                    await this.load_data();
                    this.portalling = false;
                    this.$toasted.success('Successfully Sent to Portal for Client Signature.');
                } else {
                    this.$toasted.error('In progress. Please wait and try again');
                }
            },
        },
        async created() {
            await this.init();
        },
    };
</script>

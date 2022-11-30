<template>
    <div v-if="loading == false">
        <ChirpList
            :data_source="rows"
            :export_api="export_api"
            :target_page="targetPage"
            :createAction="false"
            @applyCriteria="modifyCriteria"
            :loadingColumns="loadingTable"
            :column_meta="columnMeta"
            :totalCount="totalCount"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="handleCancelOverride"
        >
            <template #control="">
                <button class="primary"
                    @click="
                        () => {
                            $store.commit('modals/updateField', {
                                field: 'newClientModal',
                                value: !$store.state.modals.newClientModal
                            });
                        }
                    "
                >
                    + New Client
                </button>
            </template>
        </ChirpList>
    </div>
    <div v-else>Loading...</div>
</template>

<script>
    import ChirpList from '@/components/general/list/ChirpList.vue';
    import NewClientModal from '@/components/client-manager/NewClientModal.vue';
    import { tryGetFilter } from '@/util/tryGetFilter';

    const api_root = 'clients';

    export default {
        name: 'Clients',
        components: { ChirpList, NewClientModal },
        props: {
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                rows: [],
                targetPage: 'ClientOverview',
                loading: true,
                loadingTable: false,
                useOverride: false,
                showNewClientModal: false,
                totalCount: 0,
                export_api: '/clients',
                columnMeta: [
                    { field: 'first_name', headerText: 'First Name' },
                    { field: 'last_name', headerText: 'Last Name' },
                    { field: 'status', headerText: 'Status' },
                    { field: 'email', headerText: 'Email' },
                    { field: 'counselor', headerText: 'Counselor' },
                    { field: 'client_balance', headerText: 'Client Balance', align: 'Right', headerAlign: 'Right' }, // WTH?!?!? numbers are NOT Left Justified!!! do not change again
                    { field: 'tags', headerText: 'Tags' },
                    { field: 'dob',  hide: 1}
                ]
            };
        },
        computed: {
            criteria() {
                return this.useOverride && this.overrideFilter ? this.overrideCriteria : this.savedCriteria;
            },
            savedCriteria() {
                return tryGetFilter(this.$store, this.storeKey);
            },
            overrideCriteria() {
                return this.$store.getters['filters/overrideCriteria'](this.storeKey);
            },
            storeKey() {
                return this.pageMeta?.page || 'clients';
            }
            // showNewClientModal(){
            // commit('updateField', {
            //         field: 'newClientModal',
            //         value: !$store.state.modals.newClientModal,
            //     });
            // }
        },
        methods: {
            async load_data() {
                try {
                    const body = {
                        criteria: this.criteria
                    };
                    const res = await this.$api.post(this.export_api, body);

                    if (res.status >= 400) {
                        this.$toasted.error('Failed to fetch clients roster.');
                        return;
                    }

                    this.rows = res.data.rows;
                    for (let k in this.rows) {
                        if (this.rows[k]['tags'] == '{}') this.rows[k]['tags'] = '';
                    }

                    this.totalCount = res.data.total_count;
                } catch (err) {
                    this.$toasted.error('Failed to fetch clients roster.');
                }

                this.$nextTick(() => {
                    this.loading = false;
                });
            },
            async init() {
                if (this.overrideFilter) {
                    this.useOverride = true;
                    this.$store.commit('filters/applyOverride', {
                        stateKey: this.storeKey,
                        criteria: this.overrideFilter
                    });
                }

                await this.load_data();
            },
            async modifyCriteria(criteria) {
                if (this.targetPage) {
                    this.$store.commit('filters/update', {
                        criteriaPage: this.targetPage,
                        payload: criteria,
                    });
                }
                this.criteriaProps = criteria;
                await this.load_data();
            },
            handleCancelOverride() {
                this.useOverride = false;
            }
        },
        watch: {
            criteria: {
                deep: true,
                async handler() {
                    await this.load_data();
                }
            }
        },
        async created() {
            await this.init();
        }
    };
</script>

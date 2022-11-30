/* eslint-disable no-unused-vars */
<template>
    <div v-if="!loading" class="completed-forms simple-chirp-table">
        <h3>Missing Documents</h3>
        <ChirpList
            test-prop="bob"
            :column_meta="columnMeta"
            :data_source="rows"
            :totalCount="totalCount"
            @rowSelected="dynamic_target"
            :loadingColumns="loadingTable"
            :hidePaginator="true"
            :hideToolbar="true"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="useOverride = false"
        />
    </div>
</template>

<script>
    import { tryGetFilter } from '@/util/tryGetFilter';

    const api_root = 'alerts';
    import ChirpList from '@/components/general/list/ChirpList';

    export default {
        name: 'MissingDocuments',
        components: { ChirpList },
        props: {
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                clientId: this.$route.params.client_id,
                clientData: null,
                rows: [],
                totalCount: 0,
                useOverride: true,
                loading: true,
                loadingTable: false,
                criteriaProps: {},
                columnMeta: [
                    { field: 'client_id', hide: 1 },
                    { field: 'user', hide: 1 },
                    { field: 'client', hide: 1 },
                    { field: 'component_name', hide: 1 },
                    { field: 'form_data_id', hide: 1 },
                    { field: 'page_id', hide: 1 },
                    { field: 'first_name', hide: 1 },
                    { field: 'last_name', hide: 1 },
                    { field: 'alert_type', hide: 1 },
                    { field: 'dayt_appt_start', hide: 1 },
                    { field: 'appt_id', hide: 1 }
                    //{ field: 'docume}
                ]
            };
        },
        methods: {
            async load_data() {
                const body = {
                    criteria: this.criteria,
                    missingDoc: 'misingDoc'
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows;
                this.totalCount = res.data.total_count;
                if (this.rows.length <= 0) {
                    //{ field: 'docume}
                    this.columnMeta = [{ field: 'Due Date' }, { field: 'Form Name' }];
                } else {
                    this.columnMeta = [
                        { field: 'client_id', hide: 1 },
                        { field: 'user', hide: 1 },
                        { field: 'client', hide: 1 },
                        { field: 'component_name', hide: 1 },
                        { field: 'form_data_id', hide: 1 },
                        { field: 'page_id', hide: 1 },
                        { field: 'first_name', hide: 1 },
                        { field: 'last_name', hide: 1 },
                        { field: 'alert_type', hide: 1 },
                        { field: 'dayt_appt_start', hide: 1 },
                        { field: 'appt_id', hide: 1 },
                        { field: 'due_date', headerText: 'Due Date' },
                        { field: 'alert', headerText: 'Form Name' }
                    ];
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

                this.$store.commit('filters/updateFilter', {
                    stateKey: this.storeKey,
                    criteria: {
                        ...this.criteria,
                        page: {
                            num_per_page: '100',
                            page_num: 1
                        },
                        filter: {
                            client_id: [this.clientId],
                            alert_type: ['missing_document']
                        }
                    }
                });

                await this.load_data();
            },
            async modifyCriteria(criteria) {
                if (this.targetPage) {
                    this.$store.commit('filters/update', {
                        criteriaPage: this.targetPage,
                        payload: criteria
                    });
                }
                this.criteriaProps = criteria;
                await this.load_data();
            },
            async dynamic_target(row) {
                this.$router.push({ name: row.component_name, params: { record_id: row.form_data_id } });
            }
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
                return 'missingDocuments';
            }
        },
        async created() {
            await this.init();
        },
        watch: {
            criteria: {
                deep: true,
                async handler() {
                    await this.load_data();
                }
            }
        }
    };
</script>

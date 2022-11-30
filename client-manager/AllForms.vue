/* eslint-disable no-unused-vars */
<template>
    <div v-if="loading == false" class="completed-forms">
        <h3>All Forms</h3>
        <ChirpList
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
        <div class="top-10">
            <router-link
                class="text-button"
                :to="{
                    name: 'Forms',
                    params: {
                        overrideFilter: {
                            search: {},
                            filter: {
                                client_id: [this.clientId]
                            },
                            page: {
                                num_per_page: 10,
                                page_num: 1
                            },
                            sort: {
                                date: 'Descending'
                            },
                            column: []
                        }
                    }
                }"
            >
                Go to full list
            </router-link>
        </div>
    </div>
</template>

<script>
    import { tryGetFilter } from '@/util/tryGetFilter';

    const api_root = 'form_data';
    import ChirpList from '@/components/general/list/ChirpList';

    export default {
        name: 'AllForms',
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
                useOverride: false,
                loading: true,
                loadingTable: false,
                criteriaProps: {},
                columnMeta: [
                    { field: 'active', hide: 1 },
                    { field: 'user_id', hide: 1 },
                    { field: 'client_id', hide: 1 },
                    { field: 'page_id', hide: 1 },
                    { field: 'signature_ids', hide: 1 },
                    { field: 'filled_by_client', hide: 1 },
                    { field: 'locked', hide: 1 },
                    { field: 'email', hide: 1 },
                    { field: 'first_name', hide: 1 },
                    { field: 'last_name', hide: 1 },
                    { field: 'page', hide: 1 },
                    { field: 'component_name', hide: 1 }
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
                return 'AlldaForms';
            }
        },
        methods: {
            async load_data() {
                const body = {
                    criteria: this.criteria
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows;
                this.totalCount = res.data.total_count;
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
                        filter: {
                            client_id: [this.clientId]
                        },
                        page: {
                            num_per_page: 100,
                            page_num: 1
                        }
                    }
                });

                await this.load_data();
            },
            async modifyCriteria(criteria) {
                if (this.overrideFilter) {
                    this.useOverride = true;
                    this.$store.commit('filters/applyOverride', {
                        stateKey: this.storeKey,
                        criteria: this.overrideFilter
                    });
                }

                await this.load_data();
            },
            async dynamic_target(row) {
                this.$router.push({ name: row.component_name, params: { record_id: row.id } });
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

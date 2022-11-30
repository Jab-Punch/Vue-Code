/* eslint-disable no-unused-vars */
<template>
    <div v-if="!loading" class="simple-chirp-table">
        <h3 class="dark-text">Drafted Forms</h3>
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
                                'form_data.client_id': [this.clientId]
                                // ['form_data.signature_ids']: ['NULL']
                            },
                            page: {
                                num_per_page: 10,
                                page_num: 1,
                                current_page: 1
                            },
                            sort: {
                                date: 'Descending'
                            },
                            column: []
                        }
                    },
                    query:{
                        storeKey: this.storeKey,
                        override: true,
                        overrideFilter: qs.stringify({
                            search: {},
                            filter: {
                                'form_data.client_id': [this.clientId]
                                // ['form_data.signature_ids']: ['NULL']
                            },
                            page: {
                                num_per_page: 10,
                                page_num: 1,
                                current_page: 1
                            },
                            sort: {
                                date: 'Descending'
                            },
                            column: []
                       })
                    }
                }"
            >
                Go to full list
            </router-link>
            <!--            <a class="text-button">Go to full list</a>-->
        </div>
    </div>
</template>

<script>
    import { tryGetFilter } from '@/util/tryGetFilter';

    const api_root = 'form_data';
    import ChirpList from '@/components/general/list/ChirpList';
    import qs from 'qs';

    export default {
        name: 'DraftedForms',
        components: { ChirpList },
        props: {
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                qs,
                clientId: this.$route.params.client_id,
                clientData: null,
                rows: [],
                totalCount: 0,
                useOverride: true,
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
                return 'draftedForms';
            }
        },
        methods: {
            async load_data() {
                const body = {
                    criteria: this.criteria,
                    page: 'draftedForms'
                };
                const ignoreForms = [
                                    'authorization-to-enable-autopay',
                                    'practice-policies',
                                    'notice-of-privacy-practices',
                                    'intern-informed-consent',
                                    'good-faith-notice',
                                    'telehealth-informed-consent',
                                    'consent-for-clinical-observation',
                                    'informed-consent-for-therapy',
                                    'portal-intake',
                                    'portal-consent-form'
                ]
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows.filter(form => !ignoreForms.includes(form.page));
                this.totalCount = res.data.total_count;
                if (this.rows.length <= 0) {
                    this.columnMeta = [{ field: 'Date' }, { field: 'Form Name' }];
                } else {
                    this.columnMeta = [
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
                        { field: 'component_name', hide: 1 },
                        { field: 'page_title', headerText: 'Form Name' }
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
                        filter: {
                            'form_data.client_id': [this.clientId]
                            // ['form_data.signature_ids']: ['NULL'] // do NOT touch -alex
                        },
                        page: {
                            num_per_page: 100,
                            page_num: 1
                        },
                        sort: {
                            date: 'Descending'
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

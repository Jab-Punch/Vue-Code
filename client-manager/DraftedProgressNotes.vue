<template>
    <div v-if="!loading" class="simple-chirp-table">
        <h3>Drafted Progress Notes</h3>

        <ChirpList
            class="simple"
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
                    name: 'Notes',
                    params: {
                        overrideFilter: {
                            sort: {},
                            search: {},
                            filter: {
                                'notes.client_id': [clientId],
                                'notes.note_type': ['progress']
                            },
                            page: { num_per_page: '10', current_page: 1, page_num: 1 },
                            column: []
                        }
                    },
                    query: {
                        storeKey: storeKey,
                        override: true,
                        overrideFilter: qs.stringify({
                            sort: {},
                            search: {},
                            filter: {
                                'notes.client_id': [clientId],
                                'notes.note_type': ['progress']
                            },
                            page: { num_per_page: '10', current_page: 1, page_num: 1 },
                            column: []
                        })
                    }
                }"
            >
                Go to full list
            </router-link>
        </div>
    </div>
</template>

<script>
    import { openPdf } from '@/util/pdf';

    const api_root = 'notes';
    import { file } from '@/util/apiRequests';
    import ChirpList from '@/components/general/list/ChirpList';
    import { openImage } from '@/util/image';
    import { saveFile } from '@/util/genericUtilityFunctions';
    import { tryGetFilter } from '@/util/tryGetFilter';
    import qs from 'qs';

    export default {
        name: 'DraftedProgressNotes',
        components: { ChirpList },
        data() {
            return {
                qs,
                clientId: this.$route.params.client_id,
                clientData: null,
                rows: [],
                totalCount: 0,
                loading: true,
                loadingTable: false,
                useOverride: false,
                criteriaProps: {
                    // "sort":{},
                    // "search":{},
                    // "filter":{
                    //     client_id : [this.$route.params.client_id],
                    // },
                    // "page":{"num_per_page":"10",
                    // "current_page":1},
                    // "column":[]
                },
                columnMeta: [
                    { field: 'date', headerText: 'Date' },
                    { field: 'note', headerText: 'Note' },
                    { field: 'tags', headerText: 'Tags' },
                    { field: 'client', headerText: 'Client' },
                    { field: 'note_type', headerText: 'Note Type' },
                    { field: 'active', hide: 1 },
                    {
                        field: 'diags',
                        hide: 1
                    },
                    { field: 'goals', hide: 1 },
                    { field: 'objectives', hide: 1 },
                    { field: 'interventions', hide: 1 },
                    { field: 'summary', hide: 1 },
                    { field: 'recommends', hide: 1 }
                ]
            };
        },
        props: {
            overrideFilter: {
                type: Object,
                default: null
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
                return 'draftedProgressNotes';
            }
        },
        methods: {
            async dynamic_target(row) {
                await this.$router.push({ name: 'ProgressNote', params: { id: row.id } });
            },
            async load_data() {
                let body = {
                    criteria: this.criteria,
                    page: 'draftProgressNotes'
                };
                body.criteria.filter['notes.note_type'] = ['progress'];
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows;
                this.totalCount = res.data.total_count;
                if (this.rows.length <= 0) {
                    this.columnMeta = [{ field: 'date' }, { field: 'User' }];
                } else {
                    this.columnMeta = [
                        { field: 'date', headerText: 'Date' },
                        { field: 'note', headerText: 'Note', hide: 1 },
                        { field: 'tags', headerText: 'Tags', hide: 1 },
                        { field: 'client', headerText: 'Client', hide: 1 },
                        { field: 'note_type', headerText: 'Note Type', hide: 1 },
                        { field: 'active', hide: 1 },
                        {
                            field: 'diags',
                            hide: 1
                        },
                        { field: 'goals', hide: 1 },
                        { field: 'objectives', hide: 1 },
                        { field: 'interventions', hide: 1 },
                        { field: 'summary', hide: 1 },
                        { field: 'recommends', hide: 1 }
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
                            client_id: [this.clientId],
                            note_type: ['progress']
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
                if (this.targetPage) {
                    this.$store.commit('filters/update', {
                        criteriaPage: this.targetPage,
                        payload: criteria
                    });
                }
                this.criteriaProps = criteria;
                await this.load_data();
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

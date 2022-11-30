<template>
    <div v-if="!loading" class="completed-by-practice completed-forms simple-chirp-table">
        <h3>Forms Completed by Client</h3>
        <ChirpList
            :column_meta="columnMeta"
            :data_source="rows"
            :totalCount="totalCount"
            @rowSelected="getFile"
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
                    name: 'Documents',
                    params: {
                        overrideFilter: {
                            sort: { date: 'DESC' },
                            search: {},
                            filter: {
                                'files.client_id': [clientId],
                                file_type: ['pdf'],
                                form_data_id: ['!0'],
                                'signed_by_client': ['1'],
                                 },
                            page: { num_per_page: 10, current_page: 1, page_num: 1 },
                            column: []
                        }
                    },
                    query: {
                        storeKey: storeKey,
                        override: true,
                        overrideFilter: qs.stringify({
                            sort: { date: 'DESC' },
                            search: {},
                            filter: {
                                'files.client_id': [clientId],
                                file_type: ['pdf'],
                                form_data_id: ['!0'],
                                'signed_by_client': ['1'],
                            },
                            page: { num_per_page: 10, current_page: 1, page_num: 1 },
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

    const api_root = 'documents';
    import { file } from '@/util/apiRequests';
    import ChirpList from '@/components/general/list/ChirpList';
    import { openImage } from '@/util/image';
    import { saveFile } from '@/util/genericUtilityFunctions';
    import { tryGetFilter } from '@/util/tryGetFilter';
    import MyServiceCodes from '@/components/client-manager/ClientClinical/ServiceCodes';
    import qs from 'qs';

    export default {
        name: 'ClientedForms',
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
                useOverride: true,
                criteriaProps: {
                    sort: {
                        date: 'DESC'
                    }
                    // "search":{},
                    // "filter":{
                    //     client_id : [this.$route.params.client_id],
                    // },
                    // "page":{"num_per_page":"10",
                    // "current_page":1},
                    // "column":[]
                },
                columnMeta: [
                    { field: 'date' },
                    { field: 'file_name', headerText: 'File Name', hide: 1 },
                    { field: 'user_id', hide: 1 },
                    { field: 'client_id', hide: 1 },
                    { field: 'tags', hide: 1 },
                    { field: 'file_type', hide: 1 },
                    { field: 'file_kind', hide: 1 },
                    { field: 'page_title', headerText: 'Form Name' },
                    { field: 'first_name', hide: 1 },
                    { field: 'last_name', hide: 1 },
                    { field: 'user', hide: 1 },
                    { field: 'downloads', hide: 1 },
                    {
                        field: 'shared_to_portal',
                        headerText: 'Shared to Portal',
                        editType: 'booleanedit',
                        type: 'boolean',
                        displayAsCheckBox: 'true',
                        allowEditing: true,
                        hide: 1
                    },
                    {
                        field: 'filled_by_client',
                        headerText: 'Client Filled',
                        hide: 1
                    },
                    {
                        field: 'signed_by_client',
                        headerText: 'Client Signed',
                        hide: 1
                    }
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
                return 'clientCompletedForms';
            }
        },
        methods: {
            async getFile(f) {
                try {
                    if (f.id ) {
                        let result = await this.$api.get(file.getFile(f.id));
                        if (result.data.file.file_type == 'pdf') {
                            openPdf(result.data?.file?.Body, result.data?.file?.file_name);
                        } else if (result.data.file.originalContentType.includes('image')) {
                            openImage(result.data?.file?.Body);
                        } else {
                            saveFile(
                                result.data?.file?.Body,
                                result.data?.file?.originalContentType,
                                result.data?.file?.file_name
                            );
                        }
                    } else {
                        this.$toasted.error('File not found');
                    }
                } catch (err) {
                    console.log(f);
                }
            },
            async load_data() {
                const body = {
                    criteria: this.criteria,
                    page: 'clientedForms'
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows.map((e) => {
                    if (e?.file_kind) {
                        e.file_kind = e.file_kind.replace(/([a-z0-9])([A-Z])/g, '$1 $2') + ' Form';
                    }
                    return e;
                });
                //this.rows.map(())
                this.totalCount = res.data.total_count;
                if (this.rows.length <= 0) {
                    this.columnMeta = [{ field: 'Date' }, { field: 'Form Name' }];
                } else {
                    this.columnMeta = [
                        { field: 'date' },
                        { field: 'file_name', headerText: 'File Name', hide: 1 },
                        { field: 'user_id', hide: 1 },
                        { field: 'client_id', hide: 1 },
                        { field: 'tags', hide: 1 },
                        { field: 'file_type', hide: 1 },
                        { field: 'file_kind', hide: 1 },
                        { field: 'page_title', headerText: 'Form Name' },
                        { field: 'first_name', hide: 1 },
                        { field: 'last_name', hide: 1 },
                        { field: 'user', hide: 1 },
                        { field: 'downloads', hide: 1 },
                        {
                            field: 'shared_to_portal',
                            headerText: 'Shared to Portal',
                            editType: 'booleanedit',
                            type: 'boolean',
                            displayAsCheckBox: 'true',
                            allowEditing: true,
                            hide: 1
                        },
                        {
                            field: 'filled_by_client',
                            headerText: 'Client Filled',
                            hide: 1
                        },
                        {
                            field: 'signed_by_client',
                            headerText: 'Client Signed',
                            hide: 1
                        }
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
                            'files.client_id': [this.clientId],
                            file_type: ['pdf'],
                            form_data_id: ['!0']
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
            },
            async handleShareToPortal(args) {
                const res = await this.$api.put(file.updateFile(args.data.id), {
                    shared_to_portal: args.data.shared_to_portal === 0 ? 1 : 0
                });

                if (res.status >= 300) {
                    //this.$toasted.error('Failed to update shared to portal status');
                    return;
                }

                this.$toasted.success('Successfully updated shared to portal status');

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

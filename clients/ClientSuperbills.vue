<template>
    <div v-if='this.findCounselor'>
        <ChirpList
            headerText="Client Superbills"
            :data_source="rows"
            :export_api="export_api"
            :column_meta="headers"
            :totalCount="totalCount"
            @rowSelected="handleRowClicked"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="useOverride = false"
            :prevent-nav-on-col-label="'shared to portal'"
            @specialCellClicked="handleShareToPortal"
            :hideFilter=true
            :hideAction=true
        />
    </div>
    <div v-else-if="!this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
</template>

<script>
    import ChirpList from '@/components/general/list/ChirpList';
    import { file, settings } from '@/util/apiRequests';
    import dayjs from '@/util/dayjs';
    import { tryGetFilter } from '@/util/tryGetFilter';
    import { openPdf } from '@/util/pdf';

    export default {
        name: 'ClientSuperbills',
        components: { ChirpList },
        props: {
            client_id: {
                type: [String, Number],
                required: true
            },
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                rows: [],
                headers: [
                    { field: 'dayt_create', headerText: 'Date', allowSorting: true },
                    { field: 'file_label', headerText: 'File Name', allowSorting: true },
                    {
                        field: 'shared_to_portal',
                        headerText: 'Shared to Portal',
                        editType: 'booleanedit',
                        type: 'boolean',
                        displayAsCheckBox: 'true',
                        allowEditing: true
                    },
                    { field: 'document_id', headerText: 'Document', allowSorting: true, hide: true },
                ],
                targetPage: 'ClientSuperbill',
                totalCount: 0,
                useOverride: false,
                loading: true,
                loadingTable: false,
                criteriaProps: {},
                clientAllowed: false,
                export_api: '/file/billing-list-by-client',
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
                return 'clientSuperbills';
            },
            findCounselor() {
                let found = false;
                if (!this.clientAllowed) {
                    if (this.$store.getters['clientOverview/client'].primary_counselor == this.$store.state.user.id || this.$store.getters['clientOverview/client'].secondary_counselor == this.$store.state.user.id || this.$store.getters['clientOverview/client'].tertiary_counselor == this.$store.state.user.id) {
                        found = true;
                    }
                } else {
                    found = true;
                }
                return found;
            },
        },
        methods: {
            async loadData() {
                //Client id must be included whenever filters are updated.
                if (!this.criteria.filter?.client_id) {
                    this.criteria.filter = {
                        ...this.criteria.filter,
                        client_id: this.client_id
                    };
                }

                const body = {
                    criteria: this.criteria,
                    fileKind: 'superbill',
                    fileCode: 'SB #'
                };

                const res = await this.$api.post('/file/billing-list-by-client', body);

                this.rows = res.data.rows.map((row) => {
                    return {
                        dayt_create: dayjs(row.dayt_create).format('MM/DD/YYYY'),
                        file_label: row.file_label,
                        shared_to_portal: row.shared_to_portal,
                        document_id: row.document_id,
                    };
                });

                this.totalCount = res.data.total_count;
            },
            async handleCriteriaModified(criteria) {
                this.criteriaProps = {
                    ...criteria
                };
                await this.loadData();
            },
            handleRowClicked(data) {
                this.viewDocument(data);
            },
            async viewDocument(data) {
                try {
                    if (data.document_id) {
                        const res = await this.$api.get(file.getFile(data.document_id));

                        openPdf(res.data?.file?.Body, res.data?.file?.file_name);
                    } else {
                        this.$toasted.error('No document found');
                    }
                } catch (err) {
                    //this.$toasted.error('Could not load document');
                }
            },
            async handleShareToPortal(args) {
                await this.updateShareStatus(args);
            },
            async updateShareStatus(status) {
                try {
                    await this.$api.put(file.updateFile(status.data.document_id), {
                        shared_to_portal: !status.data.shared_to_portal,
                    });

                    this.$toasted.success('Updated share to portal status');
                } catch (err) {
                    //this.$toasted.error('Failed to update share to portal status');
                }

                await this.loadData();
            },
            async checkClientAllowed() {
                if (this.$store.state.user.role_id == 12 && !this.$store.state.user.requires_sup && !this.$store.state.user.is_supervisor) {
                    const allCharts = await this.$api.get(settings.getSetting('clinician_see_all_charts','company','company'));
                    this.clientAllowed = (allCharts.data.value == 0) ? false : true;
                } else {
                    this.clientAllowed = true;
                }
            },
        },
        async created() {
            await this.checkClientAllowed();

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
                    sort: {
                        dayt_create: 'Descending',
                    },
                },
            });

            await this.loadData();
        },
        watch: {
            criteria: {
                deep: true,
                async handler() {
                    await this.loadData();
                }
            }
        }
    };
</script>

<style scoped></style>

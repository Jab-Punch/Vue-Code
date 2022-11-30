<template>
    <div v-if='this.findCounselor'>
        <ChirpList
            headerText="Client Invoices"
            :data_source="rows"
            :export_api="export_api"
            :column_meta="headers"
            :totalCount="totalCount"
            @rowSelected="handleRowClicked"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="useOverride = false"
        />
    </div>
    <div v-else-if="!this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
</template>

<script>
    import ChirpList from '@/components/general/list/ChirpList';
    import { invoices, settings } from '@/util/apiRequests';
    import dayjs from '@/util/dayjs';
    import { tryGetFilter } from '@/util/tryGetFilter';

    export default {
        name: 'ClientInvoices',
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
                    { field: 'status', headerText: 'Status', allowSorting: true },
                    { field: 'amount_due', headerText: 'Amount Due', allowSorting: true },
                    { field: 'amount_paid', headerText: 'Amount Paid', allowSorting: true },
                    { field: 'amount_credited', headerText: 'Amount Credited', allowSorting: true },
                    { field: 'invoice_num', headerText: 'Invoice #', allowSorting: true },
                ],
                targetPage: 'ClientInvoice',
                totalCount: 0,
                useOverride: false,
                loading: true,
                loadingTable: false,
                criteriaProps: {},
                clientAllowed: false,
                export_api: '/invoices/by-client',
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
                return 'clientInvoices';
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
                    criteria: this.criteria
                };

                const res = await this.$api.post(invoices.getList(), body);

                this.rows = res.data.rows.map((row) => {
                    return {
                        dayt_create: dayjs(row.dayt_create).format('MM/DD/YYYY'),
                        status: row.status,
                        amount_paid: row.amount_paid,
                        amount_credited: row.amount_credited,
                        amount_due: row.amount_due,
                        invoice_num: row.id,
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
                this.$router.push({
                    name: 'Invoice',
                    params: { invoice_id: data.invoice_num }
                });
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

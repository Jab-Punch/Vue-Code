<template>
    <div v-if='this.findCounselor'>
        <ChirpList
            headerText="Client Transactions"
            :data_source="rows"
            :export_api="export_api"
            :column_meta="headers"
            :totalCount="totalCount"
            :storeKey="storeKey"
            :useOverride="useOverride"
            :rowDataBound="handleRowDataBound"
            :commandColumns="commandColumns"
            :client_id="client_id"
            :hideFilter="true"
            @cancelOverride="useOverride = false"
            @buttonInCellClicked="handleRefundClicked"
        />

        <RefundModal
            v-if="refundModalOpen"
            :clientId="client_id"
            :paymentInfo="selectedPayment"
            @close="handleRefundModalClose"
        />
    </div>
    <div v-else-if="!this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
</template>

<script>
    import ChirpList from '@/components/general/list/ChirpList';
    import { invoices, ledger, settings } from '@/util/apiRequests';
    import dayjs from '@/util/dayjs';
    import { tryGetFilter } from '@/util/tryGetFilter';
    import RefundModal from '@/components/client-manager/ClientBilling/RefundModal';

    export default {
        name: 'ClientTransactions',
        components: { RefundModal, ChirpList },
        props: {
            client_id: {
                type: [String, Number],
                required: true,
            },
            overrideFilter: {
                type: Object,
                default: null,
            },
        },
        data() {
            return {
                rows: [],
                rawRows: [],
                headers: [
                    { field: 'id', headerText: 'ID', allowSorting: false, hidden: true },
                    { field: 'dayt_create', headerText: 'Date', allowSorting: true },
                    { field: 'description', headerText: 'Description', allowSorting: true },
                    { field: 'charge_total', headerText: 'Charges', allowSorting: true },
                    { field: 'payment_total', headerText: 'Payments', allowSorting: true },
                    { field: 'type', headerText: 'Type', hidden: true },
                    { field: 'rawPayment', headerText: 'Raw Payment', hidden: true },
                    { field: 'paymentType', headerText: 'Payment Type', hidden: true },
                    { field: 'paymentIntentId', headerText: 'Payment Intent ID', hidden: true },
                    { field: 'availableForRefund', headerText: 'Available for Refund', hidden: true },
                    { field: 'ledger_id', headerText: 'Ledger Id', hidden: true },
                ],
                commandColumns: [
                    {
                        field: 'Commands',
                        headerText: 'Refund Payment',
                        commands: [
                            {
                                buttonOption: {
                                    content: `<span class="material-icons-outlined" style="pointer-events: none">attach_money</span>`,
                                    cssClass: 'delete-icon pad-5',
                                }
                            }
                        ]
                    }
                ],
                totalCount: 0,
                useOverride: false,
                loading: true,
                loadingTable: false,
                criteriaProps: {},
                selectedPayment: {
                    paymentId: 0,
                    paymentType: 'CASH',
                    paymentIntentId: '0',
                    initialPaymentAmount: 0,
                    availableForRefund: 0,
                },
                refundModalOpen: false,
                clientAllowed: false,
                export_api: '/ledger/transactions',
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
                return 'clientTransactions';
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

                const res = await this.$api.post(ledger.getTransactionList(), body);

                this.rawRows = res.data.rows;

                this.rows = res.data.rows.map((row) => {

                    return {
                        id: row.id,
                        dayt_create: dayjs(row.date).format('MM/DD/YYYY'),
                        description: row.description,
                        charge_total: row.charge_total,
                        payment_total: row.payment_total,
                        type: row.type,
                        rawPayment: row.payment_total,
                        paymentType: row.paymentType,
                        paymentIntentId: row.stripePaymentIntentId,
                        availableForRefund: row.availableForRefund,
                        ledger_id: row.ledger_id
                    };
                });

                this.totalCount = res.data.total_count;
            },
            async handleCriteriaModified(criteria) {
                this.criteriaProps = {
                    ...criteria,
                };
                await this.loadData();
            },
            handleRowDataBound(args) {
                const el = args.row.querySelector('.e-unboundcell');
                const button = args.row.querySelector('button');
                const tdSecond = args.row.querySelectorAll('td')[1]
                // will display tooltip on description column for large descriptions
                tdSecond.setAttribute('title', args.data.description);

                if (el) {
                    el.classList.add('command-col'); // Have to add this because the column displays ellipses if you hide the button..
                }

                if (!args.data.availableForRefund) {
                    button.setAttribute('disabled', 'true');
                    button.setAttribute('title', 'Payment Has Been Fully Refunded');
                } else {
                    button.setAttribute('title', 'Refund Payment');
                }

                if (args.data.payment_total === null || args.data.type === 'refund') {
                    args.row.querySelector('.e-btn').classList.add('e-hide');
                }

                if (args.data.payment_total < 0){
                    button.setAttribute('disabled', 'true');
                }


            },
            handleRefundClicked(args) {
                const transaction = args.rowData;

                this.selectedPayment = {
                    paymentId: transaction.id,
                    paymentType: transaction.paymentType,
                    paymentIntentId: transaction.paymentIntentId,
                    initialPaymentAmount: transaction.rawPayment,
                    availableForRefund: Math.min(transaction.availableForRefund * 100, transaction.rawPayment),
                    ledger_id: transaction.ledger_id,
                };

                this.refundModalOpen = true;
            },
            handleRefundModalClose() {
                this.refundModalOpen = false;
                this.loadData();
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
                    criteria: this.overrideFilter,
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
                },
            },
        },
    };
</script>

<style scoped></style>

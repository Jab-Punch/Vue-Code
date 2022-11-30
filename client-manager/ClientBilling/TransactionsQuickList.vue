<template>
    <div>
        <h3>Transactions</h3>
        <div class="grid bottom-10">
            <div class="x-scroll">
                <table class="simple client-transactions">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th style="text-align: right" >Charges</th>
                            <th style="text-align: right" >Payments</th>
                            <th style="text-align: right" >Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(transaction, idx) in transactions" :key="transaction.date + idx">
                            <td>{{ getShortDate(transaction.date) }}</td>
                            <td :title='transaction.description'>{{ transaction.description }}</td>
                            <td style="text-align: right" >{{ $getCurrency(transaction.charge) }}</td>
                            <td style="text-align: right" >{{ $getCurrency(transaction.payment) }}</td>
                            <td style="text-align: right" >
                                <ejs-dropdownbutton
                                    v-if="showDropdown(transaction)"
                                    :items="items[idx]"
                                    :select="handleDropdownSelection"
                                ></ejs-dropdownbutton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <router-link class="text-button" :to="{ name: 'ClientTransactions', params: {
            overrideFilter: {
                        sort: { dayt_create: 'Descending' },
                        search: {},
                        filter: { client_id: clientId },
                        page: { num_per_page: 10, current_page: 1, page_num: 1 },
                        column: []
                    } } }">Go to full list</router-link>

        <RefundModal
            v-if="refundModalOpen"
            :clientId="clientId"
            @close="handleRefundModalClose"
            :paymentInfo="selectedPayment"
        />
    </div>
</template>

<script>
    import Vue from 'vue';
    import { DropDownButtonPlugin } from '@syncfusion/ej2-vue-splitbuttons';
    import dayjs from '@/util/dayjs';
    import RefundModal from '@/components/client-manager/ClientBilling/RefundModal';

    Vue.use(DropDownButtonPlugin);

    export default {
        name: 'TransactionsQuickList',
        components: { RefundModal },
        props: {
            clientId: {
                type: [Number, String],
                required: true,
            },
            transactions: {
                type: Array,
                required: true,
            },
        },
        data() {
            return {
                selectedPayment: {
                    paymentId: 0,
                    paymentType: 'CASH',
                    paymentIntentId: '0',
                    initialPaymentAmount: 0,
                    availableForRefund: 0,
                },
                refundModalOpen: false,
            };
        },
        computed: {
            items() {
                return this.transactions.map((trx) => {
                    return [
                        {
                            id: `${trx.id}!${trx.paymentType}!${trx.payment}!${trx.availableForRefund}!${trx.stripePaymentIntentId}!${trx.ledger_id}!refund`,
                            text: 'Refund',
                        },
                    ];
                });
            },
        },
        methods: {
            getShortDate(isoDateString) {
                return dayjs(isoDateString).format('MM/DD/YY');
            },
            showDropdown(transaction) {
                return transaction.type === 'payment' && transaction.availableForRefund > 0;
            },
            handleDropdownSelection(args) {
                const [paymentId, paymentType, paymentAmount, availableForRefund, intentId, ledger_id] =
                    args.element.id.split('!');

                this.selectedPayment = {
                    paymentId,
                    paymentType,
                    paymentIntentId: intentId,
                    initialPaymentAmount: paymentAmount,
                    availableForRefund,
                    ledger_id,
                };
                this.refundModalOpen = true;
            },
            handleRefundModalClose() {
                this.$emit('refund');
                this.refundModalOpen = false;
            },
        },
    };
</script>

<style scoped></style>

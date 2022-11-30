<template>
    <div>
        <h3>Invoices</h3>
        <div class="bottom-20 simple-table-fliters">
            <button :class="filterStatus === 'OPEN' ? 'primary purple-bg' : 'no-bg'" @click="setFilterStatus('OPEN')">
                Open
            </button>
            <button :class="filterStatus === 'ALL' ? 'primary purple-bg' : 'no-bg'" @click="setFilterStatus('ALL')">
                All
            </button>
        </div>
        <div class="grid bottom-10">
            <div class="x-scroll">
                <table class="client-invoice-table simple">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Invoice #</th>
                            <th>Status</th>
                            <th style="text-align: right">Amt Paid</th>
                            <th style="text-align: right">Amt Cr</th>
                            <th style="text-align: right">Amt Due</th>
                            <th style="text-align: right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="invoice-row"
                            v-for="(invoice, idx) in filteredInvoices"
                            :key="invoice.id"
                            @click="handleRowClicked($event, invoice)"
                        >
                            <td class="pointer">{{ getShortDate(invoice.dayt_create) }}</td>
                            <td class="pointer">{{ invoice.id }}</td>
                            <td class="pointer">{{ invoiceClosed(invoice) ? 'Paid' : 'Open' }}</td>
                            <td class="pointer" style="text-align: right">{{ getCurrency(invoice.amount_paid) }}</td>
                            <td class="pointer" style="text-align: right">{{ getCurrency(invoice.amount_credited) }}</td>
                            <td class="pointer" style="text-align: right">{{ getCurrency(invoice.amount_owed) }}</td>
                            <td class="pointer" style="text-align: right">
                                <ejs-dropdownbutton
                                    v-if="showDropdown(invoice, items, idx)"
                                    :items="items[idx]"
                                    :select="handleInvoiceDropdownSelection"
                                ></ejs-dropdownbutton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <router-link class="text-button" :to="{ name: 'ClientInvoices', params: { overrideFilter: {
                        sort: { dayt_create: 'Descending' },
                        search: {},
                        filter: { client_id: clientId },
                        page: { num_per_page: 10, current_page: 1, page_num: 1 },
                        column: []
                    } } }"
            >Go to full list</router-link>

        <PayInvoiceModal
            v-if="payInvoiceModalOpen"
            :balance="selectedInvoice.balance"
            :invoiceId="selectedInvoice.id"
            :clientId="clientId"
            @close="handlePaymentClose"
        />

        <InvoiceAdjustmentModal
            :open="adjustInvoiceModalOpen"
            :amountOwed="selectedInvoice.balance"
            :invoiceId="selectedInvoice.id"
            @close="handleAdjustmentClose"
        />
    </div>
</template>

<script>
    import Vue from 'vue';
    import { DropDownButtonPlugin } from '@syncfusion/ej2-vue-splitbuttons';
    import dayjs from '@/util/dayjs';
    import { invoices } from '@/util/apiRequests';
    import PayInvoiceModal from '@/components/invoice/PayInvoiceModal';
    import InvoiceAdjustmentModal from '@/components/client-manager/ClientBilling/InvoiceAdjustmentModal';

    Vue.use(DropDownButtonPlugin);

    export default {
        name: 'InvoiceQuickList',
        components: { InvoiceAdjustmentModal, PayInvoiceModal },
        props: {
            clientId: {
                type: [String, Number],
                required: true,
            },
        },
        data() {
            return {
                filterStatus: 'ALL',
                invoices: [],
                items: [],
                payInvoiceModalOpen: false,
                selectedInvoice: {
                    id: 0,
                    balance: 0,
                },
                adjustInvoiceModalOpen: false,
            };
        },
        computed: {
            filteredInvoices() {
                if (this.filterStatus === 'OPEN') {
                    return this.invoices.filter((invoice) => !invoice.closed);
                } else {
                    return this.invoices;
                }
            },
        },
        methods: {
            getShortDate(isoDateString) {
                return dayjs(isoDateString).format('MM/DD/YY');
            },
            getCurrency(amount) {
                amount = amount / 100;

                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                }).format(amount);
            },
            setFilterStatus(newStatus) {
                this.filterStatus = newStatus;
            },
            async handleRowClicked(e, invoice) {
                if (!e.target.classList.contains('e-btn-icon') && !e.target.classList.contains('e-dropdown-btn')) {
                    await this.$router.push({ name: 'Invoice', params: { invoice_id: invoice.id } }); // await this.$router.push({ name: 'UserInvoiceV2', params: { id: invoice.id } });
                }
            },
            invoiceClosed(invoice) {
                return invoice.amount_owed <= 0;
            },
            async getInvoices() {
                const res = await this.$api.get(invoices.getQuickList(this.clientId, this.filterStatus));

                this.invoices = res.data;
                this.items = res.data.map((row) => {
                    const itemList = [];

                    if (!this.invoiceClosed(row)) {
                        itemList.unshift({
                            id: `${row.id}_${row.amount_owed}_payment`,
                            text: 'Pay',
                        });
                    }

                    return itemList;
                });
            },
            handleInvoiceDropdownSelection(args) {
                const [invoiceId, amountDue, action] = args.element.id.split('_');

                this.selectedInvoice = {
                    id: invoiceId,
                    balance: parseInt(amountDue),
                };

                if (action === 'adjustment') {
                    this.adjustInvoiceModalOpen = true;
                }

                if (action === 'payment') {
                    this.payInvoiceModalOpen = true;
                }
            },
            handleAdjustmentClose() {
                this.adjustInvoiceModalOpen = false;
                this.$emit('actionComplete');
            },
            handlePaymentClose(payload) {
                this.payInvoiceModalOpen = false;
                this.$emit('actionComplete', 'ACTION COMPLETE FROM HANDLE PAYMENT CLOSE');
            },
            async refresh() {
                await this.getInvoices();
            },
            showDropdown(invoice, items, idx) {
                return !this.invoiceClosed(invoice) && items[idx] && items[idx].length > 0;
            },
        },
        async created() {
            await this.getInvoices();
        },
        watch: {
            async filterStatus() {
                await this.getInvoices();
            },
        },
    };
</script>

<style scoped>
    .invoice-row:hover {
        cursor: pointer;
    }
</style>

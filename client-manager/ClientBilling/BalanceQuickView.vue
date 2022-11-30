<template>
    <div class="client-account-balance">
        <h3>Account Balance</h3>
        <div class="flex center bottom-15">
            <p class="top-0 bottom-0 right-20">Client Owes</p>
            <h3 class="margin-0" :class="getClientOwesColor(clientOwes)">
                <b>{{ $getCurrency(clientOwes) }}</b>
            </h3>
            <div  class="flex-1 align-right">
                <button class="primary" @click="collectPaymentOpen = true">Collect Payment</button>
            </div>
        </div>
        <div class="flex center">
            <p class="top-0 bottom-0 right-20">Client Credit</p>
            <h3 class="margin-0" :class="getClientCreditColor(clientCredit)">
                <b>{{ $getCurrency(clientCredit) }}</b>
            </h3>
            <div class="flex-1 align-right">
<!--                <button class="primary bottom-10">Collect Payment</button>-->
                <button class="secondary" @click="addCreditModalOpen = true">
                    <span class="material-icons">add</span> Add Credit
                </button>
            </div>
        </div>
        <div class="flex-1">
            <button class="no-bg blue list-button" style="text-decoration:underline;" @click="sendEmail">Send Email Reminder To Pay Balance</button>
        </div>



        <NewCollectPaymentModal
            v-if="collectPaymentOpen"
            @close="collectPaymentOpen = false"
            @paymentCollected="handlePaymentCollected"
            :clientId="clientId"
            :owes="clientOwes"
            :credit="clientCredit"
        />

<!--         This is actually the add credit modal -->
        <CollectPaymentModal
            v-if="addCreditModalOpen"
            @close="addCreditModalOpen = false"
            @paymentCollected="handlePaymentCollected"
            :clientId="clientId"
        />
        <AccountBalanceEmailModal
            :modal_client="clientId"
            :open="showEmailModal"
            :amount_owed="clientOwes"
            @closeModal="showEmailModal = false"
        />
    </div>
</template>

<script>
    import { ledger } from '@/util/apiRequests';
    import CollectPaymentModal from '@/components/client-manager/ClientBilling/CollectPaymentModal';
    import AccountBalanceEmailModal from '@/components/client-manager/ClientBilling/AccountBalanceEmailModal';
    import NewCollectPaymentModal from "@/components/client-manager/ClientBilling/NewCollectPaymentModal";


    export default {
        name: 'BalanceQuickView',
        components: {NewCollectPaymentModal, CollectPaymentModal, AccountBalanceEmailModal },

        props: {
            clientId: {
                type: [String, Number],
                required: true,
            },
        },
        data() {
            return {
                clientOwes: 0,
                clientCredit: 0,
                addCreditModalOpen: false,
                collectPaymentOpen: false,
                showEmailModal: false,
            };

        },
        methods: {
            async getBalance() {
                const res = await this.$api.get(ledger.getClientBalance(this.clientId));

                this.clientOwes = res.data.owes;
                this.clientCredit = res.data.credit;
            },
            async handlePaymentCollected() {
                await this.getBalance();
                this.$emit('paymentCollected');
            },
            async refresh() {
                await this.getBalance();
            },
            getClientOwesColor(amount) {
                return {
                    'balance-red-text': amount > 0,
                    'balance-black-text': amount === 0,
                    'balance-green-text': amount < 0,
                };
            },
            getClientCreditColor(amount) {
                return {
                    'balance-red-text': amount < 0,
                    'balance-black-text': amount === 0,
                    'balance-green-text': amount > 0,
                };
            },
            sendEmail() {
                this.showEmailModal = true;
            }
        },
        async created() {
            await this.getBalance();
        },
    };
</script>

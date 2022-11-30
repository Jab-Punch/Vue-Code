<template>
    <Modal @close="handleClose">
        <h2>Submit Refund</h2>

        <div class="bottom-15">
            <span>Original Client Payment: </span>
            <span><strong>{{ originalPayment }}</strong></span>
        </div>

        <div class="bottom-15">
            <span>Amount Available for Refund: </span>
            <span><strong>{{ availableRefund }}</strong></span>
        </div>

        <div class="bottom-15">
            <label for="refundAmount">Refund Amount to Client</label>
            <CurrencyInput
                id="refundAmount"
                ref="refundOtherAmount"
                :initialValue="0"
                :max="
                    typeof paymentInfo.availableForRefund === 'string'
                        ? $getNumFromCurrency(paymentInfo.availableForRefund)
                        : paymentInfo.availableForRefund
                "
                @currency="handleCurrency"
            />
        </div>

        <Dropdown
            v-if="showRefundMethod"
            :options="refundMethodList"
            v-model="refundMethod"
            label="Select Refund Method"
        />

        <Input v-if="refundMethod === 'CHECK'" id="refundCheckNumber" label="Enter Check #" v-model="checkNumber" />

        <Input v-if="refundMethod === 'OTHER'" id="refundOtherDescription" label="Details" v-model="details" />

        <div class="align-right top-20">
            <button @click="handleClose" class="secondary">Cancel</button>
            <button @click="handleSubmitRefund" :disabled="working" class="primary">Submit</button>
        </div>
    </Modal>
</template>

<script>
    import Modal from '@/components/general/modals/Modal';
    import CurrencyInput from '@/components/general/inputs/CurrencyInput';
    import { payments, logs } from '@/util/apiRequests';

    export default {
        name: 'RefundModal',
        props: {
            clientId: {
                type: [String, Number],
                required: true,
            },
            paymentInfo: {
                type: Object,
                required: true,
            },
        },
        components: { CurrencyInput, Modal },
        data() {
            return {
                refundAmount: 0,
                refundMethodList: [
                    { text: 'Cash', value: 'CASH' },
                    { text: 'Check', value: 'CHECK' },
                    { text: 'Other', value: 'OTHER' },
                ],
                refundMethod: 'CASH',
                checkNumber: '',
                details: '',
                working: false,
                criteria:{
                    filter:{
                        client_id: [`${this.clientId}`],
                    },
                    sort: {
                        'logs.dayt_create': 'desc',
                    },
                    page: {

                        num_per_page: "10000",
                        page_num: 1,
                    },
                }
            };
        },
        computed: {
            showRefundMethod() {
                return this.paymentInfo.paymentType !== 'CARD' && this.paymentInfo.availableForRefund > 0;
            },
            originalPayment() {
                return this.$getCurrency(parseInt(this.paymentInfo.initialPaymentAmount));
            },
            availableRefund() {
                return this.$getCurrency(parseInt(this.paymentInfo.availableForRefund));
            },
        },
        methods: {
            //check if already refunded by looking in logs
            async checkIfMaxAlreadyRefunded() {
                let noRefund;
                let amountAlreadyRefunded = 0;
                let amountAttemptingToBeRefunded = this.refundAmount;
                try {

                    const res = await this.$api.post(logs.getActivityTimeline(), {
                        criteria: this.criteria,
                        log_type: 'refund_via_client_modal',
                    });

                    //try catch json parse metadata and then filter by the payment id, ledger id, and client id
                    let log_refunds_so_far = res.data.rows.filter((log) => {
                        const metadata = JSON.parse(log.metadata);
                        return (
                            metadata.payment_id === this.paymentInfo.paymentId &&
                            metadata.ledger_id === this.paymentInfo.ledger_id &&
                            metadata.client_id === this.clientId
                        );
                    });

                    //if there are refunds, then subtract the amount of the refunds from the original payment
                    if (log_refunds_so_far.length > 0) {
                        amountAlreadyRefunded = log_refunds_so_far.reduce((acc, log) => {
                            const metadata = JSON.parse(log.metadata);
                            return acc + metadata.amount;
                        }, 0);
                    }

                    //if the amount attempting to be refunded is greater than the amount already refunded, then do not allow refund
                    if(amountAlreadyRefunded + amountAttemptingToBeRefunded > this.paymentInfo.initialPaymentAmount){
                        noRefund = true;
                    }else {
                        //amount already refunded is greater than or equal to the original payment amount
                        if (amountAlreadyRefunded >= this.paymentInfo.initialPaymentAmount) {
                            noRefund = true;
                        } else {
                            noRefund = false;
                        }
                    }

                } catch (err) {
                    //if there is an error, then do not allow refund
                    this.$cl(err);
                }
                return noRefund;
            },
            async handleSubmitRefund() {
                this.working = true;
                if (this.refundMethod === 'CHECK' && !this.checkNumber) {
                    this.$toasted.error('Check Number is Required');
                    this.working = false;
                    return;
                }

                if (this.refundMethod === 'OTHER' && !this.details) {
                    this.$toasted.error('Description is Required');
                    this.working = false;
                    return;
                }

                if (this.refundAmount === 0) {
                    this.$toasted.error('Refund amount must be more than $0');
                    this.working = false;
                    return;
                }

                if (this.refundAmount > this.paymentInfo.availableForRefund) {
                    this.$toasted.error('Refund amount cannot exceed amount available for refund');
                    this.working = false;
                    return;
                }
                let refundedMaxAlready = await this.checkIfMaxAlreadyRefunded();
                if(refundedMaxAlready){
                    this.$toasted.error('Max refund already submitted');
                    this.working = false;
                    this.handleClose();
                    return;
                }
                try {
                    const res = await this.$api.post(payments.refund(), {
                        payment_id: this.paymentInfo.paymentId,
                        amount: this.refundAmount,
                        payment_type: this.paymentInfo.paymentType,
                        stripe_payment_intent_id: this.paymentInfo.paymentIntentId || undefined,
                        refund_type: this.refundMethod,
                        client_id: this.clientId,
                        ledger_id: this.paymentInfo.ledger_id,
                    });

                    if (res.status >= 200 && res.status < 300) {
                        this.$toasted.success('Refund successful');
                        //Here we'll save to local storage that these ids have been refunded
                        const refundToCurrency = this.$getCurrency(this.refundAmount);
                        await this.$api.put(logs.saveLog('new'), {
                            log_type: 'refund_via_client_modal',
                            description: `Refund of $${refundToCurrency} for payment ${this.paymentInfo.paymentId} was submitted. With ledger id ${this.paymentInfo.ledger_id} and client id ${this.clientId}.`,
                            client_id: this.clientId,
                            user_id_create: this.$store.state.user.id,
                            metadata: JSON.stringify({
                                initial_payment_amount: this.paymentInfo.initialPaymentAmount,
                                payment_id: this.paymentInfo.paymentId,
                                amount: this.refundAmount,
                                payment_type: this.paymentInfo.paymentType,
                                stripe_payment_intent_id: this.paymentInfo.paymentIntentId || undefined,
                                refund_type: this.refundMethod,
                                client_id: this.clientId,
                                ledger_id: this.paymentInfo.ledger_id,
                                id_counter_for_data_migration: 1,
                            }),
                        });


                        this.handleClose();
                    } else {
                        this.$toasted.error('Failed to issue refund');
                    }
                    this.working = false;
                } catch (err) {
                    this.$toasted.error('Failed to issue refund');
                    this.working = false;
                }
            },
            handleCurrency(val) {
                this.refundAmount = this.$getNumFromCurrency(val);
            },
            handleClose() {
                console.log(this.paymentInfo.ledger_id);
                console.log(this.paymentInfo.paymentId);
                this.$refs.refundOtherAmount.clear();
                this.refundAmount = 0;
                this.refundMethod = 'CASH';
                this.checkNumber = '';
                this.details = '';
                this.working = false;

                this.$emit('close');
            },
        },
        created() {
            console.log('created');
            console.log('paymentInfo ledger in created', this.paymentInfo?.ledger_id);
            console.log('paymentInfo paymentId in created', this.paymentInfo?.paymentId);
        },
        watch: {
            open() {
                console.log(this.paymentInfo);
                console.log('ok');
                this.refundMethod = this.paymentInfo.paymentType;
            },
        },
    };
</script>

<style scoped></style>

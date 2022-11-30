<template>
    <NoButtonModal :open="open" @close="handleClose">
        <h2>Submit Adjustment</h2>

        <div>
            <p>Original Client Responsibility</p>
            <span>{{ $getCurrency(amountOwed) }}</span>
        </div>

        <div>
            <label for="adjustmentInput">Write-Off Amount</label>
            <CurrencyInput
                id="adjustmentInput"
                :initialValue="0"
                @currency="handleCurrencyChange"
                ref="adjustmentInput"
            />
        </div>

        <Input type="text" name="Reason" label="Reason" v-model="reason" required />

        <div>
            <p>New Client Responsibility</p>
            <span>{{ $getCurrency(newClientResponsibility) }}</span>
        </div>

        <button @click="handleClose">Cancel</button>
        <button @click="submitWriteOff">Submit</button>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import CurrencyInput from '@/components/general/inputs/CurrencyInput';
    import { invoices } from '@/util/apiRequests';

    export default {
        name: 'InvoiceAdjustmentModal',
        components: { CurrencyInput, NoButtonModal },
        props: {
            open: {
                type: Boolean,
                required: true,
            },
            amountOwed: {
                type: Number,
                required: true,
            },
            invoiceId: {
                type: [Number, String],
                required: true,
            },
        },
        data() {
            return {
                selectedAdjustType: 'ADD_FEE',
                adjustmentAmount: 0,
                reason: '',
            };
        },
        computed: {
            newClientResponsibility() {
                return this.amountOwed - this.adjustmentAmount;
            },
        },
        methods: {
            handleCurrencyChange(newVal) {
                this.adjustmentAmount = this.$getNumFromCurrency(newVal);
            },
            handleClose() {
                this.adjustmentAmount = 0;
                this.reason = '';
                this.$refs.adjustmentInput.clear();
                this.$emit('close');
            },
            async submitWriteOff() {
                if (!this.reason) {
                    //this.$toasted.error('Reason is required');
                    return;
                }

                if (!this.adjustmentAmount) {
                    this.$toasted.error('Adjustment amount must be greater than $0.00');
                    return;
                }

                try {
                    const res = await this.$api.post(invoices.writeOff(), {
                        invoice_id: this.invoiceId,
                        amount: this.adjustmentAmount,
                        description: this.reason,
                    });

                    if (res.status >= 200 && res.status < 300) {
                        this.$toasted.success('Write-off successful');
                        this.$emit('writeOff');
                        this.handleClose();
                    } else {
                        this.$toasted.error('Failed to submit write-off');
                    }
                } catch (err) {
                    this.$toasted.error('Failed to submit write-off');
                }
            },
        },
    };
</script>

<style scoped></style>

<template>
    <NoButtonModal :open="open" @close="handleClose">
        <div class="flex">
            <div class="right-20">
                <span class="material-icons-outlined leaf-green large-icon">check_circle</span>
            </div>
            <div>
                <h2>Payment Success</h2>
                <div class="bottom-20">A payment of <b>{{ paymentAmount }}</b> was successfully completed{{ clientName &&' by  '+ clientName }}.</div>
                <div>
                    <button class="secondary" type="button" @click="openReceiptPreview"  v-if="data.receiptId">Preview Receipt</button>
                    <button
                        class="secondary"
                        type="button"
                        :disabled="receiptSentToPortal"
                        :title="shareToPortalTitle"
                        @click="shareToPortal"
                        v-if="data.receiptId"
                    >Send Receipt to Portal

                    </button>
                    <button class="primary" type="button" @click="handleClose">Ok</button>
                </div>
            </div>
        </div>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import { file } from '@/util/apiRequests';
    import { openPdf } from '@/util/pdf';

    export default {
        name: 'PaymentSuccessModal',
        components: { NoButtonModal },
        props: {
            open: {
                type: Boolean,
                required: true
            },
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                receiptSentToPortal: false
            };
        },
        computed: {
            paymentAmount() {
                return this.data?.data?.paymentAmount || this.data?.data?.amountPaid || this.data?.amount && this.$getCurrency(this.data?.amount) || '';
            },
            clientName() {
                return this.data?.data?.clientName || '';
            },
            shareToPortalTitle() {
                return this.receiptSentToPortal ? 'Receipt already sent to portal' : null;
            }
        },
        methods: {
            async openReceiptPreview() {
                if (this.data.receiptId) {
                    const result = await this.$api.get(file.getFile(this.data.receiptId));
                    await openPdf(result.data.file.Body, result.data.file.file_name);
                } else {
                    this.$toasted.error('No receipt found');
                }
            },
            async shareToPortal() {
                if (this.data.receiptId) {
                    const result = await this.$api.put(file.updateFile(this.data.receiptId), {
                        shared_to_portal: true
                    });

                    if (result.status < 300) {
                        this.receiptSentToPortal = true;
                        this.$toasted.success('Receipt shared to portal');
                    }
                } else {
                    this.$toasted.error('No receipt found');
                }
            },
            handleClose() {
                this.receiptSentToPortal = false;
                this.$emit('close');
            }
        }
    };
</script>

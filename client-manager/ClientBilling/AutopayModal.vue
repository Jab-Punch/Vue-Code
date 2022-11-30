<template>
    <NoButtonModal :open="open" @close="$emit('close')">
        <h2>Set Up Autopay?</h2>
        <p>Setting up autopay for this client will automatically pay any invoice generated for this client.</p>
        <div class="align-right">
            <button class="secondary" @click="$emit('close')">Cancel</button>
            <button class="primary" @click="setCardForAutopay">Confirm</button>
        </div>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import { payments } from '@/util/apiRequests';
    export default {
        name: 'AutopayModal',
        components: { NoButtonModal },
        props: {
            open: {
                type: Boolean,
                required: true,
            },
            clientId: {
                type: [String, Number],
                required: true,
            },
            paymentMethodId: {
                type: [String, Number],
                required: true,
            },
        },
        methods: {
            async setCardForAutopay() {
                const res = await this.$api.patch(payments.setAutopay(this.paymentMethodId), {
                    clientId: this.clientId,
                });

                if (res.status < 200 || res.status >= 300) {
                    //this.$toasted.error('Failed to set card up for autopay');
                    return;
                }

                this.$toasted.success('Card set up for autopay');
                this.$emit('close');
            },
        },
    };
</script>
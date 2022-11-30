<template>
    <NoButtonModal :open="open" @close="handleClose">
        <h2>Are you sure you want to delete this card?</h2>
        <button @click="handleClose">Cancel</button>
        <button @click="handleDelete">Confirm</button>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import { payments } from '@/util/apiRequests';
    export default {
        name: 'DeleteCardModal',
        components: { NoButtonModal },
        props: {
            open: {
                type: Boolean,
                required: true,
            },
            cardId: {
                type: [Number, String],
                required: true,
            },
        },
        methods: {
            handleClose() {
                this.$emit('close');
            },
            async handleDelete() {
                try {
                    const res = await this.$api.delete(payments.deletePaymentMethod(this.cardId));

                    if (res.status === 204) {
                        this.$toasted.success('Successfully deleted saved card');
                        this.$emit('deleted');
                        this.handleClose();
                    }
                } catch (err) {
                    //this.$toasted.error('Failed to delete saved card');
                }
            },
        },
    };
</script>

<style scoped></style>

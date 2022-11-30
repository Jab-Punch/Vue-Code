<template>
    <NoButtonModal :open="open" @close="handleClose">
        <h2>Edit Card Nickname</h2>
        <Input type="text" v-model="formData.nickname" label="Nickname" @keydown.enter="handleSave" />
        <div class="align-right top-15">
            <button class="secondary" @click="handleClose">Cancel</button>
            <button class="primary" @click="handleSave">Save</button>
        </div>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import { payments } from '@/util/apiRequests';
    export default {
        name: 'EditCardNicknameModal',
        components: { NoButtonModal },
        props: {
            open: {
                type: Boolean,
                required: true,
            },
            paymentData: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                formData: {
                    ...this.paymentData,
                },
            };
        },
        methods: {
            handleClose() {
                this.$emit('close');
                this.clear();
            },
            async handleSave() {
                await this.saveCardName();
                this.$emit('saved');
                this.handleClose();
            },
            async saveCardName() {
                try {
                    const res = await this.$api.patch(payments.updatePaymentMethodName(), {
                        payment_method_id: this.formData.id,
                        nickname: this.formData.nickname,
                    });

                    if (res.status === 204) {
                        this.$toasted.success('Saved new card nickname');
                    }
                } catch (err) {
                    console.log(err);
                    //this.$toasted.error('Failed to update card name');
                }
            },
            clear() {
                this.formData = {
                    ...this.paymentData,
                };
            },
        },
        watch: {
            paymentData: {
                deep: true,
                handler(newValue) {
                    this.formData = { ...newValue };
                },
            },
        },
    };
</script>

<style scoped></style>

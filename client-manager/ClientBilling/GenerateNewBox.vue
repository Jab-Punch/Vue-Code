<template>
    <div>
        <h3>Generate New</h3>
        <button class="no-bg blue list-button" @click="setStatementModalState(true)">Statement</button>
        <button class="no-bg blue list-button" @click="setSuperbillModalState(true)">Superbill</button>
        <button class="no-bg blue list-button" @click="setInvoiceModalState(true)">Invoice</button>
        <GenerateSuperbillModal
            :open="generateSuperbillModalOpen"
            @close="setSuperbillModalState(false)"
            :clientId="clientId"
        />
        <GenerateStatementModal
            :open="generateStatementModalOpen"
            @close="setStatementModalState(false)"
            :clientId="clientId"
        />
        <GenerateInvoiceModal
            :open="generateInvoiceModalOpen"
            @close="setInvoiceModalState(false)"
            :clientId="clientId"
            :financialClass="financialClass"
        />
    </div>
</template>

<script>
    import GenerateSuperbillModal from '@/components/client-manager/ClientBilling/GenerateSuperbillModal';
    import GenerateStatementModal from '@/components/client-manager/ClientBilling/GenerateStatementModal';
    import GenerateInvoiceModal from '@/components/client-manager/ClientBilling/GenerateInvoiceModal';
    export default {
        name: 'GenerateNewBox',
        components: { GenerateInvoiceModal, GenerateStatementModal, GenerateSuperbillModal },
        props: {
            clientId: {
                type: [Number, String],
                required: true
            },
            financialClass: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                generateSuperbillModalOpen: false,
                generateStatementModalOpen: false,
                generateInvoiceModalOpen: false
            };
        },
        methods: {
            setSuperbillModalState(newState) {
                this.generateSuperbillModalOpen = newState;
            },
            setStatementModalState(newState) {
                this.generateStatementModalOpen = newState;
            },
            setInvoiceModalState(newState) {
                this.generateInvoiceModalOpen = newState;
                if (!newState) {
                    this.$emit('refresh');
                }
            }
        }
    };
</script>

<style scoped></style>

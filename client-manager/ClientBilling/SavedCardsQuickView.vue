<template>
    <div>
        <div class="flex center space-between bottom-20 card-head">
            <h3 class="margin-0">Stored Debit/Credit Cards</h3>
            <button class="no-bg margin-0 text-button" @click="newCardModalOpen = true">
                <span class="material-icons purple">add_box</span> Add Card
            </button>
        </div>
        <table class="simple">
            <thead>
                <tr>
                    <th>Nickname</th>
                    <th>Last 4</th>
                    <th>Expiration Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(card, idx) in cards" :key="card.id">
                    <td>
                        <span v-if="card.is_autopay" class="balance-green-text middot"> • </span>
                        <strong>{{ card.payment_name }}</strong>
                    </td>
                    <td>•••{{ card.last4_cc_num }}</td>
                    <td>{{ formatExpDate(card.expiration_dayt) }}</td>
                    <td>
                        <ejs-dropdownbutton :items="items[idx]" :select="handleDropdownSelection"></ejs-dropdownbutton>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr v-if="clientHasAutopayCard">
                    <td colspan="4">
                        <span class="balance-green-text middot">• </span>
                        — Card selected for autopay, client will be charged on this card when invoiced
                    </td>
                </tr>
            </tfoot>
        </table>

        <NewCardModal :open="newCardModalOpen" :clientId="clientId" @close="handleNewCardClose" @saved="getCards" />

        <EditCardNicknameModal
            :open="editNicknameModalOpen"
            :paymentData="editNicknameData"
            @close="handleEditNicknameClose"
            @saved="getCards"
        />

        <DeleteCardModal
            :open="deleteCardModalOpen"
            :cardId="selectedCardForDelete"
            @close="handleDeleteClose"
            @deleted="getCards"
        />

        <AutopayModal
            :open="autopayModalOpen"
            :paymentMethodId="selectedCardForAutopay"
            :clientId="clientId"
            @close="handleAutopayClose"
        />
    </div>
</template>

<script>
    import Vue from 'vue';
    import { DropDownButtonPlugin } from '@syncfusion/ej2-vue-splitbuttons';
    import { payments } from '@/util/apiRequests';
    import dayjs from '@/util/dayjs';
    import EditCardNicknameModal from '@/components/client-manager/ClientBilling/EditCardNicknameModal';
    import DeleteCardModal from '@/components/client-manager/ClientBilling/DeleteCardModal';
    import NewCardModal from '@/components/client-manager/ClientBilling/NewCardModal';
    import AutopayModal from '@/components/client-manager/ClientBilling/AutopayModal';

    Vue.use(DropDownButtonPlugin);

    export default {
        name: 'SavedCardsQuickView',
        components: { AutopayModal, NewCardModal, DeleteCardModal, EditCardNicknameModal },
        props: {
            clientId: {
                type: [Number, String],
                required: true,
            },
        },
        data() {
            return {
                cards: [],
                items: [],
                editNicknameModalOpen: false,
                editNicknameData: {
                    id: 0,
                    nickname: '',
                },
                deleteCardModalOpen: false,
                selectedCardForDelete: 0,
                newCardModalOpen: false,
                autopayModalOpen: false,
                selectedCardForAutopay: 0,
            };
        },
        computed: {
            clientHasAutopayCard() {
                return this.cards.some((card) => card.is_autopay);
            },
        },
        methods: {
            async getCards() {
                try {
                    const res = await this.$api.get(payments.getSavedCardsForClient(this.clientId));

                    this.cards = res.data;
                    this.items = res.data.map((card) => {
                        const items = [
                            {
                                id: `${card.id}_${card.payment_name}_edit`,
                                text: 'Edit Nickname',
                            },
                            {
                                id: `${card.id}_${card.payment_name}_delete`,
                                text: 'Delete Card',
                            },
                        ];

                        if (card.is_autopay) {
                            items.push({
                                id: `${card.id}_${card.payment_name}_autopayRemove`,
                                text: 'Remove Autopay',
                            });
                        } else {
                            items.push({
                                id: `${card.id}_${card.payment_name}_autopay`,
                                text: 'Set Autopay',
                            });
                        }

                        return items;
                    });
                } catch (err) {
                    //this.$toasted.error('Could not retrieve saved cards for client');
                }
            },
            formatExpDate(date) {
                return dayjs(date).add(12, 'h').format('MM/YY');
            },
            handleDropdownSelection(args) {
                const [paymentId, nickname, action] = args.element.id.split('_');

                switch (action) {
                    case 'edit':
                        this.editNicknameData = {
                            id: paymentId,
                            nickname,
                        };

                        this.editNicknameModalOpen = true;
                        break;
                    case 'delete':
                        this.selectedCardForDelete = paymentId;
                        this.deleteCardModalOpen = true;
                        break;
                    case 'autopay':
                        this.selectedCardForAutopay = paymentId;
                        this.autopayModalOpen = true;
                        break;
                    case 'autopayRemove':
                        this.removeAutopay(paymentId);
                        break;
                }
            },
            handleEditNicknameClose() {
                this.editNicknameModalOpen = false;
            },
            handleDeleteClose() {
                this.deleteCardModalOpen = false;
            },
            handleNewCardClose() {
                this.newCardModalOpen = false;
            },
            async handleAutopayClose() {
                this.autopayModalOpen = false;
                await this.refresh();
            },
            async refresh() {
                await this.getCards();
            },
            async removeAutopay(paymentId) {
                const res = await this.$api.patch(payments.removeAutopay(paymentId));

                if (res.status < 200 || res.status >= 300) {
                    //this.$toasted.error('Failed to remove autopay from selected card');
                    return;
                }

                this.$toasted.success('Removed autopay from selected card');
                await this.refresh();
            },
        },
        async created() {
            await this.getCards();
        },
    };
</script>

<style scoped></style>

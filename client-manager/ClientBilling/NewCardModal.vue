<template>
    <NoButtonModal :open="open" @close="handleClose">
        <h2>Add Card</h2>
        <form action="">
            <Input type="text" v-model="nickname" label="Card Nickname" id="cardName" placeholder="Card Nickname" />
            <NewCardForm v-model="cardInfo" ref="cardForm" :hideSave="true" @input='cardName' />
        </form>
        <div class="align-right flex justify-end">
            <button class="secondary" @click="handleClose">Cancel</button>
            <button class="primary" @click="saveCard" :disabled="savingCard">
                <span v-if="savingCard == false">Save</span>
                <Loading
                    :outerHeight="'19px'"
                    :outerWidth="'31.97px'"
                    :height="'19px'"
                    :width="'19px'"
                    :color="'white transparent transparent transparent'"
                    :borderWidth="'2px'"
                    v-else
                />
            </button>
        </div>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import NewCardForm from '@/components/stripe/NewCardForm';
    import Loading from '@/components/general/loading/loading';
    import { payments } from '@/util/apiRequests';
    export default {
        name: 'NewCardModal',
        components: { NewCardForm, NoButtonModal, Loading },
        props: {
            open: {
                type: Boolean,
                required: true
            },
            clientId: {
                type: [Number, String],
                required: true
            }
        },
        data() {
            return {
                cardInfo: null,
                nickname: '',
                savingCard: false
            };
        },
        methods: {
            cardName() {
                if (this.cardInfo.card.number.length >= 15) {
                    const isValid = this.$refs.cardForm.validateCardNumber();
                    if (isValid && !this.nickname) {
                        this.nickname = this.cardInfo.card.number.slice(-4)
                    }
                }
            },
            async saveCard() {
                this.savingCard = true;
                const isValid = this.$refs.cardForm.validate();

                if (!isValid) {
                    this.$toasted.error('Invalid card');
                    this.savingCard = false;
                    return;
                }
                if(!this.nickname) {
                    this.$toasted.error('Enter Card Nickname');
                    this.savingCard = false;
                    return;
                }

                const payload = {
                    client_id: this.clientId,
                    is_autopay: this.cardInfo.card.is_autopay,
                    card_info: {
                        number: this.cardInfo.card.number,
                        exp_month: this.cardInfo.card.exp_month,
                        exp_year: this.cardInfo.card.exp_year,
                        cvc: this.cardInfo.card.cvc,
                        zip: this.cardInfo.billing_details.address.postal_code,
                        name: this.nickname
                    }
                };

                try {
                    const res = await this.$api.post(payments.saveCard(), payload);

                    if (res.status >= 200 && res.status < 300) {
                        this.$toasted.success('Saved new card');
                        this.$emit('saved');
                        this.handleClose();
                    } else if (res.status === 400) {
                        if (res.data) {
                            const message = Object.keys(res.data)
                                .map((key) => {
                                    return res.data[key];
                                })
                                .join(' + ');

                            this.$toasted.error(message);
                        } else {
                            this.$toasted.error(res.data.message || 'Failed to save card');
                        }
                    } else {
                        this.$toasted.error('Failed to save card');
                    }
                } catch (err) {
                    console.log(err);
                    this.$toasted.error('Failed to save card');
                } finally {
                    this.savingCard = false;
                }
            },
            handleClose() {
                this.$refs.cardForm.clear();
                this.nickname = '';
                this.$emit('close');
            }

        }
    };
</script>

<style scoped>
    button:disabled {
        color: #2e3343 !important;
        box-shadow: inset 0 0 0 1px rgba(112, 112, 112, 0.2) !important;
        background: rgba(112, 112, 112, 0.1);
    }

    button:disabled:hover {
        cursor: not-allowed;
        box-shadow: inset 0 0 0 1px rgba(112, 112, 112, 0.3) !important;
        background: rgba(112, 112, 112, 0.2) !important;
    }
</style>

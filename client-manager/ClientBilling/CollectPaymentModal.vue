<template>
    <Modal @close="handleClose">

        <div class="flex space-between">
            <h2 bottom>Add Credit</h2>
            <span class="cursor-pointer block align-right" @click="handleClose"><span class="material-icons-outlined">close</span></span>
        </div>
        <form class="add-funds-modal">

            <Dropdown
                :options="paymentTypes"
                name="Payment Type"
                id="paymentTypes"
                label="Payment Type"
                v-model="paymentType"
                disableEmpty
            />

            <div v-if="paymentType === 'check'">
                <Input
                    type="text"
                    name="checknum"
                    id="checknum"
                    placeholder="Check Number"
                    v-model="checkNumber"
                    label="Check Number"
                    v-if="paymentType === 'check'"
                />
            </div>

            <div v-if="paymentType === 'credit_debit'">
                <div class="flex center bottom-15">
<!-- <input type="radio" id="useSavedCardRadioTrue" v-model="useSavedCard" :value="true" />-->
<!-- <label class="left-5 bottom-0 inline-block" for="useSavedCardRadioTrue">Use Saved Card</label>-->
<!-- <input type="radio" id="useSavedCardRadioFalse" v-model="useSavedCard" :value="false" />-->
<!-- <label class="left-5 bottom-0 inline-block" for="useSavedCardRadioFalse">Use New Card</label>-->
                    <label v-for="(method, index) in cc_methods" :key="index" class="bottom-0 flex center right-30">
                        <input :id="method.value" v-model="cc_method" :value="method.value" type="radio"/>
                        <label :for="method.label" class="bottom-0 inline-block">{{ method.label }}</label>
                    </label>
                </div>

                <div v-if="cc_method === 'saved'">
                    <SavedCardsDropdown :clientId="clientId" @choseCard="handleCardChosen" ref="savedCardsDropdown" />
                </div>

                <div v-if="cc_method === 'manual'">
                    <NewCardForm v-model="cardInfo" ref="newCardForm" />
                </div>
            </div>

            <div>
                <span>Enter Amount</span>
                <CurrencyInput
                    style="width: 150px;"
                    id="amount-currency-input"
                    @currency="handleCurrencyChange"
                    ref="otherAmountInput"
                />
            </div>

            <div class="align-right bottom-0">
                <button class="secondary" @click="handleClose" type="button">Cancel</button>
                <button class="primary" @click="makePayment" type="button" :disabled="paymentInProgress">
                    <span v-if="!paymentInProgress">Submit</span>
                    <Loading
                        outerHeight="16px"
                        outerWidth="16px"
                        height="16px"
                        width="16px"
                        :color="'white transparent transparent transparent'"
                        :borderWidth="'3px'"
                        v-else
                    />
                </button>
            </div>
        </form>

        <PaymentSuccessModal :open="successModalOpen" :data="successModalData" @close="handleSuccessClose" />
    </Modal>
</template>

<script>
    import SavedCardsDropdown from '@/components/payments/SavedCardsDropdown';
    import NewCardForm from '@/components/stripe/NewCardForm';
    import Modal from '@/components/general/modals/Modal';
    import CurrencyInput from '@/components/general/inputs/CurrencyInput';
    import { payments } from '@/util/apiRequests';
    import PaymentSuccessModal from '@/components/client-manager/ClientBilling/PaymentSuccessModal';
    import Loading from '@/components/general/loading/loading';
    const api_root = 'settings/list/company';

    const initialData = {
        paymentType: '',
        paymentTypes: [],
        otherBalance: 0,
        checkNumber: '',
        cardInfo: null,
        selectedSavedCard: null,
        cc_methods: [
            {value: 'saved', label: 'Use Saved Card'},
            {value: 'manual', label: 'Use New Card'}],
        cc_method: 'saved',
        successModalOpen: false,
        successModalData: {},
        paymentInProgress: false
    };

    export default {
        name: 'CollectPaymentModal',
        components: { PaymentSuccessModal, Modal, CurrencyInput, SavedCardsDropdown, NewCardForm, Loading },
        props: {
            clientId: {
                type: [String, Number],
                required: true
            }
        },
        data() {
            return { ...initialData };
        },
        computed: {
            selectedBalance() {
                return typeof this.otherBalance === 'number'
                    ? this.otherBalance
                    : this.$getNumFromCurrency(this.otherBalance);
            }
        },
        methods: {
            handleClose() {
                this.clearModalForm();
                this.$emit('close');
            },
            handleCurrencyChange(newCurrencyTotal) {
                this.otherBalance = newCurrencyTotal;
            },
            async getPaymentTypes() {
                this.level_id = this.$store.state.user.company_id;
                let res = await this.$api.get(`/${api_root}/${this.level_id}/payment`);
                this.rows = await res.data
                let filteredPayments = res.data.filter(payment => payment.settings_id != 176 && payment.value == 1)
                let paymentObj = filteredPayments.map(payment => ({text : payment.label.toUpperCase(), value : payment.setting}))
                this.$set(this, "paymentTypes", paymentObj)
                this.$set(this, "paymentType", paymentObj[0].value)
            },
            async makePayment() {
                this.paymentInProgress = true;
                if (this.paymentTypes.length == 0) {
                    this.$toasted.error('No payment type(s) enabled');
                    this.paymentInProgress = false;
                    return;
                }if (!this.paymentType) {
                    this.$toasted.error('Must select payment type');
                    this.paymentInProgress = false;
                    return;
                }
                if (this.selectedBalance <= 0) {
                    this.$toasted.error('Payment amount must be greater than $0.00');
                    this.paymentInProgress = false;
                    return;
                }

                const paymentPayload = {
                    client_id: this.clientId,
                    payment_type: this.paymentType,
                    payment_amount: this.selectedBalance,
                    description: 'Payment collected from client'
                };

                switch (this.paymentType) {
                    case '':
                        this.$toasted.error('Please enter a payment type');
                        break;
                    case 'CASH':
                        break;
                    case 'CHECK':
                        if (!this.checkNumber) {
                            this.$toasted.error('Please enter a check number');
                            return;
                        }

                        paymentPayload.checknum = this.checkNumber;

                        break;
                    case 'credit_debit':
                        if (this.cc_method === 'saved') {
                            if (!this.selectedSavedCard) {
                                this.$toasted.error('Please select a card');
                                this.paymentInProgress = false;
                                return;
                            }

                            paymentPayload.saved_card_id = this.selectedSavedCard.stripe_pm_id;
                        } else if (this.cc_method === 'manual') {
                            if (this.cardInfo && this.cardInfo.card.save_card && !this.cardInfo.card.save_card_nickname) {
                                this.$toasted.error('Please give card a nickname');
                                this.paymentInProgress = false;
                                return;
                            }

                            const isValid = this.$refs.newCardForm.validate();

                            if (!isValid) {
                                this.$toasted.error('Invalid card');
                                this.paymentInProgress = false;
                                return;
                            }

                            paymentPayload.card_info = {
                                number: this.cardInfo.card.number,
                                exp_month: this.cardInfo.card.exp_month,
                                exp_year: this.cardInfo.card.exp_year,
                                cvc: this.cardInfo.card.cvc,
                                zip: this.cardInfo.billing_details.address.postal_code,
                                name: this.cardInfo.card.save_card ? this.cardInfo.card.save_card_nickname : undefined
                            };
                            paymentPayload.save_card = this.cardInfo.card.save_card;
                            paymentPayload.is_autopay = this.cardInfo.card.is_autopay;
                        }

                        break;
                }

                await this.sendPayment(paymentPayload);
                this.paymentInProgress = false;
            },
            async sendPayment(payload) {
                try {
                    const res = await this.$api.post(payments.makePayment(), payload);

                    if (res.status < 300) {
                        this.$toasted.success('Payment successful');
                        this.successModalData = res.data;
                        this.successModalOpen = true;
                    }
                } catch (err) {
                    console.log(err);
                    this.$toasted.error('Failed to make payment, please try again later');
                }
            },
            handleCardChosen(card) {
                this.selectedSavedCard = card;
            },
            clearModalForm() {
                this.data = { ...initialData };
                this.paymentType = 'CASH';
                this.$refs.otherAmountInput?.clear();
                this.$refs.savedCardsDropdown?.clear();
            },
            handleSuccessClose() {
                this.successModalOpen = false;
                this.$emit('paymentCollected');
                this.$emit('close');
                this.clearModalForm();
            }
        },
        async created() {
            await this.getPaymentTypes();
        },
        watch: {
            paymentType(val) {
                if (val !== 'CHECK') {
                    this.checkNumber = '';
                }
            }
        }
    };
</script>

<style scoped></style>

<template>
    <Modal :hasCloseButton="true" class="appt-modal" @close="$emit('close')">
        <form action="submit" class="">
            <h2>Collect Payment</h2>

            <div class="body-bg pad-20">
                <span class="dark-red inline-block font-16 right-30"><b>Owes: {{ $getCurrency(owes) }}</b></span>
                <span class="dark-green inline-block font-16"><b>Credit: {{ $getCurrency(credit) }}</b></span>
            </div>

            <div>
                <div class="bottom-15">
                    <label class="flex center font-14" for="full">
                        <input id="full" v-model="amt_model" :disabled="!canPayFull" class="" name="method" type="radio"
                               value="full">&nbsp; Pay Full Amount Due {{
                            $getCurrency(owes)
                        }}
                    </label>
                </div>
                <div class="flex center">
                    <label class="flex center font-14" for="partial">
                        <input id="partial" v-model="amt_model" class="" name="method" type="radio" value="partial">&nbsp; Pay
                        Other Amount
                    </label>
                    <CurrencyInput :disabled="can_edit_partial" :initial-value="other_amt" :max="other_amt_max.max"
                                   :maxMsg="other_amt_max.maxMsg" class="left-15" @currency="set_other_amt"/>
                </div>
            </div>

            <div class="left-30 bottom-20">
                <label for="method">
                    Payment Type
                    <Multiselect
                        :options="payment_options"
                        :value="payment_options_label"
                        label="label"
                        track-by="value"
                        @input="set_payment_type($event)"
                    />
                </label>
            </div>

            <!-- CHECK -->
            <div class="left-30 bottom-30">
                <div v-if="payment_type === 'check'">
                    <Input
                        v-if="payment_type === 'check'"
                        id="checknum"
                        v-model="check_number"
                        label="Enter Check Number"
                        name="checknum"
                        placeholder="Check Number"
                        type="text"
                    />
                </div>
            </div>

            <!-- CARD -->
            <div v-if="payment_type==='credit_debit'" class="left-30 bottom-30">
                <!-- radio buttons for method-->
                <div class="flex center bottom-15">
                    <label v-for="(method, index) in cc_methods" :key="index" class="flex center right-30 bottom-0">
                        <input :id="method.value" v-model="cc_method" :value="method.value" type="radio"/>
                        <label :for="method.label" class="left-5 bottom-0 inline-block">{{ method.label }}</label>
                    </label>
                </div>

                <SavedCardsDropdown v-if="cc_method === 'saved'" ref="savedCardsDropdown" :clientId="clientId"
                                    @choseCard="handleCardChosen"/>

                <div v-if="cc_method === 'manual'">
                    <NewCardForm ref="newCardForm" v-model="cc_new_card_info"/>
                </div>
            </div>
            <hr>
            <div class="pad-20">
                <div class="flex center left-30 bottom-30 space-between collect-payment-modal">
                    <div class="dark-text"><b>Total:</b></div>
                    <CurrencyInput :initial-value="total_model" class="left-15 flex-1 align-right currency-input"
                                   disabled/>
                </div>
                <div class="align-right">
                    <button :disabled="loading" class="secondary" @click="$emit('close')">Cancel</button>
                    <!--            submit button-->
                    <button :disabled="loading" class="primary" @click="handleSubmit">
                        <span v-if="!loading">Submit</span>
                        <Loading
                            v-else
                            :borderWidth="'3px'"
                            :color="'white transparent transparent transparent'"
                            height="16px"
                            outerHeight="16px"
                            outerWidth="16px"
                            width="16px"
                        />
                    </button>
                </div>
            </div>
        </form>
        <PaymentSuccessModal
            :open="payment_success_open"
            :paymentAmount="total_model"
            :data="payment_success_data"
            @close="handle_payment_success_close"
            />
    </Modal>
</template>

<script>
import Modal from '@/components/general/modals/Modal';
import CurrencyInput from "@/components/general/inputs/CurrencyInput";
import {getNumberFromCurrency} from "@/util/getCurrency";
import SavedCardsDropdown from "@/components/payments/SavedCardsDropdown";
import NewCardForm from "@/components/stripe/NewCardForm";
import {payments} from '@/util/apiRequests';
import Loading from '@/components/general/loading/loading';
import PaymentSuccessModal from "@/components/client-manager/ClientBilling/PaymentSuccessModal";
const api_root = 'settings/list/company';

export default {
    name: "NewCollectPaymentModal",
    components: {PaymentSuccessModal, SavedCardsDropdown, CurrencyInput, Modal, NewCardForm, Loading},
    data() {
        return {
            amt: 'full',
            other_amt: 0,
            payment_type: "",
            payment_options: [
                {label: "Account Credit", value: "credit"},
            ],
            check_number: "",
            cc_methods: [{value: "saved", label: "Saved"}, {
                value: "manual",
                label: "Manual"
            }],
            cc_method: "saved",
            cc_card: null,
            cc_new_card_info: null,
            loading: false,
            canPayFull: true,
            payment_success_open: false,
            payment_success_data: {},
            other_amt_max: {
                max: this.owes,
                maxMsg: "Amount must be less than or equal to the amount due."
            }
        }
    },
    props: {
        clientId: {
            type: [String, Number],
            required: true
        },

        owes: {
            type: Number,
            required: true
        },
        credit: {
            type: Number,
            required: true
        },
    },
    computed: {
        payment_options_label() {
            return this.payment_options.find(option => option.value === this.payment_type);
        },
        can_edit_partial() {
            return this.amt !== 'partial'
        },
        total_model() {
            if (this.amt === 'full') {
                return this.owes;
            } else {
                return this.other_amt
            }
        },
        amt_model: {
            get() {
                return this.amt
            },
            set(value) {
                if (this.payment_type === "credit") {
                    this.$set(this, 'other_amt', Math.min(this.credit, this.owes))
                    if (this.owes > this.credit){
                        this.$set(this, 'other_amt', this.credit)
                        this.other_amt_max = {
                            max: this.credit,
                            maxMsg: "You do not have sufficient credit to pay more."
                        }
                    } else {
                        this.other_amt_max = {
                            max: this.owes,
                            maxMsg: "Amount must be less than or equal to the amount due."
                        }
                    }
                } else {
                    this.other_amt_max = {
                        max: this.owes,
                        maxMsg: "Amount must be less than or equal to the amount due."
                    }
                }

                this.amt = value
            }
        },

    },
    methods: {
        async getPaymentTypes() {
            this.level_id = this.$store.state.user.company_id;
            let res = await this.$api.get(`/${api_root}/${this.level_id}/payment`);
            this.rows = await res.data
            let filteredPayments = res.data.filter(payment => payment.settings_id != 176 && payment.value == 1)
            let paymentObj = filteredPayments.map(payment => ({label : payment.label, value : payment.setting}))
            paymentObj.forEach(payment => this.payment_options.unshift(payment))
        },
        set_payment_type(type) {
            if (!type) return

            this.payment_type = type.value;

            if (type.value === 'credit' && this.credit < this.owes) {
                this.amt = 'partial';
                this.other_amt = this.credit;
                this.other_amt_max = {
                    max: this.credit,
                    maxMsg: "You do not have sufficient credit to pay more."
                }
                // this.$toasted.error("Client does not have sufficient account credit to pay the selected amount")
                this.canPayFull = false;
            } else {
                this.canPayFull = true;
                this.other_amt_max = {
                    max: this.owes,
                    maxMsg: "Amount must be less than or equal to the amount due."
                }
            }
        },
        set_other_amt(val) {
            this.$set(this, 'other_amt', getNumberFromCurrency(val))
        },
        handleCardChosen(card) {
            this.$set(this, 'cc_card', card);
        },
        handle_payment_success_close() {
            this.payment_success_open = false;
            this.$emit('close');
        },
        async handleSubmit(e) {
            e.preventDefault()

            this.$set(this, 'loading', true);

            const body = {
                amount: this.amt === 'full' ? this.owes : this.other_amt,
                paymentType: this.payment_type.toUpperCase(),
                paymentDescription: "Pay multiple invoices",
                clientId: this.clientId,
            }
            if (!this.payment_type) {
                this.$toasted.error("You must select a payment type");
                this.$set(this, 'loading', false);
                return
            }
            if (this.payment_type === 'credit_debit') {
                switch (this.cc_method) {
                    case 'saved':
                        if (!this.cc_card) {
                            this.$toasted.error("You must select a card");
                            this.$set(this, 'loading', false);
                            return
                        }

                        body.savedCardId = this.cc_card.stripe_pm_id;
                        break;
                    case 'manual':

                        const isValid = this.$refs.newCardForm.validate();

                        if (!isValid || !this.cc_new_card_info) {
                            this.$toasted.error("Not valid CC information")
                            this.$set(this, 'loading', false);
                            return;
                        }

                        const {cvc, exp_month, exp_year, number, is_autopay, save_card, save_card_nickname} = this.cc_new_card_info.card;
                        const zip = this.cc_new_card_info?.billing_details?.address?.postal_code ?? null

                        if (!cvc || !exp_month || !exp_year || !number || !zip || (save_card && !save_card_nickname)) {
                            this.$toasted.error("Please fill out all fields");
                            this.$set(this, 'loading', false);
                            return;
                        }

                        body.cardMetadata = {
                            cvc,
                            exp_month,
                            exp_year,
                            number,
                            zip
                        };
                        body.shouldSaveCard = save_card;
                        if (save_card) {
                            body.isNewCardAutopay = !!is_autopay
                            body.newCardNickname = save_card_nickname;
                        }
                        break;
                    default:
                        break;
                }
            } else if (this.payment_type === 'check') {
                body.checkNumber = this.check_number;
            } else if (this.payment_type === 'credit') {
                if (this.credit < body.amount || this.credit <= 0) {
                    this.$toasted.error("Exceeds credits available")
                }
            }

            const res = await this.$api.post(payments.batchInvoice(), body)

            if (res.status >= 200 && res.status < 300) {
                this.$emit('paymentCollected')
                this.payment_success_open = true;

                const {amount, receiptFileId} = res.data;

                this.payment_success_data = {amount, receiptId: receiptFileId};

            } else {
                this.$toasted.error("Error posting payment")
            }

            this.$set(this, 'loading', false);

        }
    },
    async created() {
        await this.getPaymentTypes()
    }
}
</script>
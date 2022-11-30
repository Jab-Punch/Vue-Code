<template>
    <div>
        <div class="card-block">
            <h3>Insurance Contact Information</h3>
            <ValidationObserver ref="insurance_contact_information">
                <form @submit.prevent="submit" class="">
                    <div class="flex colx2">
                        <Input
                            type="text"
                            class="right-15"
                            :name="'phone' + index"
                            label="Insurance Phone Number"
                            title="insurnace phone number"
                            v-model="insuranceContactInfo.phone"
                            required
                            :disabled="!isEditMode"
                        />
                        <Input
                            type="text"
                            class=""
                            :name="'fax' + index"
                            label="Insurance Fax Number"
                            title="insurnace fax number"
                            v-model="insuranceContactInfo.fax"
                            required
                            :disabled="!isEditMode"
                        />
                    </div>
                    <Input
                        type="text"
                        class="fullwidth"
                        :name="'email' + index"
                        label="Insurance Email"
                        title="insurance email"
                        v-model="insuranceContactInfo.email"
                        required
                        :disabled="!isEditMode"
                    />
                    <Input
                        type="text"
                        class="fullwidth"
                        :name="'payer_id' + index"
                        label="Payer ID for Electronic Claims"
                        title="insurance payer id for electronic claims"
                        v-model="insurancePayerId"
                        :disabled="true"
                    />
                    <label for="Mailing Address">Mailing Address for Paper Claims</label>
                    <textarea
                        class="bottom-20"
                        :name="'Mailing Address' + index"
                        label="Mailing Address for Paper Claims"
                        title="mailing address for paper claims"
                        v-model="insuranceContactInfo.mailingAddress"
                        required
                        :disabled="!isEditMode"
                    />
                    <div class="align-right fullwidth top-20">
                        <button type="button" @click="resetFields" class="secondary">Cancel</button>
                        <button type="submit" class="primary">Save</button>
                    </div>
                </form>
            </ValidationObserver>
        </div>
    </div>
</template>

<script>
    import Input from '@/components/general/validatedInputs/Input.vue';
    import { ValidationObserver } from 'vee-validate';
    import { insurance } from '@/util/apiRequests';

    export default {
        name: 'InsuranceContactInformation',
        components: { Input, ValidationObserver },
        props: {
            insurance: {
                type: Object
            },
            index: {}
        },
        data() {
            return {
                tempInsuranceContactInfo: {},
                insuranceContactInfo: {
                    phone: '',
                    fax: '',
                    email: '',
                    insurancePayersId: '',
                    mailingAddress: ''
                },
                isEditMode: true
            };
        },
        methods: {
            async submit() {
                try {
                    let temp = this.insuranceContactInfo;
                    temp.cardId = this.insurance.cardId;
                    temp.veriId = this.insurance.veriId;
                    temp.client_id = this.$store.state.clientOverview.clientData.id;
                    const response = await this.$api.put(insurance.saveInsuranceContactInformation(), {
                        insurance: temp
                    });
                    if (response.data.cardId && response.data.veriId) {
                        this.$toasted.success('Successfully saved insurance contact information.');
                        this.tempInsuranceContactInfo = JSON.parse(JSON.stringify(this.insuranceContactInfo));
                        this.$emit('assignId', this.insurance, response.data.cardId, response.data.veriId);
                    }
                } catch (err) {
                    // TODO: add snackbar to display other errors to user
                    console.error(err);
                }
            },
            cancelButtonClick() {
                this.resetFields();
                this.isEditMode = false;
            },
            tempSaveFields() {
                this.tempInsuranceContactInfo = JSON.parse(JSON.stringify(this.insuranceContactInfo));
            },
            resetFields() {
                this.insuranceContactInfo = JSON.parse(JSON.stringify(this.tempInsuranceContactInfo));
            }
        },
        created() {
            this.insuranceContactInfo = {
                phone: this.insurance.phone ?? '',
                fax: this.insurance.fax ?? '',
                email: this.insurance.email ?? '',
                insurancePayersId: this.insurance.insurance_payers_id ?? '',
                mailingAddress: this.insurance.mailing_address ?? ''
            };
            this.tempSaveFields();
        },
        computed: {
            insurancePayerId() {
                return this.insurance?.insurance_payer_id;
            }
        }
    };
</script>

<template>
    <NoButtonModal :open="open" @close.stop="onModalClose" class="create-invoice">
        <h1>Create Invoice</h1>

        <div
            class="invoice-row flex bottom top-20 bottom-20"
            v-for="(item, idx) in pickedServiceItems"
            :key="getItemKey(item, idx)"
        >
            <Input
                class="right-10"
                type="date"
                :name="`date_${getItemKey(item, idx)}`"
                :id="`date_${getItemKey(item, idx)}`"
                label="Date"
                v-model="pickedServiceItems[idx].date"
            />
            <div class="right-10 fullwidth">
                <label :for="`services-dropdown-${getItemKey(item, idx)}`">Services</label>
                <Multiselect
                    class="block"
                    :id="`services-dropdown-${getItemKey(item, idx)}`"
                    :options="availableServices"
                    group-values="codes"
                    group-label="codeType"
                    placeholder="Type to search"
                    track-by="id"
                    label="abbrev"
                    :value="pickedServiceItems[idx]"
                    @input="handleSelection($event, idx)"
                />
            </div>
            <CurrencyInput
                class="block right-10"
                disabled
                label="Service Fee"
                :initialValue="pickedServiceItems[idx].cost"
                v-model="pickedServiceItems[idx].cost"
            />
            <CurrencyInput
                class="block right-10"
                label="Client Responsibility"
                :initialValue="pickedServiceItems[idx].cost"
                @currency="handleCurrencyChange($event, idx)"
            />
            <div class="margin-0">
                <button class="margin-0" type="button" @click="removeService(idx)">
                    <span class="material-icons-outlined delete dark-text">delete_outline</span>
                </button>
            </div>

            <!-- <div class="flex center">
                <div class="flex-1">
                    <div>
                        <label :for="`services-dropdown-${getItemKey(item, idx)}`">Services</label>
                        <Multiselect
                            class="block bottom-15"
                            :id="`services-dropdown-${getItemKey(item, idx)}`"
                            :options="availableServices"
                            group-values="codes"
                            group-label="codeType"
                            placeholder="Type to search"
                            track-by="id"
                            label="abbrev"
                            :value="pickedServiceItems[idx]"
                            @input="handleSelection($event, idx)"
                        />
                    </div>
                    <div class="flex service-fees">
                        <CurrencyInput
                            class="block bottom-15 right-15 flex-1"
                            disabled
                            label="Service Fee"
                            :initialValue="pickedServiceItems[idx].cost"
                            v-model="pickedServiceItems[idx].cost"
                        />
                        <CurrencyInput
                            class="block bottom-15 flex-1"
                            label="Client Responsibility"
                            :initialValue="pickedServiceItems[idx].cost"
                            @currency="handleCurrencyChange($event, idx)"
                        />
                    </div>
                </div>
                <button type="button" @click="removeService(idx)">
                    <span class="material-icons-outlined delete dark-text">delete_outline</span>
                </button>
            </div> -->
        </div>

        <div>
            <button class="no-bg margin-0 text-button" @click="addService">
                <span class="material-icons purple">add_box</span> Add Service
            </button>
        </div>

        <div class="align-right pad-10">
            <button class="secondary bottom-0" type="button" @click="onModalClose">Cancel</button>
            <button class="primary bottom-0" type="button" :disabled="submitDisabled" @click="createInvoice">
                Create
            </button>
        </div>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    import CurrencyInput from '@/components/general/inputs/CurrencyInput';
    import { invoices, serviceCodes } from '@/util/apiRequests';
    import dayjs from '@/util/dayjs';

    export default {
        name: 'GenerateInvoiceModal',
        components: { CurrencyInput, NoButtonModal },
        props: {
            clientId: {
                type: [Number, String],
                required: true
            },
            open: {
                type: Boolean,
                required: true
            },
            financialClass: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                pickedServiceItems: [],
                availableServices: []
            };
        },
        computed: {
            submitDisabled() {
                return this.pickedServiceItems.filter((item) => item.id !== null).length === 0;
            }
        },
        methods: {
            async getAvailableCodes() {
                const res = await this.$api.get(
                    serviceCodes.getAllCodes(true, 'client', this.clientId, this.financialClass)
                );

                if (res.status < 300 && Array.isArray(res.data)) {
                    this.availableServices = res.data.map((group) => {
                        let codeType = group.codeType.split('');
                        codeType[0] = codeType[0].toUpperCase();
                        codeType = codeType.join('');
                        codeType += 's';

                        return {
                            codes: group.codes.map((code) => ({
                                ...code,
                                abbrev: `${code.service_code} - ${code.abbrev}`,
                                id: code.service_code_id
                            })),
                            codeType
                        };
                    });
                } else {
                    this.$toasted.error('Failed to get available invocable codes. Please try again later.');
                    this.onModalClose();
                }
            },
            async createInvoice() {
                const services = this.pickedServiceItems.filter((item) => item.id !== null);
                const res = await this.$api.post(invoices.createManualInvoice(), {
                    clientId: this.clientId,
                    services
                });

                if (res.status < 300) {
                    this.$toasted.success('Created new invoice');
                    this.onModalClose();
                } else {
                    this.$toasted.error('Failed to create invoice. Please try again later.');
                }
            },
            onModalClose() {
                this.pickedServiceItems = [];
                this.availableServices = [];
                this.$emit('close');
            },
            addService() {
                this.pickedServiceItems.push({
                    id: null,
                    date: dayjs().format('YYYY-MM-DD'),
                    cost: 0,
                    clientResponsibility: 0,
                    abbrev: null,
                    serviceCode: null
                });
            },
            getItemKey(item, idx) {
                return item?.description || idx;
            },
            handleSelection(serviceCode, idx) {
                const serviceItem = this.pickedServiceItems[idx];
                serviceItem.id = serviceCode.id;
                serviceItem.cost = serviceCode.cost;
                serviceItem.clientResponsibility = serviceCode.cost;
                serviceItem.abbrev = serviceCode.abbrev;
                serviceItem.serviceCode = serviceCode.service_code;
                this.$set(this.pickedServiceItems, idx, serviceItem);
            },
            handleCurrencyChange(amount, idx) {
                const serviceItem = this.pickedServiceItems[idx];
                serviceItem.clientResponsibility = this.$getNumFromCurrency(amount);
                this.$set(this.pickedServiceItems, idx, serviceItem);
            },
            removeService(idx) {
                this.pickedServiceItems = this.pickedServiceItems.filter((_, i) => i !== idx);
            }
        },
        watch: {
            open(isOpenNew) {
                if (isOpenNew && this.availableServices.length === 0) {
                    this.getAvailableCodes();
                }
            }
        }
    };
</script>

<style scoped>
    select {
        height: 40px;
        padding: 0 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: none;
    }
</style>

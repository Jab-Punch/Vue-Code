<template>
    <div>
        <!-- <h3>Client Service Fees</h3> -->
        <h3 class="margin-0">Procedure Codes (CPT)</h3>
        <p class="margin-0 bottom-20">Select service codes and customize fees assigned to client</p>
        <div class="company-service-fees">
            <div
                v-for="(service_fee, key) in service_fees"
                :key="service_fee.data_id"
                class="single-service flex bottom"
            >
                <Multiselect
                    v-model="service_fee.selected"
                    :options="options"
                    :key="'select_' + service_fee.data_id"
                    track-by="service_code_id"
                    :custom-label="serviceCodeDesc"
                    @input="
                        () => {
                            $forceUpdate();
                        }
                    "
                    @select="(e) => calibrateMenu(e, service_fee.selected)"
                    :disabled="service_fee.disabled"
                    class="multiselect"
                >
                </Multiselect>
                <div class="fee">
                    <div class="flex flex-1 space-between">
                        <label for="">Enter Fee</label>
                        <ejs-tooltip
                            class="tooltipcontainer"
                            v-if="Object.keys(service_fee.selected).length > 0"
                            :content="`Company Fee: ${companyCost(service_fee.selected)}`"
                            target="#target"
                            cssClass="customtooltip"
                            position="BottomLeft"
                        >
                            <div class="info-icon" id="target">
                                <span class="material-icons-outlined purple">info</span>
                            </div>
                        </ejs-tooltip>
                    </div>
                    <CurrencyInput
                        @currency="(e) => debounceHandleCurrencyChange(e, service_fee)"
                        :id="'input_' + service_fee.data_id"
                        :name="'input_' + service_fee.data_id"
                        :key="'input_' + service_fee.data_id"
                        :initialValue="service_fee.cost"
                    />
                </div>
                <div class="delete-icon">
                    <span class="material-icons-outlined" @click="removeCpt(key)">delete</span>
                </div>
            </div>
        </div>
        <button @click="addCpt()" class="text-button no-bg weight-600">
            <span class="material-icons purple">add_box</span> Add additional CPT code
        </button>
    </div>
</template>

<script>
    /**
     * We want the option to be disabled from being selected if it's already selected,
     *
     */
    const api_root = 'service_fees';
    import CurrencyInput from '@/components/general/inputs/CurrencyInput';
    import { generateId } from '@/util/genericUtilityFunctions';
    import { TooltipPlugin } from '@syncfusion/ej2-vue-popups';
    import Vue from 'vue';
    import { debounce } from 'lodash';

    Vue.use(TooltipPlugin);

    // import { serviceCodes } from '@/util/apiRequests';

    export default {
        components: { CurrencyInput },
        name: 'ClientServiceFees',
        props: {
            client_id: {}
        },
        data() {
            return {
                loading: 1,
                rows: [],
                level_id: 0,
                level: 'client',
                options: [],
                service_fees: [],
                justModified: null,
                originalOptions: [],
                companyId: null
                // cssClassTooltip: 'customtooltip'
            };
        },
        methods: {
            async init() {
                this.level_id = this.client_id;
                // this.companyId = this.$store.state.user.company_id;
                const res = await this.$api.get(`/${api_root}/list/client/${this.level_id}`);
                await this.getServiceCodeFeeOptions();

                this.service_fees = res.data
                    .filter(
                        (fee) => fee.level === 'client' && fee.level_id == this.client_id && fee.code_type == 'service'
                    )
                    .map((element) => {
                        element.selected = {
                            service_code: element.service_code,
                            long_descrip: element.long_descrip,
                            service_code_id: element.service_code_id
                        };
                        element.disabled = true;
                        return element;
                    });

                this.options = this.options.filter((element) => {
                    if (this.service_fees.some((fee) => element.service_code_id == fee.selected?.service_code_id)) {
                        return false;
                    }
                    return true;
                });
                this.loading = 0;
            },
            async validate() {
                return 1;
            },
            addCpt() {
                //This is necessary due to the CurrencyInput being a bit glitchy for correctly binding.
                this.service_fees.push({ data_id: generateId(), generated: true, selected: {}, cost: 0 });
            },
            serviceCodeDesc({ service_code, long_descrip }) {
                if (service_code && long_descrip) {
                    return `${service_code} ${long_descrip}`;
                }
                return 'Select an option';
            },
            handleCurrencyChange(newCurrencyTotal, item) {
                // console.log(item);
                // this.$set(item, 'cost', newCurrencyTotal);
                this.$set(item, 'cost', this.$getNumFromCurrency(newCurrencyTotal));

                this.update_setting(item);
            },
            debounceHandleCurrencyChange: debounce(function(newCurrencyTotal, item) {
                this.handleCurrencyChange(newCurrencyTotal, item);
            }, 400),
            async removeCpt(index) {
                let copy = this.service_fees[index];
                if (this.service_fees[index].generated == true) {
                    this.service_fees.splice(index, 1);
                    this.calibrateMenu(null, copy.selected);
                } else {
                    //Api Delete
                    try {
                        //Refer to update_setting comment on why we use id_after_generated_is_false
                        await this.$api.delete(
                            `/${api_root}/${
                                this.service_fees[index].id_after_generated_is_false
                                    ? this.service_fees[index].id_after_generated_is_false
                                    : this.service_fees[index].data_id
                            }`
                        );
                        this.service_fees.splice(index, 1);
                        this.calibrateMenu(null, copy.selected);
                    } catch (error) {
                        this.$toasted.error('Failed to delete Record. Please try again later.');
                    }
                }
            },
            async getServiceCodeFeeOptions() {
                let companyId = this.$store.state.user.company_id;
                let result = await this.$api.get(`/${api_root}/list/company/${companyId}`);
                this.options = result.data.filter((fee) => fee.level === 'company' && fee.code_type == 'service');

                this.originalOptions = this.options;
            },
            async update_setting(item) {
                //console.log(item);
                try {
                    if (Object.keys(item.selected).length <= 0) {
                        return;
                    }
                    //new
                    if (item.generated == true) {
                        let result = await this.$api.post(
                            `/${api_root}/${this.level}/${this.level_id}/${item.selected.service_code_id}`,
                            {
                                item: {
                                    cost: item.cost,
                                    financial_class: 'self_pay',
                                    insurance_payer_id: 0,
                                    expected_reimbursement: 0
                                }
                            }
                        );
                        this.$toasted.success('Record successfully created');

                        this.$set(item, 'generated', false);
                        //Apparently you can't do the below code commented out, because it will mess with the CurrencyInput by preventing a user from typing.
                        // this.$set(item, 'data_id',  result.data.recId[0]);
                        this.$set(item, 'id_after_generated_is_false', result.data.recId[0]);
                        this.calibrateMenu(item, null);
                        this.$set(item, 'disabled', true);
                    }

                    //update
                    else {
                        await this.$api.put(
                            `/${api_root}/${
                                item.id_after_generated_is_false ? item.id_after_generated_is_false : item.data_id
                            }`,
                            {
                                item: {
                                    cost: item.cost,
                                    financial_class: 'self_pay',
                                    insurance_payer_id: 0,
                                    expected_reimbursement: 0,
                                    service_code_id: item.service_code_id
                                }
                                // val: item.cost
                                // val: this.$getNumFromCurrency(item.cost)
                            }
                        );

                        this.$toasted.success('Successfully updated Record.');
                    }
                } catch (err) {
                    this.$toasted.error('Failed to update Record. Please try again later.');
                }
            },
            //This function removes options from being selected.
            async calibrateMenu(newVal, oldVal) {
                if (oldVal !== null && oldVal) {
                    //add option back into menu
                    if (this.options.some((option) => option.service_code_id == oldVal.service_code_id) == false) {
                        this.options.push(oldVal);
                    }
                }
                //remove the new option
                this.options = this.options.filter((option) => {
                    if (option?.service_code_id == newVal?.service_code_id) {
                        return false;
                    }
                    return true;
                });
            },
            companyCost(service_fee) {
                let service = this.originalOptions.find((o) => o.service_code_id == service_fee.service_code_id);
                return this.$getCurrency(service?.cost);
            }
        },

        async created() {
            await this.init();
        }
    };
</script>
<style>
    /*
    Left here as refernce for Nate to play around with and style
    */

    /* .customtooltip.e-tooltip-wrap .e-tip-content {
        line-height: 20px;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip.e-tip-bottom {
        height: 12px;
        left: 50%;
        top: 100%;
        width: 24px;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip.e-tip-top {
        height: 12px;
        left: 50%;
        top: -9px;
        width: 24px;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip.e-tip-left {
        height: 24px;
        left: -9px;
        top: 48%;
        width: 12px;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip.e-tip-right {
        height: 24px;
        left: 100%;
        top: 50%;
        width: 12px;
    }
    
    .customtooltip.e-tooltip-wrap {
        border-radius: 4px;
        opacity: 1;
    }
    
    .customtooltip.e-tooltip-wrap.e-popup {
        background-color: #fff;
        border: 2px solid #000;
    } */

    .customtooltip.e-tooltip-wrap .e-tip-content {
        /* color: #000; */
        font-size: 14px;
        text-align: center;
    }

    /* .customtooltip.e-tooltip-wrap .e-arrow-tip-outer.e-tip-bottom {
        border-left: 12px solid transparent;
        border-right: 14px solid transparent;
        border-top: 12px solid #000;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip-outer.e-tip-top {
        border-bottom: 12px solid #000;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip-outer.e-tip-left {
        border-bottom: 12px solid transparent;
        border-right: 12px solid #000;
        border-top: 12px solid transparent;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip-outer.e-tip-right {
        border-bottom: 12px solid transparent;
        border-left: 12px solid #000;
        border-top: 12px solid transparent;
    }
    
    .customtooltip.e-tooltip-wrap .e-arrow-tip-inner.e-tip-bottom {
        color: #fff;
        font-size: 25.9px;
    } */
</style>

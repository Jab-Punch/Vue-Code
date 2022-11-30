<template>
    <div>
        <RunVerificationModal :open="showVerificationModal" @close="closeVerificationModal" />
        <ValidationObserver ref="insurance_details_and_verification">
            <form @submit.prevent="submit">
                <div title="Insurance Details" class="">
                    <h3>Insurance Details</h3>
                    <!-- TODO convert dropdown to use dynamic options -->
                    <div class="flex space-between wrap">
                        <div class="flex-2 right-15">
<!--                            <label>Insurance Payer</label>-->
<!--                            <Multiselect-->
<!--                                v-model="insuranceDetailsAndVerifi.insurance_payer"-->
<!--                                :options="insurance_payers_list"-->
<!--                                @select="emitCurrentlySelectedPayer"-->
<!--                                track-by="id"-->
<!--                                :options-limit="1000"-->
<!--                                label="payer_label"-->
<!--                            />-->
                            <label>Insurance Payer</label>
                            <Multiselect
                                v-model="insuranceDetailsAndVerifi.insurance_payer"
                                :options="insurance_payers_list"
                                @select="emitCurrentlySelectedPayer"
                                track-by="id"
                                :options-limit="1000"
                                label="payer_label"
                            >
                                <template slot='singleLabel' slot-scope="{ option }">
                                    <span>{{ option.payer_label }}</span>
                                    <span class='material-icons blue pad-l-10' v-if='Boolean(option.checked)'>check_circle</span>
                                </template>
                                <template slot="option" slot-scope="option">
                                    <span class=''>{{ option.option.payer_label }}</span>
                                    <span class='material-icons blue pad-l-10' v-if='option.option.checked'>check_circle</span>
                                </template>
                            </Multiselect>
                        </div>
                        <DropDown
                            class="flex-1"
                            label="Insurance Type"
                            :options="planTypeOptions"
                            name="insurance_type"
                            :id="'insuranceTypeId' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.insurance_type"
                        />
                    </div>
                    <div class="flex space-between wrap">
                        <div class="flex-2 right-15">
                            <label>Eligibility Insurance Payer VOB</label>
                            <Multiselect
                                v-model="insuranceDetailsAndVerifi.insurance_vob"
                                :options="insurance_payers_vob_list"
                                @select="emitCurrentlySelectedPayerVob"
                                track-by="id"
                                :options-limit="1000"
                                label="payer_label"
                            />
                        </div>

                        <DropDown
                            class="flex-1"
                            label="Plan Type"
                            :options="insuranceTypeOptions"
                            name="plan_type"
                            :id="'planTypeId' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.plan_type"
                        />
                    </div>
                    <div class="flex bottom-15">
                        <div class="flex flex-2 right-15">
                            <Input
                                class="flex-1 right-15"
                                type="text"
                                label="Membership ID"
                                name="member_id"
                                :id="'memberId' + index"
                                :disabled="!isEditMode"
                                v-model="insuranceDetailsAndVerifi.member_id"
                            />
                            <Input
                                class="flex-1"
                                type="text"
                                label="Group ID"
                                name="insurance_group_id"
                                :id="'insuranceGroupId' + index"
                                :disabled="!isEditMode"
                                v-model="insuranceDetailsAndVerifi.group_id"
                            />
                        </div>
                        <Input
                            class="flex-1"
                            label="Date of Birth of Insured"
                            type="date"
                            name="dob_person"
                            :id="'dobPersonId' + index"
                            v-model="insuranceDetailsAndVerifi.dob_insured"
                        />
                    </div>
                    <div class="flex space-between wrap">
                        <Input
                            class="flex-2 right-15"
                            type="text"
                            label="Name of Insured Person"
                            name="name_insured_person"
                            :id="'nameInsuredPersonId' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.name_insured"
                        />

                        <!-- TODO convert dropdown to use dynamic options -->
                        <DropDown
                            class="flex-1"
                            label="Relationship to Insured"
                            :options="relationToInsuredOptions"
                            name="relation_to_person"
                            :id="'relationToPersonId' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.relationship"
                        />
                    </div>
                    <div class="align-right">
                        <button class='secondary' type="button" @click='removeCard(index)' v-if="index > 0 && !insurance.veriId">
                            <span class='material-icons'>delete_outline</span>
                        </button>
                        <!--                        Add Back in later -->
                        <!--                        <button type="button" id="insurance-details-cancel" @click="cancelDetail()">Cancel</button>-->
                        <button type="submit" id="insurance-details-button">Save</button>
                    </div>
                </div>

                <div title="Cost and Coverage Details" class="">
                    <h3>Cost and Coverage Details</h3>
                    <div class="flex colx3 wrap space-between">
                        <CurrencyInput
                            :initial-value="parseInt(insuranceDetailsAndVerifi.co_pay)"
                            :disabled="!isEditMode"
                            :id="'coPay' + index"
                            name="co_pay"
                            label="Copay"
                            @currency="handleCurrencyChange($event, 'co_pay')"
                        />
                        <div>
                            <label :for="'coInsurance' + index">CoInsurance</label>
                            <input
                                type="number"
                                name="co_insurance"
                                :id="'coInsurance' + index"
                                :disabled="!isEditMode"
                                v-model="insuranceDetailsAndVerifi.co_insurance"
                                placeholder='0.000'
                                min="0"
                                max="100"
                                step="0.001"
                            />
                        </div>
                        <div></div>
                        <DropDown
                            :options="isProvideInNetworkOptions"
                            name="is_provider_in_network"
                            label="Is Provider In Network?"
                            :disabled="!isEditMode"
                            :id="'isProvideInNetwork' + index"
                            v-model="insuranceDetailsAndVerifi.is_provide_in_network"
                        />
                        <DropDown
                            :options="outOfNetworkBenefitsOptions"
                            name="out_of_network_benefits"
                            label="Out of Network Benefits?"
                            :disabled="!isEditMode"
                            :id="'outOfNetworkBenefits' + index"
                            v-model="insuranceDetailsAndVerifi.out_of_network_benefits"
                        />
                        <DropDown
                            :options="outOfNetworkBenefitsOptions"
                            name="preauth_require"
                            label="Preauthorization Required"
                            :disabled="!isEditMode"
                            :id="'preauthRequired' + index"
                            v-model="insuranceDetailsAndVerifi.preauth_require"
                        />
                    </div>
                    <div class="align-right" v-if='insurance.cardId'>
                        <button class='secondary' type='button' @click='removeCard(index)' v-if="index > 0">
                            <span class='material-icons'>delete_outline</span>
                        </button>
                        <button type="submit" v-if="showVerificationFields" id="insurance-coverage-button">Save</button>
                    </div>
                </div>

                <div title="Cost and Coverage Details" class="">
                    <h3>Preauthorization Details (if applicable)</h3>
                    <div class="flex colx3 wrap space-between">
                        <Input
                            type="text"
                            name="authorization_num"
                            label="Authorization Number"
                            :disabled="!isEditMode"
                            :id="'authorizationNum' + index"
                            v-model="insuranceDetailsAndVerifi.auth_num"
                        />
                        <span>
                            <label :for="'startDateAuthId' + index">Start Date of Authorization</label>
                            <input
                                label="Start Date of Authorization"
                                type="date"
                                name="start_date_auth"
                                :disabled="!isEditMode"
                                :id="'startDateAuthId' + index"
                                v-model="insuranceDetailsAndVerifi.start_date_auth"
                            />
                        </span>
                        <span>
                            <label :for="'endDateAuthId' + index">End Date of Authorization</label>
                            <input
                                label="End Date of Authorization"
                                type="date"
                                name="end_date_auth"
                                :disabled="!isEditMode"
                                :id="'endDateAuthId' + index"
                                v-model="insuranceDetailsAndVerifi.end_date_auth"
                            />
                        </span>
                        <span>
                            <label :for="'dateVerificationCallCompleted' + index">Date Verification Call Completed</label>
                            <input
                                label="Date Verification Call Completed"
                                type="date"
                                name="date_verification_call"
                                :disabled="!isEditMode"
                                :id="'dateVerificationCallCompleted' + index"
                                v-model="insuranceDetailsAndVerifi.date_verification_call"
                            />
                        </span>
                        <Input
                            type="text"
                            label="Name of Representative"
                            name="name_of_rep"
                            :id="'nameOfRep' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.name_of_rep"
                        />
                        <Input
                            type="text"
                            label="Reference Number for Call"
                            name="ref_num_for_call"
                            :id="'refNumForCall' + index"
                            :disabled="!isEditMode"
                            v-model="insuranceDetailsAndVerifi.ref_num_for_call"
                        />
                    </div>
                    <div class="align-right" v-if='insurance.cardId'>
                        <button class='secondary' type='button' @click='removeCard(index)' v-if="index > 0">
                            <span class='material-icons'>delete_outline</span>
                        </button>
                        <button type="submit" v-if="showVerificationFields" id="insurance-verification-button">Save</button>
                    </div>
                </div>

                <div title="Verification of Eligibility and Benefits" class="verification-benefits" v-if='this.insurance.cardId'>
                    <h3 class="margin-0">Verification of Eligibility and Benefits</h3>
                    <div class="bottom-20 fullwidth">
                        Select ‘Run Verification’ to automatically check benefits through the clearinghouse.
                    </div>
                    <div class="flex bottom-20 fullwidth">
                        <div>
                            <button class="purple-bg" type="button" @click="showVerificationModal = true">
                                Run Verification
                            </button>
                        </div>
<!--                        <div class="flex right-20" v-if="date_veri_completed">-->
<!--                            Last Verified: {{ date_veri_completed }}-->
<!--                        </div>-->
                        <!--                        <button-->
                        <!--                            class="purple-bg"-->
                        <!--                            type="button"-->
                        <!--                            @click="showVerificationFields = !showVerificationFields"-->
                        <!--                        >-->
                        <!--                            Manual Verification-->
                        <!--                        </button>-->
                    </div>
                    <h3 class="margin-0">Eligibility Check Via Clearinghouse</h3>
                    <br/>
                    <div class="flex colx2 space-between wrap">
                        <span>
                            <label :for="'dateVeriCompleted' + index">Date of Verification</label>
                            <input
                                label="Date Verification Completed"
                                type="date"
                                name="date_veri_complete"
                                :id="'dateVeriCompleted' + index"
                                v-model="date_veri_completed"
                                :disabled="true"
                            />
                        </span>
                        <DropDown
                            :options="isPolicyCurrentlyActiveOptions"
                            name="is_pol_active"
                            label="Is Policy Currently Active"
                            :disabled="true"
                            v-if="showVerificationFields"
                            v-model="insuranceDetailsAndVerifi.policy_active"
                        />
                        <span v-if="showVerificationFields">
                            <label :for="'policyStartDate' + index">Policy Start Date</label>
                            <input
                                type="date"
                                name="policy_start_date"
                                label="Policy Start Date"
                                :disabled="true"
                                :id="'policyStartDate' + index"
                                v-model="insuranceDetailsAndVerifi.start_date_policy"
                            />
                        </span>
                        <span v-if="showVerificationFields">
                            <label :for="'policyEndDate' + index">Policy End Date</label>
                            <input
                                type="date"
                                name="policy_end_date"
                                label="Policy End Date"
                                :disabled="true"
                                :id="'policyEndDate' + index"
                                v-model="insuranceDetailsAndVerifi.end_date_policy"
                            />
                        </span>
                    </div>
                    <div>
                        <Accordion class="bottom-10">
                            <template #openIcon><span class="material-icons">remove</span></template>
                            <template #closedIcon><span class="material-icons">add</span></template>
                            <template #title><h3 class="margin-0">View Full Eligibility Report</h3></template>
                            <template #content>
                                <div v-if="insuranceDetailsAndVerifi.report_list">
<!--                                    <div class="align-right bottom-10">{{ insuranceDetailsAndVerifi.api_response_json }}</div>-->
                                    <div v-if="insuranceDetailsAndVerifi.report_list.service">
                                        <table v-for="(serv, srv) in insuranceDetailsAndVerifi.report_list.service" :key="srv">
                                            <thead>
                                                <tr>
                                                    <h2><b>{{ serv.name }}</b></h2>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="serv.active">
                                                    <td><h3><b>Active Coverage:</b></h3></td>
                                                    <td><h3>{{ (serv.active) ? "Active" : "Inactive" }}</h3></td>
                                                </tr>
                                                <tr v-if="serv.plan_name">
                                                    <td><h3><b>Plan Name:</b></h3></td>
                                                    <td><h3>{{ serv.plan_name }}</h3></td>
                                                </tr>
                                                <tr v-if="serv.insurance_type">
                                                    <td><h3><b>Insurance Type:</b></h3></td>
                                                    <td><h3>{{ serv.insurance_type }}</h3></td>
                                                </tr>
                                                <tr v-if="serv.messages && serv.messages.length > 0">
                                                    <td><h3><b>Messages:</b></h3></td>
                                                    <td>
                                                        <h4 v-for="(msg, msgKey) in serv.messages" :key="msgKey">-&nbsp;{{ msg }}</h4>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.primary_care_provider && Object.keys(serv.primary_care_provider).length > 0">
                                                    <td><h3><b>Primary Care Provider:</b></h3></td>
                                                    <td><h3>{{ (serv.primary_care_provider.last_name) ? serv.primary_care_provider.last_name + ", " : '' }}{{ serv.primary_care_provider.first_name }}</h3></td>
                                                </tr>
                                                <tr v-if="serv.primary_care_provider && Object.keys(serv.primary_care_provider).length > 0">
                                                    <td><h3><b>NPI:</b></h3></td>
                                                    <td><h3>{{ serv.primary_care_provider.npi }}</h3></td>
                                                </tr>
                                                <tr v-if="serv.copayment && Object.keys(serv.copayment).length > 0">
                                                    <td><h3><b>Co-Payment:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.copayment" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.authorization_required"><b>Authorization Required: </b>{{ item.authorization_required }}</h4>
                                                                    <h4 v-if="item.begin_date"><b>{{ item.begin_word }}: </b>{{ item.begin_date }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                    <div v-if="item.messages">
                                                                        <h4 v-for="(item2, itemKey2) in item.messages" :key="itemKey2"><b>-</b>{{ item2 }}</h4>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.coinsurance && Object.keys(serv.coinsurance).length > 0">
                                                    <td><h3><b>Co-Insurance:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.coinsurance" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>{{ item.amount }}%</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.authorization_required"><b>Authorization Required: </b>{{ item.authorization_required }}</h4>
                                                                    <h4 v-if="item.begin_date"><b>{{ item.begin_word }}: </b>{{ item.begin_date }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                    <div v-if="item.messages">
                                                                        <h4 v-for="(item2, itemKey2) in item.messages" :key="itemKey2"><b>-</b>{{ item2 }}</h4>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.deductible && Object.keys(serv.deductible).length > 0">
                                                    <td><h3><b>Deductible:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.deductible" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.authorization_required"><b>Authorization Required: </b>{{ item.authorization_required }}</h4>
                                                                    <h4 v-if="item.begin_date"><b>{{ item.begin_word }}: </b>{{ item.begin_date }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                    <div v-if="item.messages">
                                                                        <h4 v-for="(item2, itemKey2) in item.messages" :key="itemKey2"><b>-</b>{{ item2 }}</h4>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.deductible_remaining && Object.keys(serv.deductible_remaining).length > 0">
                                                    <td><h3><b>Deductible Remaining:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.deductible_remaining" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.out_of_pocket && Object.keys(serv.out_of_pocket).length > 0">
                                                    <td><h3><b>Out of Pocket (Stop Loss):</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.out_of_pocket" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.authorization_required"><b>Authorization Required: </b>{{ item.authorization_required }}</h4>
                                                                    <h4 v-if="item.begin_date"><b>{{ item.begin_word }}: </b>{{ item.begin_date }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                    <div v-if="item.messages">
                                                                        <h4 v-for="(item2, itemKey2) in item.messages" :key="itemKey2"><b>-</b>{{ item2 }}</h4>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.out_of_pocket_remaining && Object.keys(serv.out_of_pocket_remaining).length > 0">
                                                    <td><h3><b>Out of Pocket Remaining:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.out_of_pocket_remaining" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.limitations && Object.keys(serv.limitations).length > 0">
                                                    <td><h3><b>Limitations:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.limitations" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.authorization_required"><b>Authorization Required: </b>{{ item.authorization_required }}</h4>
                                                                    <h4 v-if="item.begin_date"><b>{{ item.begin_word }}: </b>{{ item.begin_date }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                    <div v-if="item.messages">
                                                                        <h4 v-for="(item2, itemKey2) in item.messages" :key="itemKey2"><b>-</b>{{ item2 }}</h4>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                                <tr v-if="serv.limitations_remaining && Object.keys(serv.limitations_remaining).length > 0">
                                                    <td><h3><b>Limitations Remaining:</b></h3></td>
                                                    <td><div>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <td><h4><b>Amount:</b></h4></td>
                                                                <td><h4><b>In Network:</b></h4></td>
                                                                <td><h4><b>Coverage:</b></h4></td>
                                                                <td><h4><b>Other:</b></h4></td>
                                                            </tr>
                                                            </thead>
                                                            <tbody v-for="(item, itemKey) in serv.limitations_remaining" :key="itemKey">
                                                            <tr>
                                                                <td><h4 v-if="item.amount != null"><b>${{ item.amount.toFixed(2) }}</b></h4></td>
                                                                <td><h4 v-if="item.in_network"><b>{{ item.in_network }}</b></h4></td>
                                                                <td><h4 v-if="item.cover"><b>{{ item.cover }}</b></h4></td>
                                                                <td>
                                                                    <h4 v-if="item.period"><b>Period: </b>{{ item.period }}</h4>
                                                                    <h4 v-if="item.description"><b>Description: </b>{{ item.description }}</h4>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div v-else>
                                    <span class="none-to-show">No report to show</span>
                                </div>
                            </template>
                        </Accordion>
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
    import Input from '@/components/general/validatedInputs/Input.vue';
    import DropDown from '@/components/general/validatedInputs/Dropdown.vue';
    import { insurance, insurancePayers } from '@/util/apiRequests';
    import RunVerificationModal from '@/components/general/modals/RunVerificationModal';
    import dayjs from '@/util/dayjs';
    import CurrencyInput from "@/components/general/inputs/CurrencyInput";
    import Accordion from '@/components/general/accordion/Accordion';

    import {
        insuranceTypeOptions,
        relationToInsuredOptions,
        planTypeOptions,
        deductibleMetOptions,
        hasDeductibleBeenMetOptions,
        isPolicyCurrentlyActiveOptions,
        isProvideInNetworkOptions,
        outOfNetworkBenefitsOptions,
        isAuthRequiredOptions,
        isReferralRequiredOptions,
        isThereDeductibleOptions,
        limitExcludeDocumentRequirementOptions
    } from '@/util/options';
    import { ValidationObserver } from 'vee-validate';

    export default {
        components: { Input, DropDown, ValidationObserver, RunVerificationModal, CurrencyInput, Accordion },
        name: 'InsuranceDetailsAndVerification',
        props: {
            insurance: {
                type: Object
            },
            index: {},
            removeCard: {
            },
        },
        data() {
            return {
                showVerificationModal: false,
                tempInsuranceDetailsAndVerifi: {},
                date_veri_completed: '',
                insuranceDetailsAndVerifi: {
                    insurance_type: '',
                    plan_type: '',
                    member_id: '',
                    group_id: '',
                    name_insured: '',
                    relationship: '',
                    dob_insured: '',
                    ins_num: '',
                    group_num: '',
                    service_code: '',
                    name_of_rep: '',
                    ref_num_for_call: '',
                    date_verification_call: '',
                    policy_active: '',
                    deductible_met: '',
                    is_there_deductible: '',
                    deductible_remain: '',
                    visits_allowed: '',
                    visits_used: '',
                    visits_remain: '',
                    co_pay: '',
                    co_insurance: '',
                    is_provide_in_network: '',
                    out_of_network_benefits: '',
                    preauth_require: '',
                    auth_num: '',
                    start_date_auth: '',
                    end_date_auth: '',
                    ref_required: '',
                    service_or_treatment_exclude: '',
                    limit_exclude_docum_requirement: '',
                    notes: '',
                    start_date_policy: '',
                    end_date_policy: '',
                    insurance_payer: {},
                    insurance_payers_vob_id: 0,
                    report_list: {},
                },
                insuranceTypeOptions,
                relationToInsuredOptions,
                planTypeOptions,
                deductibleMetOptions,
                hasDeductibleBeenMetOptions,
                isPolicyCurrentlyActiveOptions,
                isProvideInNetworkOptions,
                outOfNetworkBenefitsOptions,
                isAuthRequiredOptions,
                isReferralRequiredOptions,
                isThereDeductibleOptions,
                limitExcludeDocumentRequirementOptions,
                isEditMode: true,
                showVerificationFields: true,
                insurance_payers_setting: '',
                insurance_payers_list: [],
                insurance_payers_vob_list: [],
                narrowed_insurance_payers_list: []
            };
        },

        methods: {
            closeVerificationModal(action) {
                if (action == 'cancel') {
                    this.showVerificationModal = false;
                } else if (action == 'proceed') {
                    this.showVerificationModal = false;
                    this.verify_card_check_eligibilities();
                }
            },
            emitCurrentlySelectedPayer(val) {
                this.insurance.insurance_payer_id = val.payer_id;
                this.$emit('assignId', this.insurance, this.insurance?.cardId, this.insurance?.veriId);
            },
            emitCurrentlySelectedPayerVob(val) {
                this.insurance.insurance_payers_vob_id = parseInt( val.id )
                this.$emit('assign_vob_id', this.insurance, this.insurance?.cardId, this.insurance?.veriId);
            },
            async get_insurance_payers() {
                let level_id = this.$store.state.user.company_id;
                const body = {
                    criteria: {
                        page: { num_per_page: '100000', page_num: '1' },
                    }
                }
                const res = await this.$api.post(insurancePayers.getList(), body);
                const my_payers = res.data?.rows;
                if(my_payers.length){
                        this.insurance_payers_setting = my_payers
                        this.insurance_payers_list = my_payers.map(function(e) {
                            e.payer_label = e.payer_id + ' : ' + e.payer_name;
                            return e;
                        });
                        this.insurance_payers_list = this.insurance_payers_list.filter((e) => {
                            if (e.payer_label == 'undefined : undefined') {
                                return false;
                            }
                            return true;
                        });
                }
                const res1 = await this.$api.get(`/settings/setting/insurance_payers/company/${level_id}`);
                if (res) {
                    const my_payers = res1.data.value;

                    this.narrowed_insurance_payers_list = JSON.parse(my_payers);
                    //map over insurance_payers_list and add a checkmark to the list if it is in the narrowed_insurance_payers_list also each item is an object
                    this.insurance_payers_list = this.insurance_payers_list.map(e => {
                       if(this.narrowed_insurance_payers_list.some(i => i.id === e.id)){
                            e.checked = true;
                       }
                        return e;
                    });
                }
            },
            async get_insurance_payers_vob() {
                const body = {
                    criteria: {
                        page: { num_per_page: '10000', page_num: 1 }
                    }
                };
                const res = await this.$api.post(`/insurance_payers/vob`, body);

                this.insurance_payers_vob_list = res.data.rows.map(function(e) {
                    e.payer_label = e.payer_id + ' : ' + e.payer_name
                    return e
                })
            },
            async submit(e) {
                //Get the data (Any Data)
                //Data will return a new id
                //Saving if new will create a new row and emit the id back up so that the rest of the components can get the information.
                try {
                    //I'm doing this because, a refactor will take too long...
                    let whichSave;
                    if(e.submitter.id == 'insurance-details-button'){
                        whichSave = 'insurance_card';
                    }
                    if(e.submitter.id == 'insurance-coverage-button'){
                        whichSave = 'insurance_coverage';
                    }
                    if(e.submitter.id == 'insurance-verification-button'){
                        whichSave = 'insurance_verification'
                    }
                    let temp = JSON.parse(JSON.stringify(this.insuranceDetailsAndVerifi));
                    temp.insurance_payers_id = temp.insurance_payer?.id;
                    temp.insurance_payers_vob_id = temp.insurance_vob?.id;
                    delete temp?.insurance_vob
                    let copyOfInsurancePayer = null;
                    try {
                        copyOfInsurancePayer = JSON.parse(JSON.stringify(temp.insurance_payer));
                    } catch (error) {
                        //
                    }

                    //the one below is for contact information - i  know the naming sucks plz bare with it.

                    delete temp.insurance_payer;
                    temp.cardId = this.insurance.cardId;
                    temp.veriId = this.insurance.veriId;
                    temp.client_id = this.$store.state.clientOverview.clientData.id;

                    let response;
                    if(whichSave == 'insurance_card') {
                        response = await this.$api.put(insurance.saveInsuranceDetailsInformation(), {
                            insurance: temp,
                            whichSave
                        });

                    }
                    else if((whichSave == 'insurance_coverage' || whichSave == 'insurance_verification') && temp.cardId){
                        response = await this.$api.put(insurance.saveInsuranceDetailsInformation(), {
                            insurance: temp,
                            whichSave
                        });
                    }
                    if (response.data.cardId && response.data.veriId) {
                        if (copyOfInsurancePayer) {
                            this.insurance.insurance_payer_id = copyOfInsurancePayer.payer_id;
                        }
                        this.$emit('assignId', this.insurance, response.data.cardId, response.data.veriId);
                    }
                    else if(response.data.cardId && !response.data.veriId) {
                        if (copyOfInsurancePayer) {
                            this.insurance.insurance_payer_id = copyOfInsurancePayer.payer_id;
                        }
                        this.$emit('assignId', this.insurance, response.data.cardId, null);
                    }
                    this.$toasted.success('Saved information successfully.');
                } catch (err) {
                    this.$toasted.error('Could not save information.');
                    // TODO: add snackbar to display other errors to user
                    console.error(err);
                }
            },
            cancelButtonClick() {
                this.resetFields();
                this.isEditMode = false;
            },
            tempSaveFields() {
                this.tempInsuranceDetailsAndVerifi = JSON.parse(JSON.stringify(this.insuranceDetailsAndVerifi));
            },
            resetFields() {
                this.tempInsuranceDetailsAndVerifi = JSON.parse(JSON.stringify(this.tempInsuranceDetailsAndVerifi));
            },
            checkIfVerificationFieldsExist() {
                let fields = {
                    service_code: this.insurance.service_code,
                    name_of_rep: this.insurance.name_of_rep,
                    ref_num_for_call: this.insurance.ref_num_for_call,
                    date_verification_call: this.insurance.date_verification_call,
                    policy_active: this.insurance.policy_active,
                    deductible_met: this.insurance.deductible_met,
                    is_there_deductible: this.insurance.is_there_deductible,
                    deductible_remain: this.insurance.deductible_remain,
                    visits_allowed: this.insurance.visits_allowed,
                    visits_used: this.insurance.visits_used,
                    visits_remain: this.insurance.visits_remain,
                    co_pay: this.insurance.co_pay,
                    co_insurance: this.insurance.co_insurance,
                    is_provide_in_network: this.insurance.is_provide_in_network,
                    out_of_network_benefits: this.insurance.out_of_network_benefits,
                    preauth_require: this.insurance.preauth_require,
                    auth_num: this.insurance.auth_num,
                    start_date_auth: this.insurance.start_date_auth,
                    end_date_auth: this.insurance.end_date_auth,
                    ref_required: this.insurance.ref_required,
                    service_or_treatment_exclude: this.insurance.service_or_treatment_exclude,
                    limit_exclude_docum_requirement: this.insurance.limit_exclude_docum_requirement,
                    notes: this.insurance.notes,
                    start_date_policy: this.insurance.start_date_policy,
                    end_date_policy: this.insurance.end_date_policy
                };

                for (const key in fields) {
                    if (Object.hasOwnProperty.call(fields, key)) {
                        const element = fields[key];
                        //An element with a valid value was found
                        if (element == null || element == '' || typeof element == 'undefined') {
                            continue;
                        } else {
                            this.showVerificationFields = true;
                        }
                    }
                }
                return;
            },
            async verify_card_check_eligibilities() {
                const payload = { id: this.insurance.cardId, verif_id: this.insurance.veriId, client_id: this.$store.state.clientOverview.clientData.id };

                const res = await this.$api.post(`/insurance/verify_eligibility`, payload);
                if (res.status === 200) {
                    this.insuranceDetailsAndVerifi.policy_active = res.data.response.policy_active;
                    this.insuranceDetailsAndVerifi.start_date_policy = (res.data.response.start_date_policy ? dayjs(res.data.response.start_date_policy).format('YYYY-MM-DD') : null);
                    this.insuranceDetailsAndVerifi.end_date_policy = (res.data.response.end_date_policy ? dayjs(res.data.response.end_date_policy).format('YYYY-MM-DD') : null);
                    this.insuranceDetailsAndVerifi.report_list = res.data.response.report_list;
                    this.date_veri_completed = (res.data.response.date_verified ? dayjs(res.data.response.date_verified).format('YYYY-MM-DD') : null);

                    /*if (res.data.response.cardId && res.data.response.veriId) {

                        let temp = this.insuranceDetailsAndVerifi;
                        temp.insurance_payers_id = temp.insurance_payer?.id;
                        temp.insurance_payers_vob_id = temp.insurance_vob?.id;
                        delete temp?.insurance_vob
                        let copyOfInsurancePayer = null;
                        try {
                            copyOfInsurancePayer = JSON.parse(JSON.stringify(temp.insurance_payer));
                        } catch (error) {
                            //
                        }

                        if (copyOfInsurancePayer) {
                            this.insurance.insurance_payer_id = copyOfInsurancePayer.payer_id;
                        }
                        this.$emit('assignId', this.insurance, res.data.response.cardId, res.data.response.veriId);
                    }*/

                    await this.$nextTick();
                } else {
                    this.$toasted.error('Could not verify eligibility.');
                }

                // if it's good, then this.insuranceDetailsAndVerifi = the result
                // refresh the verifications
            },
            handleCurrencyChange(newCurrencyTotal, field) {
                this.$set(this.insuranceDetailsAndVerifi, field, this.$getNumFromCurrency(newCurrencyTotal));
            },
            handlePercent(e) {
                const pf = Intl.NumberFormat('en-US', {
                    style: 'percent',
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                });

                if (!e) {
                    let zero = pf.format(0);
                    this.$set(this.insuranceDetailsAndVerifi, 'co_insurance', zero);
                    return;
                }

                let newNum = parseFloat(e.replace(/[^0-9-\.]/g, ''));

                if (isNaN(newNum)) {
                    let zero2 = pf.format(0);
                    this.$set(this.insuranceDetailsAndVerifi, 'co_insurance', zero2);
                    return;
                }

                console.log("E",e);
                let perc = parseFloat(e.replace(/[^0-9-]/g, ''));
                perc = perc / 100;
                let perc3 = pf.format(perc);
                console.log(perc);
                console.log(perc3);
                this.$set(this.insuranceDetailsAndVerifi, 'co_insurance', perc3);
            },
        },
        async created() {
            await this.get_insurance_payers();
            await this.get_insurance_payers_vob();

            let dob_insured_format = this.insurance.dob_insured;
            if (!dob_insured_format && this.$store.state?.clientOverview?.clientData?.dob) {

                dob_insured_format = (dayjs(this.$store.state.clientOverview.clientData.dob).add(12, 'h').format('YYYY-MM-DD'));
            }

            let report_list_output;

            try {
                report_list_output = JSON.parse(this.insurance.report_list);
            } catch (error) {
                report_list_output = null;
            }

            this.insuranceDetailsAndVerifi = {
                // insurance_payer

                insurance_type: this.insurance.insurance_type ?? '',
                plan_type: this.insurance.plan_type ?? '',
                member_id: this.insurance.member_id ?? '',

                group_id: this.insurance.group_id ?? '',
                name_insured: this.insurance.name_insured ?? '',
                relationship: this.insurance.relationship ?? '',

                dob_insured: dob_insured_format ? dayjs(dob_insured_format).format('YYYY-MM-DD') : '',
                ins_num: this.insurance.ins_num ?? '',
                group_num: this.insurance.group_num ?? '',

                service_code: this.insurance.service_code ?? '',
                name_of_rep: this.insurance.name_of_rep ?? '',
                ref_num_for_call: this.insurance.ref_num_for_call ?? '',
                date_verification_call: this.insurance.date_verification_call ? dayjs.utc(this.insurance.date_verification_call).format('YYYY-MM-DD') : '',
                policy_active: this.insurance.policy_active ?? 1,
                deductible_met: this.insurance.deductible_met ?? 0,
                is_there_deductible: this.insurance.is_there_deductible ?? 0,
                deductible_remain: this.insurance.deductible_remain ?? '',
                visits_allowed: this.insurance.visits_allowed ?? '',
                visits_used: this.insurance.visits_used ?? '',
                visits_remain: this.insurance.visits_remain ?? '',
                co_pay: this.insurance.co_pay ?? '',
                co_insurance: this.insurance.co_insurance ?? '',
                is_provide_in_network: this.insurance.is_provide_in_network ?? 0,
                out_of_network_benefits: this.insurance.out_of_network_benefits ?? 0,
                preauth_require: this.insurance.preauth_require ?? '',
                auth_num: this.insurance.auth_num ?? '',
                start_date_auth: this.insurance.start_date_auth ? dayjs(this.insurance.start_date_auth).format('YYYY-MM-DD') : '',
                end_date_auth: this.insurance.end_date_auth ? dayjs(this.insurance.end_date_auth).format('YYYY-MM-DD') : '',
                ref_required: this.insurance.ref_required ?? '',
                service_or_treatment_exclude: this.insurance.service_or_treatment_exclude ?? '',
                limit_exclude_docum_requirement: this.insurance.limit_exclude_docum_requirement ?? 0,
                notes: this.insurance.notes ?? '',
                start_date_policy:
                    this.insurance.start_date_policy ? dayjs.utc(this.insurance.start_date_policy).format('YYYY-MM-DD') : '',
                end_date_policy:
                    this.insurance.end_date_policy ? dayjs.utc(this.insurance.end_date_policy).format('YYYY-MM-DD') : '',
                report_list: report_list_output ?? null,
                insurance_payer: this.insurance_payers_list.some(
                    (element) => element.id == this.insurance?.insurance_payers_id
                )
                    ? this.insurance_payers_list.find((element) => element.id == this.insurance?.insurance_payers_id)
                    : {},
                insurance_vob: this.insurance_payers_vob_list.some(
                    (element) => element.id == this.insurance?.card_insurance_payers_vob_id
                )
                    ? this.insurance_payers_vob_list.find((element) => element.id == this.insurance?.card_insurance_payers_vob_id)
                    : {}
            };
            this.emitCurrentlySelectedPayer(this.insuranceDetailsAndVerifi);

            this.date_veri_completed = this.insurance.date_verified ? dayjs.utc(this.insurance.date_verified).format('YYYY-MM-DD') : '';

            this.checkIfVerificationFieldsExist();
            await this.$forceUpdate();

        },

    };

    /*
    ins_num
    group_num
    service_code
    name_of_rep
    ref_num_for_call
    date_verification_call
    policy_active
    deductible_met
    is_there_deductible
    deductible_remain
    visits_allowed
    visits_used
    visits_remain
    co_pay
    co_insurance
    is_provide_in_network
    out_of_network_benefits
    preauth_require
    auth_num
    start_date_auth
    end_date_auth
    ref_required
    service_or_treatment_exclude
    limit_exclude_docum_requirement
    notes
    start_date_policy
    end_date_policy


    ins_num: this.insurance.ins_num ?? ''
    group_num: this.insurance.group_num ?? ''
    service_code: this.insurance.service_code ?? ''
    name_of_rep: this.insurance.name_of_rep ?? ''
    ref_num_for_call: this.insurance.ref_num_for_call ?? ''
    date_verification_call: this.inssurance.date_verification_call ?? ''
    policy_active: this.insurance.policy_active ?? ''
    deductible_met: this.insurance.deductible_met ?? ''
    is_there_deductible: this.insurance.is_there_deductible ?? ''
    deductible_remain: this.insurance.deductible_remain ?? ''
    visits_allowed: this.insurance.visits_allowed ?? ''
    visits_used: this.insurance.visits_used ?? ''
    visits_remain: this.insurance.visits_remain ?? ''
    co_pay: this.insurance.co_pay ?? ''
    co_insurance: this.insurance.co_insurance ?? ''
    is_provide_in_network: this.insurance.is_provide_in_network ?? ''
    out_of_network_benefits: this.insurance.out_of_network_benefits ?? ''
    preauth_require: this.insurance.preauth_require ?? ''
    auth_num: this.insurance.auth_num ?? ''
    start_date_auth: this.insurance.start_date_auth ?? ''
    end_date_auth: this.insurance.end_date_auth ?? ''
    ref_required: this.insurance.ref_required ?? ''
    service_or_treatment_exclude: this.insurance.service_or_treatment_exclude ?? ''
    limit_exclude_docum_requirement: this.insurance.limit_exclude_docum_requirement ?? ''
    notes: this.insurance.notes ?? ''
    start_date_policy: this.insurance.start_date_policy ?? ''
    end_date_policy: this.insurance.end_date_policy ?? ''
    */
</script>

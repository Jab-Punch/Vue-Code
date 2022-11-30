<template>
    <div class="client-manager" v-if="this.$store.state.clientOverview.loaded && this.findCounselor">
        <div class="client-manager-header">
            <div class="client-profile-info flex">
                <!-- <UploadOverlay/> -->
                <div class="client-photo">
                    <UploadOverlay
                        :storeGetterKey="'clientOverview/clientLicense'"
                        :storeUpdateFileKey="'clientOverview/updateField'"
                        :storeUpdateFileField="'license'"
                        :storeUpdateFileIDKey="'clientOverview/updateClientLicenseId'"
                        :storeUpdateFileIDField="'license_id'"
                        :storeFileID="$store.state.clientOverview.clientData.license_id"
                        :kind="'client_license'"
                        :client="$store.getters['clientOverview/client']"
                        :urlToUpload="
                            `/clients/client-license?fileId=${$store.state.clientOverview.clientData.license_id}`
                        "
                        v-if="$store.state.clientOverview.loaded"
                        :alt="''"
                    />
                    <!-- <img src="assets/px/client-profile-placeholder.png" alt=""/> -->
                </div>
                <div class="client-info">
                    <div class="flex center">
                        <b>{{ $store.getters['clientOverview/clientFullName'] }} </b>
                        <ClientManagerActionsDropdown class="pad-0 left-5"/>
                    </div>
                    <div>Internal ID# {{ $store.getters['clientOverview/client'].id }}</div>
                    <div>{{ $store.getters['clientOverview/clientTags'] }}</div>
                    <OfficeDropdown />
                    <!--<div class="single-setting office flex center">
                        <span class="material-icons-outlined right-5">holiday_village</span>
                        <div v-if='office_locations.length > 1'>
                            <Dropdown
                                :value="primaryOfficeId"
                                @input="updatePrimaryOffice"
                                id="primaryOffice"
                                name="primaryOffice"
                                label="Primary Office"
                                :options="office_locations"
                            />
                        </div>
                        <div v-else>
                            {{ officeName }}
                        </div>
                    </div>-->
                </div>
                <div class="client-activity">
                    <div>
                        <b>{{ $store.getters['clientOverview/clientActive'] }}</b>
                    </div>
                    <div v-if="$store.state.clientOverview.attendance">
                        Visits attended: {{ this.$store.state.clientOverview.attendance.attended }}
                    </div>
                    <div v-if="$store.state.clientOverview.attendance">
                        Visits missed: {{ this.$store.state.clientOverview.attendance.missed }}
                    </div>
                </div>
            </div>
            <ClientManagerTabs :pages="tabPages" @action="goToPage" />
        </div>
        <!-- <h1>Client Billing</h1> -->
        <div class="flex">
            <div class="flex-1 left-col margin">
                <div class="card-block">
                    <BalanceQuickView
                        :clientId="clientId"
                        @paymentCollected="handleDataChange"
                        ref="balanceQuickView"
                    />
                </div>
                <div class="flex space-between">
                    <div class="card-block flex-1 left-col margin">
                        <h3>Billing Preferences</h3>
                        <Dropdown
                            :disableEmpty="true"
                            :id="'financial_class'"
                            :name="'financial_class'"
                            :label="'Select One'"
                            :options="financial_classes"
                            @input="put_client_info()"
                            v-model="client_data.financial_class"
                        />
                    </div>
                    <div class="card-block flex-1">
                        <GenerateNewBox
                            :clientId="clientId"
                            @refresh="handleDataChange"
                            :financialClass="client_data.financial_class"
                        />
                    </div>
                </div>
                <div class="card-block">
                    <BillingDocumentQuickList :clientId="clientId" ref="billingDocumentQuickList" />
                </div>
                <div class="card-block">
                    <SavedCardsQuickView :clientId="clientId" ref="savedCardsQuickView" />
                </div>
                <div class="card-block">
                    <PaymentBeforeTelehealth />
                </div>
            </div>
            <div class="flex-1">
                <div class="card-block">
                    <InvoiceQuickList :clientId="clientId" @actionComplete="handleDataChange" ref="invoiceQuickList" />
                </div>
                <div class="card-block">
                    <TransactionsQuickList
                        :transactions="transactions"
                        :clientId="clientId"
                        @refund="handleDataChange"
                    />
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="this.$store.state.clientOverview.loaded && !this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
    <Loading v-else-if="this.$store.state.clientOverview.loaded == false" />
</template>

<script>
    import ClientManagerTabs from '@/components/client-manager/ClientManagerTabs.vue';
    import { ledger, settings, users } from '@/util/apiRequests';
    import InvoiceQuickList from '@/components/client-manager/ClientBilling/InvoiceQuickList';
    import BalanceQuickView from '@/components/client-manager/ClientBilling/BalanceQuickView';
    import TransactionsQuickList from '@/components/client-manager/ClientBilling/TransactionsQuickList';
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import GenerateNewBox from '@/components/client-manager/ClientBilling/GenerateNewBox';
    import SavedCardsQuickView from '@/components/client-manager/ClientBilling/SavedCardsQuickView';
    import BillingDocumentQuickList from '@/components/client-manager/ClientBilling/BillingDocumentQuickList';
    import Loading from '@/components/general/loading/loading.vue';
    import PaymentBeforeTelehealth from '@/components/client-manager/ClientBilling/PaymentBeforeTelehealth';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';

    export default {
        name: 'ClientBilling',
        components: {
            ClientManagerActionsDropdown,
            BillingDocumentQuickList,
            SavedCardsQuickView,
            GenerateNewBox,
            TransactionsQuickList,
            BalanceQuickView,
            InvoiceQuickList,
            ClientManagerTabs,
            UploadOverlay,
            Loading,
            PaymentBeforeTelehealth,
            OfficeDropdown
        },
        data() {
            return {
                tabPages: [
                    { label: 'Overview', name: 'ClientOverview', params: { record_id: this.$route.params.client_id } },
                    {
                        label: 'Demographics',
                        name: 'ClientDemographics',
                        params: { client_id: this.$route.params.client_id }
                    },
                    {
                        label: 'Insurance',
                        name: 'ClientInsurance',
                        params: { client_id: this.$route.params.client_id }
                    },
                    { label: 'Billing', name: 'ClientBilling', params: { client_id: this.$route.params.client_id } },
                    { label: 'Clinical', name: 'ClientClinical', params: { client_id: this.$route.params.client_id } },
                    {
                        label: 'Documents & Forms',
                        name: 'ClientDocuments',
                        params: { client_id: this.$route.params.client_id }
                    }
                ],
                transactions: [],
                client_data: {
                    financial_class: 'self_pay'
                },
                clientAllowed: false,
                financial_classes: [
                    'self_pay',
                    'self_pay_custom',
                    'commercial_insurance',
                    'medicaid',
                    'medicare',
                    'workers_comp'
                ],
            };
        },
        computed: {
            clientId() {
                return this.$store.state.current_client_id;
            },
            findCounselor() {
                let found = false;
                if (!this.clientAllowed) {
                    if (this.$store.getters['clientOverview/client'].primary_counselor == this.$store.state.user.id || this.$store.getters['clientOverview/client'].secondary_counselor == this.$store.state.user.id || this.$store.getters['clientOverview/client'].tertiary_counselor == this.$store.state.user.id) {
                        found = true;
                    }
                } else {
                    found = true;
                }
                return found;
            },
        },
        methods: {
            goToPage(page) {
                this.$router.push(page);
            },

            async init() {
                await Promise.all([this.getTransactions(),
                    this.get_client_info()
                ]);
            },

            async getTransactions() {
                try {
                    const res = await this.$api.get(ledger.getTransactionQuickList(this.clientId));
                    this.transactions = res.data;
                } catch (err) {
                    this.$toasted.error('Could not get transactions - please try again later');
                }
            },

            async get_client_info() {
                try {
                    const res = await this.$api.get(`clients/${this.clientId}/general-info`);
                    this.client_data = res.data[0];
                } catch (err) {
                    this.$toasted.error('Could not get info');
                }
            },

            async put_client_info() {
                try {
                    let push_info = this.$clone_obj(this.client_data);
                    delete(push_info.guardian_id)
                    delete(push_info.guardian_relationship_to_client)
                    delete(push_info.primary_counselor)
                    const res = await this.$api.put(`clients/${this.clientId}/general-info`, push_info);
                    this.$toasted.success('Billing preference successfully updated')
                } catch (err) {
                    this.$toasted.error('Could not put info');
                }
            },

            async handleDataChange() {
                await Promise.all([
                    this.$refs.balanceQuickView?.refresh(),
                    this.$refs.invoiceQuickList?.refresh(),
                    this.$refs.savedCardsQuickView?.refresh(),
                    this.$refs.billingDocumentQuickList?.getDocuments(),
                    this.getTransactions(),
                    this.put_client_info(),
                    this.init()
                ]);
            },
            async checkClientAllowed() {
                if (this.$store.state.user.role_id == 12 && !this.$store.state.user.requires_sup && !this.$store.state.user.is_supervisor) {
                    const allCharts = await this.$api.get(settings.getSetting('clinician_see_all_charts','company','company'));
                    this.clientAllowed = (allCharts.data.value == 0) ? false : true;
                } else {
                    this.clientAllowed = true;
                }
            },
        },
        async created() {
            await this.checkClientAllowed();
            await this.init();
        }
    };
</script>

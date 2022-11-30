<template>
    <div class='client-manager' v-if='this.$store.state.clientOverview.loaded && this.findCounselor'>
        <div class='client-manager-header'>
            <div class='client-profile-info flex'>
                <!-- <UploadOverlay/> -->
                <div class='client-photo'>
                    <UploadOverlay
                        :storeGetterKey="'clientOverview/clientLicense'"
                        :storeUpdateFileKey="'clientOverview/updateField'"
                        :storeUpdateFileField="'license'"
                        :storeUpdateFileIDKey="'clientOverview/updateClientLicenseId'"
                        :storeUpdateFileIDField="'license_id'"
                        :storeFileID='$store.state.clientOverview.clientData.license_id'
                        :kind="'client_license'"
                        :client="$store.getters['clientOverview/client']"
                        :urlToUpload='`/clients/client-license?fileId=${$store.state.clientOverview.clientData.license_id}`'
                        v-if='$store.state.clientOverview.loaded'
                        :key='generateId()'
                        :alt="''"

                    />
                    <!-- <img src="assets/px/client-profile-placeholder.png" alt=""/> -->

                </div>
                <div class='client-info'>
                    <div class="flex center">
                        <b>{{ $store.getters['clientOverview/clientFullName'] }}</b>
                        <ClientManagerActionsDropdown class="pad-0 left-5"/>
                    </div>
                    <div>Internal ID# {{ $store.getters['clientOverview/client'].id }}</div>
                    <div>{{ $store.getters['clientOverview/clientTags'] }}</div>
                    <OfficeDropdown />
                </div>
                <div class='client-activity'>
                    <div><b>{{ $store.getters['clientOverview/clientActive'] }}</b></div>
                    <div v-if='$store.state.clientOverview.attendance'>Visits attended:
                        {{ this.$store.state.clientOverview.attendance.attended }}
                    </div>
                    <div v-if='$store.state.clientOverview.attendance'>Visits missed:
                        {{ this.$store.state.clientOverview.attendance.missed }}
                    </div>
                </div>
            </div>
            <ClientManagerTabs :pages='tabPages' @action='goToPage' />
        </div>

        <div v-if='loading == false'>
            <div class="flex" v-if="(this.clientInsuranceVerified && this.clientInsuranceVerified != 'Invalid Date')" style="background:blue; justify-content: center; text-align:center;">
                <h2 style="color:white;">Insurance {{ (clientInsurance) ? 'Active' : 'Inactive' }}, last verified on {{ clientInsuranceVerified }}</h2>
            </div>
            <div v-for='(insurance, key) in insurances' :key='insurance.generated_id' class='client-insurance flex'>
                <div class='flex-6 left-col margin three-col-fields'>
                    <div>
                        <insurance-details-and-verification :insurance='insurance' :index='key'
                                                            @assignId='fromNewToId' @assign_vob_id="fromNewToId" :remove-card='remove'/>
<!--                        <div class='align-right'>-->
<!--                            <button class='secondary bottom-20 remove-ins' @click='remove(key)' v-if='key > 0'>-->
<!--                                <span class='material-icons'>delete_outline</span> Remove-->
<!--                            </button>-->
<!--                        </div>-->
                    </div>
                </div>
                <div class='flex-4'>
                    <insurance-cards :insurance='insurance' :key='key' @assignId='fromNewToId' />
                    <!-- <insurance-contact-information :insurance='insurance' :index='key' @assignId='fromNewToId' /> -->
                </div>
                <!-- <hr v-if="key == 0" class="fullwidth"/> -->
                <!-- <button @click="remove(key)" v-if="key > 0">Remove</button> -->
            </div>
            <button v-if='loading == false && this.insurances.length < 3' @click='add()' class='weight-600 no-bg'><span
                class='material-icons purple'>add_box</span> Add Insurance
            </button>
        </div>
        <Loading v-else />
    </div>
    <div v-else-if="this.$store.state.clientOverview.loaded && !this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
    <Loading v-else-if='this.$store.state.clientOverview.loaded == false' />

</template>

<script>
    import InsuranceContactInformation
        from '@/components/client-manager/ClientInsurance/InsuranceContactInformation.vue';
    import InsuranceCards from '@/components/client-manager/ClientInsurance/InsuranceCards.vue';
    import InsuranceDetailsAndVerification
        from '@/components/client-manager/ClientInsurance/InsuranceDetailsAndVerificationNEW.vue';
    import { clients, insurance, settings } from '@/util/apiRequests';
    import ClientManagerTabs from '@/components/client-manager/ClientManagerTabs.vue';
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import { generateId } from '@/util/genericUtilityFunctions';
    import Loading from '@/components/general/loading/loading.vue';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';
    import dayjs from '@/util/dayjs';

    export default {
        name: 'ClientInsurance',
        components: {
            ClientManagerActionsDropdown,
            InsuranceContactInformation,
            InsuranceCards,
            InsuranceDetailsAndVerification,
            ClientManagerTabs,
            UploadOverlay,
            Loading,
            OfficeDropdown
        },
        data() {
            return {
                // clientId: this.$route.params.client_id,
                insurances: [{ generated_id: generateId() }],
                loading: true,
                clientData: null,
                clientInsurance: false,
                clientInsuranceVerified: null,
                clientAllowed: false,
                generateId,
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
                ]
            };
        },
        async created() {
            await this.checkClientAllowed();
            await this.$forceUpdate();//coming from other tab, you just created a new client, so history push is being funny.
            await this.getInsurances();
            await this.getInsuranceVerification();
        },
        computed: {
            clientId() {
                return this.$store.state.current_client_id;
                //return this.$store.state.clientData.
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
            add() {
                if (this.insurances.length < 3) {
                    this.insurances.push({ generated_id: generateId() });
                }
            },
            goToPage(page) {
                this.$router.push(page);
            },
            async remove(key) {

                //Explictly doing this to avoid id = 0 falsey, and to also not evaluate if undefined
                if (Object.prototype.hasOwnProperty.call(this.insurances[key], 'cardId') && this.insurances[key]?.cardId) {
                    try {
                        await this.$api.delete(insurance.deleteInsurance(this.insurances[key].cardId));
                        this.insurances.splice(key, 1);
                    } catch (error) {
                        console.log(error);
                    }
                    //this.insurances.splice(key, 1);
                    // this.insurances.splice(key, 1);

                } else {
                    this.insurances.splice(key, 1);
                }
            },
            async getInsurances() {
                try {
                    let response = await this.$api.get(clients.getInsurances(this.clientId));
                    if (response?.data?.insurances) {
                        if (response?.data?.insurances.length > 0) {
                            let res = response?.data.insurances.map((element) => {
                                element.generated_id = generateId();
                                return element;
                            });
                            this.insurances = res;
                            // this.insurances.generated_id = generateId();
                        }
                        this.loading = false;
                    }
                } catch (error) {
                    this.loading = true;
                }
            },
            async getInsuranceVerification() {
                try {
                    const response = await this.$api.get(`/insurance/primary_verification/${this.clientId}`);
                    if (response && response.data && response.data.info.length) {
                        this.clientInsurance = response.data.info[0].policy_active;
                        this.clientInsuranceVerified = dayjs(response.data.info[0].date_verified).format('MM/DD/YYYY');
                    }
                } catch (err) {
                    //
                }
            },
            fromNewToId(insurance, cardId, veriId, backId, frontId) {
                // insurance.insurance_payers_vob_id = insurance.insurance_payers_vob_id.id
                this.$set(insurance, 'cardId', cardId);
                this.$set(insurance, 'veriId', veriId);
                if (frontId) {
                    this.$set(insurance, 'card_front_file_id', frontId);
                }
                if (backId) {
                    this.$set(insurance, 'card_back_file_id', backId);
                }
            },
            assign_vob_id(insurance, cardId, veriId) {
            },
            async checkClientAllowed() {
                if (this.$store.state.user.role_id == 12 && !this.$store.state.user.requires_sup && !this.$store.state.user.is_supervisor) {
                    const allCharts = await this.$api.get(settings.getSetting('clinician_see_all_charts','company','company'));
                    this.clientAllowed = (allCharts.data.value == 0) ? false : true;
                } else {
                    this.clientAllowed = true;
                }
            },

        }
    };
</script>

<style></style>

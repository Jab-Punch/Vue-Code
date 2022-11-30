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
                <div class="client-info" v-if="this.$store.state.clientOverview.clientData">
                    <div class="flex center">
                        <b>{{ $store.getters['clientOverview/clientFullName'] }} </b>
                        <ClientManagerActionsDropdown class="pad-0 left-5"/>
                    </div>
                    <div>Internal ID# {{ $store.getters['clientOverview/client'].id }}</div>
                    <div>{{ $store.getters['clientOverview/clientTags'] }}</div>
                    <OfficeDropdown />
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
        <!-- <h1>Client Clinical</h1> -->
        <div class="flex">
            <div class="flex-4 left-col margin">
                <div class="card-block">
                    <Counselors :client_id="clientId" />
                </div>
                <div class="card-block">
                    <AttendanceHistory :client_id="clientId" />
                </div>
                <div class="card-block">
                    <Tags :client_id="clientId" />
                </div>
            </div>
            <div class="flex-6">
                <div class="card-block">
                    <ServiceCodes :client_id="clientId" />
                </div>
                <div class="card-block">
                    <ClientCustomProducts :client_id="clientId" />
                </div>
                <!-- <div class="card-block">
                    <h3 class="margin-0">Custom Services</h3>
                    <p class="margin-0 bottom-20">Add custom services and assign your fees</p>
                    <div @click="addCpt()">+ Add custom service</div>
                </div> -->
                <!-- <div class="card-block">
                    <DiagnosticCodes :client_id="clientId" />
                </div> -->
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
    import Counselors from '@/components/client-manager/ClientClinical/Counselors.vue';
    // import DiagnosticCodes from '@/components/client-manager/ClientClinical/DiagnosticCodes.vue';
    import AttendanceHistory from '@/components/client-manager/ClientClinical/AttendanceHistory.vue';
    import Tags from '@/components/client-manager/ClientClinical/Tags.vue';
    import ServiceCodes from '@/components/client-manager/ClientClinical/ServiceCodes.vue';
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import Loading from '@/components/general/loading/loading.vue';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import ClientCustomProducts from '@/components/client-manager/ClientClinical/ClientCustomProducts';
    import { settings } from '@/util/apiRequests';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';

    export default {
        name: 'ClientClinical',
        components: {
            ClientManagerActionsDropdown,
            ClientCustomProducts,
            ClientManagerTabs,
            Counselors,
            // DiagnosticCodes,
            AttendanceHistory,
            Tags,
            ServiceCodes,
            UploadOverlay,
            Loading,
            OfficeDropdown
        },
        data() {
            return {
                // clientId: this.$route.params.client_id,
                clientData: null,
                clientAllowed: false,

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
            goToPage(page) {
                this.$router.push(page);
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
            this.$forceUpdate(); //coming from other tab, you just created a new client, so history push is being funny.
        }
    };
</script>

<template>
    <div class="client-manager" :key="generatedKey" v-if="this.$store.state.clientOverview.loaded && this.findCounselor">
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
                        v-if="
                            $store.state.clientOverview && clientId !== 'new'
                                ? $store.state.clientOverview.loaded
                                : false
                        "
                        :alt="''"
                    />
                    <UploadOverlay
                        :kind="'client_license'"
                        :urlToUpload="`/clients/client-license?fileId=`"
                        :alt="''"
                        v-if="clientId == 'new'"
                        :notApiPersistent="true"
                        @returnLocalData="giveDataToGeneral"
                    />
                    <!-- <img src="assets/px/client-profile-placeholder.png" alt=""/> -->
                </div>
                <div class="client-info" v-if="clientId !== 'new'">
                    <div class="flex center">
                        <b>{{ $store.getters['clientOverview/clientFullName'] }}</b>
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
                        Visits attended:
                        {{ this.$store.state.clientOverview.attendance.attended }}
                    </div>
                    <div v-if="$store.state.clientOverview.attendance">
                        Visits missed:
                        {{ this.$store.state.clientOverview.attendance.missed }}
                    </div>
                </div>
            </div>
            <ClientManagerTabs :pages="tabPages" @action="goToPage" v-if="clientId !== 'new'" />
        </div>
        <div class="client-demographics flex">
            <div class="flex-6 left-col margin three-col-fields">
                <ClientDemographicsGeneral :client-id="clientId" @assignId="assignId" :newLicense="newLicense" />
                <ClientDemographicsSocial :client-id="clientId" @assignId="assignId" :newLicense="newLicense" />
                <ClientDemographicsWork :client-id="clientId" @assignId="assignId" :newLicense="newLicense" />
                <ClientReferralInfo :client-id="clientId" v-if="clientId !== 'new'" />
                <ClientMedicalInfo :client-id="clientId" v-if="clientId !== 'new'" />
            </div>
            <div class="flex-4">
                <ClientContactInfo
                    :client-id="useClientId()"
                    v-if="clientId !== 'new' && $store.getters['clientOverview/client']"
                />
                <ClientContactPermissions :client-id="clientId" @assignId="assignId" :newLicense="newLicense" />
                <ClientMandateInfo :client-id="clientId" v-if="clientId !== 'new'" />
            </div>
        </div>
    </div>
    <div v-else-if="this.$store.state.clientOverview.loaded && !this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
    <Loading v-else-if="this.$store.state.clientOverview.loaded == false" />
</template>
<script>
    import ClientReferralInfo from '@/components/client-manager/ClientReferralInfo';
    import ClientMandateInfo from '@/components/client-manager/ClientMandateInfo';
    import ClientMedicalInfo from '@/components/client-manager/ClientMedicalInfo';
    import ClientContactInfo from '@/components/client-manager/ClientContactInfo';
    import ClientContactPermissions from '@/components/client-manager/ClientContactPermissions';
    import ClientDemographicsGeneral from '@/components/client-manager/ClientDemographicsGeneral';
    import ClientDemographicsSocial from '@/components/client-manager/ClientDemographicsSocial';
    import ClientDemographicsWork from '@/components/client-manager/ClientDemographicsWork';
    import ClientManagerTabs from '@/components/client-manager/ClientManagerTabs.vue';
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import { generateId } from '@/util/genericUtilityFunctions';
    import Loading from '@/components/general/loading/loading.vue';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import { settings } from '@/util/apiRequests';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';

    export default {
        name: 'ClientDemographics',
        components: {
            ClientManagerActionsDropdown,
            ClientDemographicsGeneral,
            ClientDemographicsSocial,
            ClientDemographicsWork,
            ClientContactInfo,
            ClientContactPermissions,
            ClientReferralInfo,
            ClientMandateInfo,
            ClientMedicalInfo,
            ClientManagerTabs,
            UploadOverlay,
            Loading,
            OfficeDropdown
        },
        provide() {
            return {
                storeFileId: this.$store.state?.clientOverview?.clientData?.license_id
            };
        },
        // beforeRouteLeave(to, from) {
        //     console.log(to);
        //     console.log(from);
        //     // if (to.name == 'ClientDemographics') {
        //     //     console.log(to);
        //     //     console.log(from);
        //     //     // this.$router.push()
        //     // }
        // },
        data() {
            return {
                generatedKey: generateId(),
                newLicense: null,
                clientAllowed: false,
                // clientId: this.$route.params.client_id,
                // tabPages: [
                //     { label: 'Overview', name: 'ClientOverview', params: { record_id: this.useClientId() } },
                //     {
                //         label: 'Demographics',
                //         name: 'ClientDemographics',
                //         params: { client_id: this.useClientId() }
                //     },
                //     {
                //         label: 'Insurance',
                //         name: 'ClientInsurance',
                //         params: { client_id: this.useClientId() }
                //     },
                //     { label: 'Billing', name: 'ClientBilling', params: { client_id: this.useClientId() } },
                //     { label: 'Clinical', name: 'ClientClinical', params: { client_id: this.useClientId() } },
                //     {
                //         label: 'Documents & Forms',
                //         name: 'ClientDocuments',
                //         params: { client_id: this.useClientId() }
                //     }
                // ]
            };
        },
        computed: {
            tabPages() {
                return [
                    { label: 'Overview', name: 'ClientOverview', params: { record_id: this.clientId } },
                    {
                        label: 'Demographics',
                        name: 'ClientDemographics',
                        params: { client_id: this.clientId }
                    },
                    {
                        label: 'Insurance',
                        name: 'ClientInsurance',
                        params: { client_id: this.clientId }
                    },
                    { label: 'Billing', name: 'ClientBilling', params: { client_id: this.clientId } },
                    { label: 'Clinical', name: 'ClientClinical', params: { client_id: this.clientId } },
                    {
                        label: 'Documents & Forms',
                        name: 'ClientDocuments',
                        params: { client_id: this.clientId }
                    }
                ];
                //return
            },
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
                this.$forceUpdate();
            },
            assignId(id) {
                this.$router.replace({ params: { client_id: id } });
            },
            giveDataToGeneral(data) {
                this.newLicense = data;
            },
            useClientId() {
                if (this.clientId) {
                    return this.clientId;
                } else {
                    return this.$route.params.client_id;
                }
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
        },
        watch: {
            '$route.params.client_id': {
                handler(newVal, oldVal) {
                    this.$forceUpdate();
                    this.generatedKey = generateId();
                    //this.clientId = newVal;
                    // this.$forceUpdate();
                    // this.$store.state.clientOverview.loaded = false;
                    // this.$nextTick(() => {
                    //     this.$forceUpdate();
                    //     this.$store.state.clientOverview.loaded = true;
                    // }, 500);
                    // this.tabPages = this.tabPages.map((element) => {
                    //     let key = Object.keys(element.params).filter((thing) => thing.includes('id'))[0];
                    //     element.params[key] = newVal;
                    //     return element;
                    // });
                    // //This will allow the page to rerender despite
                    // //being the same route
                    // if (newVal == 'new' && oldVal !== null) {
                    //     this.$forceUpdate();
                    //     this.generatedKey = generateId();
                    // }
                }
            }
        }
    };
</script>

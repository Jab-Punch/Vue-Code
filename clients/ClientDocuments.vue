/* eslint-disable no-unused-vars */
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
            <ClientManagerTabs :pages="tabPages" @action="goToPage" />
        </div>

        <div class="flex">
            <div class="flex-1 left-col margin">
                <div class="card-block" id="completed-forms">
                    <!--                    <CompletedForms :overrideFilter="{ sort: { date: 'DESC' } }" />-->
                    <CompletedForms
                        :overrideFilter="{
                            filter: {
                                'files.client_id': [this.clientId],
                                file_type: ['pdf'],
                                form_data_id: ['!0'],
                                'files.filled_by_client': ['0'],
                                'signed_by_client': ['0'],
                            }
                        }"
                    />
                </div>
                <div class="card-block" id="drafted-forms">
                    <!--                    <DraftedForms :overrideFilter="{ sort: { date: 'DESC' } }" />-->
                    <DraftedForms
                        :overrideFilter="{
                            filter: {
                                'form_data.client_id': [this.clientId],
                                'filled_by_client' : ['0', 'NULL'] // do NOT touch -alex
                                // 'form_data.sign_in_portal': ['0', 'NULL'] // do NOT touch -alex
                                // ['form_data.signature_ids']: ['NULL'] // do NOT touch -alex
                            },
                            page: {
                                num_per_page: 100,
                                page_num: 1
                            }
                        }"
                    />
                </div>
                <div class="card-block" id="drafted-progress-notes">
                    <DraftedProgressNotes
                        :overrideFilter="{
                            filter: {
                                'notes.client_id': [this.clientId]
                                // ['form_data.signature_ids']: ['NULL'] // do NOT touch -alex
                            },
                            page: {
                                num_per_page: 100,
                                page_num: 1
                            }
                        }"
                    />
                </div>
                <div class="card-block" id="missing-documents">
                    <!--                    <MissingDocuments :overrideFilter="{sort: {date:'DESC'}}" />-->
                    <MissingDocuments
                        :overrideFilter="{
                            page: {
                                num_per_page: '100',
                                page_num: 1
                            },
                            filter: {
                                client_id: [this.clientId],
                                alert_type: ['missing_document']
                            }
                        }"
                    />
                </div>
            </div>
            <div class="flex-1">
                <div class="card-block" id="new-forms">
                    <NewForms />
                </div>
                <div class="card-block" id="client-to-sign-forms">
                    <ClientToSignForms />
                </div>
                <div class="card-block" id="client-misc-files">
                    <MiscFiles />
                </div>
                <div class="card-block" id="cliented-forms">
                    <ClientedForms
                        :overrideFilter="{
                            filter: {
                               'files.client_id': [this.clientId],
                                file_type: ['pdf'],
                                form_data_id: ['!0'],
                                'signed_by_client': ['1'],
                            },

                        }"
                    />
                    <!--                    <ClientedForms />-->
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
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import CompletedForms from '@/components/client-manager/CompletedForms';
    import MiscFiles from '@/components/client-manager/MiscFiles';
    import NewForms from '@/components/client-manager/NewForms';
    import ClientToSignForms from '@/components/client-manager/ClientToSignForms';
    import DraftedForms from '@/components/client-manager/DraftedForms';
    import AllForms from '@/components/client-manager/AllForms';
    import MissingDocuments from '@/components/client-manager/MissingDocuments';
    import Loading from '@/components/general/loading/loading.vue';
    import ClientedForms from '@/components/client-manager/ClientedForms';
    import DraftedProgressNotes from '@/components/client-manager/DraftedProgressNotes';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import { settings } from '@/util/apiRequests';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';

    export default {
        name: 'ClientDocuments',
        components: {
            ClientManagerActionsDropdown,
            ClientManagerTabs,
            UploadOverlay,
            CompletedForms,
            MiscFiles,
            NewForms,
            ClientToSignForms,
            DraftedForms,
            AllForms,
            MissingDocuments,
            Loading,
            OfficeDropdown,
            ClientedForms,
            DraftedProgressNotes
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
            async init() {
                if (this.$route.params.client_id && this.$route.params.client_id != 'new') {
                    this.$store.commit('persistClientId', parseInt(this.$route.params.client_id));
                    window.localStorage.setItem('last_client_id', parseInt(this.$route.params.client_id));
                    this.$store.state.current_client_id = parseInt(this.$route.params.client_id);
                }
                if (this.$route.params && this.$route.params.criteria_props) {
                    this.criteriaProps = this.$route.params.criteria_props;
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
            await this.init();
        }
    };
</script>

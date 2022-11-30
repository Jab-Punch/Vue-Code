<template>
    <div class="client-manager" v-if="this.$store.state.clientOverview.loaded && this.findCounselor">
        <div class="client-manager-header">
            <div class="client-profile-info flex">
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
                    <!-- <img src="@/assets/px/client-profile-placeholder.png" alt="client profile photo" title="client profile photo"> -->
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
                        Visits attended: {{ this.$store.state.clientOverview.attendance.attended }}
                    </div>
                    <div v-if="$store.state.clientOverview.attendance">
                        Visits missed: {{ this.$store.state.clientOverview.attendance.missed }}
                    </div>
                </div>
            </div>
            <ClientManagerTabs :pages="tabPages" @action="goToPage" />
        </div>

        <div class="client-overview">
            <div class="flex-7 left-col margin">
                <div class="overview-portal-header">
                    <button @click="addChartNote">+ Chart Note</button>
                    <button @click="sendEmail">Send Email</button>
                    <button @click="scheduleAppt">Schedule Now</button>
                    <div class="overview-client-portal nowrap">
                        <div @click="showPortalMenu = !showPortalMenu">Client Portal</div>
                        <div class="overview-client-portal-menu" v-if="showPortalMenu">
                            <ul>
                                <li v-if="clientHasPortal" @click="navigateToPortal">Go to Portal</li>
                                <li v-if="clientHasPortal" @click="sendPortalPasswordReset">
                                    Send Reset Password Link
                                </li>
                                <li v-if="unlockButton" @click="resetLogin" id="the_client_overview_unlock_button">Reset Login Attempts / Unlock Account</li>
                                <li v-if="!clientHasPortal" @click="sendPortalInvite">Send Link to Set Up Access</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="overview-client-timeline">
                    <h3>Client Timeline</h3>
                    <div class="overview-timeline-select-containers">
                        <div>
                            <input type="text" v-model="searchTextRaw" placeholder="Search" ref="searchInput" @blur="handleBlur" />
                        </div>
                        <Dropdown
                            name="timelineActivity"
                            id="client-timeline-activity"
                            :label="''"
                            :options="timelineActivity"
                            placeholder="Select Activity"
                            v-model="selectedTimelineActivity"
                            @change="(value) => adjustCriteria(value, 'activity')"
                        />
                        <Dropdown
                            name="timelimeOrder"
                            id="client-timeline-order"
                            :label="''"
                            :options="timelineOrder"
                            placeholder="Select Order"
                            v-model="selectedTimelineOrder"
                            @change="(value) => adjustCriteria(value, 'date_order')"
                        />
                        <span v-if="selectedTimelineOrder == 'custom'">
                            <ejs-daterangepicker
                                :placeholder="waterMark"
                                :openOnFocus="true"
                                :open="onPickerOpen"
                                @change="(args) => adjustCriteria(args, 'date_range')"
                            ></ejs-daterangepicker>
                        </span>
                    </div>
                    <div class="overview-timeline-chart" v-if="activities.length > 0">
                        <div
                            v-for="(activity, activityIndex) in activities"
                            :key="activityIndex"
                            class="bottom-15 flex"
                        >
                            <div class="chart-row-date weight-600 right-15">
                                <div v-if="activity.log_type == 'appointment'" class="flex appt">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>

                                <div v-if="activity.log_type == 'chart'" class="flex chart">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>

                                <div v-if="activity.log_type == 'forms'" class="flex forms">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>
                                <div v-if="activity.log_type == 'email'" class="flex email">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>
                                <div v-if="activity.log_type == 'payment'" class="flex payment">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>
                                <div v-if="activity.log_type == 'toxicology'" class="flex toxicology">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>
                                <div v-if="activity.log_type == 'progress'" class="flex progress">
                                    {{ dayjs(activity.dayt_create).format('MM/DD/YY') }}
                                </div>
                            </div>
                            <div class="chart-row-details">
                                <!-- All activity types and their potential different layouts. -->
                                <div v-if="activity.log_type == 'appointment'" class="appt">
                                    <div class="weight-600">
                                        Appointment{{ getMeta('appointment', activity, 'subtitle') }}
                                    </div>
                                    <div>{{ activity.description }}</div>
                                    <div v-if="activity.record_id && activity.page_id">
                                        <router-link
                                            :to="{
                                                name: 'Calendar',
                                                query: {
                                                    apptId: activity.record_id,
                                                    startTime: getMeta('appointment', activity, 'start_time')
                                                }
                                            }"
                                        >
                                            Details
                                        </router-link>
                                    </div>
                                </div>
                                <div v-if="activity.log_type == 'chart'" class="chart">
                                    <div class="weight-600">Chart Note</div>
                                    <div v-html="activity.description"></div>
                                    <div v-if="activity.record_id && activity.page_id">
                                        <span class="blue pointer" @click="addChartNote($event, activity.record_id)">Details</span>
                                        <!--                                        <a></a>-->
                                        <!--                                        <router-link :to="`/${activity.page}/${activity.record_id}`"-->
                                        <!--                                            >Details-->
                                        <!--                                        </router-link>-->
                                    </div>
                                </div>
                                <div v-if="activity.log_type == 'email'" class="email">
                                    <div class="weight-600">Email</div>
                                    <div>{{ activity.description }}</div>
                                    <div v-if="activity.record_id && activity.page_id">
                                        <router-link>Details</router-link>
                                    </div>
                                </div>
                                <div v-if="activity.log_type == 'payment'" class="payment">
                                    <div class="weight-600">Payment</div>
                                    <div>{{ activity.description }}</div>
                                    <div v-if="activity.record_id && activity.page_id">
                                        <router-link :to="`/${activity.page}/${activity.record_id}`"
                                            >Details
                                        </router-link>
                                    </div>
                                </div>
                                <div v-if="activity.log_type == 'toxicology'" class="toxicology">
                                    <div class="weight-600">Toxicology Report</div>
                                    <div>{{ activity.description }}</div>
                                    <div
                                        v-if="
                                            activity.record_id &&
                                                activity.page_id &&
                                                getMeta('progress', activity, 'signed') !== 'signing' &&
                                                getMeta('progress', activity, 'complete') !== 'complete'
                                        "
                                    >
                                        <router-link :to="`/${activity.page.replace('portal-', '')}/${activity.record_id}`"
                                        >Details
                                        </router-link>
                                    </div>
                                    <div v-if="activity.record_id && getMeta('forms', activity, 'signed') == 'signing'">
                                        <a href="" @click.prevent="getFile({ id: activity.record_id })">
                                            Details
                                        </a>
                                    </div>
<!--                                    <div v-if="activity.record_id && activity.page_id">-->
<!--                                        <router-link :to="`/${activity.page}/${activity.record_id}`"-->
<!--                                            >Details-->
<!--                                        </router-link>-->
<!--                                    </div>-->
                                </div>
                                <div v-if="activity.log_type == 'progress'" class="progress">
                                    <div class="weight-600">Progress Note</div>
                                    <div>{{ activity.description }}</div>
                                    <div
                                        v-if="
                                            activity.record_id &&
                                                activity.page_id &&
                                                getMeta('progress', activity, 'signed') !== 'signing' &&
                                                getMeta('progress', activity, 'complete') !== 'complete'
                                        "
                                    >
                                        <router-link :to="`/${activity.page}/${activity.record_id}`"
                                            >Details
                                        </router-link>
                                    </div>
                                    <div
                                        v-if="
                                            activity.record_id && getMeta('progress', activity, 'signed') == 'signing'
                                        "
                                    >
                                        <a href="" @click.prevent="getFile({ id: activity.record_id })">
                                            Details
                                        </a>
                                    </div>
                                    <div
                                        v-if="
                                            activity.record_id &&
                                                getMeta('progress', activity, 'complete') == 'complete'
                                        "
                                    >
                                        <a href="" @click.prevent="getFile({ id: activity.record_id })">
                                            Details
                                        </a>
                                    </div>
                                </div>
                                <div v-if="activity.log_type == 'forms'" class="forms">
                                    <div class="weight-600">{{ getMeta('forms', activity, 'subtitle') }}</div>
                                    <div>{{ activity.description }}</div>
                                    <div
                                        v-if="
                                            activity.record_id &&
                                                activity.page_id &&
                                                getMeta('progress', activity, 'signed') !== 'signing' &&
                                                getMeta('progress', activity, 'complete') !== 'complete'
                                        "
                                    >
                                        <router-link :to="`/${activity.page.replace('portal-', '')}/${activity.record_id}`"
                                            >Details
                                        </router-link>
                                    </div>
                                    <div v-if="activity.record_id && getMeta('forms', activity, 'signed') == 'signing'">
                                        <a href="" @click.prevent="getFile({ id: activity.record_id })">
                                            Details
                                        </a>
                                    </div>
                                    <div
                                        v-if="
                                            activity.record_id && getMeta('forms', activity, 'complete') == 'complete'
                                        "
                                    >
                                        <a href="" @click.prevent="getFile({ id: activity.record_id })">
                                            Details
                                        </a>
                                    </div>
                                </div>
                                <!--  End of potential activity types and their layouts. -->
                            </div>
                        </div>
                    </div>
                    <div class="overview-timeline-chart" v-else>No client activity to date.</div>
                </div>
            </div>

            <div class="flex-3">
                <div class="overview-memo" v-if="clientData">
                    <div class="overview-memo-header">
                        <h3 class="margin-0">Office Memo</h3>
                        <div><span>Not part of the client's medical record</span></div>
                        <div class="edit-icon" @click="memoEdit = !memoEdit">
                            <span class="material-icons-outlined">edit</span>
                        </div>
                        <div class="delete-icon" @click="deleteMemo()">
                            <span class="material-icons-outlined">delete</span>
                        </div>
                    </div>
                    <div class="overview-memo-text-container">
                        <p v-if="!memoEdit" v-text="clientData.memo"></p>
                        <textarea v-if="memoEdit" v-model="clientData.memo" />
                        <div>
                            <button class="primary top-10" type="button" @click="editMemo()" v-if="memoEdit">Save</button>
                        </div>
                    </div>
                </div>
                <div class="overview-appointments">
                    <h3>Upcoming Appointments</h3>
                    <div v-for="(appointment, appointmentIndex) in appointments" :key="appointmentIndex">
                        <router-link
                            :to="{
                                name: 'Calendar',
                                query: { apptId: appointment.appt_id, startTime: appointment.dayt_appt_start }
                            }"
                            >{{ formatDateWithoutHours(appointment.dayt_appt_start) }} -
                            {{ appointment.appointment }}
                        </router-link>
                    </div>
                    <div v-if="appointments.length == 0">No upcoming appointments yet.</div>
                    <div class="top-15">
                        <router-link class="text-link" :to="{ name: 'Calendar' }"
                            >View Full Calendar <span class="material-icons-outlined">arrow_right_alt</span>
                        </router-link>
                    </div>
                </div>
                <div class="overview-billing">
                    <div class="flex space-between">
                        <h3>Insurance</h3>
                        <div class="">
                                <span
                                    class="font-16 right-5"
                                    :class="(clientInsurance) ? 'dark-green' : 'red-text'"
                                >
                                    <b>{{ (clientInsurance) ? 'Active' : 'Inactive' }}</b>
                                </span>
                        </div>
                    </div>
                    <div>Last verified on: {{ (clientInsuranceVerified && clientInsuranceVerified != 'Invalid Date') ? clientInsuranceVerified : '' }}</div>
                </div>
                <div class="overview-billing">
                    <div class="flex space-between">
                        <h3>Billing Overview</h3>
                        <div class="" v-if="overviewBalance">
                            <span
                                class="font-12 right-5"
                                :class="overviewBalance.title == 'Credit' ? 'green-text' : 'red-text'"
                                >{{ overviewBalance.title }}</span
                            >
                            <span class="font-16" :class="overviewBalance.title == 'Credit' ? 'green-text' : 'red-text'"
                                ><b>{{ overviewBalance.balance }}</b></span
                            >
                        </div>
                    </div>
                    <div v-if="billings.length > 0">
                        <div v-for="(billing, billingIndex) in billings" :key="billingIndex">
                            {{ formatDateWithoutHours(billing.date) }}- {{ billing.type }}
                            {{ getCurrency(billing.payment) }}
                        </div>
                    </div>
                    <div v-else>No client transactions</div>
                    <div class="top-15">
                        <router-link
                            class="view-more text-link"
                            :to="{ name: 'ClientBilling', params: { client_id: this.record_id } }"
                            >View more or make payment <span class="material-icons-outlined">arrow_right_alt</span>
                        </router-link>
                    </div>
                </div>
                <div class="overview-client-files">
                    <h3>Client Files</h3>
                    <div class="grid">
                        <div class="file-name-wrapper x-scroll">
                            <div v-for="(file, fileIndex) in files" :key="fileIndex">
                                <a href="" @click.prevent="getFile(file)"
                                >{{ formatDateWithoutHours(file.dayt_create) }}- {{ file.file_name }}</a
                                >
                            </div>
                        </div>
                    </div>
                    <div v-if="files.length == 0">No client files yet.</div>
                    <div class="top-15">
                        <router-link
                            :to="{
                                name: 'Documents',
                                params: {
                                    overrideFilter: {
                                        sort: {},
                                        search: {},
                                        filter: { 'files.client_id': [String(this.record_id)] },
                                        page: { num_per_page: '10', current_page: 1, page_num: 1 },
                                        column: []
                                    }
                                }
                            }"
                            class="view-more text-link"
                        >
                            View all <span class="material-icons-outlined">arrow_right_alt</span>
                        </router-link>
                    </div>
                </div>
                <div class="overview-files-shared">
                    <h3>Shared Files with Client</h3>
                    <div class="grid">
                        <div class="file-name-wrapper x-scroll">
                            <div v-for="(sharedFile, sharedFileIndex) in shared_files" :key="sharedFileIndex">
                                <a href="" @click.prevent="getFile(sharedFile)"
                                    >{{ sharedFile.dayt_create }}- {{ sharedFile.file_name }}</a
                                >
                            </div>
                        </div>
                    </div>
                    <div v-if="shared_files.length == 0">No shared files yet.</div>
                    <div class="top-15">
                        <router-link
                            :to="{
                                name: 'Documents',
                                params: {
                                    overrideFilter: {
                                        sort: {},
                                        search: {},
                                        filter: {
                                            'files.client_id': [String(this.record_id)],
                                            shared_to_portal: [String(1)]
                                        },
                                        page: { num_per_page: '10', current_page: 1, page_num: 1 },
                                        column: []
                                    }
                                }
                            }"
                            class="view-more text-link"
                        >
                            View all <span class="material-icons-outlined">arrow_right_alt</span>
                        </router-link>
                    </div>
                </div>
                <div class="overview-files-shared">
                    <h3>Forms Auto-Shared To Client</h3>
                    <div class="">
                        <div v-for="(sharedForm, sharedFormIndex) in auto_portal_forms" :key="sharedFormIndex">
                            {{ sharedForm.title }}
                        </div>
                    </div>
                </div>
            </div>
            <NewChartNoteModal
                v-if="clientData"
                :client_id="clientData.id"
                :open="showChartNote"
                :note_id="currentChartNoteId"
                @closeModal="
                    showChartNote = false;
                    currentChartNoteId = null;
                "
            />
            <EmailModal
                v-if="clientData"
                :client_id="clientData.id"
                :client_guardian_email="clientData.guardian_email"
                :open="showEmailModal"
                @closeModal="showEmailModal = false"
            />
            <!-- @saved="getTimeline" -->
        </div>
    </div>
    <div v-else-if="this.$store.state.clientOverview.loaded && !this.findCounselor">
        You do not have permission to view the charts of this client.
    </div>
    <Loading v-else-if="this.$store.state.clientOverview.loaded == false" />
</template>

<script>
    import Vue from 'vue';
    import Dropdown from '@/components/general/validatedInputs/Dropdown.vue';
    import dayjs from '@/util/dayjs';
    import { clients, file, appts, logs, documents, ledger, auth, settings } from '@/util/apiRequests';
    import { openPdf } from '@/util/pdf';
    import { openImage } from '@/util/image';
    import ClientManagerTabs from '@/components/client-manager/ClientManagerTabs.vue';
    import { timelineActivity, timelineOrder } from '@/util/options';
    import { getCurrency } from '@/util/getCurrency';
    import {
        // base64ToArrayBuffer,
        saveFile
    } from '@/util/genericUtilityFunctions';
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import { DateRangePickerPlugin } from '@syncfusion/ej2-vue-calendars';
    import NewChartNoteModal from '@/components/general/modals/NewChartNoteModal';
    import EmailModal from '@/components/general/modals/EmailModal.vue';
    import Loading from '@/components/general/loading/loading.vue';
    import OfficeDropdown from '@/components/general/validatedInputs/OfficeDropdown';
    import { debounce } from 'lodash';
    import ClientManagerActionsDropdown from '@/components/client-manager/ClientManagerActionsDropdown';

    Vue.use(DateRangePickerPlugin);

    export default {
        name: 'ClientOverview',
        components: { ClientManagerActionsDropdown, Dropdown, ClientManagerTabs, UploadOverlay, NewChartNoteModal, EmailModal, Loading, OfficeDropdown },
        props: {
            record_id: [String, Number]
        },
        data() {
            return {
                searchTextRaw: '',
                loading: true,
                getCurrency,
                criteria: { page: { num_per_page: '10000', page_num: 1 } },
                timelineActivity,
                timelineOrder,
                selectedTimelineActivity: null,
                selectedTimelineOrder: null,
                selectedTimelineOrderCustom: null,
                memoEdit: false,
                logType: null,
                showPortalMenu: false,
                showChartNote: false,
                showEmailModal: false,
                activities: [],
                appointments: [],
                billings: [],
                balanceData: {},
                files: [],
                shared_files: [],
                auto_portal_forms: [],
                clientData: {login_locked: false, tym_last_failed: null},
                currentChartNoteId: null,
                clientInsurance: false,
                clientInsuranceVerified: null,
                waterMark: 'Select a Range',
                dayjs: dayjs,
                clientAllowed: false,
                tabPages: [
                    { label: 'Overview', name: 'ClientOverview', params: { record_id: this.$route.params.record_id } },
                    {
                        label: 'Demographics',
                        name: 'ClientDemographics',
                        params: { client_id: this.$route.params.record_id }
                    },
                    {
                        label: 'Insurance',
                        name: 'ClientInsurance',
                        params: { client_id: this.$route.params.record_id }
                    },
                    { label: 'Billing', name: 'ClientBilling', params: { client_id: this.$route.params.record_id } },
                    { label: 'Clinical', name: 'ClientClinical', params: { client_id: this.$route.params.record_id } },
                    {
                        label: 'Documents & Forms',
                        name: 'ClientDocuments',
                        params: { client_id: this.$route.params.record_id }
                    }
                ]
            };
        },
        computed: {
            overviewBalance() {
                if (
                    (this.balanceData?.credit || this.balanceData?.credit == 0) &&
                    (this.balanceData?.owes || this.balanceData?.owes == 0)
                ) {
                    let balance = this.balanceData.credit - this.balanceData.owes;
                    switch (Math.sign(balance)) {
                        case 1:
                            balance = { title: 'Credit', balance: getCurrency(balance) };
                            break;
                        case -1:
                            balance = { title: 'Owes', balance: getCurrency(Math.abs(balance)) };
                            break;
                        case 0:
                            balance = { title: 'Owes', balance: getCurrency(balance) };
                            break;
                        default:
                            break;
                    }
                    return balance;
                    // return getCurrency(this.balanceData.credit - this.balanceData.owes);
                    //return "";
                }
                return null;
            },
            clientId() {
                return this.$store.state.current_client_id;
                //return this.$store.state.clientData.
            },
            clientHasPortal() {
                return Boolean(this.clientData?.has_portal_acct);
            },
          unlockButton(){
            const { tym_last_failed, login_locked} = this.clientData

            let display = false

            const usr = this.$store.state.user;

            if (usr.role_id !== 1){
              display = false
            } else if (!tym_last_failed){
              display =  false
            } else if (dayjs().isAfter(dayjs(tym_last_failed).add(1,'day'))){
              display = false
            } else if (login_locked){
              display = true
            }

            return display

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
            handleBlur(e) {
                if (this.searchTextRaw || e.relatedTarget?.classList?.contains('e-focus')) {
                    this.$refs.searchInput?.focus();
                }
            },
            async getFile(f) {
                if (f.id) {
                    if (f.id) {
                        let result = await this.$api.get(file.getFile(f.id));
                        if (result.data.file.file_type == 'pdf' || result.data.file.file_type == '.pdf') {
                            await openPdf(result.data?.file?.Body, result.data?.file?.file_name);
                        } else if (result.data.file.originalContentType.includes('image')) {
                            openImage(result.data?.file?.Body);
                        } else {
                            saveFile(
                                result.data?.file?.Body,
                                result.data?.file?.originalContentType,
                                result.data?.file?.file_name
                            );
                        }
                    }
                }
            },
            getMeta(type, activity, property) {
                let string = '';
                if (type == 'forms') {
                    if (activity.metadata) {
                        try {
                            if (property == 'subtitle') {
                                let subtitle = JSON.parse(activity.metadata)?.subtitle ?? '';
                                if (subtitle) {
                                    string = subtitle;
                                }
                            }
                            if (property == 'signed') {
                                let signed = JSON.parse(activity.metadata)?.signed ?? '';
                                if (signed) {
                                    string = 'signing';
                                }
                            }
                            if (property == 'complete') {
                                let complete = JSON.parse(activity.metadata)?.complete ?? '';
                                if (complete) {
                                    string = 'complete';
                                }
                            }
                        } catch (error) {
                            //
                        }
                    }
                }
                if (type == 'appointment') {
                    if (activity.metadata) {
                        try {
                            if (property == 'subtitle') {
                                let subtitle = JSON.parse(activity.metadata)?.subtitle ?? '';
                                if (subtitle) {
                                    string = ' - ' + subtitle;
                                }
                            }
                            if (property == 'start_time') {
                                let start_time = JSON.parse(activity.metadata)?.start_time ?? '';
                                string = start_time;
                            }
                        } catch (error) {
                            //
                        }
                    }
                }
                if (type == 'progress') {
                    if (activity.metadata) {
                        try {
                            if (property == 'signed') {
                                let signed = JSON.parse(activity.metadata)?.signed ?? '';
                                if (signed) {
                                    string = 'signing';
                                }
                            }
                            if (property == 'complete') {
                                let complete = JSON.parse(activity.metadata)?.complete ?? '';
                                if (complete) {
                                    string = 'complete';
                                }
                            }
                        } catch (error) {
                            //
                        }
                    }
                }
                if (type == 'toxicology') {
                    if (activity.metadata) {
                        try {
                            if (property == 'subtitle') {
                                let subtitle = JSON.parse(activity.metadata)?.subtitle ?? '';
                                if (subtitle) {
                                    string = subtitle;
                                }
                            }
                            if (property == 'signed') {
                                let signed = JSON.parse(activity.metadata)?.signed ?? '';
                                if (signed) {
                                    string = 'signing';
                                }
                            }
                            if (property == 'complete') {
                                let complete = JSON.parse(activity.metadata)?.complete ?? '';
                                if (complete) {
                                    string = 'complete';
                                }
                            }
                        } catch (error) {
                            //
                        }
                    }
                }
                return string;
            },
            addChartNote(e, id) {
                this.showChartNote = true;
                this.currentChartNoteId = id;
                // this.$router.push('');
            },
            activityMetaData(activity) {
                [].includes(activity);
            },
            sendEmail() {
                this.showEmailModal = true;
                // this.$router.push('');
            },
            adjustCriteria(value, type) {
                if (type == 'search') {
                    this.criteria.search = value;
                    this.getTimeline();
                }
                if (type == 'activity') {
                    this.criteria.filter = { client_id: [String(this.record_id)] };
                    if (value == 'all') {
                        value = null;
                    }
                    this.logType = value;
                    if (value || value == null) {
                        this.getTimeline();
                    }
                } else if (type == 'date_order') {
                    if (value == 'custom') {
                        //this.criteria.date_range
                        delete this.criteria?.sort;
                    } else {
                        this.criteria.sort = { 'logs.dayt_create': value };
                        delete this.criteria?.date_range;
                        if (value) {
                            this.getTimeline();
                        }
                    }
                } else if (type == 'date_range') {
                    this.criteria.date_range = {
                        daytcol2range: 'logs.dayt_create',
                        start_date: value.value[0].toISOString(),
                        end_date: value.value[1].toISOString()
                    };

                    this.getTimeline();
                }
            },
            editMemo() {
                try {
                    this.$api.put(clients.updateRecord(this.record_id), { client: { memo: this.clientData?.memo } });
                    // this.$api.put(clients.saveMemo(this.record_id), {memo: this.clientData?.memo})
                } catch (error) {
                    this.$toasted.error('Could not update memo');
                }
                this.memoEdit = false;
            },
            deleteMemo() {
                this.clientData.memo = '';
                try {
                    this.$api.put(clients.updateRecord(this.record_id), { client: { memo: this.clientData?.memo } });
                } catch (error) {
                    this.$toasted.error('Could not update memo');
                }
                this.memoEdit = false;
            },
            goToPage(page) {
                this.$router.push(page);
            },
            formatDateWithoutHours(dayt) {
                return dayjs(dayt).format('MM/DD/YY');
            },
            async getClient() {
                try {
                    const res = await this.$api.get(clients.getClient(this.record_id));
                    this.clientData = res.data?.[0];
                } catch (error) {
                    this.$cl(error);
                }
            },
            async getAppointments() {
                try {
                    // const res = await this.$api.post(appts.getList(), {
                    //     criteria: {
                    //         filter: { client_id: [String(this.record_id)]},
                    //         sort: { dayt_appt_start: 'Descending' },
                    //     },
                    // });

                    const res = await this.$api.get(appts.getClientAppts(), {
                        params: {
                            u: this.record_id,
                            //Date is today at midnight
                            //  s:  dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ssZ'),
                            s: dayjs(new Date(new Date().setHours(0, 0, 0, 0))).format('YYYY-MM-DDTHH:mm:ssZ')
                        }
                    });

                    if (res.data?.length > 0) {
                        this.appointments = res.data;
                        this.appointments = this.appointments
                            .filter((element) => {
                                try {
                                    if (dayjs(element.dayt_appt_start).isAfter(dayjs(new Date()))) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } catch (error) {
                                    return false;
                                }
                            })
                            .sort((a, b) => (dayjs(a.dayt_appt_start).isAfter(dayjs(b.dayt_appt_start)) ? 1 : -1))
                            .slice(0, 5);
                    }
                } catch (err) {
                    this.$cl(err);
                    this.$toasted.error('Could not retrieve list of appointments');
                }
            },
            async getSharedFiles() {
                try {
                    let criteria = {
                        filter: { 'files.client_id': [String(this.record_id)], shared_to_portal: [String(1)] },
                        sort: { ['files.dayt_create']: 'Descending' }
                    };
                    const res = await this.$api.post(documents.getList(), { criteria: criteria });
                    if (res.data?.rows?.length > 0) {
                        this.shared_files = res.data.rows.slice(0,5);
                    }
                } catch (err) {
                    this.$toasted.error('Could not retrieve list of shared files');
                }
            },
            async getAutoPortalForms() {
                const res = await this.$api.get(`/form_data/get-client-forms2complete/${this.record_id}`);
                if (res.data.rows) {
                    this.auto_portal_forms = [];
                    for (const row of res.data.rows) {
                        let form = {
                            component_name: row.component_name,
                            record_id: 0,
                            title: row.menu_txt
                        }
                        this.auto_portal_forms.push(form)
                    }
                }
            },
            async getClientFiles() {
                try {
                    let criteria = {
                        filter: { 'files.client_id': [String(this.record_id)] },
                        sort: { ['files.dayt_create']: 'Descending' }
                    };
                    const res = await this.$api.post(documents.getList(), { criteria: criteria });
                    if (res.data?.rows?.length > 0) {
                        this.files = res.data.rows.slice(0, 5);
                    }
                } catch (err) {
                    this.$cl('error');
                    //
                }
                // try {
                //     const res = await this.$api.post(clients.getClientFiles(this.record_id));

                //     this.files = res.data.files.slice(0, 5);
                // } catch (err) {
                //     this.$toasted.error('Could not retrieve list of client files');
                // }
            },
            async getTimeline() {
                try {
                    const res = await this.$api.post(logs.getActivityTimeline(), {
                        criteria: this.criteria,
                        log_type: this.logType
                    });
                    this.activities = res.data.rows.filter((e) => {
                        if (e?.log_type && e?.record_id) {
                            return true;
                        }
                        return false;
                    });

                } catch (err) {
                    //
                }
                // try {
                //     const res = await this.$api.post(logs.getList(), {
                //         criteria: this.criteria,
                //         log_type: this.logType,
                //     });
                //     this.activities = res.data.rows;
                //     this.$cl(res.data);
                // } catch (err) {
                //     //
                // }
            },
            async getInsurance() {
                try {
                    const response = await this.$api.get(`/insurance/primary_verification/${this.record_id}`);
                    if (response && response.data && response.data.info.length) {
                        this.clientInsurance = response.data.info[0].policy_active;
                        this.clientInsuranceVerified = dayjs(response.data.info[0].date_verified).format('MM/DD/YYYY');
                    }
                } catch (err) {
                    //
                }
            },
            onPickerOpen(args) {
                args.popup.position = { X: 'left', Y: 'bottom' };
            },
            async getQuickBillingOverview() {
                let response = await this.$api.get(ledger.getTransactionQuickList(this.record_id));
                this.billings = response.data ? response.data.slice(0, 5) : [];
                let { data } = await this.$api.get(ledger.getClientBalance(this.record_id));
                this.balanceData = data;
            },
            async scheduleAppt() {
                // Checks if user is inactive. If they aren't, activeClientList is
                // updated and used to autofill client field on calendar appt.
                if (this.clientData.status.toLowerCase() === "inactive") {
                    this.$toasted.error("Cannot schedule an appointment for an inactive client.");
                } else {
                    await this.$store.dispatch('scheduler/getActiveClientList');
                    await this.$router.push({
                        name: 'Calendar',
                        params: {clientId: this.clientData.id, apptType: 'Individual' }
                    });
                }
            },
            async navigateToPortal() {
                this.showPortalMenu = false;

                const res = await this.$api.get(clients.navigateToPortal(this.clientData.id));

                if (res.status < 200 || res.status >= 300) {
                    this.$toasted.error('Could not retrieve log in token for portal access');
                } else {
                    window.open(res.data.link);
                }
            },
            debounceSearch: debounce(function() {
                if (this.searchTextRaw) {
                    this.adjustCriteria({ like_all: this.searchTextRaw }, 'search');
                } else {
                    this.adjustCriteria({}, 'search');
                }
            }, 500),
            async sendPortalPasswordReset() {
                const res = await this.$api.post(clients.resetPortalPassword(), {
                    clientId: this.clientData?.id
                });

                if (res.status < 200 || res.status >= 300) {
                    this.$toasted.error('Failed to send password reset. Please try again later.');
                    this.showPortalMenu = false;
                } else {
                    this.$toasted.success('Sent password reset email to client');
                    this.showPortalMenu = false;
                }
            },
            async sendPortalInvite() {
                const res = await this.$api.post(clients.inviteToPortal(), {
                    clientId: this.clientData?.id
                });

                if (res.status < 200 || res.status >= 300) {
                    this.$toasted.error('Failed to send portal invite. Please try again later.');
                    this.showPortalMenu = false;
                } else {
                    this.$toasted.success('Send portal invite to client');
                    this.showPortalMenu = false;
                    await this.getClient();
                }
            },
          async resetLogin (){
            try {
              await this.$api.patch(auth.resetClient(), {clientId: this.clientData.id});
              this.$toasted.success('Successfully reset logins.')
              await this.getClient()
            } catch (err) {
              this.$toasted.error('Failed to reset logins. Please try again later.')
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
            // this.$forceUpdate();//coming from other tab, you just created a new client, so history push is being funny.

            await this.checkClientAllowed();
            if (this.record_id && this.record_id != 'new') {
                this.$store.commit('persistClientId', parseInt(this.record_id));
                window.localStorage.setItem('last_client_id', parseInt(this.record_id));
                this.$store.state.current_client_id = parseInt(this.record_id);
            }
            //Descending
            this.criteria.sort = { 'logs.dayt_create': 'Descending' };
            this.criteria.filter = { client_id: [String(this.record_id)] };
            // this.logType = 'email';
            await Promise.all([
                this.getAppointments(),
                this.getSharedFiles(),
                this.getAutoPortalForms(),
                this.getClientFiles(),
                this.getClient(),
                this.getTimeline(),
                this.getInsurance(),
                this.getQuickBillingOverview()
            ]);
            this.loading = false;

            //    try {
            //         const res = await this.$api.get(appts.getClientAppts(), {
            //             params: {
            //                 u: this.clientData.id,
            //                 //Date is today at midnight
            //                 //  s:  dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ssZ'),
            //                 s:  dayjs(new Date(new Date().setHours(0,0,0,0))).format('YYYY-MM-DDTHH:mm:ssZ'),
            //             },
            //         });
            //         let test = res.data.map((element) => {
            //             return dayjs(element.dayt_appt_start).format('MM-DD-YY');
            //             //return dayjs(element.dayt_appt_start).utc().format();
            //         });
            //         this.$cl(test);
            //    }catch(err){
            //        this.$cl(err);
            //    }
        },
        watch: {
            searchTextRaw() {
                this.debounceSearch();
            },
            showChartNote() {
                if (this.showChartNote == false) {
                    this.getTimeline();
                }
            },
            showEmailModal() {
                if (this.showEmailModal== false) {
                    this.getTimeline();
                }
            }
        }
    };
</script>

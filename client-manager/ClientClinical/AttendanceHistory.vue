<template>
    <div>
        <!-- <chirp-list /> -->
        <div class="clinical-attendance-history">
            <h3>Attendance History</h3>
            <div>
                <span class="dark-text weight-600">Date</span>
                <span class="dark-text weight-600">Time</span>
                <span class="dark-text weight-600">Type</span>
                <span class="dark-text weight-600">Status</span>
            </div>
            <div v-for="(appt, apptKey) in preview_data" :key="apptKey">
                <router-link
                    :to="{
                                name: 'Calendar',
                                query: { apptId: appt.id, startTime: appt.dayt_appt_start }
                            }"
                >{{ formatDateWithoutHours(appt.dayt_appt_start) }}
                </router-link>
                <span v-text="formatDateWithJustHours(appt.dayt_appt_start)"></span>
                <span v-text="appt.appt_type"></span>
                <span v-text="appt.appt_status ? appt.appt_status : 'Not Updated'"></span>
            </div>
        </div>
        <BaseModal class="attendance-modal" @close="showAttendanceModal = !showAttendanceModal">
            <template #control="{ open }" class="top-20">
                <span class="blue text-button" @click="open">See All</span>
            </template>

            <template #content="{ close }">
                <div
                    class="modal-attendance-history"
                    style="position: sticky; top: 0px; left: 0px; right: 0px; z-index: 99; background: white; text-align: right;"
                >
                    <button class="bottom-20 pad-0 no-bg close" @click="close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div>
                    <div class="clinical-attendance-history">
                        <h3>Attendance History</h3>
                        <div>
                            <span class="dark-text weight-600">Date</span>
                            <span class="dark-text weight-600">Time</span>
                            <span class="dark-text weight-600">Type</span>
                            <span class="dark-text weight-600">Status</span>
                        </div>
                        <hr class="top-15 bottom-15" />
                        <div v-for="(appt, apptKey) in row_data" :key="apptKey">
                            <router-link :to="
                            {name: 'Calendar',
                            query: {apptId: appt.id, startTime: appt.dayt_appt_start}}"
                            ><span v-text="formatDateWithoutHours(appt.dayt_appt_start)"></span>
                            </router-link>
                            <span v-text="formatDateWithJustHours(appt.dayt_appt_start)"></span>
                            <span v-text="appt.appt_type"></span>
                            <span v-text="appt.appt_status ? appt.appt_status : 'Not Updated'"></span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseModal>

        <!-- <router-link to="enter_name_here">See All</router-link> -->
    </div>
</template>

<script>
    // import ChirpList from '../../general/list/ChirpList.vue';
    import { appts } from '@/util/apiRequests';
    import BaseModal from '../../general/modals/BaseModal.vue';
    import dayjs from '@/util/dayjs';

    export default {
        components: { BaseModal },
        // components: { ChirpList },

        props: {
            client_id: {}
        },
        data() {
            return {
                row_data: [],
                preview_data: [],
                showAttendanceModal: false
            };
        },
        methods: {
            formatDateWithoutHours(dayt) {
                return dayjs(dayt).format('MM/DD/YY');
            },
            formatDateWithJustHours(dayt) {
                return dayjs(dayt).format('h:mma');
            },
            async getApptHistory() {
                const res = await this.$api.get(appts.getApptHistory(this.client_id, dayjs().format('YYYY-MM-DD')));

                if (res.status >= 300) {
                    this.$toasted.error('Failed to retrieve attendance history');
                } else {
                    this.row_data = res.data;
                    this.preview_data = res.data.slice(0, 5);
                }
            }
        },
        async created() {
            await this.getApptHistory();
        }
    };
</script>

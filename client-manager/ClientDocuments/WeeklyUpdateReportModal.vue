<template>
    <NoButtonModal :open="open" @close.stop="onModalClose">
        <h1>Weekly Update Report</h1>
        <label for="">Select Report Date Range</label>
        <ejs-daterangepicker
            ref="dp"
            placeholder="Select Report Date Range"
            :allowEdit="false"
            :openOnFocus="true"
            :open="onPickerOpen"
            :close="onPickerClose"
            v-model="dateRange"
        />
        <div class="align-right">
            <button class="secondary" @click="onModalClose">Cancel</button>
            <button class="primary" @click="redirectToReport" :disabled="dateRange === null">Create</button>
        </div>
    </NoButtonModal>
</template>

<script>
    import Vue from 'vue';
    import { DateRangePickerPlugin } from '@syncfusion/ej2-vue-calendars';
    import NoButtonModal from '@/components/general/modals/NoButtonModal';

    Vue.use(DateRangePickerPlugin);

    export default {
        name: 'WeeklyUpdateReportModal',
        components: { NoButtonModal },
        props: {
            clientId: {
                type: [Number, String],
                required: true
            },
            open: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                pickerIsOpen: false,
                dateRange: [
                    this.getSundayOfCurrentWeek()
                    ,this.getSaturdayOfCurrentWeek()
                ]
            };
        },
        computed: {
            startDate() {
                return this.dateRange ? encodeURIComponent(this.dateRange[0].toISOString()) : null;
            },
            endDate() {
                return this.dateRange ? encodeURIComponent(this.dateRange[1].toISOString()) : null;
            }
        },
        methods: {
            onPickerOpen(args) {
                args.popup.position = { X: 'left', Y: 'bottom' };
                this.pickerIsOpen = true;
            },
            onPickerClose() {
                setTimeout(() => {
                    this.pickerIsOpen = false;
                }, 100);
            },
            onModalClose() {
                if (!this.pickerIsOpen) {
                    this.$emit('close');
                    this.clearDates();
                }
            },
            clearDates() {
                this.dateRange = [
                    this.getSundayOfCurrentWeek()
                    ,this.getSaturdayOfCurrentWeek()
                ];
            },
            getSundayOfCurrentWeek() {
                const today = new Date();
                const first = today.getDate() - today.getDay() + 1 - 7;
                const last = first - 1;

                let sunday = new Date(today.setDate(last));
                sunday = new Date(sunday.setHours(0));
                sunday = new Date(sunday.setMinutes(0));
                sunday = new Date(sunday.setSeconds(0));

                return sunday;
            },
            getSaturdayOfCurrentWeek() {
                const today = new Date();
                const first = today.getDate() - today.getDay() + 1 - 7;
                const last = first + 5;

                let saturday = new Date(today.setDate(last));
                saturday = new Date(saturday.setHours(23));
                saturday = new Date(saturday.setMinutes(59));
                saturday = new Date(saturday.setSeconds(59));

                return saturday;
            },
            async redirectToReport() {
                await this.$router.push({
                    name: 'WeeklyUpdateReport',
                    params: {
                        record_id: 0,
                    },
                    /*props: {
                        startDate: this.startDate, endDate: this.endDate
                    },*/
                    query: {
                        client_id: this.clientId, startDate: this.startDate, endDate: this.endDate
                    }
                });
            }
        },
        async mounted() {
            this.getSundayOfCurrentWeek();
            this.getSaturdayOfCurrentWeek();
        }
    };
</script>

<style scoped>
    @import '~@syncfusion/ej2-base/styles/material.css';
    @import '~@syncfusion/ej2-buttons/styles/material.css';
    @import '~@syncfusion/ej2-inputs/styles/material.css';
    @import '~@syncfusion/ej2-popups/styles/material.css';
    @import '~@syncfusion/ej2-lists/styles/material.css';
    @import '~@syncfusion/ej2-vue-calendars/styles/material.css';
</style>

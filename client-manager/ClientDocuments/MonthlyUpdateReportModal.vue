<template>
    <NoButtonModal :open="open" @close.stop="onModalClose">
        <h1>Monthly Update Report</h1>
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
        name: 'MonthlyUpdateReportModal',
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
                    this.getFirstOfCurrentMonth()
                    ,this.getLastOfCurrentMonth()
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
                    this.getFirstOfCurrentMonth()
                    ,this.getLastOfCurrentMonth()
                ];
            },
            getFirstOfCurrentMonth() {
                const today = new Date();
                const month = today.getMonth() - 1;
                let thisMonth = new Date(today.setMonth(month));
                thisMonth = new Date(thisMonth.setDate(1));
                thisMonth = new Date(thisMonth.setHours(0));
                thisMonth = new Date(thisMonth.setMinutes(0));
                thisMonth = new Date(thisMonth.setSeconds(0));

                return thisMonth;
            },
            getLastOfCurrentMonth() {
                const today = new Date();
                const month = today.getMonth();
                let thisMonth = new Date(today.setMonth(month));
                thisMonth = new Date(thisMonth.setDate(0));
                thisMonth = new Date(thisMonth.setHours(23));
                thisMonth = new Date(thisMonth.setMinutes(59));
                thisMonth = new Date(thisMonth.setSeconds(59));

                return thisMonth;
            },
            async redirectToReport() {
                await this.$router.push({
                    name: 'MonthlyUpdateReport',
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
            this.getFirstOfCurrentMonth();
            this.getLastOfCurrentMonth();
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

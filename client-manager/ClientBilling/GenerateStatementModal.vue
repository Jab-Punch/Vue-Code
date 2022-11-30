<template>
    <NoButtonModal :open="open" @close.stop="onModalClose">
        <h1>Generate Statement</h1>
        <ejs-daterangepicker
            ref="dp"
            placeholder="Select a Range"
            :max="new Date()"
            :allowEdit="false"
            :openOnFocus="true"
            :open="onPickerOpen"
            :close="onPickerClose"
            v-model="dateRange"
        />
        <div class="align-right">
            <button class="secondary" @click="onModalClose">Cancel</button>
            <button class="primary" @click="redirectToStatement" :disabled="dateRange === null">Generate</button>
        </div>
    </NoButtonModal>
</template>

<script>
    import Vue from 'vue';
    import { DateRangePickerPlugin } from '@syncfusion/ej2-vue-calendars';
    import NoButtonModal from '@/components/general/modals/NoButtonModal';

    Vue.use(DateRangePickerPlugin);

    export default {
        name: 'GenerateStatementModal',
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
                dateRange: null
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
                this.dateRange = null;
            },
            async redirectToStatement() {
                await this.$router.push({
                    name: 'Statement',
                    query: { c: this.clientId, s: this.startDate, e: this.endDate }
                });
            }
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

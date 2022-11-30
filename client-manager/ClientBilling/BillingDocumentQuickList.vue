<template>
    <div>
        <h3>Billing Documents</h3>

        <Accordion class="bottom-10">
            <template #openIcon><span class="material-icons">remove</span></template>
            <template #closedIcon><span class="material-icons">add</span></template>
            <template #title><h3 class="margin-0">Superbills</h3></template>
            <template #content>
                <div v-if="superbills.length > 0">
                    <div class="align-right bottom-10"><b>Share to Portal</b></div>
                </div>

                <div v-if="superbills.length === 0">
                    <span class="none-to-show">No superbills to show</span>
                </div>

                <div v-else>
                    <BillingDocumentQuickListItem
                        v-for="item in superbills"
                        :key="item.id"
                        :date="formatDate(item.dayt_create)"
                        :documentId="item.id"
                        :shareToPortal="!!item.shared_to_portal"
                        documentType="SB"
                        @updateShareValue="handleShareStatusUpdate"
                    />
                </div>

                <router-link v-if="superbills.length === 5" :to="{ name: 'ClientSuperbills', params: { overrideFilter: {
                        sort: { dayt_create: 'Descending' },
                        search: {},
                        filter: { client_id: clientId },
                        page: { num_per_page: 10, current_page: 1, page_num: 1 },
                        column: []
                    } } }">View All</router-link>
            </template>
        </Accordion>

        <Accordion class="bottom-10">
            <template #openIcon><span class="material-icons">remove</span></template>
            <template #closedIcon><span class="material-icons">add</span></template>
            <template #title><h3 class="margin-0">Statements</h3></template>
            <template #content>
                <div v-if="statements.length > 0">
                    <div class="align-right bottom-10"><b>Share to Portal</b></div>
                </div>

                <div v-if="statements.length === 0">
                    <span class="none-to-show">No statements to show</span>
                </div>

                <div v-else class="bottom-10">
                    <BillingDocumentQuickListItem
                        v-for="item in statements"
                        :key="item.id"
                        :date="formatDate(item.dayt_create)"
                        :documentId="item.id"
                        :shareToPortal="!!item.shared_to_portal"
                        documentType="ST"
                        @updateShareValue="handleShareStatusUpdate"
                    />
                </div>

                <router-link v-if="statements.length === 5" :to="{ name: 'ClientStatements', params: { overrideFilter: {
                        sort: { dayt_create: 'Descending' },
                        search: {},
                        filter: { client_id: clientId },
                        page: { num_per_page: 10, current_page: 1, page_num: 1 },
                        column: []
                    } } }" class="text-button">View All</router-link>
            </template>
        </Accordion>

        <Accordion class="bottom-10">
            <template #openIcon><span class="material-icons">remove</span></template>
            <template #closedIcon><span class="material-icons">add</span></template>
            <template #title><h3 class="margin-0">Receipts</h3></template>
            <template #content>
                <div v-if="receipts.length > 0">
                    <div class="align-right bottom-10"><b>Share to Portal</b></div>
                </div>

                <div v-if="receipts.length === 0">
                    <span class="none-to-show">No receipts to show</span>
                </div>

                <div v-else>
                    <BillingDocumentQuickListItem
                        v-for="item in receipts"
                        :key="item.id"
                        :date="formatDate(item.dayt_create)"
                        :documentId="item.id"
                        :shareToPortal="!!item.shared_to_portal"
                        documentType="RC"
                        @updateShareValue="handleShareStatusUpdate"
                    />
                </div>

                <router-link v-if="receipts.length === 5" :to="{ name: 'ClientReceipts', params: { overrideFilter: {
                        sort: { dayt_create: 'Descending' },
                        search: {},
                        filter: { client_id: clientId },
                        page: { num_per_page: 10, current_page: 1, page_num: 1 },
                        column: []
                    } } }">View All</router-link>
            </template>
        </Accordion>
    </div>
</template>

<script>
    import Accordion from '@/components/general/accordion/Accordion';
    import { file } from '@/util/apiRequests';
    import BillingDocumentQuickListItem from '@/components/client-manager/ClientBilling/BillingDocumentQuickListItem';
    import dayjs from '@/util/dayjs';

    export default {
        name: 'BillingDocumentQuickList',
        components: { BillingDocumentQuickListItem, Accordion },
        props: {
            clientId: {
                type: [Number, String],
                required: true,
            },
        },
        data() {
            return {
                superbills: [],
                statements: [],
                receipts: [],
            };
        },
        methods: {
            formatDate(date) {
                return dayjs(date).format('MM/DD/YY');
            },
            async getDocuments() {
                try {
                    const res = await this.$api.get(file.getQuickList(this.clientId));

                    if (res.status >= 200 && res.status < 300) {
                        this.superbills = res.data.superbills;
                        this.statements = res.data.statements;
                        this.receipts = res.data.receipts;
                    } else {
                        //this.$toasted.error('Failed to retrieve documents');
                    }
                } catch (err) {
                    //this.$toasted.error('Failed to retrieve documents');
                }
            },
            async handleShareStatusUpdate() {
                await this.getDocuments();
            },
        },
        async created() {
            await this.getDocuments();
        },
    };
</script>

<style scoped></style>

<template>
    <div class="document-quick-list-item" @click.exact="viewDocument">
        <div>
            <span>{{ date }}</span>
        </div>
        <div>
            <span>{{ documentType }} #{{ documentId }}</span>
        </div>
        <div class="share">
            <input type="checkbox" v-model="shareValue" @click.stop />
        </div>
    </div>
</template>

<script>
    import { file } from '@/util/apiRequests';
    import { openPdf } from '@/util/pdf';

    export default {
        name: 'BillingDocumentQuickListItem',
        props: {
            date: {
                type: String,
                required: true,
            },
            documentId: {
                type: [String, Number],
                required: true,
            },
            documentType: {
                type: String,
                required: true,
            },
            shareToPortal: {
                type: Boolean,
                required: false,
            },
        },
        computed: {
            shareValue: {
                get() {
                    return this.shareToPortal;
                },
                async set(value) {
                    await this.updateShareStatus(value);
                    this.$emit('updateShareValue', { share: value, documentId: this.documentId });
                },
            },
        },
        methods: {
            async viewDocument() {
                try {
                    if (this.documentId) {
                        const res = await this.$api.get(file.getFile(this.documentId));

                        openPdf(res.data?.file?.Body, res.data?.file?.file_name);
                    } else {
                        this.$toasted.error('No document found');
                    }
                } catch (err) {
                    //this.$toasted.error('Could not load document');
                }
            },
            async updateShareStatus(status) {
                try {
                    await this.$api.put(file.updateFile(this.documentId), {
                        shared_to_portal: status,
                    });

                    this.$toasted.success('Updated share to portal status');
                } catch (err) {
                    //this.$toasted.error('Failed to update share to portal status');
                }
            },
        },
    };
</script>

<style scoped>
    .document-quick-list-item:hover {
        cursor: pointer;
    }
</style>

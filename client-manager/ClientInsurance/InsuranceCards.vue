<template>
    <div>
        <div class='card-block insurance-cards'>
            <h3>Insurance Card</h3>
            <!-- Add your props, imgUrl and urlToUpload are required -->
            <label for=''>Front side</label>
            <UploadOverlay
                :urlToUpload="`/insurance/upload-card/front?fileId=${insurance.card_front_file_id}&cardId=${insurance.cardId}&veriId=${insurance.veriId}`"
                :imgUrl='insurance.card_front_file_id ? file.getFile(insurance.card_front_file_id) : null'
                kind='insurance'
                @returnApiData='assignFrontId'
                :client='{id: this.$store.state.clientOverview.clientData.id}'
            />
            <label for=''>Back side</label>
            <UploadOverlay
                :urlToUpload="`/insurance/upload-card/back?fileId=${insurance.card_back_file_id}&cardId=${insurance.cardId}&veriId=${insurance.veriId}`"
                :imgUrl='insurance.card_back_file_id ? file.getFile(insurance.card_back_file_id) : null'
                kind='insurance'
                :client='{id: this.$store.state.clientOverview.clientData.id}'
                @returnApiData='assignBackId'
            />
        </div>
    </div>
</template>

<script>
    import UploadOverlay from '@/components/general/Upload/UploadOverlay.vue';
    import { file, upload } from '@/util/apiRequests';

    export default {
        components: {
            UploadOverlay
        },
        props: {
            insurance: {
                type: Object
            }
        },
        data() {
            return {
                file: file,
                upload: upload
            };
        },
        methods: {
            assignFrontId(response) {
                this.$emit('assignId', this.insurance, response.cardId, response.veriId, null, response.fileId);
            },
            assignBackId(response) {
                this.$emit('assignId', this.insurance, response.cardId, response.veriId, response.fileId, null);
            }
        }
    };
</script>
<template>
    <div class="client-details-header-nav" >
        <div>client photo</div>
        <div>client details</div>
        <div class="page-tab client-tab" :href="'client-overview/' + client_id">Overview</div>
        <div class="page-tab client-tab" :href="'client-demographics/' + client_id">Demographics</div>
        <div class="page-tab client-tab" :href="'client-insurance/' + client_id">Insurance</div>
        <div class="page-tab client-tab" :href="'client-billing/' + client_id">Billing</div>
        <div class="page-tab client-tab" :href="'client-clinical/' + client_id">Clinical</div>
        <div class="page-tab client-tab" :href="'client-documents/' + client_id">Document & Forms</div>
    </div>
</template>

<script>
    export default {
        name: 'ClientHeader',
        props: {
            client_id : {
                type : Number,
                default: 0
            },
            active_tab : {
                type: String,
                default : 'overview'
            }
        },
        data() {
            return {
                loading : 1
            };
        },
    }
</script>

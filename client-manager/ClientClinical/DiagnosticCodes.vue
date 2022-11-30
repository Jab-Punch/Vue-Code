<template>
    <div>
        <!-- <h3 class="margin-0">Custom Services</h3> -->
        <!-- <p class="margin-0 bottom-20">Add custom services and assign your fees</p> -->
        <h3>Diagnostic Codes</h3>
        <div v-for="(diagnosticCode, diagnosticCodeIndex) in diagnostic_codes" :key="diagnosticCodeIndex || diagnosticCode.id"></div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            diagnostic_codes: [{}],
            loading: true
        }
    },
    methods: {

    },
    created(){
        // this.$api.get()
    }

}
</script>

<style>

</style>
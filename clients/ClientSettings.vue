<template>
    <div>
        <h1>Client Settings</h1>
        <ChirpSettings v-if="!loading" :data_source="rows" :level="'client'" :level_id="level_id"/>
    </div>
</template>

<script>
    const api_root = 'settings/list/client'

    import ChirpSettings from '@/components/general/list/ChirpSettings'

    export default {
        name: 'ClientSettings',
        components: { ChirpSettings },
        // props: {
        //     client_id: [String, Number],
        // },
        data () {
            return {
                loading : 1,
                rows: [],
                level_id : 0,
            }
        },
        methods: {
            async init() {
                this.level_id = 1 // this.$store.state.client.id // this.client_id
                const res = await this.$api.get(`/${api_root}/${this.level_id}`)
                this.rows = res.data
                this.loading = 0
            },
        },
        async created() {
            await this.init()
        },
    }
</script>

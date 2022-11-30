<template>
    <div v-if="loading == false">
        <ChirpList
            :data_source="rows"
            @rowSelected="dynamic_target"
            @applyCriteria="modifyCriteria"
            :loadingColumns="loadingTable"
            :totalCount="totalCount"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="handleCancelOverride"
        />
    </div>
    <div v-else>Loading...</div>
</template>

<script>
    const api_root = 'form_data';

    import ChirpList from '@/components/general/list/ChirpList';
    import { tryGetFilter } from '@/util/tryGetFilter';

    export default {
        name: 'FormsLibrary',
        components: { ChirpList },
        props: {
            overrideFilter: {
                type: Object,
                default: null,
            },
        },
        data() {
            return {
                rows: [],
                totalCount: 0,
                loading: true,
                loadingTable: false,
                useOverride: false,
                columnMeta: [
                    { field: 'first_name', headerText: 'First Name' },
                    { field: 'last_name', headerText: 'Last Name' },
                    { field: 'status', headerText: 'Status' },
                    { field: 'counselor', headerText: 'Counselor' },
                    { field: 'client_balance', headerText: 'Client Balance', align: 'Right' },
                    { field: 'tags', headerText: 'Tags' },
                ],
            };
        },
        computed: {
            criteria() {
                return this.useOverride && this.overrideFilter ? this.overrideCriteria : this.savedCriteria;
            },
            savedCriteria() {
                return tryGetFilter(this.$store, this.storeKey);
            },
            overrideCriteria() {
                return this.$store.getters['filters/overrideCriteria'](this.storeKey);
            },
            storeKey() {
                return this.pageMeta?.page || 'forms-library';
            },
        },
        methods: {
            async load_data() {
                const body = {
                    criteria: this.criteria,
                };
                const res = await this.$api.post(`/${api_root}`, body);

                this.rows = res.data.rows;

                this.totalCount = res.data.total_count;
                this.$nextTick(() => {
                    this.loading = false;
                });
            },
            async init() {
                if (this.overrideFilter) {
                    this.useOverride = true;
                    this.$store.commit('filters/applyOverride', {
                        stateKey: this.storeKey,
                        criteria: this.overrideFilter,
                    });
                }
                await this.load_data();
            },
            async modifyCriteria(criteria) {
                await this.load_data();
            },
            handleCancelOverride() {
                this.useOverride = false;
            },
        },
        watch: {
            criteria: {
                deep: true,
                async handler() {
                    await this.load_data();
                },
            },
        async dynamic_target(row) {
                this.$router.push({ name: row.component_name, params: { record_id: row.id } });
            },
        },
        async created() {
            await this.init();
        },
    };
</script>

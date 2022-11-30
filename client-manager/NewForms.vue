/* eslint-disable no-unused-vars */
<template>
    <div v-if="!loading" class="start-new-form">
        <h3>Start a New Form or Report</h3>
        <div style="margin-left: 10px;">
            <p><b>Legal Disclaimer:</b> Form templates are for reference only. It is your responsibility to ensure they meet the legal requirements within your state and request any necessary modifications.</p>
        </div>
        <!--        <ChirpList-->
        <!--            :column_meta="columnMeta"-->
        <!--            :data_source="rows"-->
        <!--            :totalCount="totalCount"-->
        <!--            @rowSelected="dynamic_target"-->
        <!--            @applyCriteria="modifyCriteria"-->
        <!--            :loadingColumns="loadingTable"-->
        <!--            :criteriaProps="criteriaProps"-->
        <!--            :hidePaginator="true"-->
        <!--            :hideToolbar="true"-->
        <!--            :storeKey="storeKey"-->
        <!--            :useOverride="useOverride"-->
        <!--            @cancelOverride="useOverride = false"-->
        <!--        />-->
        <div v-if="Object.keys(forms).length > 0">
            <Accordion v-for="(value, name) in forms" :key="value+name">
                <template #openIcon><span class="material-icons">remove</span></template>
                <template #closedIcon><span class="material-icons">add</span></template>
                <template #title
                    ><h3 class="margin-0">{{ name }}</h3></template
                >
                <template #content>
                    <div v-for="(f, index2) in value" :key="index2+f">
                        <div v-if="f.report_form == 0">
                            <router-link :to="{ name: `${f.component_name}`, params: { record_id: 0 } }">
                                <div class="pad-5-10 bottom-5">
                                    <h4 class="bottom-0">{{ f.menu_txt }}</h4>
                                    <p class="margin-0">{{ f.description }}</p>
                                </div>
                            </router-link>
                        </div>
                        <div v-else>
                            <button class="no-bg blue margin-0 pad-0 align-left" @click="setReportsModalState(true, f.component_name)">
                                <div class="pad-5-10 bottom-5">
                                    <h4 class="bottom-0">{{ f.menu_txt }}</h4>
                                    <p class="margin-0">{{ f.description }}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </template>
            </Accordion>
        </div>
        <WeeklyUpdateReportModal
            :open="weeklyReportModalOpen"
            @close="setReportsModalState(false, 'WeeklyUpdateReport')"
            :clientId="clientId"
        />
        <MonthlyUpdateReportModal
            :open="monthlyReportModalOpen"
            @close="setReportsModalState(false, 'MonthlyUpdateReport')"
            :clientId="clientId"
        />
    </div>
</template>

<script>
    import { tryGetFilter } from '@/util/tryGetFilter';

    const api_root = 'forms/listnewforms';
    import ChirpList from '@/components/general/list/ChirpList';
    import Accordion from '@/components/general/accordion/Accordion';
    import WeeklyUpdateReportModal from '@/components/client-manager/ClientDocuments/WeeklyUpdateReportModal';
    import MonthlyUpdateReportModal from '@/components/client-manager/ClientDocuments/MonthlyUpdateReportModal';

    export default {
        name: 'NewForms',
        components: { Accordion, ChirpList, WeeklyUpdateReportModal, MonthlyUpdateReportModal },
        props: {
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                clientId: this.$route.params.client_id,
                clientData: null,
                rows: [],
                forms: {},
                totalCount: 0,
                loading: true,
                loadingTable: false,
                useOverride: false,
                criteriaProps: {},
                columnMeta: [
                    { field: 'page', hide: 1 },
                    { field: 'needs_signatures', hide: 1 },
                    { field: 'component_name', hide: 1 },
                    { field: 'form_type', hide: 1 },
                    { field: 'form_category', hide: 1 }
                ],
                weeklyReportModalOpen: false,
                monthlyReportModalOpen: false,
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
                return 'newForms';
            }
        },
        methods: {
            async load_data() {
                const body = {
                    criteria: this.criteria,
                    page: 'newForms'
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows;
                this.totalCount = res.data.total_count;
                this.$nextTick(() => {
                    this.loading = false;
                });
                let categories = {};
                this.rows.forEach((value, index, array) => {
                    if (value.form_category in categories == false) {
                        //push to
                        categories[value.form_category] = [value];
                    } else {
                        categories[value.form_category] = [...categories[value.form_category], value];
                    }
                });
                this.forms = categories;
            },
            async init() {
                if (this.overrideFilter) {
                    this.useOverride = true;
                    this.$store.commit('filters/applyOverride', {
                        stateKey: this.storeKey,
                        criteria: this.overrideFilter
                    });
                }

                this.$store.commit('filters/updateFilter', {
                    stateKey: this.storeKey,
                    criteria: {
                        ...this.criteria,
                        page: {
                            num_per_page: 100,
                            page_num: 1
                        }
                    }
                });

                await this.load_data();
            },
            async modifyCriteria(criteria) {
                if (this.targetPage) {
                    this.$store.commit('filters/update', {
                        criteriaPage: this.targetPage,
                        payload: criteria
                    });
                }
                this.criteriaProps = criteria;
                await this.load_data();
            },
            async dynamic_target(row) {
                this.$router.push({ name: row.component_name, params: { record_id: 0 } });
            },
            setReportsModalState(newState, name) {
                if (name == "WeeklyUpdateReport") {
                    this.weeklyReportModalOpen = newState;
                }
                if (name == "MonthlyUpdateReport") {
                    this.monthlyReportModalOpen = newState;
                }
            },
        },
        async created() {
            await this.init();
        },
        watch: {
            criteria: {
                deep: true,
                async handler() {
                    await this.load_data();
                }
            }
        }
    };
</script>
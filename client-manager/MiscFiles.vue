<template>
    <div v-if="!loading" class="misc-files simple-chirp-table">
        <div class="flex center space-between bottom-15">
            <h3 class="margin-0">Uploads</h3>

            <button class="text-button no-bg weight-600" type="button" @click="selectFile">
                <span class="material-icons purple">add_box</span> Upload New
            </button>
        </div>
        <ChirpList
            :column_meta="columnMeta"
            :data_source="rows"
            :totalCount="totalCount"
            @rowSelected="getFile"
            :loadingColumns="loadingTable"
            :hidePaginator="true"
            :hideToolbar="true"
            :storeKey="storeKey"
            :useOverride="useOverride"
            @cancelOverride="useOverride = false"
            :command-columns="commandColumns"
            :prevent-nav-on-col-label="'shared to portal'"
            @specialCellClicked="handleShareToPortal"
            @buttonInCellClicked="setFileToDelete"
        />
        <div class="top-10">
            <router-link
                class="text-button"
                :to="{
                    name: 'Documents',
                    params: {
                        overrideFilter: {
                            sort: {},
                            search: {},
                            filter: { 'files.client_id': [clientId], file_kind: ['external'] },
                            page: { num_per_page: 10, current_page: 1, page_num: 1 },
                            column: []
                        }
                    },
                    query: {
                        storeKey: storeKey,
                        override: true,
                        overrideFilter: qs.stringify({
                            sort: {},
                            search: {},
                            filter: { 'files.client_id': [clientId], file_kind: ['external'] },
                            page: { num_per_page: 10, current_page: 1, page_num: 1 },
                            column: []
                        })
                    }
                }"
            >
                Go to full list
            </router-link>
        </div>
        <MiscFilesDeleteFileModal
            :open="deleteFileModalOpen"
            @cancel="cancelFileDeleteModal"
            @handleDelete="handleDelete"
        />
        <MultipleFileUploadModal
            v-if='showUploadModal'
            @close='showUploadModal = false'
            @upload='uploadMiscFiles'
            :status='uploadStatus'
        />
    </div>
</template>

<script>
    import { openPdf } from '@/util/pdf';
    import qs from 'qs';

    const api_root = 'documents';
    import { file } from '@/util/apiRequests';
    import ChirpList from '@/components/general/list/ChirpList';
    import MiscFilesDeleteFileModal from '@/components/client-manager/MiscFilesDeleteFileModal';
    import { openImage } from '@/util/image';
    import { saveFile } from '@/util/genericUtilityFunctions';
    import { tryGetFilter } from '@/util/tryGetFilter';
    import MultipleFileUploadModal from '@/components/general/Upload/MultipleFileUploadModal';

    export default {
        name: 'MiscFiles',
        components: { MultipleFileUploadModal, ChirpList, MiscFilesDeleteFileModal },
        props: {
            overrideFilter: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                qs,
                showUploadModal: false,
                clientId: this.$route.params.client_id,
                clientData: null,
                rows: [],
                totalCount: 0,
                loading: true,
                useOverride: false,
                loadingTable: false,
                criteriaProps: {},
                uploadStatus: "",
                columnMeta: [
                    { field: 'date' },
                    { field: 'file_name' },
                    { field: 'first_name' },
                    { field: 'last_name' },
                    { field: 'user_id', hide: 1 },
                    { field: 'client_id', hide: 1 },
                    { field: 'tags', hide: 1 },
                    { field: 'file_type', hide: 1 },
                    { field: 'file_kind', hide: 1 },
                    { field: 'downloads', hide: 1 },
                    { field: 'page_title', hide: 1 },
                    {
                        field: 'shared_to_portal',
                        headerText: 'Shared to Portal',
                        editType: 'booleanedit',
                        type: 'boolean',
                        displayAsCheckBox: 'true',
                        allowEditing: true
                    },
                    { field: 'filled_by_client', hide: 1 },
                    { field: 'signed_by_client', hide: 1 }
                ],
                commandColumns: [],
                deleteFileModalOpen: false,
                fileToDelete: null
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
                return 'miscFiles';
            }
        },
        methods: {
            async uploadMiscFiles(files) {
                try {

                    this.uploadStatus = 'uploading';
                    const formData = new FormData();
                    files.forEach(file => {
                        formData.append('files[]', file.rawFile, file.name);
                    });
                    formData.append('client_id', this.clientId);
                    formData.append('user_id', this.$store.getters['auth/userId']);
                    formData.append('kind', 'external');

                    const res = await this.$api.post(file.saveMultipleFiles(), formData);
                    if (res.status === 200) {
                        this.uploadStatus = 'success';
                        this.$toasted.success('Files uploaded successfully');
                    } else {
                        this.uploadStatus = 'error';
                        this.$toasted.error('Error uploading files');
                    }
                }catch (e) {
                    this.uploadStatus = 'error';
                    this.$toasted.error('Error uploading files, please try again');
                } finally {
                    this.showUploadModal = false;
                    await this.load_data();
                }

            },
            async selectFile() {
                console.log('selectFile');
                this.showUploadModal = true;
                // this.$refs.upload.click();
            },
            async getFile(f) {
                try {
                    if (f.id) {
                        let result = await this.$api.get(file.getFile(f.id));
                        if (result.data.file.file_type == 'pdf') {
                            openPdf(result.data?.file?.Body, result.data?.file?.file_name);
                        } else if (result.data.file.originalContentType.includes('image')) {
                            openImage(result.data?.file?.Body);
                        } else {
                            saveFile(
                                result.data?.file?.Body,
                                result.data?.file?.originalContentType,
                                result.data?.file?.file_name
                            );
                        }
                    } else {
                        this.$toasted.error('File not found.');
                    }
                } catch (err) {
                    console.log(f);
                }
            },
            async load_data() {
                const body = {
                    criteria: this.criteria
                };
                const res = await this.$api.post(`/${api_root}`, body);
                this.rows = res.data.rows ?? [];
                let newRows = []
                this.rows.forEach(row => {
                    newRows.push({
                        'id': row.id,
                        'date': row.date,
                        'file_name': row.file_name,
                        'user': row.user,
                        'shared_to_portal': row.shared_to_portal
                    });
                });
                this.rows = newRows;
                this.totalCount = res.data.total_count;
                if (this.rows.length <= 0) {
                    this.columnMeta = [{ field: 'date' }, { field: 'File Name' }, { field: 'User' }, { field: 'Shared to Portal' }]; // ,{field: 'Delete'}
                } else {
                    this.columnMeta = [
                        { field: 'date' },
                        { field: 'file_name' },
                        { field: 'user' },
                        { field: 'first_name', hide: 1 },
                        { field: 'last_name', hide: 1 },
                        { field: 'user_id', hide: 1 },
                        { field: 'client_id', hide: 1 },
                        { field: 'tags', hide: 1 },
                        { field: 'file_type', hide: 1 },
                        { field: 'file_kind', hide: 1 },
                        { field: 'downloads', hide: 1 },
                        { field: 'page_title', hide: 1 },
                        {
                            field: 'shared_to_portal',
                            headerText: 'Shared to Portal',
                            editType: 'booleanedit',
                            type: 'boolean',
                            displayAsCheckBox: 'true',
                            allowEditing: true
                        },
                        { field: 'filled_by_client', hide: 1 },
                        { field: 'signed_by_client', hide: 1 }
                    ];
                }
                this.$nextTick(() => {
                    this.loading = false;
                });
            },
            cancelFileDeleteModal() {
                this.deleteFileModalOpen = false;
                this.fileToDelete = null;
            },
            setFileToDelete(props) {
                this.fileToDelete = props.rowData.id;
                this.deleteFileModalOpen = true;
            },
            async handleDelete() {
                try {
                    const res = await this.$api.post(file.deleteFile(this.fileToDelete));
                    if (res.status >= 200 && res.status < 300) {
                        this.$toasted.success('Successfully deleted file.');
                        this.deleteFileModalOpen = false;
                        this.fileToDelete = null;
                        await this.load_data();
                    } else {
                        this.$toasted.error('You are not authorized to delete this file.');
                    }
                } catch (error) {
                    this.$cl(error);
                    this.$toasted.error('Error deleting file.');
                }
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
                        filter: {
                            'files.client_id': [this.clientId],
                            // file_type: ['!pdf'],
                            // form_data_id: ['0'],
                            // file_kind: ['!ProgressNote']
                            file_kind: ['external']
                        },
                        page: {
                            num_per_page: 10,
                            page_num: 1
                        }
                    }
                });

                // get the user from the vuex store
                const usr = this.$store.state.user;

                if (usr.role_id === 1) {
                    const cols = [
                        {
                            field: 'Commands',
                            headerText: 'Delete',
                            commands: [
                                {
                                    buttonOption: {
                                        content: `<span class="material-icons-outlined" style="pointer-events: none">delete</span>`,
                                        cssClass: 'delete-icon pad-5',

                                    }
                                }
                            ]
                        }
                    ];
                    this.$set(this, 'commandColumns', cols);
                }

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
            async handleShareToPortal(args) {
                const res = await this.$api.put(file.updateFile(args.data.id), {
                    shared_to_portal: args.data.shared_to_portal === 0 ? 1 : 0
                });

                if (res.status >= 300) {
                    //this.$toasted.error('Failed to update shared to portal status');
                    return;
                }

                this.$toasted.success('Successfully updated shared to portal status');

                await this.load_data();
            }
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

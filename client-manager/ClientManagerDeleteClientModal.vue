<template>
    <Modal
        @close="handleClose"
    >
        <div v-if='canDelete'>

            <div class='flex'>
                <div class="right-20">
                    <span class="material-icons-outlined red-text large-icon">error_outline</span>
                </div>
                <div>
                    <h2 class='bottom-5'>
                        Are you sure?
                    </h2>
                    <p>
                        Do you really want to delete this client? Deleting a client is a forever,
                        there is no undo. All associated records will be removed. This process can not be undone.
                    </p>
                </div>
            </div>
            <div class="top-20 flex justify-end">
                <button
                    type='button'
                    class="secondary cancel"
                    @click="handleClose"
                >
                    Cancel
                </button>
                <button
                    type='button'
                    class="primary"
                    @click="handleDelete"
                >
                    <span v-if='!loading'>Delete</span>
                    <Loading
                        outerHeight="16px"
                        outerWidth="16px"
                        height="16px"
                        width="16px"
                        :color="'white transparent transparent transparent'"
                        :borderWidth="'3px'"
                        v-else
                    />
                </button>
            </div>
        </div>
        <div v-if='!canDelete'>
            <Loading
                outerHeight="16px"
                outerWidth="16px"
                height="16px"
                width="16px"
                :color="'white transparent transparent transparent'"
                :borderWidth="'3px'"
                v-if='canDeleteLoading'
            />
            <div class='flex' v-if='!canDeleteLoading'>
                <div class="right-20">
                    <span class="material-icons-outlined red-text large-icon">error_outline</span>
                </div>
                <div>
                    <h2 class='bottom-5'>
                        Can't delete client
                    </h2>
                    <p>
                        You are unable to delete this client due to recorded activity within their chart. Please set client to ‘Inactive'.
                    </p>
                </div>
            </div>
            <div class="top-20 flex justify-end">
                <button
                    type='button'
                    class="secondary cancel"
                    @click="handleClose"
                >
                    Cancel
                </button>
                <button
                    type='button'
                    class="primary"
                    @click="handleClose"
                >
                    Okay
                </button>
            </div>
        </div>

    </Modal>
</template>

<script>
    import Modal from '@/components/general/modals/Modal';
    import Loading from '@/components/general/loading/loading';
    import { clients } from '@/util/apiRequests';
    export default {
        name: 'ClientManagerDeleteClientModal',
        components: { Modal, Loading },
        props: {
            client: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                loading: false,
                canDelete: false,
                canDeleteLoading: true
            };
        },
        methods: {
            handleClose() {
                this.$store.commit('clientOverview/showDeleteClientModal', false);
            },
            handleDelete() {
                this.loading = true;
                this.$store.dispatch('clientOverview/deleteClient', this.client.id)
                    .then(() => {
                        this.loading = false;
                        this.handleClose();
                    });
            },
            async checkClientDeleteEligibility(){
                this.canDeleteLoading = true;
                try {
                    const res = await this.$api.delete(clients.checkClientDeleteEligibility(this.client.id));
                    if (res.status === 200) {
                        this.canDelete = true;
                    }else {
                        throw new Error(res?.data?.message);
                    }
                }catch(e){
                    this.canDelete = false;
                    this.$cl(e);
                }
                finally {
                    this.canDeleteLoading = false;
                }
            }
        },
        created() {
            this.checkClientDeleteEligibility()
        }
    };
</script>

<style scoped>

</style>
<template>
    <div>
        <!--Create a ejs-dropdown button with actions tied to it including an action for opening a modal-->
        <ejs-dropdownbutton :items="items" :select="handleDropdownSelection"></ejs-dropdownbutton>
        <ClientManagerDeleteClientModal v-if="showDeleteClientModal" :client='client'/>
    </div>
</template>

<script>
    import Vue from 'vue';
    import DeleteClientModal from '@/components/general/modals/DeleteClientModal';
    import ClientManagerDeleteClientModal from '@/components/client-manager/ClientManagerDeleteClientModal';
    import { mapState } from 'vuex';
    import { DropDownButtonPlugin } from '@syncfusion/ej2-vue-splitbuttons';
    Vue.use(DropDownButtonPlugin);

    export default {
        name: 'ClientManagerActionsDropdown',
        components: { ClientManagerDeleteClientModal, DeleteClientModal },
        data() {
            return {
                items: [
                    {
                        text: 'Delete Client',
                        iconCss: 'fas fa-trash',
                        id: 'delete-client',
                    },
                ],
            };
        },
        methods: {
            handleDropdownSelection(args) {
                switch (args.item.id) {

                    case 'delete-client':
                        this.$store.commit('clientOverview/showDeleteClientModal', true);
                        break;
                    default:
                        break;
                }
            },
        },
        computed: {
            ...mapState('clientOverview', {
                client: (state) => state.clientData,
                showDeleteClientModal: (state) => state.deleteClientModal,
            }),
        },
    };
</script>

<style scoped>

</style>
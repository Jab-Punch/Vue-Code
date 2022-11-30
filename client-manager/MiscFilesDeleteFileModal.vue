<template>
    <NoButtonModal :open="open" @close="$emit('cancel')">
      <button class="close-x" type="button" @click.prevent="$emit('cancel')">
        <span class="material-icons-outlined dark-text">close</span>
      </button>
      <h1>Delete Upload?</h1>
      <p>Are you sure you want to delete this upload from the client's chart? Select Confirm to delete this upload. Select Cancel to keep this upload in the client's chart.</p>
      <button @click="$emit('cancel')" class="button secondary">Cancel</button>
      <button @click="$emit('handleDelete')" class="button primary">Delete</button>
    </NoButtonModal>
</template>

<script>
    import NoButtonModal from '@/components/general/modals/NoButtonModal';
    export default {
        name: 'MiscFilesDeleteFileModal',
        components: { NoButtonModal },
      props: {
          open: {
            type: Boolean,
            required: true,
          },
      }
    };

</script>

<style scoped></style>
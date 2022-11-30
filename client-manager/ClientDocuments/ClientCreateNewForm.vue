<template>
    <div class="client-create-form-wrapper">
        <div class="client-create-form-header">Start a new form</div>
        <div class="client-create-form-body">
            <div>
                <div v-for="(form, formIndex) in forms" :key="formIndex">
                    <div v-for="(availableForm, availableFormIndex) in form.availableForms" :key="availableFormIndex">
                        <router-link :to="{name: availableForm.name, query: {client_id: this.client_id}, params: {client_id: this.client_id}}">
                            <div class="form-title">{{ availableForm.title }}</div>
                            <div class="form-desc">{{ availableForm.desc }}</div>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            client_id: {

            }
        },
        data() {
        
            return {
                forms: [{ category: 'General', availableForms: [{}] }]
            };
        }
    };
</script>

<style></style>

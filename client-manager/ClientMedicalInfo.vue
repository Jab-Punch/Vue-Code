<template>
    <div>
        <ValidationObserver ref="form">
            <form @submit.prevent="submit">
                <div class="  ">
                    <h2>Medical Information</h2>
                    <Input
                        label="Allergies"
                        type="text"
                        name="Allergies"
                        id="allergiesInput"
                        class="fullwidth block bottom-15"
                        v-model="medicalInfo.allergies"
                        :disabled="!userAllowedEdit"
                    />
                    <div
                        v-for="prescription in medicalInfo.prescriptions"
                        :key="prescription.dataId"
                        class=" flex bottom bottom-10"
                    >
                        <Input
                            label="Prescription"
                            type="text"
                            name="Name"
                            class="right-15 flex-1"
                            :id="'name_' + prescription.dataId"
                            v-model="prescription.name"
                            :disabled="!userAllowedEdit"
                        /><Input
                            label="Dosage & Schedule"
                            type="text"
                            name="Dosage"
                            class="right-15 flex-1"
                            :id="'dosage_'+prescription.dataId"
                            v-model="prescription.dosage"
                            :disabled="!userAllowedEdit"
                        /><Input
                            label="Prescriber"
                            type="text"
                            name=""
                            class="right-5 flex-1"
                            :id="'prescriber' + prescription.dataId"
                            v-model="prescription.prescriber"
                            :disabled="!userAllowedEdit"
                        />
                        <button
                            class="delete-icon"
                            @click.prevent="removePrescription(prescription.dataId)"
                            :disabled="!userAllowedEdit"
                            v-show="userAllowedEdit"
                        >
                            <span class="button material-icons-outlined">delete</span>
                        </button>
                    </div>
                    <button
                        class="add-service_btn no-bg dark-text add"
                        @click.prevent="addPrescription()"
                        :disabled="!userAllowedEdit"
                        v-show="userAllowedEdit"
                    >
                        <span class="material-icons purple">add_box</span>Prescription
                    </button>
                    <!-- Buttons - "Edit" gets replaced with "Cancel" and "Save" buttons and makes
                                   editable fields !disabled when clicked. Only visible to users who can edit-->
                    <div v-if="userAllowedEdit" class="button-wrap">
                        <input type="submit" value="Save" />
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
    import { generateId } from '@/util/genericUtilityFunctions';
    import { clients } from '@/util/apiRequests';
    import { ValidationObserver } from 'vee-validate';
    import Input from '@/components/general/validatedInputs/Input.vue';

    export default {
        name: 'ClientMedicalInfo',
        components: { ValidationObserver, Input },
        props: {
            clientId: {
                type: [Number, String],
                default: 0
            }
        },
        data() {
            return {
                medicalInfo: {
                    allergies: '',
                    other: '',
                    prescriptions: [{ dataId: generateId(), name: '', dosage: '', prescriber: '' }]
                }
            };
        },
        methods: {
            async submit() {
                const form = this.$refs.form;
                const isValid = await form.validate();

                if (!isValid) {
                    return;
                }

                if (!this.userAllowedEdit) {
                    return;
                }

                try {
                    const endpoint = clients.putMedicalInfo(this.clientId);
                    const { prescriptions, allergies } = this.medicalInfo;
                    const res = await this.$api.put(endpoint, {
                        medicalInfo: {
                            allergies,
                            prescriptions
                        }
                    });

                    if (res.status === 400) {
                        form.setErrors(res.data);
                        return;
                    } else {
                        this.$toasted.success('Successfully saved medical info.');
                    }
                } catch (err) {
                    this.$toasted.error('An error occurred while saving medical info.');
                    // console.error(err);
                }
            },
            async getInfo() {
                try {
                    const endpoint = clients.getMedicalInfo(this.clientId);
                    const res = await this.$api.get(endpoint);

                    if (res.status === 200) {
                        const { prescriptions, allergies } = res.data;

                        this.medicalInfo.allergies = allergies;

                        if (prescriptions) {
                            this.medicalInfo.prescriptions = prescriptions;
                        }
                    }
                } catch (err) {
                    this.$toasted.error('An error occurred while getting medical info.');
                    // console.error(err);
                }
            },
            addPrescription() {
                if (this.medicalInfo.prescriptions.length < 10) {
                    this.medicalInfo.prescriptions.push({ dataId: generateId(), name: '', dosage: '', prescriber: '' });
                } else {
                    this.$toasted.error('You can only have 10 prescriptions.');
                }
            },
            removePrescription(dataId) {
                this.medicalInfo.prescriptions = this.medicalInfo.prescriptions.filter(
                    (prescription) => prescription.dataId !== dataId
                );
            }
        },
        computed: {
            userAllowedEdit: function() {
                const permission = this.$store.getters['availablePages'].find(
                    (page) => page.component_name === 'ClientDemographics'
                );
                const { permissions } = permission;

                return permissions.create && permissions.edit;
            }
        },
        created() {
            this.getInfo();
        }
    };
</script>

<template>
    <div v-if="!loading" class="clinical-counselors">
        <h3>Counselors</h3>
        <form class="">
            <!-- <div @click="remove"> -->
            <div class="flex bottom">
                <Dropdown class="flex-1 right-5" v-model="counselors.primary_counselor" :options="counselorOptions" label="Primary" placeholder="Select a primary counselor" :disableEmpty="true"/>
                <div class="delete-icon" @click="remove('primary')">
                    <span class="material-icons-outlined">delete</span>
                </div>
            </div>
            <!-- </div> -->
            <div v-if="showSecondary" class="flex bottom">
                <Dropdown class="flex-1 right-5" v-model="counselors.secondary_counselor" :options="counselorOptions" label="Secondary" placeholder="Select a secondary counselor" v-if="showSecondary" :disableEmpty="true"/>
                <div class="delete-icon" @click="remove('secondary')">
                    <span class="material-icons-outlined">delete</span>
                </div>
            </div>

            <div v-if="showTertiary" class="flex bottom">    
                <Dropdown class="flex-1 right-5" v-model="counselors.tertiary_counselor" :options="counselorOptions" label="Tertiary" placeholder="Select a tertiary counselor" :disableEmpty="true"/>
                <div class="delete-icon" @click="remove('tertiary')">
                    <span class="material-icons-outlined">delete</span>
                </div>
            </div>

            <div class="text-button no-bg weight-600 dark-text inline-block" @click="addCounselor()">
                <span class="material-icons purple">add_box</span> Add additional counselor
            </div>
        </form>
        <button class="primary" type="button" @click="saveCounselors()">Save</button>
    </div>
    <Loading v-else/>
</template>

<script>
    /**
     * Not a big fan of how this component turned out, 
     * could have just been a nice v-for solution, but somehow turned into
     * a v-if complicated mess...
     */
    import Dropdown from '@/components/general/validatedInputs/Dropdown.vue';
    import { clients, companies  } from '@/util/apiRequests';
    import Loading from '@/components/general/loading/loading.vue';
    export default {
        components: {
            Dropdown,
            Loading
        },
        props: {
            client_id: {}
        },
        data() {
            return {
                counselors: {
                    primary_counselor: null,
                    secondary_counselor: null,
                    tertiary_counselor: null,
                    // showPrimary: true,
                    // showSecondary: false,
                    // showTertiary: false
                },
                showPrimary: true,
                showSecondary: false,
                showTertiary: false,
                counselorOptions: [],
                counselorOptionsOriginal: [],
                loading: true
            };
        },
        methods: {
            async getClientCounselors() {
                try {
                    let result = await this.$api.get(clients.getCounselors(this.client_id));
                    this.counselors.primary_counselor = result.data.counselors?.primary_counselor?.id.toString();
                    this.counselors.secondary_counselor = result.data.counselors?.secondary_counselor?.id.toString();
                    this.counselors.tertiary_counselor = result.data.counselors?.tertiary_counselor?.id.toString();
                    
                } catch (err) {
                    this.$toasted.error('Could not retrieve client counselors.');
                }
            },
            async getCounselorOptions() {
                try {
                    let result = await this.$api.get(companies.getClinicians(this.$store.state.user.company_id));
                    this.counselorOptions = result.data.map((element) => {
                        return { text: `${element?.first_name} ${element?.last_name}`, value: element.id };
                    });
                    this.counselorOptionsOriginal = this.counselorOptions;
                } catch (err) {
                    this.$toasted.error('Could not retrieve list of counselors.');
                }
            },
            async saveCounselors() {
                try{
                    await this.$api.post(clients.saveCounselors(this.client_id), {counselors: this.counselors});
                    this.$toasted.success('Counselors saved successfully.');
                }catch(error){
                    this.$toasted.error('Could not retrieve counselors.');
                }

            },
            calibrateMenu(newValue, oldValue){
                if(!this.loading ){
                    let optionToAdd = null;
                    if(oldValue !== null && oldValue){
                        optionToAdd = this.counselorOptionsOriginal.find(counselor => counselor.value == oldValue);
                     
                    }
                    this.counselorOptions = this.counselorOptions.map(function(obj){
                        if(optionToAdd?.value == obj?.value){
                            obj.disabled = false;
                        }
                        if(obj?.value == newValue){obj.disabled = true}
                        return obj;
                    })
                }
            },
            remove(type){
                switch (type) {
                    case 'primary':
                        if(this.counselors.secondary_counselor && !this.counselors.tertiary_counselor){
                            this.counselors.primary_counselor = this.counselors.secondary_counselor
                            this.counselors.secondary_counselor = '';
                            if(this.showTertiary == true){
                                this.showSecondary = true;
                                this.showTertiary = false;
                            }else {
                                this.showSecondary = false;
                            }
                        }
                        else if(this.counselors.secondary_counselor && this.counselors.tertiary_counselor){
                            this.counselors.primary_counselor = this.counselors.secondary_counselor
                            this.counselors.secondary_counselor = this.counselors.tertiary_counselor;
                            this.counselors.tertiary_counselor = '';
                            this.showTertiary = false;
                        }
                        else{
                            if(this.showSecondary){
                                this.showSecondary = false;
                            }
                            this.counselors.primary_counselor = '';
                        }
                    
                        break;
                    case 'secondary':
                        if(this.counselors.tertiary_counselor){
                            this.counselors.secondary_counselor = this.counselors.tertiary_counselor;
                            this.showTertiary = false;
                            this.counselors.tertiary_counselor = '';
                            
                            // this.showTertiary = false;

                        }
                        else if(!this.counselors.tertiary_counselor && this.showTertiary == true){
                            this.showTertiary = false;
                            this.counselors.secondary_counselor = '';
                        }
                        else {
                            
                            this.counselors.secondary_counselor = '';
                            this.showSecondary = false;

                            // this.showTertiary = false;

                        }
                        break;
                    case 'tertiary':
                        
                        this.counselors.tertiary_counselor = '';
                        this.showTertiary = false;
                        // this.calibrateMenu('')
                        break;
                    default:
                        break;
                }
            },
            addCounselor(){
                if(this.showSecondary == false && this.showTertiary == false && this.counselors.primary_counselor){
                    this.showSecondary = true;
                }
                else if(this.showSecondary == true && this.showTertiary == false && this.counselors.secondary_counselor){
                    this.showTertiary = true;
                }
            },
            
        },
        watch: {
            'counselors.primary_counselor':{
                immediate: true,
                deep: true,
                handler: function (newVal, oldVal){
                    this.calibrateMenu(newVal, oldVal)
                }
            },
            'counselors.secondary_counselor': {
                immediate: true,
                deep: true,
                handler: function (newVal, oldVal){
                    this.calibrateMenu(newVal, oldVal)
                }
            },
            'counselors.tertiary_counselor': {
                immediate: true,
                deep: true,
                handler: function (newVal, oldVal){
                    this.calibrateMenu(newVal, oldVal)
            
                }
            }
        },
        async created() {
            await Promise.all([this.getClientCounselors(), this.getCounselorOptions()]);
            this.loading = false;
            let primary = this.counselorOptionsOriginal.find(counselor => counselor.value == this.counselors.primary_counselor);
            let secondary = this.counselorOptionsOriginal.find(counselor => counselor.value == this.counselors.secondary_counselor);
            let tertiary = this.counselorOptionsOriginal.find(counselor => counselor.value == this.counselors.tertiary_counselor);
             this.counselorOptions = this.counselorOptions.filter(function(obj){
                 obj.disabled = false;
                if(primary?.value == obj?.value){   
                    obj.disabled = true;
                }
                if(secondary?.value == obj?.value){
                    obj.disabled = true;
                }
                if(tertiary?.value == obj?.value){
                    obj.disabled = true;
                }
                return obj;
            })
            this.showSecondary = this.counselors?.secondary_counselor ? true : false;
            this.showTertiary =  this.counselors?.tertiary_counselor ? true : false;
            
        }
    };
</script>

<style></style>

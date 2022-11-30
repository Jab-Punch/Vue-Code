<template>
    <div class="bottom-10" >
        <h3>Telehealth Settings</h3>
        <p>Should this client be required to pay an invoice before entering a Telehealth appointment?</p>
        <div class="flex center">
            <input class="right-10 inline-block" type="checkbox" id="paymentBeforeTelealth"  :value="!paymentSetting" v-model='paymentSetting' @change="updatePaymentBeforeTelehealth"/>
            <label for="paymentBeforeTelealth"> Require Payment </label>
        </div>
    </div>
</template>

<script>

    import { settings } from '@/util/apiRequests';


    export default {
        name: 'PaymentBeforeTelehealth',
        data(){
            return{
                setting: 'pay_telehealth_session_before_join',
                level: 'client',
                clientId: null,
                paymentSetting: null,
                paymentSettingId: null,
                clientSettingId: null,

            }
        },

        methods:{
            async getTelehealthPaymentSettings() {
                try {
                    const res = await this.$api.get(settings.getList('client', this.clientId))
                    this.paymentSettingId = res.data.find(element => element.setting == this.setting)?.settings_id
                    this.clientSettingId = parseInt(res.data.find(element => element.setting == this.setting)?.data_id)

                } catch (error) {
                    console.log(error)
                }
            },

            async updatePaymentBeforeTelehealth(e){
                let checkboxValue = e.target.checked
                let updatedSettingValue = 0

                if (checkboxValue == true){
                    updatedSettingValue = 1
                }

                if(this.clientSettingId > 0){
                    await this.$api.put(settings.updateSettingById(this.clientSettingId), {val: updatedSettingValue})
                    this.$toasted.success('Successfully updated record.')
                    await this.getTelehealthPaymentSettings();
                    return
                }

                await this.$api.post(settings.createSettingData(this.level, this.clientId, this.paymentSettingId), {val: updatedSettingValue})
                this.$toasted.success('Successfully updated record.')
                await this.getTelehealthPaymentSettings();

            },

            async getPaymentSetting(){
                const res = await this.$api.get(settings.getSetting(this.setting, this.level, this.clientId))
                this.paymentSetting = res.data
                if(res.data.level == 'client'){
                    this.clientSettingId = res.data.data_id;
                }
            },

            async init(){
                await this.getTelehealthPaymentSettings()
                await this.getPaymentSetting()
            },

        },

        async created(){
            this.clientId = parseInt(this.$store.state.current_client_id)
            await this.init()
        }
    };
</script>

<style scoped>

</style>
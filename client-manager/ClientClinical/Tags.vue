<template>
  <div>
      <div class="flex">
          <h3 class="margin-0 right-10">Tags</h3>
          <p class="margin-0 bottom-20">(Select tags to assign to client)</p>
      </div>
      <div class="columns-2">
          <div class="bottom-10 flex center" v-for="(tag, tagIndex) in companyTags" :key="tag">
              <input class="right-5" type="checkbox" :id="'tag_box' + tagIndex" :value="tag" v-model="selectedTags" @change="updateTags"/>
              <label :for="'tag_box' + tagIndex"> {{tag}} </label>
          </div>
      </div>
  </div>
</template>

<script>
import { settings } from '@/util/apiRequests';
export default {
    props: {
        client_id: {

        }
    },
    data(){
        return {
            clientId: this.client_id,
            companyTags: [],
            selectedTags: [],
            levelId: this.client_id,
            level: 'client',
            updateClientSettingId: null,
            tagSettingsId: null
        }
    },
    methods: {
        async getTagSettingsId(){
            try {
                const res = await this.$api.get(settings.getList('company', this.$store.state.user.company_id))                
                this.tagSettingsId = res.data.find(element => element.setting == 'tags')?.settings_id
            }catch(error){
                //
            }
        },
        async getCompanyTags(){
            try{
                const res = await this.$api.get(settings.getSetting('tags', 'company', this.$store.state.user.company_id))
                this.companyTags = res.data.value.split(',');
                
            }catch(error){
                this.$toasted.error('Could not retrieve company tags');
            }
        },
        async getClientTags(){
            try{
                const res = await this.$api.get(settings.getSetting('tags', 'client', this.clientId));
                if(res.data.level == 'client'){
                    this.selectedTags = res.data.value.split(',');
                    this.updateClientSettingId = res.data.data_id;
                }
            }catch(error){
                this.$toasted.error('Could not retrieve client tags');
            }
        },
        async updateTags(){
            try {
                let payload = this.selectedTags.join(',');
                if(this.updateClientSettingId){
                    await this.$api.put(settings.updateSettingById(this.updateClientSettingId), {val: payload})
                }else {
                    await this.$api.post(settings.createSettingData(this.level, this.levelId, this.tagSettingsId), {val: payload})
                    await this.getTagSettingsId();
                    await Promise.all([this.getCompanyTags(), this.getClientTags()]);
                }
                this.$store.dispatch('clientOverview/getTags');
                this.$toasted.success('successfully modified');
            }catch(error){
                console.log(error);
            }
        }

    },
    //Get the tags.
    async created(){
        //get the setting id pertaining to the tag setting.
        await this.getTagSettingsId();
        await Promise.all([this.getCompanyTags(), this.getClientTags()]);
    }

}
</script>

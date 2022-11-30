<template>
<!-- Primary use of this component is for going to different pages -->
<!-- But it's emit action could theoretically allow you to utilize it for going to different sections on a single page via anchor -->
  <div class="page-tabs">
      <div v-for="(page, pageKey) in pages" :key="pageKey">
          <span @click="doAction(page)">
              <div :class="page.name == $route.name ? 'active':''">{{page.label}}</div>
          </span>
      </div>
  </div>
</template>

<script>
export default {
    props: {
        pages: {

        }
    },
    methods: {
        async doAction(page){
            this.$emit('action', page)
        }
    }
}
</script>

<style>

</style>
<template>
  <div id="app">
    <router-view class="uk-offcanvas-content" />
  </div>
</template>
<script>

export default {
  async mounted() {
    const UIkit = await import('uikit');
    const Icons = await import('uikit/dist/js/uikit-icons');
    UIkit.use(Icons.default);
  },
};
</script>
<style lang="scss" src="@npm/font-awesome/scss/font-awesome.scss" />
<style lang="scss" src="@style/theme-uikit/index.scss" />
<style lang="scss" src="@style/theme-mavon-editor/index.scss" />
<style lang="scss" src="@style/theme-element-ui/index.scss" />
<style lang="scss" src="@style/google-font/index.scss" />
<style lang="css" src="@npm/viewerjs/dist/viewer.css" />

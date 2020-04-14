<template>
    <component :is='current' :data='data'></component>
</template>
<script>
import book from './book.vue';

export default {
  name: 'ui',
  data() {
    return {
      current: null
    };
  },
  components: {
    book,
  },
  created() {
    this.data = {};
    window.ui = this;
  },
  methods: {
    show(id, data) {
      this.data = data || {};
      this.current = id;
    },
  }
};
</script>

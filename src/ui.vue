<template>
  <div>
    <button @click='showBook'>toggle</button>
    <component :is='current' :data='data'></component>
  </div>
</template>
<script>
import book from './book.vue';
import test from './test.vue';

console.log(book);
export default {
  name: 'ui',
  data() {
    return {
      current: null
    };
  },
  components: {
    book,
    test
  },
  created() {
    this.data = {};
    window.ui = this;
    main.book = book;
  },
  methods: {
    show(id, data) {
      this.data = data || {};
      this.current = id;
    },
    showBook() {
      if (this.current !== null) {
        main.closePanel();
      } else main.drawBook();
    }
  }
};
</script>
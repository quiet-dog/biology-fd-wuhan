<script lang='ts' setup>
import VDialog from "@/components/VDialog/VDialog.vue";
import { ref } from "vue";
const visible = ref(false);

function handleClosed() {
  visible.value = false;
}


</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="心电" v-model="visible"
    @closed="handleClosed">
    <ElTable>
      <ElTableColumn />
    </ElTable>
  </v-dialog>
</template>

<style scoped></style>

<script lang='ts' setup>
import { ref } from 'vue';
import VDialog from '../VDialog/VDialog.vue';
import { getResultShiJuan, setResultGanYu } from '@/api/resultShiJuan';
import { ResultShiJuanRow } from '@/api/resultShiJuan/types';
import dayjs from 'dayjs';
import { ElForm, ElMessage, FormRules } from 'element-plus';
const visible = ref(false)
const form = ref<ResultShiJuanRow>()
const formRef = ref<InstanceType<typeof ElForm>>()
const pingGuShiJian = ref()

const rules: FormRules = {
  userJobCode: [
    {
      required: true,
      message: ""
    }
  ],
  userNickname: [
    {
      required: true,
      message: ""
    }
  ],
  type: [
    {
      required: true,
      message: ""
    }
  ],
  score: [
    {
      required: true,
      message: ""
    }
  ],
  cePing: [
    {
      required: true,
      message: ""
    }
  ],
  lastTime: [
    {
      required: true,
      message: ""
    }
  ],
  ganYuFangShi: [
    {
      required: true,
      message: "请填写干预方式"
    }
  ],
  ganYuTime: [
    {
      required: true,
      message: "请选择干预时间"
    }
  ],
  ganYuResult: [
    {
      required: true,
      message: "请填写干预结果"
    }
  ],
  execUser: [
    {
      required: true,
      message: "请填写执行人员"
    }
  ]
};


function handleConfirem() {
  formRef.value.validate((valid, fields) => {
    console.log(fields)
    if (valid) {
      setResultGanYu({
        resultId: form.value.resultId,
        ganYuFangShi: form.value.ganYuFangShi,
        ganYuResult: form.value.ganYuResult,
        execUser: form.value.execUser,
        ganYuTime: form.value.ganYuTime
      }).then(res => {
        ElMessage.success('提交成功');
        visible.value = false;
      })
    } else {
      ElMessage.warning("请完整填写表单")
    }
  })


}
function handleOpen(resultId: number) {
  getResultShiJuan(resultId).then(res => {
    // @ts-expect-error
    form.value = res.data
    visible.value = true
    pingGuShiJian.value = dayjs(form.value.lastTime).format("YYYY-MM-DD")
  })
}

function cancelConfirm() {
  visible.value = false
}

defineExpose({
  handleOpen
})
</script>

<template>
  <VDialog title="干预措施" @cancel="cancelConfirm" @confirm="handleConfirem" use-body-scrolling v-model="visible">
    <ElForm :rules="rules" ref="formRef" :model="form">
      <ElRow>
        <ElCol :span="12">
          <ElFormItem prop="userJobCode" label="人员工号：">
            <ElInput style="width: 300px;" v-model="form.userJobCode" :disabled="true" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem prop="userNickname" label="人员姓名：">
            <ElInput style="width: 300px;" v-model="form.userNickname" :disabled="true" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="12">
          <ElFormItem prop="type" label="量表名称：">
            <ElInput style="width: 300px;" v-model="form.type" :disabled="true" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem prop="score" label="最终得分：">
            <ElInput style="width: 300px;" v-model="form.score" :disabled="true" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="12">
          <ElFormItem prop="cePing" label="评估结果：">
            <ElInput style="width: 300px;" v-model="form.cePing" :disabled="true" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem prop="lastTime" label="评估时间：">
            <ElDatePicker v-model="form.lastTime" :disabled="true" type="date" value-format="x" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="12">
          <ElFormItem prop="ganYuFangShi" label="干预方式：">
            <ElInput style="width: 300px;" v-model="form.ganYuFangShi" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem prop="ganYuTime" label="干预时间：">
            <!-- <ElInput style="width: 300px;" :disabled="true" /> -->
            <ElDatePicker v-model="form.ganYuTime" type="date" value-format="x" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="12">
          <ElFormItem prop="execUser" label="执行人员：">
            <ElInput style="width: 300px;" v-model="form.execUser" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem prop="ganYuResult" label="跟踪结果：">
            <ElInput style="width: 300px;" v-model="form.ganYuResult" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </VDialog>
</template>

<style scoped></style>

<template>
  <div class="settings-container">
    <el-card class="header-card">
      <span class="title">系统设置</span>
    </el-card>

    <el-card>
      <el-form :model="form" ref="formRef" label-width="100px" v-loading="loading">
        <el-divider content-position="left">基础设置</el-divider>
        <el-form-item label="系统名称">
          <el-input v-model="form.site_name" placeholder="请输入系统名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="系统Logo">
          <div class="image-upload-section">
            <el-radio-group v-model="uploadType" size="small">
              <el-radio-button label="url">URL输入</el-radio-button>
              <el-radio-button label="upload">本地上传</el-radio-button>
            </el-radio-group>
            <div class="upload-content">
              <el-input
                v-if="uploadType === 'url'"
                v-model="form.site_logo"
                placeholder="请输入Logo图片URL"
              />
              <el-upload
                v-else
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
              >
                <el-button type="primary" size="small">选择图片</el-button>
              </el-upload>
            </div>
            <div v-if="form.site_logo" class="image-preview">
              <el-image :src="form.site_logo" style="width: 120px; height: 120px" fit="contain" />
            </div>
          </div>
        </el-form-item>

        <el-divider content-position="left">联系信息</el-divider>
        <el-form-item label="联系电话">
          <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="form.contact_email" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input v-model="form.contact_address" type="textarea" :rows="2" placeholder="请输入联系地址" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
          <el-button @click="loadData">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getSettingsList, updateSettings, initSettings } from '../../api';

const loading = ref(false);
const saving = ref(false);
const formRef = ref(null);
const uploadType = ref('url');

const form = reactive({
    site_name: '',
    site_logo: '',
    contact_phone: '',
    contact_email: '',
    contact_address: ''
});

const uploadUrl = 'https://yspt-api.lechiqy.com/upload';
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('adminToken')
}));

const loadData = async () => {
    loading.value = true;
    try {
        const res = await getSettingsList();
        if (res.data) {
            form.site_name = res.data.site_name?.value || '';
            form.site_logo = res.data.site_logo?.value || '';
            form.contact_phone = res.data.contact_phone?.value || '';
            form.contact_email = res.data.contact_email?.value || '';
            form.contact_address = res.data.contact_address?.value || '';
        }
    } catch (error) {
        console.log('加载设置失败:', error);
        // 尝试初始化设置
        try {
            await initSettings();
            ElMessage.success('已初始化默认设置');
            loadData();
        } catch (initError) {
            console.log('初始化设置失败:', initError);
        }
    } finally {
        loading.value = false;
    }
};

const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
    }
    if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!');
        return false;
    }
    return true;
};

const handleUploadSuccess = (response) => {
    if (response.url) {
        form.site_logo = response.url;
        ElMessage.success('上传成功');
    }
};

const handleSave = async () => {
    saving.value = true;
    try {
        await updateSettings({
            site_name: form.site_name,
            site_logo: form.site_logo,
            contact_phone: form.contact_phone,
            contact_email: form.contact_email,
            contact_address: form.contact_address
        });
        ElMessage.success('保存成功');
    } catch (error) {
        console.log('保存设置失败:', error);
        ElMessage.error('保存失败');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.settings-container {
    padding: 20px;
}

.header-card {
    margin-bottom: 20px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.image-upload-section {
    width: 100%;
}

.upload-content {
    margin: 10px 0;
}

.image-preview {
    margin-top: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    display: inline-block;
}

:deep(.el-divider__text) {
    font-weight: bold;
    color: #303133;
}
</style>

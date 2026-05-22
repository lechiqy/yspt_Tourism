<template>
  <div class="swipers-container">
    <el-card class="header-card">
      <div class="header-content">
        <span class="title">小程序首页轮播图管理</span>
        <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="SwiperID" label="ID" width="80" />
        <el-table-column prop="Image" label="图片" width="180">
          <template #default="{ row }">
            <el-image
              :src="row.Image"
              :preview-src-list="[row.Image]"
              style="width: 160px; height: 90px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="Title" label="标题" min-width="150">
          <template #default="{ row }">
            {{ row.Title || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="LinkType" label="跳转类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLinkTypeTag(row.LinkType)">{{ getLinkTypeName(row.LinkType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="LinkValue" label="跳转值" min-width="150">
          <template #default="{ row }">
            <span v-if="row.LinkType === 'none'">-</span>
            <span v-else>{{ row.LinkValue || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="Sort" label="排序" width="80" />
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.Status === 'active' ? 'success' : 'info'">
              {{ row.Status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="图片" prop="Image">
          <div class="image-upload-section">
            <el-radio-group v-model="uploadType" size="small">
              <el-radio-button label="url">URL输入</el-radio-button>
              <el-radio-button label="upload">本地上传</el-radio-button>
            </el-radio-group>
            <div class="upload-content">
              <el-input
                v-if="uploadType === 'url'"
                v-model="form.Image"
                placeholder="请输入图片URL"
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
            <div v-if="form.Image" class="image-preview">
              <el-image :src="form.Image" style="width: 300px; height: 170px" fit="cover" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.Title" placeholder="请输入标题（可选）" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="跳转类型" prop="LinkType">
          <el-select v-model="form.LinkType" placeholder="请选择跳转类型" @change="handleLinkTypeChange">
            <el-option label="无跳转" value="none" />
            <el-option label="线路详情" value="route" />
            <el-option label="分类内容详情" value="content" />
            <el-option label="莆韵红团" value="hongtuan" />
            <el-option label="莆韵红迹" value="hongji" />
            <el-option label="旅游线路" value="routes" />
            <el-option label="热门活动" value="activity" />
            <el-option label="分类页面" value="category" />
            <el-option label="外部链接" value="external" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.LinkType !== 'none'" label="跳转值" prop="LinkValue">
          <el-select v-if="form.LinkType === 'route'" v-model="form.LinkValue" placeholder="请选择线路" filterable>
            <el-option
              v-for="item in routeList"
              :key="item.RouteID"
              :label="item.RouteName"
              :value="String(item.RouteID)"
            />
          </el-select>
          <el-select v-else-if="form.LinkType === 'content'" v-model="form.LinkValue" placeholder="请选择内容" filterable>
            <el-option
              v-for="item in contentList"
              :key="item.ContentID"
              :label="item.Title"
              :value="String(item.ContentID)"
            />
          </el-select>
          <el-select v-else-if="form.LinkType === 'category'" v-model="form.LinkValue" placeholder="请选择分类">
            <el-option label="智慧景区" value="scenic" />
            <el-option label="特色美食" value="food" />
            <el-option label="非遗文化" value="culture" />
            <el-option label="文旅路线" value="routes" />
          </el-select>
          <el-input v-else-if="form.LinkType === 'external'" v-model="form.LinkValue" placeholder="请输入外部链接URL" />
          <span v-else style="color: #999;">该页面无需额外参数</span>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.Sort" :min="0" :max="999" />
          <span class="sort-tip">数字越小越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.Status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSwiperList, addSwiper, updateSwiper, deleteSwiper, getRouteList, getContentsList } from '../../api';

const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('添加轮播图');
const isEdit = ref(false);
const formRef = ref(null);
const submitting = ref(false);
const uploadType = ref('url');
const routeList = ref([]);
const contentList = ref([]);

const uploadUrl = 'https://yspt-api.lechiqy.com/upload';
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('adminToken')
}));

const form = reactive({
    SwiperID: null,
    Title: '',
    Image: '',
    LinkType: 'none',
    LinkValue: '',
    Sort: 0,
    Status: 'active'
});

const rules = {
    Image: [{ required: true, message: '请上传图片', trigger: 'change' }],
    LinkType: [{ required: true, message: '请选择跳转类型', trigger: 'change' }]
};

const linkTypeMap = {
    none: '无跳转',
    route: '线路详情',
    content: '分类内容详情',
    hongtuan: '莆韵红团',
    hongji: '莆韵红迹',
    routes: '旅游线路',
    activity: '热门活动',
    category: '分类页面',
    external: '外部链接'
};

const linkTypeTagMap = {
    none: 'info',
    route: 'primary',
    content: 'success',
    hongtuan: 'danger',
    hongji: 'warning',
    routes: 'primary',
    activity: 'warning',
    category: 'success',
    external: 'info'
};

const getLinkTypeName = (type) => linkTypeMap[type] || type;
const getLinkTypeTag = (type) => linkTypeTagMap[type] || 'info';

const loadData = async () => {
    try {
        const res = await getSwiperList();
        tableData.value = res.list || [];
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

const loadRouteList = async () => {
    try {
        const res = await getRouteList({ page: 1, limit: 100 });
        routeList.value = res.list || [];
    } catch (error) {
        console.log('加载线路列表失败:', error);
    }
};

const loadContentList = async () => {
    try {
        const res = await getContentsList({ page: 1, limit: 100 });
        contentList.value = res.list || [];
    } catch (error) {
        console.log('加载内容列表失败:', error);
    }
};

const resetForm = () => {
    Object.assign(form, {
        SwiperID: null,
        Title: '',
        Image: '',
        LinkType: 'none',
        LinkValue: '',
        Sort: 0,
        Status: 'active'
    });
    uploadType.value = 'url';
};

const handleAdd = () => {
    dialogTitle.value = '添加轮播图';
    isEdit.value = false;
    resetForm();
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑轮播图';
    isEdit.value = true;
    Object.assign(form, {
        SwiperID: row.SwiperID,
        Title: row.Title || '',
        Image: row.Image,
        LinkType: row.LinkType || 'none',
        LinkValue: row.LinkValue || '',
        Sort: row.Sort || 0,
        Status: row.Status || 'active'
    });
    dialogVisible.value = true;
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该轮播图吗？', '提示', { type: 'warning' });
        await deleteSwiper(row.SwiperID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') console.log('删除失败:', error);
    }
};

const handleLinkTypeChange = () => {
    form.LinkValue = '';
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
        form.Image = response.url;
        ElMessage.success('上传成功');
    }
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        submitting.value = true;

        const submitData = {
            Title: form.Title,
            Image: form.Image,
            LinkType: form.LinkType,
            LinkValue: form.LinkType === 'none' ? '' : form.LinkValue,
            Sort: form.Sort,
            Status: form.Status
        };

        if (isEdit.value) {
            await updateSwiper(form.SwiperID, submitData);
            ElMessage.success('更新成功');
        } else {
            await addSwiper(submitData);
            ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        loadData();
    } catch (error) {
        if (error !== false) console.log('提交失败:', error);
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    loadData();
    loadRouteList();
    loadContentList();
});
</script>

<style scoped>
.swipers-container {
    padding: 20px;
}

.header-card {
    margin-bottom: 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
}

.sort-tip {
    margin-left: 10px;
    color: #999;
    font-size: 12px;
}
</style>

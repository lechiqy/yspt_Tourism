<template>
  <div class="activities-container">
    <el-card class="header-card">
      <div class="header-content">
        <div class="left">
          <span class="title">热门活动管理</span>
          <el-select v-model="filterStatus" placeholder="状态筛选" @change="loadData" style="margin-left: 20px; width: 120px;">
            <el-option label="全部" value="all" />
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">添加活动</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="ActivityID" label="ID" width="80" />
        <el-table-column prop="CoverImage" label="封面" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.CoverImage"
              :preview-src-list="[row.CoverImage]"
              style="width: 100px; height: 60px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="Title" label="标题" min-width="150" />
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.Status)">{{ getStatusName(row.Status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="参与方式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.JoinType === 'link' ? 'warning' : 'success'">
              {{ row.JoinType === 'link' ? '跳转' : '报名' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跳转类型" width="120">
          <template #default="{ row }">
            <template v-if="row.JoinType === 'link'">
              <el-tag :type="getLinkTypeTag(row.LinkType)">{{ getLinkTypeName(row.LinkType) }}</el-tag>
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="跳转值" min-width="150">
          <template #default="{ row }">
            <template v-if="row.JoinType === 'link'">
              <span v-if="row.LinkType === 'none'">-</span>
              <span v-else>{{ row.LinkValue || '-' }}</span>
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            {{ row.StartDate }} ~ {{ row.EndDate }}
          </template>
        </el-table-column>
        <el-table-column prop="Location" label="地点" width="150">
          <template #default="{ row }">
            {{ row.Location || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="Price" label="价格" width="100">
          <template #default="{ row }">
            <span v-if="row.Price == 0">免费</span>
            <span v-else style="color: #f56c6c;">¥{{ row.Price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            <template v-if="row.JoinType === 'register' || !row.JoinType">
              {{ row.CurrentParticipants }}{{ row.MaxParticipants ? '/' + row.MaxParticipants : '' }}
            </template>
            <template v-else-if="row.JoinType === 'link'">
              {{ row.CurrentParticipants || 0 }}
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="Sort" label="排序" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="活动标题" prop="Title">
          <el-input v-model="form.Title" placeholder="请输入活动标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="封面图片" prop="CoverImage">
          <div class="image-upload-section">
            <el-radio-group v-model="uploadType" size="small">
              <el-radio-button label="url">URL输入</el-radio-button>
              <el-radio-button label="upload">本地上传</el-radio-button>
            </el-radio-group>
            <div class="upload-content">
              <el-input
                v-if="uploadType === 'url'"
                v-model="form.CoverImage"
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
            <div v-if="form.CoverImage" class="image-preview">
              <el-image :src="form.CoverImage" style="width: 300px; height: 170px" fit="cover" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="活动简介">
          <el-input v-model="form.Description" type="textarea" :rows="3" placeholder="请输入活动简介" maxlength="500" show-word-limit />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="StartDate">
              <el-date-picker v-model="form.StartDate" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="EndDate">
              <el-date-picker v-model="form.EndDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动地点">
          <el-input v-model="form.Location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动价格">
              <el-input-number v-model="form.Price" :min="0" :precision="2" style="width: 100%;" />
              <span style="color: #999; font-size: 12px; margin-left: 5px;">0表示免费</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参与方式">
              <el-radio-group v-model="form.JoinType">
                <el-radio label="register">报名</el-radio>
                <el-radio label="link">跳转</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 报名类型：显示人数限制 -->
        <el-row :gutter="20" v-if="form.JoinType === 'register'">
          <el-col :span="12">
            <el-form-item label="人数限制">
              <el-input-number v-model="form.MaxParticipants" :min="0" placeholder="不限" style="width: 100%;" />
              <span style="color: #999; font-size: 12px; margin-left: 5px;">0或空表示不限</span>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 跳转类型：显示参与人数设置 -->
        <el-row :gutter="20" v-if="form.JoinType === 'link'">
          <el-col :span="12">
            <el-form-item label="参与人数">
              <el-input-number v-model="form.CurrentParticipants" :min="0" style="width: 100%;" />
              <span style="color: #999; font-size: 12px; margin-left: 5px;">手动设置参与人数</span>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 跳转类型：显示跳转配置 -->
        <template v-if="form.JoinType === 'link'">
          <el-form-item label="跳转类型" prop="LinkType">
            <el-select v-model="form.LinkType" placeholder="请选择跳转类型" @change="handleLinkTypeChange">
              <el-option label="外部链接" value="external" />
              <el-option label="线路详情" value="route" />
              <el-option label="分类内容详情" value="content" />
              <el-option label="莆韵红团" value="hongtuan" />
              <el-option label="莆韵红迹" value="hongji" />
              <el-option label="旅游线路" value="routes" />
              <el-option label="热门活动" value="activity" />
              <el-option label="分类页面" value="category" />
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
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.Status" placeholder="请选择状态" style="width: 100%;">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已结束" value="ended" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.Sort" :min="0" :max="999" style="width: 100%;" />
              <span style="color: #999; font-size: 12px; margin-left: 5px;">数字越小越靠前</span>
            </el-form-item>
          </el-col>
        </el-row>
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
import { getActivityList, addActivity, updateActivity, deleteActivity, getRouteList, getContentsList } from '../../api';

const tableData = ref([]);
const filterStatus = ref('all');
const dialogVisible = ref(false);
const dialogTitle = ref('添加活动');
const isEdit = ref(false);
const formRef = ref(null);
const submitting = ref(false);
const uploadType = ref('url');
const routeList = ref([]);
const contentList = ref([]);

const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0
});

const uploadUrl = 'https://yspt-api.lechiqy.com/upload';
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('adminToken')
}));

const form = reactive({
    ActivityID: null,
    Title: '',
    CoverImage: '',
    Description: '',
    Status: 'draft',
    StartDate: '',
    EndDate: '',
    Location: '',
    Price: 0,
    MaxParticipants: null,
    CurrentParticipants: 0,
    JoinType: 'register',
    LinkType: 'external',
    LinkValue: '',
    Sort: 0
});

const rules = {
    Title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
    CoverImage: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
    StartDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    EndDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
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

const statusMap = {
    draft: { name: '草稿', type: 'info' },
    published: { name: '已发布', type: 'primary' },
    ongoing: { name: '进行中', type: 'success' },
    ended: { name: '已结束', type: 'warning' }
};

const getStatusName = (status) => statusMap[status]?.name || status;
const getStatusType = (status) => statusMap[status]?.type || 'info';

const loadData = async () => {
    try {
        const res = await getActivityList({
            page: pagination.page,
            limit: pagination.limit,
            status: filterStatus.value
        });
        tableData.value = res.list || [];
        pagination.total = res.total || 0;
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

const handleLinkTypeChange = () => {
    form.LinkValue = '';
};

const resetForm = () => {
    Object.assign(form, {
        ActivityID: null,
        Title: '',
        CoverImage: '',
        Description: '',
        Status: 'draft',
        StartDate: '',
        EndDate: '',
        Location: '',
        Price: 0,
        MaxParticipants: null,
        CurrentParticipants: 0,
        JoinType: 'register',
        LinkType: 'external',
        LinkValue: '',
        Sort: 0
    });
    uploadType.value = 'url';
};

const handleAdd = () => {
    dialogTitle.value = '添加活动';
    isEdit.value = false;
    resetForm();
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑活动';
    isEdit.value = true;
    Object.assign(form, {
        ActivityID: row.ActivityID,
        Title: row.Title,
        CoverImage: row.CoverImage,
        Description: row.Description || '',
        Status: row.Status || 'draft',
        StartDate: row.StartDate,
        EndDate: row.EndDate,
        Location: row.Location || '',
        Price: row.Price || 0,
        MaxParticipants: row.MaxParticipants,
        CurrentParticipants: row.CurrentParticipants || 0,
        JoinType: row.JoinType || 'register',
        LinkType: row.LinkType || 'external',
        LinkValue: row.LinkValue || '',
        Sort: row.Sort || 0
    });
    dialogVisible.value = true;
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该活动吗？', '提示', { type: 'warning' });
        await deleteActivity(row.ActivityID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') console.log('删除失败:', error);
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
        form.CoverImage = response.url;
        ElMessage.success('上传成功');
    }
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        submitting.value = true;

        const submitData = {
            Title: form.Title,
            CoverImage: form.CoverImage,
            Description: form.Description,
            Status: form.Status,
            StartDate: form.StartDate,
            EndDate: form.EndDate,
            Location: form.Location,
            Price: form.Price,
            MaxParticipants: form.JoinType === 'register' ? (form.MaxParticipants || null) : null,
            CurrentParticipants: form.JoinType === 'link' ? form.CurrentParticipants : form.CurrentParticipants,
            JoinType: form.JoinType,
            LinkType: form.JoinType === 'link' ? form.LinkType : null,
            LinkValue: form.JoinType === 'link' ? form.LinkValue : null,
            Sort: form.Sort
        };

        if (isEdit.value) {
            await updateActivity(form.ActivityID, submitData);
            ElMessage.success('更新成功');
        } else {
            await addActivity(submitData);
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
.activities-container {
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

.header-content .left {
    display: flex;
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
</style>

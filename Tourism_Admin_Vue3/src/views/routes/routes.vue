<template>
  <div class="routes-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="线路名称">
          <el-input v-model="searchForm.RouteName" placeholder="请输入线路名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.Status" placeholder="请选择状态" clearable>
            <el-option label="待发布" value="draft" />
            <el-option label="已发布(可购买)" value="published" />
            <el-option label="仅展示(不可购买)" value="display_only" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加线路</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="RouteID" label="ID" width="80" />
        <el-table-column prop="RouteName" label="线路名称" min-width="150" />
        <el-table-column prop="Days" label="天数" width="80" />
        <el-table-column prop="Price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.Price }}
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.Status)">{{ getStatusText(row.Status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="admin.RealName" label="管理员" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.Status === 'published' ? 'warning' : row.Status === 'display_only' ? 'info' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.Status === 'draft' ? '发布' : row.Status === 'published' ? '设为仅展示' : row.Status === 'display_only' ? '下架' : '发布' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="线路名称" prop="RouteName">
          <el-input v-model="form.RouteName" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="行程天数" prop="Days">
          <el-input-number v-model="form.Days" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="价格" prop="Price">
          <el-input-number v-model="form.Price" :min="0" :precision="2" :controls="false" />
        </el-form-item>
        <el-form-item label="线路描述" prop="Description">
          <el-input v-model="form.Description" type="textarea" :rows="4" placeholder="请输入线路描述" />
        </el-form-item>
        <el-form-item label="状态" prop="Status">
          <el-radio-group v-model="form.Status">
            <el-radio value="draft">待发布</el-radio>
            <el-radio value="published">已发布（可预订）</el-radio>
            <el-radio value="display_only">仅展示（不可预订）</el-radio>
            <el-radio value="offline">已下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图片" prop="CoverImage">
          <div class="image-upload-section">
            <div class="upload-content">
              <el-input v-model="form.CoverImage" placeholder="请输入封面图片URL" />
            </div>
            <div v-if="form.CoverImage" class="image-preview">
              <el-image :src="form.CoverImage" style="width: 200px; height: 120px" fit="cover" />
              <el-button type="danger" size="small" @click="form.CoverImage = ''">删除</el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 多图片管理 -->
        <el-form-item label="图片列表">
          <div class="images-section">
            <div class="images-input">
              <el-input v-model="newImageUrl" placeholder="输入图片URL" style="width: 300px" />
              <el-button type="primary" @click="addImageByUrl">添加</el-button>
            </div>
            <div class="images-list">
              <div v-for="(img, index) in form.Images" :key="index" class="image-item">
                <el-image :src="img" style="width: 100px; height: 70px" fit="cover" />
                <el-button type="danger" size="small" circle @click="removeImage(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import { getRouteList, addRoute, updateRoute, updateRouteStatus, deleteRoute } from '../../api';

const searchForm = ref({
    RouteName: '',
    Status: ''
});

const tableData = ref([]);
const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref('添加线路');
const isEdit = ref(false);
const formRef = ref(null);

const newImageUrl = ref('');

const form = reactive({
    RouteID: null,
    RouteName: '',
    Days: 1,
    Price: 0,
    Description: '',
    CoverImage: '',
    Images: []
});

const rules = {
    RouteName: [{ required: true, message: '请输入线路名称', trigger: 'blur' }],
    Days: [{ required: true, message: '请输入天数', trigger: 'blur' }],
    Price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
};

const getStatusType = (status) => {
    const types = { draft: 'info', published: 'success', display_only: 'warning', offline: 'info' };
    return types[status] || 'info';
};

const getStatusText = (status) => {
    const texts = { draft: '待发布', published: '已发布', display_only: '仅展示', offline: '已下架' };
    return texts[status] || status;
};

const loadData = async () => {
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            ...searchForm.value
        };
        const res = await getRouteList(params);
        tableData.value = res.list;
        pagination.total = res.total;
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

const handleSearch = () => {
    pagination.page = 1;
    loadData();
};

const handleReset = () => {
    searchForm.value = { RouteName: '', Status: '' };
    handleSearch();
};

const handleAdd = () => {
    dialogTitle.value = '添加线路';
    isEdit.value = false;
    Object.assign(form, {
        RouteID: null,
        RouteName: '',
        Days: 1,
        Price: 0,
        Description: '',
        CoverImage: '',
        Images: []
    });
    newImageUrl.value = '';
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑线路';
    isEdit.value = true;
    Object.assign(form, row);
    dialogVisible.value = true;
};

const handleToggleStatus = async (row) => {
    const statusCycle = { draft: 'published', published: 'display_only', display_only: 'offline', offline: 'published' };
        const newStatus = statusCycle[row.Status] || 'published';
    try {
        await updateRouteStatus(row.RouteID, { Status: newStatus });
        const statusMsg = { draft: '已设为待发布', published: '已发布（可预订）', display_only: '已设为仅展示', offline: '已下架' };
        ElMessage.success(statusMsg[newStatus] || '状态更新成功');
        loadData();
    } catch (error) {
        console.log('更新状态失败:', error);
    }
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该线路吗？', '提示', {
            type: 'warning'
        });
        await deleteRoute(row.RouteID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') {
            console.log('删除失败:', error);
        }
    }
};

// 图片管理
const addImageByUrl = () => {
    if (newImageUrl.value) {
        form.Images.push(newImageUrl.value);
        newImageUrl.value = '';
    }
};

const removeImage = (index) => {
    form.Images.splice(index, 1);
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        if (isEdit.value) {
            await updateRoute(form.RouteID, form);
            ElMessage.success('更新成功');
        } else {
            await addRoute(form);
            ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        loadData();
    } catch (error) {
        console.log('提交失败:', error);
    }
};

const handleDialogClose = () => {
    formRef.value?.resetFields();
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.routes-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.table-card {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.image-upload-section .upload-content {
    flex: 1;
}

.image-upload-section .image-preview {
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.images-section {
    width: 100%;
}

.images-input {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.images-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.images-list .image-item {
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 4px;
}

.images-list .image-item .el-button {
    position: absolute;
    top: -8px;
    right: -8px;
}
</style>

<template>
  <div class="products-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.Status" placeholder="全部状态" clearable style="width:160px">
            <el-option label="上架" value="active" />
            <el-option label="仅展示" value="display_only" />
            <el-option label="下架" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="success" @click="openAddDialog">+ 新增商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="ProductID" label="ID" width="60" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.Image"
              :src="row.Image"
              style="width:50px;height:50px;border-radius:4px"
              fit="cover"
              :preview-src-list="[row.Image]"
            />
            <span v-else style="color:#999">无图</span>
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="商品名称" min-width="140" />
        <el-table-column prop="Desc" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="Price" label="单价" width="100">
          <template #default="{ row }">¥{{ parseFloat(row.Price).toFixed(2) }}/{{ row.Unit }}</template>
        </el-table-column>
        <el-table-column prop="Unit" label="单位" width="60" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.Status === 'active'" type="success">上架</el-tag>
            <el-tag v-else-if="row.Status === 'display_only'" type="warning">仅展示</el-tag>
            <el-tag v-else type="info">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="Name">
          <el-input v-model="form.Name" placeholder="请输入商品名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="商品描述" prop="Desc">
          <el-input
            v-model="form.Desc"
            type="textarea"
            :rows="2"
            placeholder="请输入商品描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="单价" prop="Price">
          <el-input-number v-model="form.Price" :min="0" :precision="2" :step="1" style="width:200px" />
          <span style="margin-left:8px;color:#999">元</span>
        </el-form-item>
        <el-form-item label="单位" prop="Unit">
          <el-input v-model="form.Unit" placeholder="如：个、盒、份" style="width:120px" maxlength="10" />
        </el-form-item>
        <el-form-item label="商品图片" prop="Image">
          <el-input v-model="form.Image" placeholder="输入图片URL" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态" prop="Status">
          <el-radio-group v-model="form.Status">
            <el-radio value="active">上架（可购买）</el-radio>
            <el-radio value="display_only">仅展示（不可购买）</el-radio>
            <el-radio value="inactive">下架（不显示）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProductList, addProduct, updateProduct, deleteProduct } from '../../api';

const searchForm = ref({ Status: '' });
const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });

const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const formRef = ref(null);
const form = reactive({
    Name: '',
    Desc: '',
    Price: 0,
    Unit: '个',
    Image: '',
    Status: 'active'
});

const rules = {
    Name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    Price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    Unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
};

let editId = null;

const loadData = async () => {
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            ...searchForm.value
        };
        const res = await getProductList(params);
        tableData.value = res.list;
        pagination.total = res.total;
    } catch (error) {
        console.log('加载商品数据失败:', error);
    }
};

const handleSearch = () => {
    pagination.page = 1;
    loadData();
};

const handleReset = () => {
    searchForm.value = { Status: '' };
    handleSearch();
};

const openAddDialog = () => {
    isEdit.value = false;
    editId = null;
    form.Name = '';
    form.Desc = '';
    form.Price = 0;
    form.Unit = '个';
    form.Image = '';
    form.Status = 'active';
    dialogVisible.value = true;
};

const openEditDialog = (row) => {
    isEdit.value = true;
    editId = row.ProductID;
    form.Name = row.Name;
    form.Desc = row.Desc || '';
    form.Price = parseFloat(row.Price);
    form.Unit = row.Unit;
    form.Image = row.Image || '';
    form.Status = row.Status;
    dialogVisible.value = true;
};

const handleSave = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    saving.value = true;
    try {
        if (isEdit.value && editId) {
            await updateProduct(editId, { ...form });
            ElMessage.success('商品更新成功');
        } else {
            await addProduct({ ...form });
            ElMessage.success('商品创建成功');
        }
        dialogVisible.value = false;
        loadData();
    } catch (error) {
        console.log('保存商品失败:', error);
    } finally {
        saving.value = false;
    }
};

const handleDelete = (row) => {
    ElMessageBox.confirm(`确定删除商品「${row.Name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await deleteProduct(row.ProductID);
            ElMessage.success('删除成功');
            loadData();
        } catch (error) {
            console.log('删除失败:', error);
        }
    }).catch(() => {});
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.products-container {
    padding: 20px;
}

.search-card,
.table-card {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>

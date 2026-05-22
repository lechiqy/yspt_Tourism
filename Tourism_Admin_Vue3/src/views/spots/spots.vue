<template>
  <div class="spots-container">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="success" @click="handleAdd">添加景点</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="SpotID" label="ID" width="80" />
        <el-table-column prop="SpotName" label="景点名称" min-width="150" />
        <el-table-column prop="City" label="城市" width="120" />
        <el-table-column prop="TicketPrice" label="门票价格" width="100">
          <template #default="{ row }">¥{{ row.TicketPrice }}</template>
        </el-table-column>
        <el-table-column prop="OpenTime" label="开放时间" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="景点名称" prop="SpotName">
          <el-input v-model="form.SpotName" placeholder="请输入景点名称" />
        </el-form-item>
        <el-form-item label="城市" prop="City">
          <el-input v-model="form.City" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="门票价格" prop="TicketPrice">
          <el-input-number v-model="form.TicketPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="开放时间" prop="OpenTime">
          <el-input v-model="form.OpenTime" placeholder="如：08:00-18:00" />
        </el-form-item>
        <el-form-item label="景点描述" prop="Description">
          <el-input v-model="form.Description" type="textarea" :rows="4" />
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
import { getSpotList, addSpot, updateSpot, deleteSpot } from '../../api';

const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });
const dialogVisible = ref(false);
const dialogTitle = ref('添加景点');
const isEdit = ref(false);
const formRef = ref(null);

const form = reactive({
    SpotID: null,
    SpotName: '',
    City: '',
    TicketPrice: 0,
    OpenTime: '',
    Description: ''
});

const loadData = async () => {
    try {
        const params = { page: pagination.page, limit: pagination.limit };
        const res = await getSpotList(params);
        tableData.value = res.list;
        pagination.total = res.total;
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

const handleAdd = () => {
    dialogTitle.value = '添加景点';
    isEdit.value = false;
    Object.assign(form, { SpotID: null, SpotName: '', City: '', TicketPrice: 0, OpenTime: '', Description: '' });
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑景点';
    isEdit.value = true;
    Object.assign(form, row);
    dialogVisible.value = true;
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该景点吗？', '提示', { type: 'warning' });
        await deleteSpot(row.SpotID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') console.log('删除失败:', error);
    }
};

const handleSubmit = async () => {
    try {
        if (isEdit.value) {
            await updateSpot(form.SpotID, form);
            ElMessage.success('更新成功');
        } else {
            await addSpot(form);
            ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        loadData();
    } catch (error) {
        console.log('提交失败:', error);
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.spots-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>

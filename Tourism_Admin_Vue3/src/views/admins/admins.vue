<template>
  <div class="admins-container">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="success" @click="handleAdd">添加管理员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="AdminID" label="ID" width="80" />
        <el-table-column prop="Username" label="用户名" width="150" />
        <el-table-column prop="RealName" label="真实姓名" width="120" />
        <el-table-column prop="Role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.Role === 'admin' ? 'primary' : 'success'">
              {{ row.Role === 'admin' ? '系统管理员' : '线路管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Phone" label="联系电话" width="150" />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="Username">
          <el-input v-model="form.Username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="Password" v-if="!isEdit">
          <el-input v-model="form.Password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="RealName">
          <el-input v-model="form.RealName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="Role">
          <el-select v-model="form.Role" placeholder="请选择角色">
            <el-option label="系统管理员" value="admin" />
            <el-option label="线路管理员" value="route_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="Phone">
          <el-input v-model="form.Phone" placeholder="请输入联系电话" />
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
import { getAdminList, addAdmin, updateAdmin, deleteAdmin } from '../../api';

const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });
const dialogVisible = ref(false);
const dialogTitle = ref('添加管理员');
const isEdit = ref(false);
const formRef = ref(null);

const form = reactive({
    AdminID: null,
    Username: '',
    Password: '',
    RealName: '',
    Role: 'admin',
    Phone: ''
});

const loadData = async () => {
    try {
        const params = { page: pagination.page, limit: pagination.limit };
        const res = await getAdminList(params);
        tableData.value = res.list;
        pagination.total = res.total;
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

const handleAdd = () => {
    dialogTitle.value = '添加管理员';
    isEdit.value = false;
    Object.assign(form, { AdminID: null, Username: '', Password: '', RealName: '', Role: 'admin', Phone: '' });
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑管理员';
    isEdit.value = true;
    Object.assign(form, { ...row, Password: '' });
    dialogVisible.value = true;
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该管理员吗？', '提示', { type: 'warning' });
        await deleteAdmin(row.AdminID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') console.log('删除失败:', error);
    }
};

const handleSubmit = async () => {
    try {
        if (isEdit.value) {
            const data = { ...form };
            if (!data.Password) delete data.Password;
            await updateAdmin(form.AdminID, data);
            ElMessage.success('更新成功');
        } else {
            await addAdmin(form);
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
.admins-container {
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

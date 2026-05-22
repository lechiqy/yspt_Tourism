<template>
  <div class="users-container">
    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="UserID" label="ID" width="80" />
        <el-table-column prop="Username" label="用户名" width="150" />
        <el-table-column prop="RealName" label="真实姓名" width="120" />
        <el-table-column prop="Phone" label="手机号" width="150" />
        <el-table-column prop="Email" label="邮箱" min-width="200" />
        <el-table-column prop="OpenID" label="微信OpenID" min-width="220" />
        <el-table-column prop="createdAt" label="注册时间" width="180" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getUserList } from '../../api';

const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });

const loadData = async () => {
    try {
        const params = { page: pagination.page, limit: pagination.limit };
        const res = await getUserList(params);
        tableData.value = res.list;
        pagination.total = res.total;
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.users-container {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>

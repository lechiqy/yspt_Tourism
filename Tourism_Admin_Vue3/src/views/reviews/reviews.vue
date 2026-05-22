<template>
  <div class="reviews-container">
    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="ReviewID" label="ID" width="80" />
        <el-table-column prop="user.Username" label="用户名" width="120" />
        <el-table-column prop="route.RouteName" label="线路" min-width="150" />
        <el-table-column prop="Rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.Rating" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="Content" label="评价内容" min-width="300" />
        <el-table-column prop="createdAt" label="评价时间" width="180" />
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

const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });

const loadData = () => {
    // 模拟数据
    tableData.value = [];
    pagination.total = 0;
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.reviews-container {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>

<template>
  <div class="orders-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.Status" placeholder="请选择状态" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="待使用" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="OrderID" label="ID" width="80" />
        <el-table-column prop="OrderNo" label="订单编号" width="180" />
        <el-table-column prop="user.Username" label="用户名" width="120" />
        <el-table-column prop="user.Phone" label="手机号" width="120" />
        <el-table-column label="商品名称" min-width="150">
          <template #default="{ row }">{{ row.OrderType === 'hongtuan' ? row.ProductName : (row.route ? row.route.RouteName : '') }}</template>
        </el-table-column>
        <el-table-column label="数量" width="80">
          <template #default="{ row }">{{ row.OrderType === 'hongtuan' ? row.Travelers + '份' : row.Travelers + '人' }}</template>
        </el-table-column>
        <el-table-column prop="TotalPrice" label="金额" width="100">
          <template #default="{ row }">¥{{ row.TotalPrice }}</template>
        </el-table-column>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">{{ row.TravelDate }}</template>
        </el-table-column>
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.Status)">{{ getStatusText(row.Status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getOrderList } from '../../api';

const searchForm = ref({ Status: '' });
const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });

const getStatusType = (status) => {
    const types = {
        pending: 'warning',
        paid: 'success',
        processing: 'success',
        completed: 'info',
        cancelled: 'danger'
    };
    return types[status] || 'info';
};

const getStatusText = (status) => {
    const texts = {
        pending: '待支付',
        paid: '待使用',
        processing: '待使用',
        completed: '已完成',
        cancelled: '已取消'
    };
    return texts[status] || status;
};

const loadData = async () => {
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            ...searchForm.value
        };
        const res = await getOrderList(params);
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
    searchForm.value = { Status: '' };
    handleSearch();
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.orders-container {
    padding: 20px;
}

.search-card, .table-card {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>

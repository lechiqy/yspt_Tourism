<template>
  <div class="contents-container">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="分类">
          <el-select v-model="filterCategory" placeholder="全部" clearable @change="loadData">
            <el-option label="智慧景区" value="scenic" />
            <el-option label="特色美食" value="food" />
            <el-option label="非遗文化" value="culture" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleAdd">发布内容</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="ContentID" label="ID" width="80" />
        <el-table-column prop="Category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.Category)">{{ getCategoryName(row.Category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Title" label="标题" min-width="180" />
        <el-table-column prop="CoverImage" label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.CoverImage"
              :src="row.CoverImage"
              :preview-src-list="[row.CoverImage]"
              style="width: 60px; height: 40px"
              fit="cover"
            />
            <span v-else style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column label="图片数" width="80">
          <template #default="{ row }">
            <el-tag type="info">{{ (row.Images || []).length }}张</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Address" label="地址" min-width="150" show-overflow-tooltip />
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

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" top="5vh">
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-form-item label="分类" prop="Category">
          <el-select v-model="form.Category" placeholder="请选择分类">
            <el-option label="智慧景区" value="scenic" />
            <el-option label="特色美食" value="food" />
            <el-option label="非遗文化" value="culture" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="Title">
          <el-input v-model="form.Title" placeholder="请输入标题" maxlength="100" show-word-limit />
        </el-form-item>

        <!-- 封面图片 -->
        <el-form-item label="封面图片">
          <div class="image-upload-section">
            <el-radio-group v-model="coverUploadType" size="small">
              <el-radio-button label="url">URL输入</el-radio-button>
              <el-radio-button label="upload">本地上传</el-radio-button>
            </el-radio-group>
            <div class="upload-content">
              <el-input
                v-if="coverUploadType === 'url'"
                v-model="form.CoverImage"
                placeholder="请输入图片URL"
              />
              <el-upload
                v-else
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeUpload"
              >
                <el-button type="primary" size="small">选择图片</el-button>
              </el-upload>
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
            <div class="images-toolbar">
              <el-radio-group v-model="imageUploadType" size="small">
                <el-radio-button label="url">URL添加</el-radio-button>
                <el-radio-button label="upload">批量上传</el-radio-button>
              </el-radio-group>
            </div>
            <div class="images-input" v-if="imageUploadType === 'url'">
              <el-input v-model="newImageUrl" placeholder="输入图片URL" style="width: 300px" />
              <el-button type="primary" @click="addImageByUrl">添加</el-button>
            </div>
            <el-upload
              v-else
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeUpload"
              multiple
            >
              <el-button type="primary" size="small">批量选择图片</el-button>
            </el-upload>
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

        <!-- 富文本内容编辑 -->
        <el-form-item label="图文内容">
          <div class="rich-content-section">
            <div class="content-toolbar">
              <el-button type="primary" size="small" @click="addTextBlock">添加文字</el-button>
              <el-button type="success" size="small" @click="addImageBlock">添加图片</el-button>
            </div>
            <div class="content-blocks">
              <div v-for="(block, index) in form.RichContent" :key="index" class="content-block">
                <div class="block-header">
                  <el-tag size="small" :type="block.type === 'text' ? 'primary' : 'success'">
                    {{ block.type === 'text' ? '文字' : '图片' }}
                  </el-tag>
                  <div class="block-actions">
                    <el-button size="small" @click="moveBlock(index, -1)" :disabled="index === 0">↑</el-button>
                    <el-button size="small" @click="moveBlock(index, 1)" :disabled="index === form.RichContent.length - 1">↓</el-button>
                    <el-button type="danger" size="small" @click="removeBlock(index)">删除</el-button>
                  </div>
                </div>
                <div class="block-content">
                  <el-input
                    v-if="block.type === 'text'"
                    v-model="block.content"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入文字内容"
                  />
                  <div v-else class="image-block">
                    <el-input v-model="block.url" placeholder="图片URL" style="margin-bottom: 10px" />
                    <el-upload
                      :action="uploadUrl"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      :on-success="(res) => block.url = res.url"
                      :before-upload="beforeUpload"
                    >
                      <el-button type="primary" size="small">上传图片</el-button>
                    </el-upload>
                    <el-image v-if="block.url" :src="block.url" style="width: 200px; margin-top: 10px" fit="cover" />
                  </div>
                </div>
              </div>
              <div v-if="form.RichContent.length === 0" class="empty-content">
                <el-empty description="暂无内容，请添加文字或图片" :image-size="60" />
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="Description">
          <el-input v-model="form.Description" type="textarea" :rows="3" placeholder="请输入描述内容（用于列表展示）" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="地址" prop="Address">
          <el-input v-model="form.Address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="Phone">
          <el-input v-model="form.Phone" placeholder="请输入联系电话" />
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
import { Delete } from '@element-plus/icons-vue';
import { getContentsList, addContent, updateContent, deleteContent } from '../../api';

const tableData = ref([]);
const pagination = reactive({ page: 1, limit: 10, total: 0 });
const filterCategory = ref('');
const dialogVisible = ref(false);
const dialogTitle = ref('发布内容');
const isEdit = ref(false);
const formRef = ref(null);
const submitting = ref(false);

// 图片上传相关
const uploadUrl = 'https://yspt-api.lechiqy.com/upload';
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('adminToken')
}));
const coverUploadType = ref('url');
const imageUploadType = ref('url');
const newImageUrl = ref('');

const form = reactive({
    ContentID: null,
    Category: '',
    Title: '',
    Description: '',
    CoverImage: '',
    Images: [],
    RichContent: [],
    Address: '',
    Phone: ''
});

const rules = {
    Category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    Title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
};

const categoryMap = {
    scenic: '智慧景区',
    food: '特色美食',
    culture: '非遗文化'
};

const categoryTypeMap = {
    scenic: 'success',
    food: 'warning',
    culture: 'danger'
};

const getCategoryName = (category) => categoryMap[category] || category;
const getCategoryType = (category) => categoryTypeMap[category] || 'info';

const loadData = async () => {
    try {
        const params = { page: pagination.page, limit: pagination.limit };
        if (filterCategory.value) {
            params.category = filterCategory.value;
        }
        const res = await getContentsList(params);
        tableData.value = res.list || [];
        pagination.total = res.total || 0;
    } catch (error) {
        console.log('加载数据失败:', error);
    }
};

const resetForm = () => {
    Object.assign(form, {
        ContentID: null,
        Category: '',
        Title: '',
        Description: '',
        CoverImage: '',
        Images: [],
        RichContent: [],
        Address: '',
        Phone: ''
    });
    coverUploadType.value = 'url';
    imageUploadType.value = 'url';
    newImageUrl.value = '';
};

const handleAdd = () => {
    dialogTitle.value = '发布内容';
    isEdit.value = false;
    resetForm();
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑内容';
    isEdit.value = true;
    Object.assign(form, {
        ContentID: row.ContentID,
        Category: row.Category,
        Title: row.Title,
        Description: row.Description || '',
        CoverImage: row.CoverImage || '',
        Images: row.Images || [],
        RichContent: row.RichContent || [],
        Address: row.Address || '',
        Phone: row.Phone || ''
    });
    dialogVisible.value = true;
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除该内容吗？删除后无法恢复。', '提示', { type: 'warning' });
        await deleteContent(row.ContentID);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') console.log('删除失败:', error);
    }
};

// 图片上传相关方法
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

const handleCoverSuccess = (response) => {
    if (response.url) {
        form.CoverImage = response.url;
        ElMessage.success('封面上传成功');
    }
};

const handleImageSuccess = (response) => {
    if (response.url) {
        form.Images.push(response.url);
    }
};

const addImageByUrl = () => {
    if (newImageUrl.value) {
        form.Images.push(newImageUrl.value);
        newImageUrl.value = '';
    }
};

const removeImage = (index) => {
    form.Images.splice(index, 1);
};

// 富文本内容相关方法
const addTextBlock = () => {
    form.RichContent.push({ type: 'text', content: '' });
};

const addImageBlock = () => {
    form.RichContent.push({ type: 'image', url: '' });
};

const removeBlock = (index) => {
    form.RichContent.splice(index, 1);
};

const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.RichContent.length) return;
    const temp = form.RichContent[index];
    form.RichContent[index] = form.RichContent[newIndex];
    form.RichContent[newIndex] = temp;
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        submitting.value = true;

        // 清理空的富文本块
        const cleanRichContent = form.RichContent.filter(block => {
            if (block.type === 'text') return block.content.trim();
            if (block.type === 'image') return block.url;
            return false;
        });

        const submitData = {
            ...form,
            RichContent: cleanRichContent
        };

        if (isEdit.value) {
            await updateContent(form.ContentID, submitData);
            ElMessage.success('更新成功');
        } else {
            await addContent(submitData);
            ElMessage.success('发布成功');
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
});
</script>

<style scoped>
.contents-container {
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

/* 图片上传区域样式 */
.image-upload-section {
    width: 100%;
}

.upload-content {
    margin: 10px 0;
}

.image-preview {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 多图片管理样式 */
.images-section {
    width: 100%;
}

.images-toolbar {
    margin-bottom: 10px;
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
    margin-top: 10px;
}

.image-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

/* 富文本内容样式 */
.rich-content-section {
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 15px;
}

.content-toolbar {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.content-blocks {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.content-block {
    background-color: #fafafa;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e8e8e8;
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.block-actions {
    display: flex;
    gap: 5px;
}

.block-content {
    margin-top: 10px;
}

.image-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.empty-content {
    padding: 20px;
    text-align: center;
}
</style>

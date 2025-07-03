<template>
    <el-header id="header">
        <div>
            <img src="@/assets/welcome.png" style="width: 200px; height: 40px; margin:20px 0 0 0;">
        </div>
        <el-dropdown split-button type="default">
             {{ userStore.user?.nickname || '游客' }}
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="logout">注销</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </el-header>
</template>


<script setup>
import { getSessionStorage, setSessionStorage } from '../utils/common.js';
import { useUserStore } from '../store/index.js';
import { getCurrentInstance } from 'vue';
import { onMounted } from 'vue'
const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const user = getSessionStorage('user');



onMounted(() => {
  console.log('--- Header.vue mounted ---');
  console.log('userStore.user 当前内容:', userStore.user);
  if (userStore.user && userStore.user.nickname) {
    console.log('已获取到用户昵称:', userStore.user.nickname);
  } else {
    console.warn('userStore.user 或 nickname 未定义，请检查登录流程和数据存储。');
  }
});
const logout = () => {

    setSessionStorage('token,null')
    setSessionStorage('user', null);
    userStore.addMenus([]);
    userStore.clearTabs();
    proxy.$router.push('/login');
    
}
</script>

<style scoped>

#header {
    max-height: 50px;
    line-height:50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#header>h2{
    color:#0b67b8;
}
</style>

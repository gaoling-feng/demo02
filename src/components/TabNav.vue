<template>
    <div class="container_tab"> {{ He }}
        <ul class="tab_nav_box">
            <li v-for="(item, index) in tabs" :key="item.title" :class="{ active: currentPath === item.path }">
                <router-link :to="item.path">{{ item.title }}</router-link>
                <el-icon v-if="index !== 0">
                    <CloseBold @click="onCloseTabIndex(index)" />
                </el-icon>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed,getCurrentInstance } from 'vue';
import { useUserStore } from '../store/index.js';
import { useRoute } from 'vue-router';
import Header from './Header.vue';
const userStore = useUserStore();
const route = useRoute();
const { proxy } = getCurrentInstance();


const tabs = computed(() => userStore.getTabs);
const currentPath = computed(() => route.path);

const onCloseTabIndex = (index) => {
    userStore.deleteTabByIndex(index);
    // 获取上一个tab
    let path = userStore.getTabs[userStore.getTabs.length - 1].path;
    //route.push(path);
}
</script>

<style scoped>
.container_tab {
    padding-left: 20px;
    border-bottom: 1px solid #d8dce5;
}


.tab_nav_box {
    display: flex;
    align-items: center;
    padding: 2px 0px;
}

.tab_nav_box li {
    height: 28px;
    line-height: 28px;
    padding: 1px;
    display: flex;
    align-items: center;
    margin-right: 8px;
    border: 1px solid #cccccc;
    border-radius: 5%;
    opacity: 0.9;
}

.tab_nav_box li:hover {
    opacity: 1;
}

.tab_nav_box li a {
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    color: #000000;
}


.tab_nav_box li:nth-child(n+2) a {
    padding-right: 15px;
}

.tab_nav_box li i:hover {
    color: #9a8282;
}

.tab_nav_box li.active {
    font-size: 15px;
    background-color: #0b67b8;
    color: white;
}

.tab_nav_box li.active a {
    color: #ffffff;
}
</style>
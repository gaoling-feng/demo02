import { defineStore } from "pinia";
import { getSessionStorage, setSessionStorage } from "../utils/common.js";
export const useUserStore = defineStore("user", {
    state: () => ({
        tabs: [],
        menus: getSessionStorage("menuList") || [],
    }),
    getters: {
        // 获取所有的tab
        getTabs: (state) => state.tabs,
        // 获取所有的菜单
        getMenus: (state) => state.menus,
    },
    actions: {
        // 添加菜单
        addMenus(menuList) {
            this.menus = menuList;
            // 将菜单存储到sessionStorage中
            setSessionStorage('menuList', menuList)
        },
        // 根据索引删除tab
        deleteTabByIndex(index) {
            this.tabs.splice(index, 1);
        },
        // 清空tab
        clearTabs() {
            this.tabs = [];
        },
        // 添加tab
        addTabs(payload) {
            const path = payload.path;
            
            if (path) {
                const result = this.tabs.filter((item) => item.path === path)
                // 判断是否存在，如果不存在才需要加入到state的tabs中
                if (result.length === 0) {
                    if (this.tabs.length === 10) {
                        // 删除第二个
                        this.tabs.splice(1, 1);
                    }
                    // 需要添加
                    this.tabs.push(payload)
                }
            }
        }
    },
    persist:true  // 开启持久化存储(默认存在localStorage中)
})
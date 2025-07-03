<template>
    <div class="login-bg">
        <div class="login">
            <div class="message">东软颐养中心</div>
            <div id="darkbannerwrap"></div>
            <form>
                <input type="text" placeholder="用户名" v-model="loginForm.username">
                <hr class="hr15">
                <input type="password" placeholder="密码" v-model="loginForm.password">
                <hr class="hr15">
                <input type="button" value="登录" style="width: 100%;" @click="userlogin">
            </form>
        </div>
    </div>
</template>



<script setup>
import { login } from '@/api/userApi.js';
import { ref, getCurrentInstance } from 'vue';
import { setSessionStorage } from '@/utils/common.js';
import { useUserStore } from '@/store/index.js';
import { ElMessage } from 'element-plus';
const { proxy } = getCurrentInstance();
const userStore = useUserStore();
let loginForm = ref({
    username: '',
    password: ''
});


const userlogin = () => {
    login(loginForm.value).then(res => {
        if (res.flag) {
            setSessionStorage('token', res.message);
            setSessionStorage('user', res.data);

            let menuListFromBackend = res.data.menuList;

            // 原始菜单数据打印 (用于调试，现在您已经看到它的结构了)
            console.log('【原始菜单数据】:', menuListFromBackend);

            const processedMenuList = JSON.parse(JSON.stringify(menuListFromBackend));

            // 遍历菜单列表，找到并修改正确的 path
            processedMenuList.forEach(menu => {
                if (menu.children && Array.isArray(menu.children)) {
                    menu.children.forEach(child => {
                        // ***** 核心修改：将匹配条件从 '床位地图' 改为 '床位示意图' *****
                        // 或者使用 ID 匹配，如果 'id: 7' 是固定的
                        if (child.title === '床位示意图' || child.id === 7) { // 使用 '床位示意图' 或者它的 id 7
                            console.log(`【匹配成功】: 找到 '${child.title}', 原始路径为 '${child.path}'`);
                            child.path = '/home/bedMap'; // 修改为正确的完整路由路径
                            console.log(`【路径修改为】: '${child.path}'`);
                        }
                    });
                }
            });

            // 将修改后的菜单列表存入pinia中
            userStore.addMenus(processedMenuList);

            // ***** 核心修改：确保这里跳转到的是 '床位示意图' 对应的修改后的路径 *****
            // 您想要跳转到 BedMap 页面，那么这里就应该直接跳转到 /home/bedMap
            // 不再需要依赖 processedMenuList[0].children[0] 的位置，除非您确定它就是 BedMap
            // 最安全的方式是直接跳转到 /home/bedMap
            proxy.$router.push('/home/bedMap'); // 直接跳转到目标路径

            // 如果您仍然想通过菜单数据动态跳转，需要确保 processedMenuList[0].children[0]
            // 就是那个被修改过的 "床位示意图" 菜单项。
            // 更好的做法是，在 processedMenuList 中找到 bedMap 的那个对象，然后使用它的 path。
            // 示例 (更稳健的方式):
            /*
            let bedMapPath = '/home'; // 默认路径，以防找不到
            processedMenuList.forEach(menu => {
                if (menu.children && Array.isArray(menu.children)) {
                    menu.children.forEach(child => {
                        if (child.title === '床位示意图' || child.id === 7) {
                            bedMapPath = child.path;
                        }
                    });
                }
            });
            proxy.$router.push(bedMapPath);
            */


        } else {
            ElMessage.error(res.message);
        }
    }).catch(error => {
        console.error('登录请求失败或处理异常:', error);
        ElMessage.error('登录失败，请检查网络或服务器。');
    });
};
</script>

<style scoped>
canvas {
    display: block;
    margin: 0;
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
}

.login-bg {
    width: 100%;
    height: 100%;
    background: url("@/assets/logbg.png") no-repeat center;
    background-size: cover;
    overflow: hidden
}

.login {
    margin: 200px auto 0 auto;
    min-height: 420px;
    max-width: 420px;
    padding: 40px;
    background-color: #fff;
    border-radius: 4px;
    box-sizing: border-box;
}

.login a.logo {
    display: block;
    height: 58px;
    width: 167px;
    margin: 0 auto 30px auto;
    background-size: 167px 42px
}

.login .message {
    margin: 10px 0 0 -58px;
    padding: 18px 10px 18px 60px;
    background: #44aff0;
    position: relative;
    color: #fff;
    font-size: 20px
}

.login #darkbannerwrap {
    width: 18px;
    height: 10px;
    margin: 0 0 20px -58px;
    position: relative
}

.login input[type=password],
.login input[type=text],
select {
    border: 1px solid #DCDEE0;
    vertical-align: middle;
    border-radius: 3px;
    height: 50px;
    padding: 0 16px;
    font-size: 14px;
    color: #555;
    outline: 0;
    width: 100%;
    box-sizing: border-box
}

.login input[type=email]:focus,
.login input[type=file]:focus,
.login input[type=password]:focus,
.login input[type=text]:focus,
select:focus {
    border: 1px solid #44aff0
}

.login input[type=button],
.login input[type=submit] {
    display: inline-block;
    vertical-align: middle;
    padding: 12px 24px;
    margin: 0;
    font-size: 18px;
    line-height: 24px;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    color: #fff;
    background-color: #44aff0;
    border-radius: 3px;
    border: none;
    -webkit-appearance: none;
    outline: 0;
    width: 100%
}

.login hr {
    background: #fff;
}

.login hr.hr15 {
    height: 15px;
    border: none;
    margin: 0;
    padding: 0;
    width: 100%
}

.login hr.hr20 {
    height: 20px;
    border: none;
    margin: 0;
    padding: 0;
    width: 100%
}
</style>
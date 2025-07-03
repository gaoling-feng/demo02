import { createRouter, createWebHistory } from "vue-router"

const routes = [
    {
        // 路由重定向
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        component: () => import("../views/Login.vue")
    },
    {
        path: "/home",
        component: () => import("../views/layout/LayOut.vue"),
        children: [
            {
                path: "bedMap",
                component: () => import("../views/bed/BedMap.vue"),
            }
        ]
    },
    {
        path: "/:catchAll(.*)*",
        component: () => import("../views/error/NotFound.vue")
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router



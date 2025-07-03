import http from '@/request/request.js'

//获取床位示意图
export const findShowBedVo=(parms)=>{
    return http.get(`/room/findShowBedVo/${parms}`)
}
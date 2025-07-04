<template>
  <!-- 定义床位SVG符号，供 <use> 引用 -->
  <svg style="display:none;">
    <symbol id="bedicon" viewBox="0 0 32 32">
      <!-- 人头 -->
      <circle cx="24" cy="10" r="4" fill="#fff"/>
      <!-- 人体 -->
      <rect x="22" y="14" width="4" height="8" rx="2" fill="#fff"/>
      <!-- 床体 -->
      <rect x="4" y="22" width="24" height="6" rx="2"/>
      <!-- 床头 -->
      <rect x="4" y="16" width="5" height="12" rx="1"/>
    </symbol>
  </svg>
  <div class="bedmap-main">
    <div class="bedmap-header">
      <span>楼层：</span>
      <el-select v-model="currentFloor" @change="loadBeds" style="width: 120px;">
        <el-option v-for="floor in floors" :key="floor" :label="floor" :value="floor" />
      </el-select>
      <span class="stat-block total">
        <svg class="icon-bed stat" width="22" height="22" viewBox="0 0 32 32" :fill="getStatSvgColor('total')" xmlns="http://www.w3.org/2000/svg">
          <use href="#bedicon"/>
        </svg>
        总床位: {{ totalBeds }}
      </span>
      <span class="stat-block free">
        <svg class="icon-bed stat" width="22" height="22" viewBox="0 0 32 32" :fill="getStatSvgColor('free')" xmlns="http://www.w3.org/2000/svg">
          <use href="#bedicon"/>
        </svg>
        空闲: {{ freeBeds }}
      </span>
      <span class="stat-block used">
        <svg class="icon-bed stat" width="22" height="22" viewBox="0 0 32 32" :fill="getStatSvgColor('used')" xmlns="http://www.w3.org/2000/svg">
          <use href="#bedicon"/>
        </svg>
        有人: {{ usedBeds }}
      </span>
      <span class="stat-block out">
        <svg class="icon-bed stat" width="22" height="22" viewBox="0 0 32 32" :fill="getStatSvgColor('out')" xmlns="http://www.w3.org/2000/svg">
          <use href="#bedicon"/>
        </svg>
        外出: {{ outBeds }}
      </span>
    </div>

    <div class="bedmap-table">
      <table v-if="displayList.length">
        <tbody>
        <tr v-for="(row, rowIndex) in getTableRows(displayList)" :key="rowIndex">
          <template v-for="cell in row">
            <td
                v-if="cell.type === 'room'"
                :key="'bed-' + cell.id"
            >
              <div v-for="bed in cell.bedList" :key="bed.id" class="bed-cell-column">
                <svg
                  class="icon-bed"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  :fill="getBedSvgColor(bed.bedStatus)"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#bedicon"/>
                </svg>
                <div class="bed-label">{{ bed.bedNo }}</div>
              </div>
            </td>
            <td
                v-else-if="cell.type === 'area'"
                :key="'area-' + cell.id"
                :colspan="cell.colspan"
                class="area-header"
                :style="{ backgroundColor: cell.areaColor }"
            >
              {{ cell.areaLabel }}
            </td>
          </template>
        </tr>
        </tbody>
      </table>
      <div v-else class="empty-tips">暂无床位数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { findShowBedVo } from '@/api/bedApi'

const floors = ['一楼', '二楼']
const currentFloor = ref(floors[0])

const totalBeds = ref(0)
const freeBeds = ref(0)
const usedBeds = ref(0)
const outBeds = ref(0)
const displayList = ref([])

function getBedSvgColor(status) {
  switch (status) {
    case 1: return '#43a047' // 绿色，空闲
    case 2: return '#ea4335' // 红色，有人
    case 3: return '#039be5' // 蓝色，外出
    default: return '#bdbdbd' // 灰色，未知
  }
}

function getStatSvgColor(type) {
  switch (type) {
    case 'free': return '#43a047'
    case 'used': return '#ea4335'
    case 'out': return '#039be5'
    case 'total': return '#888'
    default: return '#bdbdbd'
  }
}

// 每行最大显示 10 个格子（房间 + 功能区）
function getTableRows(list) {
  const rows = []
  let currentRow = []
  let countInRow = 0
  const maxPerRow = 10

  for (const cell of list) {
    const span = cell.colspan || 1
    if (countInRow + span > maxPerRow) {
      rows.push(currentRow)
      currentRow = []
      countInRow = 0
    }
    currentRow.push(cell)
    countInRow += span
  }

  if (currentRow.length) rows.push(currentRow)
  return rows
}

function buildDisplayList(list) {
  const res = []

  const functionAreas = [
    { id: 'area-1', type: 'area', areaLabel: '电梯厅', areaColor: '#26b6da', colspan: 1 },
    { id: 'area-2', type: 'area', areaLabel: '洗衣房', areaColor: '#26a69a', colspan: 2 },
    { id: 'area-3', type: 'area', areaLabel: '活动中心', areaColor: '#43a047', colspan: 3 }
  ]

  const before = list.slice(0, 1)
  const after = list.slice(1, 4)
  const remaining = list.slice(4)

  res.push(...before.map(r => ({ ...r, type: 'room' })))

  // 如果是"一楼"，插入功能区，否则不插入
  if (currentFloor.value === '一楼') {
    res.push(...functionAreas)
  }

  res.push(...after.map(r => ({ ...r, type: 'room' })))
  res.push(...remaining.map(r => ({ ...r, type: 'room' })))

  return res
}

function loadBeds() {
  findShowBedVo(currentFloor.value).then(res => {
    const data = res?.data?.data
    totalBeds.value = data?.totalBed || 0
    freeBeds.value = data?.freeBed || 0
    usedBeds.value = data?.usedBed || 0
    outBeds.value  = data?.outBed || 0
    let list = Array.isArray(data?.roomList) ? data.roomList : []
    displayList.value = buildDisplayList(list)
  }).catch(() => {
    totalBeds.value = freeBeds.value = usedBeds.value = outBeds.value = 0
    displayList.value = []
  })
}

onMounted(() => {
  loadBeds()
})
</script>

<style scoped>
.bedmap-main {
  padding: 16px;
}
.bedmap-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 18px;
  font-size: 18px;
}
.stat-block {
  margin-left: 20px;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
}
.icon-bed {
  width: 32px;
  height: 32px;
  display: block;
  margin: 0 auto 4px auto;
}
.icon-bed.stat {
  width: 22px;
  height: 22px;
  margin: 0 6px 0 0;
  display: inline-block;
  vertical-align: middle;
}
.bedmap-table {
  overflow-x: auto;
  margin-top: 18px;
}
table {
  border-collapse: collapse;
  width: 100%;
  table-layout: auto;
}
th, td {
  border: 2px solid #888;
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  text-align: center;
  padding: 10px 2px;
  font-size: 18px;
  font-weight: 600;
}

.area-header {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
.bed-cell-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
}
.bed-label {
  font-size: 15px;
  color: #333;
}
.empty-tips {
  color: #888;
  padding: 16px;
  text-align: center;
  font-size: 20px;
}
</style>

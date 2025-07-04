<template>
  <div class="bedmap-main">
    <div class="bedmap-header">
      <span>楼层：</span>
      <el-select v-model="currentFloor" @change="loadBeds" style="width: 120px;">
        <el-option v-for="floor in floors" :key="floor" :label="floor" :value="floor" />
      </el-select>
      <span class="stat-block total"><i class="icon-bed total"></i> 总床位: {{ totalBeds }}</span>
      <span class="stat-block free"><i class="icon-bed free"></i> 空闲: {{ freeBeds }}</span>
      <span class="stat-block used"><i class="icon-bed used"></i> 有人: {{ usedBeds }}</span>
      <span class="stat-block out"><i class="icon-bed out"></i> 外出: {{ outBeds }}</span>
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
                <span :class="['icon-bed', getBedClass(bed.bedStatus)]"></span>
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

function getBedClass(status) {
  switch (status) {
    case 1: return 'free'
    case 2: return 'used'
    case 3: return 'out'
    default: return 'unknown'
  }
}

// 每行最大显示 7 个格子（房间 + 功能区）
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

  // 如果是“一楼”，插入功能区，否则不插入
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
  display: inline-block;
  width: 22px;
  height: 22px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 4px;
}
.icon-bed.free {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23ea4335" viewBox="0 0 24 24"><path d="M21 10.78V8c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v2.78C2.39 11.11 2 11.78 2 12.5V18h2v-2h16v2h2v-5.5c0-.72-.39-1.39-1-1.72zM4 8c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v2H4V8zm16 7H4v-2.5c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5V15z"/></svg>');
}
.icon-bed.used {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" viewBox="0 0 24 24"><path d="M21 10.78V8c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v2.78C2.39 11.11 2 11.78 2 12.5V18h2v-2h16v2h2v-5.5c0-.72-.39-1.39-1-1.72zM4 8c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v2H4V8zm16 7H4v-2.5c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5V15z"/></svg>');
}
.icon-bed.out {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23039be5" viewBox="0 0 24 24"><path d="M21 10.78V8c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v2.78C2.39 11.11 2 11.78 2 12.5V18h2v-2h16v2h2v-5.5c0-.72-.39-1.39-1-1.72zM4 8c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v2H4V8zm16 7H4v-2.5c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5V15z"/></svg>');
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

/**
 * rotation.js
 * 排球轮转逻辑工具函数（Web版）
 * 从小程序版本移植，保持逻辑不变
 */

/**
 * 二传在6个轮次中的位置
 * 第1轮: 2号位，第2轮: 1号位，第3轮: 6号位
 * 第4轮: 5号位，第5轮: 4号位，第6轮: 3号位
 */
const SETTER_POSITIONS = [2, 1, 6, 5, 4, 3];

/**
 * 6个位置的坐标配置（百分比，相对于球场容器）
 * 排球场位置编号（俯视图）：
 *   4  3  2  (前排)
 *   5  6  1  (后排)
 */
const POSITION_COORDS = {
  1: { x: 75, y: 68.75 },  // 右后角（1号位，发球位）百分比
  2: { x: 75, y: 31.25 },  // 右前角（2号位）
  3: { x: 50, y: 25 },     // 中前（3号位）
  4: { x: 25, y: 31.25 },  // 左前角（4号位）
  5: { x: 25, y: 68.75 },  // 左后角（5号位）
  6: { x: 50, y: 75 }      // 中后（6号位）
};

/**
 * 二传插上后的目标位置（前排传球位置）
 */
const SETTER_TARGET_POSITION = { x: 63.33, y: 31.25 };

/**
 * 插上路线配置（使用贝塞尔曲线，百分比坐标）
 * 包含起点、终点和控制点
 */
const PENETRATION_ROUTES = {
  1: {  // 从1号位插上（右后方）
    start: { x: 75, y: 68.75 },
    end: { x: 63.33, y: 31.25 },
    control: { x: 80, y: 47.5 },
    description: '从右后方快速插上'
  },
  6: {  // 从6号位插上（正后方）
    start: { x: 50, y: 75 },
    end: { x: 50, y: 31.25 },
    control: { x: 50, y: 52.5 },
    description: '从正后方直线插上'
  },
  5: {  // 从5号位插上（左后方）
    start: { x: 25, y: 68.75 },
    end: { x: 36.67, y: 31.25 },
    control: { x: 20, y: 47.5 },
    description: '从左后方插上，路线最长'
  }
};

/**
 * 获取指定轮次的二传位置
 * @param {number} rotation - 轮次 (1-6)
 * @returns {number} 二传所在位置 (1-6)
 */
function getSetterPosition(rotation) {
  if (rotation < 1 || rotation > 6) {
    throw new Error('轮次必须在1-6之间');
  }
  return SETTER_POSITIONS[rotation - 1];
}

/**
 * 判断二传是否在前排
 * 前排位置：2、3、4
 * 后排位置：1、5、6
 * @param {number} position - 位置 (1-6)
 * @returns {boolean} 是否在前排
 */
function isSetterInFrontRow(position) {
  return [2, 3, 4].includes(position);
}

/**
 * 判断二传是否需要插上
 * 只有在后排时才需要插上
 * @param {number} position - 位置 (1-6)
 * @returns {boolean} 是否需要插上
 */
function needsPenetration(position) {
  return [1, 5, 6].includes(position);
}

/**
 * 获取插上路线配置
 * @param {number} position - 当前位置 (1, 5, 6)
 * @returns {object} 路线配置对象
 */
function getPenetrationRoute(position) {
  if (!needsPenetration(position)) {
    return null;
  }
  return PENETRATION_ROUTES[position];
}

/**
 * 获取位置坐标（百分比）
 * @param {number} position - 位置 (1-6)
 * @returns {object} 坐标对象 {x, y}（百分比）
 */
function getPositionCoords(position) {
  return POSITION_COORDS[position];
}

/**
 * 轮转到下一个轮次
 * @param {number} currentRotation - 当前轮次 (1-6)
 * @returns {number} 下一个轮次 (1-6)
 */
function nextRotation(currentRotation) {
  return currentRotation === 6 ? 1 : currentRotation + 1;
}

/**
 * 轮转到上一个轮次
 * @param {number} currentRotation - 当前轮次 (1-6)
 * @returns {number} 上一个轮次 (1-6)
 */
function prevRotation(currentRotation) {
  return currentRotation === 1 ? 6 : currentRotation - 1;
}

/**
 * 获取当前状态的提示文字
 * @param {number} rotation - 当前轮次
 * @param {number} position - 二传位置
 * @param {boolean} isFrontRow - 是否在前排
 * @returns {string} 提示文字
 */
function getStatusText(rotation, position, isFrontRow) {
  if (isFrontRow) {
    if (position === 2) {
      return `第${rotation}轮：二传在前排${position}号位，理想传球位置，不需要插上`;
    } else {
      return `第${rotation}轮：二传在前排${position}号位，位置稍偏，但不需要插上`;
    }
  } else {
    const route = PENETRATION_ROUTES[position];
    return `第${rotation}轮：二传在后排${position}号位，需要插上！${route.description}`;
  }
}

/**
 * 获取所有球员的初始位置（简化版，只关注二传）
 * @param {number} rotation - 当前轮次
 * @returns {array} 球员位置数组
 */
function getAllPlayersPositions(rotation) {
  const setterPos = getSetterPosition(rotation);
  
  // 定义其他5个球员的角色（简化处理）
  const otherRoles = ['主攻', '副攻', '主攻', '接应', '副攻'];
  const players = [];
  
  // 添加二传
  players.push({
    position: setterPos,
    role: 'setter',
    name: '二传',
    color: '#FFD54F',
    coords: POSITION_COORDS[setterPos]
  });
  
  // 添加其他球员
  let roleIndex = 0;
  for (let pos = 1; pos <= 6; pos++) {
    if (pos !== setterPos) {
      players.push({
        position: pos,
        role: 'other',
        name: otherRoles[roleIndex],
        color: '#BDBDBD',
        coords: POSITION_COORDS[pos]
      });
      roleIndex++;
    }
  }
  
  return players;
}



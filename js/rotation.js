/**
 * rotation.js
 * 排球轮转逻辑工具函数（Web版）
 * 从小程序版本移植，保持逻辑不变
 */

/**
 * 二传在6个轮次中的位置（反轮模式）
 * 第1轮: 1号位，第2轮: 6号位，第3轮: 5号位
 * 第4轮: 4号位，第5轮: 3号位，第6轮: 2号位
 */
const SETTER_POSITIONS = [1, 6, 5, 4, 3, 2];

/**
 * 6个位置的坐标配置（百分比，相对于球场容器）
 * 排球场位置编号（俯视图）：
 *   球网 (18%)
 *   4  3  2  (前排 25-28%)
 *   三米线 (40%)
 *   5  6  1  (后排 72-78%)
 */
const POSITION_COORDS = {
  1: { x: 83.3, y: 74 },     // 右后角（1号位，发球位）
  2: { x: 83.3, y: 26 },     // 右前角（2号位）
  3: { x: 50, y: 26 },       // 中前（3号位）
  4: { x: 16.7, y: 26 },     // 左前角（4号位）
  5: { x: 16.7, y: 74 },     // 左后角（5号位）
  6: { x: 50, y: 74 }        // 中后（6号位）
};

/**
 * 实际接发球站位坐标配置（每一轮的特殊站位）
 * 格式：Rotation (轮次) -> Position (位置号) -> {x, y}
 * 修改这里的数值来调整“变化”后的位置
 */
const ACTUAL_POSITIONS = {
  "1": {
    "1": {
      "x": 92.7,
      "y": 61.7
    },
    "2": {
      "x": 79.9,
      "y": 68.6
    },
    "3": {
      "x": 49.7,
      "y": 20.2
    },
    "4": {
      "x": 9.1,
      "y": 32.5
    },
    "5": {
      "x": 20.8,
      "y": 70.8
    },
    "6": {
      "x": 52.1,
      "y": 75.5
    }
  },
  "2": {
    "1": {
      "x": 85.3,
      "y": 69.6
    },
    "2": {
      "x": 77.2,
      "y": 27.4
    },
    "3": {
      "x": 71.2,
      "y": 11.9
    },
    "4": {
      "x": 17.2,
      "y": 63.9
    },
    "5": {
      "x": 49.7,
      "y": 74.3
    },
    "6": {
      "x": 62,
      "y": 22.5
    }
  },
  "3": {
    "1": {
      "x": 82.3,
      "y": 69.2
    },
    "2": {
      "x": 84.8,
      "y": 35.6
    },
    "3": {
      "x": 25.2,
      "y": 65.9
    },
    "4": {
      "x": 18.3,
      "y": 15
    },
    "5": {
      "x": 27.7,
      "y": 28.8
    },
    "6": {
      "x": 50.5,
      "y": 78.5
    }
  },
  "4": {
    "1": {
      "x": 82.9,
      "y": 87.3
    },
    "2": {
      "x": 19.8,
      "y": 66.6
    },
    "3": {
      "x": 13.6,
      "y": 26.9
    },
    "4": {
      "x": 23.5,
      "y": 14.4
    },
    "5": {
      "x": 49.4,
      "y": 74.7
    },
    "6": {
      "x": 80.2,
      "y": 68.5
    }
  },
  "5": {
    "1": {
      "x": 81.2,
      "y": 67.2
    },
    "2": {
      "x": 75.5,
      "y": 21
    },
    "3": {
      "x": 58.2,
      "y": 12.5
    },
    "4": {
      "x": 19.5,
      "y": 64.3
    },
    "5": {
      "x": 49.2,
      "y": 76.8
    },
    "6": {
      "x": 69,
      "y": 85
    }
  },
  "6": {
    "1": {
      "x": 83.7,
      "y": 72.1
    },
    "2": {
      "x": 79.3,
      "y": 14.5
    },
    "3": {
      "x": 16.2,
      "y": 61
    },
    "4": {
      "x": 16.8,
      "y": 19.9
    },
    "5": {
      "x": 33.7,
      "y": 89
    },
    "6": {
      "x": 50.3,
      "y": 75.4
    }
  }
};

/**
 * 二传插上后的目标位置（前排传球位置）
 */
const SETTER_TARGET_POSITION = { x: 63.33, y: 28 };

/**
 * 插上路线配置（使用贝塞尔曲线，百分比坐标）
 * 包含起点、终点和控制点
 */
const PENETRATION_ROUTES = {
  1: {  // 从1号位插上（右后方）
    start: { x: 75, y: 78 },
    end: { x: 63.33, y: 28 },
    control: { x: 78, y: 52 },
    description: '从右后方快速插上'
  },
  6: {  // 从6号位插上（正后方）
    start: { x: 50, y: 72 },
    end: { x: 50, y: 28 },
    control: { x: 50, y: 50 },
    description: '从正后方直线插上'
  },
  5: {  // 从5号位插上（左后方）
    start: { x: 25, y: 78 },
    end: { x: 36.67, y: 28 },
    control: { x: 22, y: 52 },
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
 * 获取所有球员的初始位置（根据第1轮反轮配置）
 * @param {number} rotation - 当前轮次
 * @returns {array} 球员位置数组
 */
function getAllPlayersPositions(rotation) {
  const setterPos = getSetterPosition(rotation);
  
  // 第1轮的基础配置（图片中的布局）：
  // 1号位：二传，2号位：主攻，3号位：副攻
  // 4号位：接应，5号位：主攻，6号位：副攻(自)
  const baseRoles = {
    1: '二传',
    2: '主攻',
    3: '副攻',
    4: '接应',
    5: '主攻',
    6: '副攻'
  };

  const players = [];
  
  // 根据轮转计算当前轮次每个位置的角色
  // 轮转规则：每次顺时针轮转（位置号减1，1->6循环）
  for (let pos = 1; pos <= 6; pos++) {
    // 计算这个位置在第1轮时是哪个位置 (basePos)
    // 比如：当前 pos=1 (后排右), rotation=2, 则 basePos = (1-1 + 2-1)%6 + 1 = 2 (原来是2号位的人转到了1号位)
    const basePos = ((pos - 1 + (rotation - 1)) % 6) + 1;
    
    let roleName = baseRoles[basePos];

    // ⚡️ 特殊规则：副攻(3号位起始) 和 接应/副攻(6号位起始) 在后排时变身为“自由”
    // 注意：这里的 basePos 3 和 6 代表的是那两名球员的"身份ID"
    // pos 代表的是他们现在站的"位置ID"
    
    // 规则1: 起始在6号位的球员 (basePos === 6)
    if (basePos === 6) {
      if ([1, 5, 6].includes(pos)) {
        roleName = '自由'; // 后排叫自由
      } else {
        roleName = '副攻'; // 前排叫副攻
      }
    }
    
    // 规则2: 起始在3号位的球员 (basePos === 3)
    if (basePos === 3) {
      if ([1, 5, 6].includes(pos)) {
        roleName = '自由'; // 后排叫自由
      } else {
        roleName = '副攻'; // 前排叫副攻
      }
    }
    
    const isSetterPos = (pos === setterPos);
    
    // ⚡️ 颜色规则调整：
    // 1. 二传：不再特殊高亮，改用普通颜色 (gray)
    // 2. 主攻：在前排时高亮 (yellow)，后排时普通 (gray)
    // 3. 其他：普通颜色 (gray)
    
    let isHighlight = false;
    
    // 如果角色是"主攻" 且 在前排 (2,3,4号位) -> 高亮
    if (roleName === '主攻' && [2, 3, 4].includes(pos)) {
      isHighlight = true;
    }
    
    // 获取实际站位坐标（如果配置了ACTUAL_POSITIONS，否则使用标准坐标）
    let actualCoords = POSITION_COORDS[pos];
    if (ACTUAL_POSITIONS[rotation] && ACTUAL_POSITIONS[rotation][pos]) {
      actualCoords = ACTUAL_POSITIONS[rotation][pos];
    }
    
    players.push({
      // ⚡️ 确保添加 id 字段
      id: `player-base-${basePos}`,
      position: pos,
      role: isHighlight ? 'setter' : 'other', 
      name: roleName,
      color: isHighlight ? '#FFD54F' : '#BDBDBD',
      coords: actualCoords
    });
  }
  
  return players;
}

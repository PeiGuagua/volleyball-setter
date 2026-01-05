/**
 * app.js
 * 主应用逻辑（Web版）
 * 处理页面切换、动画控制、用户交互
 */

// ========== 全局状态 ==========
let currentPage = 'index'; // 当前页面：index, tutorial, setter
let gameState = {
  currentRotation: 1,              // 当前轮次 (1-6)
  setterPosition: 2,               // 二传位置 (1-6)
  isSetterFrontRow: true,          // 二传是否在前排
  needsPenetration: false,         // 是否需要插上
  statusText: '',                  // 状态提示文字
  players: [],                     // 所有球员数据
  originalSetterCoords: {},        // 二传起始坐标
  showPenetrationRoute: true,      // 是否显示插上路线
  showPositionNumbers: true,       // 是否显示位置编号
  isAnimating: false               // 是否正在播放动画
};

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('排球二传插上教学 - Web版已加载');
  showPage('index');
});

// ========== 页面切换函数 ==========

/**
 * 显示指定页面
 */
function showPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 显示目标页面
  const targetPage = document.getElementById(pageName + '-page');
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageName;
    
    // 如果是setter页面，初始化游戏
    if (pageName === 'setter') {
      initSetterPage();
    }
  }
}

/**
 * 跳转到二传插上主页面
 */
function goToSetter() {
  showPage('setter');
}

/**
 * 跳转到规则说明页
 */
function goToTutorial() {
  showPage('tutorial');
}

/**
 * 返回首页
 */
function goBack() {
  showPage('index');
}

// ========== 二传插上页面逻辑 ==========

/**
 * 初始化二传插上页面
 */
function initSetterPage() {
  console.log('初始化二传插上页面');
  
  // 重置状态
  gameState.currentRotation = 1;
  gameState.isAnimating = false;
  
  // 初始化轮转状态
  initRotation();
  
  // 绘制球员
  renderPlayers();
  
  // 更新UI
  updateUI();
}

/**
 * 初始化轮转状态
 */
function initRotation() {
  const rotation = gameState.currentRotation;
  const setterPos = getSetterPosition(rotation);
  const isFrontRow = isSetterInFrontRow(setterPos);
  const needsPen = needsPenetration(setterPos);
  const statusText = getStatusText(rotation, setterPos, isFrontRow);
  const players = getAllPlayersPositions(rotation);

  gameState.setterPosition = setterPos;
  gameState.isSetterFrontRow = isFrontRow;
  gameState.needsPenetration = needsPen;
  gameState.statusText = statusText;
  gameState.players = players;
  gameState.originalSetterCoords = getPositionCoords(setterPos);

  console.log('当前状态：', {
    rotation,
    setterPos,
    isFrontRow,
    needsPen
  });
}

/**
 * 渲染球员到球场
 */
function renderPlayers() {
  const container = document.getElementById('players-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  gameState.players.forEach(player => {
    // 创建球员元素
    const playerDiv = document.createElement('div');
    playerDiv.className = `player ${player.role === 'setter' ? 'player-setter' : 'player-other'}`;
    playerDiv.id = `player-${player.position}`;
    playerDiv.style.left = player.coords.x + '%';
    playerDiv.style.top = player.coords.y + '%';
    
    // 球员内容
    playerDiv.innerHTML = `
      <div class="player-content">
        <span class="player-number">${player.position}</span>
        <span class="player-role">${player.name}</span>
      </div>
    `;
    
    container.appendChild(playerDiv);
    
    // 添加位置编号（如果开启）
    if (gameState.showPositionNumbers) {
      const markerDiv = document.createElement('div');
      markerDiv.className = 'position-marker';
      markerDiv.id = `marker-${player.position}`;
      markerDiv.style.left = (player.coords.x + 11.67) + '%'; // 向右偏移
      markerDiv.style.top = (player.coords.y - 1.25) + '%';   // 向上偏移
      markerDiv.textContent = player.position;
      container.appendChild(markerDiv);
    }
  });
}

/**
 * 更新UI显示
 */
function updateUI() {
  // 更新轮次显示
  const rotationDisplay = document.getElementById('rotation-display');
  if (rotationDisplay) {
    rotationDisplay.textContent = `第 ${gameState.currentRotation} 轮`;
  }
  
  // 更新发球图标
  const serveIndicator = document.getElementById('serve-indicator');
  if (serveIndicator) {
    serveIndicator.style.display = gameState.setterPosition === 1 ? 'inline' : 'none';
  }
  
  // 更新状态文字
  const statusText = document.getElementById('status-text');
  if (statusText) {
    statusText.textContent = gameState.statusText;
  }
  
  // 更新按钮状态
  updateButtonStates();
  
  // 更新虚影显示
  updateShadow();
  
  // 绘制插上路线
  if (gameState.needsPenetration && gameState.showPenetrationRoute) {
    setTimeout(() => {
      drawPenetrationArrow(gameState.setterPosition);
    }, 100);
  } else {
    clearCanvas();
  }
}

/**
 * 更新按钮状态
 */
function updateButtonStates() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const nextBtnText = document.getElementById('next-btn-text');
  
  if (prevBtn) {
    if (gameState.currentRotation === 1 || gameState.isAnimating) {
      prevBtn.classList.add('btn-disabled');
    } else {
      prevBtn.classList.remove('btn-disabled');
    }
  }
  
  if (nextBtn) {
    if (gameState.isAnimating) {
      nextBtn.classList.add('btn-disabled');
      if (nextBtnText) nextBtnText.textContent = '动画中...';
    } else {
      nextBtn.classList.remove('btn-disabled');
      if (nextBtnText) {
        nextBtnText.textContent = gameState.currentRotation === 6 ? '重新开始' : '下一轮 ▶';
      }
    }
  }
}

/**
 * 更新虚影显示
 */
function updateShadow() {
  const shadow = document.getElementById('setter-shadow');
  if (!shadow) return;
  
  if (gameState.needsPenetration && gameState.showPenetrationRoute) {
    shadow.style.display = 'flex';
    shadow.style.left = gameState.originalSetterCoords.x + '%';
    shadow.style.top = gameState.originalSetterCoords.y + '%';
    const shadowNumber = document.getElementById('shadow-number');
    if (shadowNumber) {
      shadowNumber.textContent = gameState.setterPosition;
    }
  } else {
    shadow.style.display = 'none';
  }
}

// ========== 轮转控制函数 ==========

/**
 * 下一轮
 */
function nextRotation() {
  if (gameState.isAnimating) {
    return;
  }
  
  gameState.isAnimating = true;
  updateButtonStates();
  
  let nextRot;
  if (gameState.currentRotation === 6) {
    nextRot = 1;
  } else {
    nextRot = gameState.currentRotation + 1;
  }
  
  playRotationAnimation(nextRot);
}

/**
 * 上一轮
 */
function prevRotation() {
  if (gameState.isAnimating || gameState.currentRotation === 1) {
    return;
  }
  
  gameState.isAnimating = true;
  updateButtonStates();
  
  const prevRot = gameState.currentRotation - 1;
  playRotationAnimation(prevRot);
}

/**
 * 播放轮转动画
 */
function playRotationAnimation(nextRot) {
  // 更新轮次
  gameState.currentRotation = nextRot;
  
  // 计算新位置
  const newSetterPos = getSetterPosition(nextRot);
  const newPlayers = getAllPlayersPositions(nextRot);
  
  gameState.players = newPlayers;
  
  // 移动球员（CSS transition会自动处理动画）
  newPlayers.forEach(player => {
    const playerEl = document.getElementById(`player-${player.position}`);
    if (playerEl) {
      playerEl.style.left = player.coords.x + '%';
      playerEl.style.top = player.coords.y + '%';
    }
  });
  
  // 动画完成后检查是否需要插上
  setTimeout(() => {
    afterRotation(nextRot, newSetterPos);
  }, 600);
}

/**
 * 轮转完成后的处理
 */
function afterRotation(rotation, setterPos) {
  const isFrontRow = isSetterInFrontRow(setterPos);
  const needsPen = needsPenetration(setterPos);
  const statusText = getStatusText(rotation, setterPos, isFrontRow);

  gameState.setterPosition = setterPos;
  gameState.isSetterFrontRow = isFrontRow;
  gameState.needsPenetration = needsPen;
  gameState.statusText = statusText;
  gameState.originalSetterCoords = getPositionCoords(setterPos);

  // 重新渲染球员（更新位置编号）
  renderPlayers();
  
  // 更新UI
  updateUI();

  // 如果需要插上，播放插上动画
  if (needsPen && gameState.showPenetrationRoute) {
    setTimeout(() => {
      playPenetrationAnimation(setterPos);
    }, 200);
  } else {
    gameState.isAnimating = false;
    updateButtonStates();
  }
}

/**
 * 播放插上动画
 */
function playPenetrationAnimation(position) {
  const route = getPenetrationRoute(position);
  if (!route) {
    gameState.isAnimating = false;
    updateButtonStates();
    return;
  }

  // 找到二传球员元素
  const setterEl = document.querySelector('.player-setter');
  if (!setterEl) {
    gameState.isAnimating = false;
    updateButtonStates();
    return;
  }

  // 移动到目标位置
  const targetPos = SETTER_TARGET_POSITION;
  setterEl.style.left = targetPos.x + '%';
  setterEl.style.top = targetPos.y + '%';

  // 动画完成
  setTimeout(() => {
    gameState.isAnimating = false;
    updateButtonStates();
    console.log('插上动画完成');
  }, 1100);
}

// ========== Canvas绘制函数 ==========

/**
 * 清空Canvas
 */
function clearCanvas() {
  const canvas = document.getElementById('penetration-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制插上路线箭头
 */
function drawPenetrationArrow(position) {
  const route = getPenetrationRoute(position);
  if (!route) return;

  const canvas = document.getElementById('penetration-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // 获取canvas实际尺寸
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  // 设置canvas内部尺寸
  canvas.width = width;
  canvas.height = height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 将百分比坐标转换为像素坐标
  const startX = (route.start.x / 100) * width;
  const startY = (route.start.y / 100) * height;
  const endX = (route.end.x / 100) * width;
  const endY = (route.end.y / 100) * height;
  const controlX = (route.control.x / 100) * width;
  const controlY = (route.control.y / 100) * height;

  // 绘制虚线箭头
  ctx.beginPath();
  ctx.setLineDash([10, 5]);
  ctx.strokeStyle = '#FF9800';
  ctx.lineWidth = 4;

  // 绘制贝塞尔曲线
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  ctx.stroke();

  // 绘制箭头头部
  drawArrowHead(ctx, endX, endY, controlX, controlY);

  console.log('绘制插上路线箭头完成');
}

/**
 * 绘制箭头头部
 */
function drawArrowHead(ctx, endX, endY, controlX, controlY) {
  // 计算箭头方向
  const dx = endX - controlX;
  const dy = endY - controlY;
  const angle = Math.atan2(dy, dx);

  // 箭头参数
  const headLength = 20;
  const headAngle = Math.PI / 6;

  ctx.save();
  ctx.setLineDash([]);
  ctx.fillStyle = '#FF9800';
  ctx.beginPath();

  // 箭头中心点
  ctx.moveTo(endX, endY);
  
  // 箭头左侧
  ctx.lineTo(
    endX - headLength * Math.cos(angle - headAngle),
    endY - headLength * Math.sin(angle - headAngle)
  );
  
  // 箭头右侧
  ctx.lineTo(
    endX - headLength * Math.cos(angle + headAngle),
    endY - headLength * Math.sin(angle + headAngle)
  );
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ========== 开关控制函数 ==========

/**
 * 切换插上路线显示
 */
function onRouteSwitch() {
  const checkbox = document.getElementById('route-switch');
  gameState.showPenetrationRoute = checkbox.checked;
  console.log('显示插上路线：', gameState.showPenetrationRoute);
  
  updateUI();
}

/**
 * 切换位置编号显示
 */
function onNumberSwitch() {
  const checkbox = document.getElementById('number-switch');
  gameState.showPositionNumbers = checkbox.checked;
  console.log('显示位置编号：', gameState.showPositionNumbers);
  
  renderPlayers();
  updateUI();
}

// ========== 窗口大小调整 ==========
window.addEventListener('resize', function() {
  // 重新绘制箭头（如果需要）
  if (currentPage === 'setter' && gameState.needsPenetration && gameState.showPenetrationRoute) {
    setTimeout(() => {
      drawPenetrationArrow(gameState.setterPosition);
    }, 100);
  }
});



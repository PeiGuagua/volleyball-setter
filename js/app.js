/**
 * app.js
 * 主应用逻辑（Web版）
 * 处理页面切换、动画控制、用户交互
 */

// ========== 全局状态 ==========
let currentPage = 'index'; // 当前页面：index, tutorial, setter
let gameState = {
  currentRotation: 1,              // 当前轮次 (1-6)
  rotationOffset: 0,               // 轮次偏移 (用户设置二传起始位置时改变)
  setterPosition: 2,               // 二传位置 (1-6)
  isSetterFrontRow: true,          // 二传是否在前排
  needsPenetration: false,         // 是否需要插上
  statusText: '',                  // 状态提示文字
  players: [],                     // 所有球员数据
  originalSetterCoords: {},        // 二传起始坐标
  showPenetrationRoute: true,      // 是否显示插上路线
  isAnimating: false,              // 是否正在播放动画
  isOriginalPosition: true         // 是否显示原始站位
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
  
  // 重置状态 (但不重置 rotationOffset，保留用户的选择)
  gameState.currentRotation = 1;
  gameState.isAnimating = false;
  gameState.isOriginalPosition = true; // 初始显示原始站位
  
  // 初始化轮转状态
  initRotation();
  
  // 绘制球员
  renderPlayers();
  
  // 更新UI
  updateUI();
  
  // 更新按钮文字
  const toggleBtn = document.getElementById('toggle-position-btn');
  if (toggleBtn) {
    toggleBtn.textContent = '变化 ➜';
  }
}

/**
 * 获取逻辑轮次 (考虑偏移量)
 * 用户看到的 "第1轮" 可能对应逻辑上的 "第X轮"
 */
function getEffectiveRotation(displayRotation) {
  // 逻辑：(显示轮次 - 1 + 偏移量) % 6 + 1
  return ((displayRotation - 1 + gameState.rotationOffset) % 6) + 1;
}

/**
 * 初始化轮转状态
 */
function initRotation() {
  const rotation = gameState.currentRotation;
  // 使用 effectiveRotation 获取实际的逻辑数据
  const effectiveRotation = getEffectiveRotation(rotation);

  const setterPos = getSetterPosition(effectiveRotation);
  const isFrontRow = isSetterInFrontRow(setterPos);
  const needsPen = needsPenetration(setterPos);
  const statusText = getStatusText(effectiveRotation, setterPos, isFrontRow);
  const players = getAllPlayersPositions(effectiveRotation);

  gameState.setterPosition = setterPos;
  gameState.isSetterFrontRow = isFrontRow;
  gameState.needsPenetration = needsPen;
  gameState.statusText = statusText;
  gameState.players = players;
  gameState.originalSetterCoords = getPositionCoords(setterPos);

  console.log('当前状态：', {
    displayRotation: rotation,
    effectiveRotation: effectiveRotation,
    setterPos,
    isFrontRow,
    needsPen
  });
}

/**
 * 渲染球员到球场
 * (修改版：复用DOM元素以支持CSS动画)
 */
function renderPlayers() {
  const container = document.getElementById('players-container');
  if (!container) return;
  
  // 检查是否是首次渲染（容器为空）
  const isFirstRender = container.children.length === 0;
  
  gameState.players.forEach(player => {
    // 根据当前状态决定使用哪个坐标
    let coords;
    if (gameState.isOriginalPosition) {
      // 原始站位：使用标准位置坐标
      coords = getPositionCoords(player.position);
    } else {
      // 实际接发球站位：使用计算后的坐标（含插上等）
      coords = player.coords;
    }
    
    // 尝试查找现有球员元素 (使用新的唯一 ID)
    let playerDiv = document.getElementById(player.id);
    
    // 如果元素不存在（页面首次加载），则创建
    let isNewElement = false;
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = player.id; // 使用唯一 ID
      container.appendChild(playerDiv);
      isNewElement = true;
    }

    // 更新类名（处理颜色变化）
    playerDiv.className = `player ${player.role === 'setter' ? 'player-setter' : 'player-other'}`;
    
    // 如果是首次渲染或新元素，暂时禁用 transition 以避免从 (0,0) 飞过来的动画
    if (isFirstRender || isNewElement) {
      playerDiv.style.transition = 'none';
      playerDiv.style.left = coords.x + '%';
      playerDiv.style.top = coords.y + '%';
      
      // 强制重绘 (Reflow) 让 transition: none 生效
      void playerDiv.offsetWidth;
      
      // 恢复 transition (稍微延迟一点，或者在下一帧恢复，这里简单设为空字符串让CSS接管)
      // 使用 setTimeout 确保下一帧才恢复动画
      setTimeout(() => {
        playerDiv.style.transition = '';
      }, 50);
    } else {
      // 正常移动，使用 CSS transition
      playerDiv.style.transition = ''; // 确保使用 CSS 定义的 transition
      playerDiv.style.left = coords.x + '%';
      playerDiv.style.top = coords.y + '%';
    }
    
    // 更新内容
    playerDiv.innerHTML = `
      <div class="player-content">
        <span class="player-number">${player.position}</span>
        <span class="player-role">${player.name}</span>
      </div>
    `;
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
    
    // ⚡️ 交互逻辑：如果是第1轮，允许点击设置起始位置
    if (gameState.currentRotation === 1 && !gameState.isAnimating) {
      rotationDisplay.classList.add('clickable');
      rotationDisplay.onclick = function() {
        showStartPosModal();
      };
      rotationDisplay.title = "点击设置二传起始位置";
    } else {
      rotationDisplay.classList.remove('clickable');
      rotationDisplay.onclick = null;
      rotationDisplay.title = "";
    }
  }
  
  // 更新发球图标和实际站位文字
  const serveIndicator = document.getElementById('serve-indicator');
  const actualPosLabel = document.getElementById('actual-pos-label');

  if (gameState.isOriginalPosition) {
    // 原始站位模式：隐藏实际站位文字，根据条件显示反轮图标
    if (actualPosLabel) {
      actualPosLabel.style.display = 'none';
    }

    if (serveIndicator) {
      if (gameState.setterPosition === 1) {
        serveIndicator.style.display = 'inline';
        serveIndicator.onclick = function() {
          showModal();
        };
      } else {
        serveIndicator.style.display = 'none';
      }
    }
  } else {
    // 实际接发球站位模式：显示实际站位文字，隐藏反轮图标
    if (actualPosLabel) {
      actualPosLabel.style.display = 'inline';
    }
    if (serveIndicator) {
      serveIndicator.style.display = 'none';
    }
  }
  
  // 更新按钮状态
  updateButtonStates();
  
  // 更新虚影显示
  updateShadow();
  
  // 绘制插上路线（只在实际接发球站位模式下显示）
  if (gameState.needsPenetration && gameState.showPenetrationRoute && !gameState.isOriginalPosition) {
     clearCanvas();
  } else if (gameState.needsPenetration && gameState.showPenetrationRoute && gameState.isOriginalPosition) {
    clearCanvas();
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
  
  // 只在实际接发球站位模式下显示虚影
  if (!gameState.isOriginalPosition && gameState.needsPenetration && gameState.showPenetrationRoute) {
    shadow.style.display = 'none';
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
 * 播放轮转动画（实际不再播放动画，直接跳转）
 */
function playRotationAnimation(nextRot) {
  // 重置为原始站位模式
  gameState.isOriginalPosition = true;
  
  // 更新按钮文字
  const toggleBtn = document.getElementById('toggle-position-btn');
  if (toggleBtn) {
    toggleBtn.textContent = '变化 ➜';
  }

  // 确保变回原始样式
  const courtContainer = document.querySelector('.court-container');
  if (courtContainer) {
    courtContainer.classList.remove('variation');
  }
  
  // 更新轮次
  gameState.currentRotation = nextRot;
  
  // 计算新位置 (使用偏移后的逻辑轮次)
  const effectiveRotation = getEffectiveRotation(nextRot);
  const newSetterPos = getSetterPosition(effectiveRotation);
  const newPlayers = getAllPlayersPositions(effectiveRotation);
  
  gameState.players = newPlayers;
  
  // 立即更新球员位置
  renderPlayers();

  // 立即执行后续逻辑，不延迟
  afterRotation(effectiveRotation, newSetterPos);
}

/**
 * 轮转完成后的处理
 */
function afterRotation(rotation, setterPos) {
  // rotation 参数已经是 effectiveRotation
  const isFrontRow = isSetterInFrontRow(setterPos);
  const needsPen = needsPenetration(setterPos);
  const statusText = getStatusText(rotation, setterPos, isFrontRow);

  gameState.setterPosition = setterPos;
  gameState.isSetterFrontRow = isFrontRow;
  gameState.needsPenetration = needsPen;
  gameState.statusText = statusText;
  gameState.originalSetterCoords = getPositionCoords(setterPos);

  // 直接结束，不播放插上动画
  gameState.isAnimating = false;
  
  // 更新UI (必须在 isAnimating = false 之后调用，否则第1轮的可点击状态无法激活)
  updateUI();
  updateButtonStates();
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
 * 切换原始站位/实际接发球站位
 */
function togglePosition() {
  // 切换状态
  gameState.isOriginalPosition = !gameState.isOriginalPosition;
  
  console.log('切换站位模式：', gameState.isOriginalPosition ? '原始站位' : '实际接发球站位');
  
  // 更新按钮文字
  const toggleBtn = document.getElementById('toggle-position-btn');
  if (toggleBtn) {
    toggleBtn.textContent = gameState.isOriginalPosition ? '变化 ➜' : '恢复原位 ↺';
  }
  
  // 切换场地容器的 CSS 类（控制三米线和背景数字变化）
  const courtContainer = document.querySelector('.court-container');
  if (courtContainer) {
    if (gameState.isOriginalPosition) {
      courtContainer.classList.remove('variation');
    } else {
      courtContainer.classList.add('variation');
    }
  }
  
  // 重新渲染球员和UI
  renderPlayers();
  updateUI();
}

/**
 * 更新场地背景数字的位置
 */
function updateCourtLabels() {
  for (let i = 1; i <= 6; i++) {
    const label = document.getElementById(`court-label-${i}`);
    if (label) {
      // 默认使用 POSITION_COORDS (原始位置)
      let coords = POSITION_COORDS[i];
      
      // 如果是“变化”模式，且配置了 COURT_ACTUAL_POSITIONS，则使用新坐标
      if (!gameState.isOriginalPosition && typeof COURT_ACTUAL_POSITIONS !== 'undefined' && COURT_ACTUAL_POSITIONS[i]) {
        coords = COURT_ACTUAL_POSITIONS[i];
      }
      
      label.style.left = coords.x + '%';
      label.style.top = coords.y + '%';
    }
  }
}

// ========== 模态框控制 ==========

function showModal() {
  const modal = document.getElementById('rotation-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal() {
  const modal = document.getElementById('rotation-modal');
  if (modal) {
    modal.classList.remove('show');
  }
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

// ========== 开轮设置模态框控制 ==========

let currentWheelPos = 1; // 当前滚轮选中的位置

function showStartPosModal() {
  const modal = document.getElementById('start-pos-modal');
  if (modal) {
    modal.classList.add('show');
    
    // 初始化滚轮位置
    initWheelPosition();
  }
}

function closeStartPosModal() {
  const modal = document.getElementById('start-pos-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// 初始化滚轮：滚动到当前 offset 对应的位置
function initWheelPosition() {
  const SETTER_POSITIONS_REF = [1, 6, 5, 4, 3, 2];
  const currentStartPos = SETTER_POSITIONS_REF[gameState.rotationOffset];
  
  const wheel = document.getElementById('pos-wheel');
  if (!wheel) return;
  
  const items = wheel.querySelectorAll('.wheel-item:not(.placeholder)');
  let targetIndex = 0;
  
  // 绑定点击事件：点击即滚动到该位置
  items.forEach((item, index) => {
    // 设置点击事件
    item.onclick = function() {
      wheel.scrollTo({
        top: index * 50, // 50px 是新高度
        behavior: 'smooth'
      });
    };

    if (parseInt(item.dataset.val) === currentStartPos) {
      targetIndex = index;
    }
  });
  
  // 滚动到该位置 (50px 是每项高度)
  // 使用 setTimeout 确保模态框渲染后再滚动，否则 scrollTop 可能无效
  setTimeout(() => {
    wheel.scrollTop = targetIndex * 50;
    checkWheelSelection(); // 手动触发一次高亮更新
  }, 100);
}

// 监听滚轮滚动，更新高亮
function checkWheelSelection() {
  const wheel = document.getElementById('pos-wheel');
  if (!wheel) return;
  
  const itemHeight = 50; // ⚡️ 更新为 50px
  // 计算当前滚动到了第几项 (四舍五入)
  const scrollIndex = Math.round(wheel.scrollTop / itemHeight);
  
  const items = wheel.querySelectorAll('.wheel-item:not(.placeholder)');
  
  items.forEach((item, index) => {
    if (index === scrollIndex) {
      item.classList.add('active');
      currentWheelPos = parseInt(item.dataset.val);
    } else {
      item.classList.remove('active');
    }
  });
}

// 确认选择
function confirmWheelSelection() {
  setStartingPosition(currentWheelPos);
}

/**
 * 设置二传起始位置
 * @param {number} pos - 用户选择的位置 (1-6)
 */
function setStartingPosition(pos) {
  // 计算 offset
  // SETTER_POSITIONS = [1, 6, 5, 4, 3, 2]
  const SETTER_POSITIONS_REF = [1, 6, 5, 4, 3, 2];
  const newOffset = SETTER_POSITIONS_REF.indexOf(pos);
  
  if (newOffset !== -1) {
    gameState.rotationOffset = newOffset;
    console.log(`设置二传起始位置为: ${pos}号位, Offset: ${newOffset}`);
    
    // 关闭模态框
    closeStartPosModal();
    
    // 重新初始化页面（刷新站位）
    initSetterPage();
  }
}

// 点击模态框背景关闭 (扩充原有的 window.onclick)
const originalWindowOnClick = window.onclick;
window.onclick = function(event) {
  if (originalWindowOnClick) originalWindowOnClick(event);
  
  const startModal = document.getElementById('start-pos-modal');
  if (event.target === startModal) {
    closeStartPosModal();
  }
}
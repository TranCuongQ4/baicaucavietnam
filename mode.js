// ===== CHẾ ĐỘ CHƠI =====

// Cấu hình mặc định: Tất cả bot đều là Bot (tự động)
let modeConfig = {
    west: 'bot',   // Tây: bot
    north: 'bot',  // Bắc: bot
    east: 'bot'    // Đông: bot
};

// DOM elements
const modeModal = document.getElementById('mode-modal');
const btnMode = document.getElementById('btn-mode');
const btnModeStart = document.getElementById('btn-mode-start');
const btnModeClose = document.getElementById('btn-mode-close');

// Hàm khởi tạo chế độ chơi
function initMode() {
    // Lấy cấu hình từ localStorage nếu có
    const saved = localStorage.getItem('cauca_mode');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.west) modeConfig.west = data.west;
            if (data.north) modeConfig.north = data.north;
            if (data.east) modeConfig.east = data.east;
        } catch(e) {}
    }
    
    // Cập nhật giao diện nút
    updateModeButtons();
}

// Lưu cấu hình chế độ chơi
function saveMode() {
    localStorage.setItem('cauca_mode', JSON.stringify(modeConfig));
}

// Cập nhật trạng thái nút trong modal
function updateModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const player = btn.dataset.player;
        const mode = btn.dataset.mode;
        if (modeConfig[player] === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Mở modal chế độ chơi
function openModeModal() {
    updateModeButtons();
    if (modeModal) modeModal.classList.add('show');
}

// Đóng modal chế độ chơi
function closeModeModal() {
    if (modeModal) modeModal.classList.remove('show');
}

// Xử lý chọn chế độ cho từng người chơi
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const player = this.dataset.player;
        const mode = this.dataset.mode;
        
        // Cập nhật cấu hình
        modeConfig[player] = mode;
        saveMode();
        
        // Cập nhật giao diện
        const parent = this.parentElement;
        parent.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Cập nhật trạng thái hiển thị
        const statusEl = parent.parentElement.querySelector('.mode-player-status');
        if (statusEl) {
            statusEl.textContent = mode === 'human' ? '👤 Người' : '🤖 Bot';
            statusEl.style.color = mode === 'human' ? '#4caf50' : '#ff5722';
        }
    });
});

// Hàm reset game và áp dụng chế độ mới
function applyModeAndReset() {
    // Lưu cấu hình
    saveMode();
    
    // Cập nhật chế độ vào script
    if (typeof window.updateGameMode === 'function') {
        window.updateGameMode(modeConfig);
    }
    
    // Đóng modal
    closeModeModal();
    
    // Reset game - gọi newGame từ script
    if (typeof window.newGame === 'function') {
        // Đảm bảo game được reset hoàn toàn
        setTimeout(function() {
            window.newGame();
            // Hiển thị thông báo sau khi reset
            setTimeout(function() {
                showNotification('✅ Đã áp dụng chế độ chơi mới và bắt đầu ván mới!', 2000);
            }, 500);
        }, 200);
    } else {
        showNotification('✅ Đã áp dụng chế độ chơi mới!', 2000);
    }
}

// Bắt đầu với chế độ đã chọn
if (btnModeStart) {
    btnModeStart.addEventListener('click', function() {
        applyModeAndReset();
    });
}

// Đóng modal
if (btnModeClose) {
    btnModeClose.addEventListener('click', closeModeModal);
}

if (btnMode) {
    btnMode.addEventListener('click', openModeModal);
}

// Đóng modal khi click bên ngoài
if (modeModal) {
    modeModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModeModal();
        }
    });
}

// Hàm showNotification
function showNotification(msg, duration) {
    duration = duration || 2000;
    const notif = document.getElementById('notification');
    if (notif) {
        notif.innerHTML = msg;
        notif.style.display = 'block';
        // Clear timeout cũ nếu có
        if (window._notifTimeout) {
            clearTimeout(window._notifTimeout);
        }
        window._notifTimeout = setTimeout(() => {
            notif.innerHTML = '&nbsp;';
        }, duration);
    }
}

// Khởi tạo chế độ chơi khi trang load
document.addEventListener('DOMContentLoaded', function() {
    initMode();
});

// Xuất các hàm ra toàn cục
window.modeConfig = modeConfig;
window.saveMode = saveMode;
window.initMode = initMode;
window.applyModeAndReset = applyModeAndReset;
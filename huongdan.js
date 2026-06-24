// ===== HƯỚNG DẪN =====

// Tạo modal hướng dẫn nếu chưa có
function createHelpModal() {
    // Kiểm tra xem modal đã tồn tại chưa
    if (document.getElementById('help-modal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal-content help-content">
            <h2 style="color:#ffd700; text-align:center; margin-bottom:16px;">🎣 HƯỚNG DẪN BÀI CÂU CÁ</h2>
            <div style="color:#e0e0e0; font-size:14px; line-height:1.8; text-align:left; max-height:400px; overflow-y:auto; padding:4px;">
                <ul style="padding-left:18px; margin:8px 0; list-style-type: none;">
                    <li style="margin-bottom:8px;">🎯 <b>Mục tiêu:</b> Ăn bài để đạt điểm cao nhất.</li>
                    <li style="margin-bottom:8px;">📊 <b>Luật ăn bài:</b> Hai lá có tổng bằng 10 (ví dụ 2+8, 3+7, 4+6, 5+5).</li>
                    <li style="margin-bottom:8px;">🃏 <b>J, Q, K:</b> Chỉ ăn cùng loại (J ăn J, Q ăn Q, K ăn K).</li>
                    <li style="margin-bottom:8px;">🔢 <b>A + 9:</b> A tính 20 điểm, 9 tính 10 điểm.</li>
                    <li style="margin-bottom:8px;">🔴 <b>Điểm:</b> Chỉ tính cho lá <span style="color:#ff4444;">♥ (Cơ)</span> và <span style="color:#ff4444;">♦ (Rô)</span>.</li>
                    <li style="margin-bottom:8px;">⭐ <b>Ưu tiên:</b> Ăn Cơ/Rô trước, sau đó mới đến Chuồn/Bích.</li>
                    <li style="margin-bottom:8px;">🔄 <b>Lượt chơi:</b> Theo chiều kim đồng hồ: Tôi → Tây → Bắc → Đông.</li>
                    <li style="margin-bottom:8px;">🏆 <b>Thứ hạng:</b> Nhất (+10$), Nhì (+5$), Ba (-5$), Cuối (-10$).</li>
                    <li style="margin-bottom:8px;">💰 <b>Hết tiền:</b> Được tặng 500$ để tiếp tục.</li>
                    <li style="margin-bottom:8px;">🎮 <b>Cách Chơi:</b> Chọn lá bài rồi nhấn "Đánh Bài".</li>
                </ul>
                <p style="text-align:center; margin:12px 0 4px; color:#aaa; font-style:italic;">Chúc bạn may mắn! 🍀</p>
            </div>
            <button id="btn-help-close" class="help-close-btn">✅ Đã Hiểu</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Thêm sự kiện đóng modal
    document.getElementById('btn-help-close').addEventListener('click', function() {
        closeHelpModal();
    });
    
    // Đóng modal khi click bên ngoài
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeHelpModal();
        }
    });
}

// Mở modal hướng dẫn
function openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) {
        createHelpModal();
    }
    const modalEl = document.getElementById('help-modal');
    if (modalEl) {
        modalEl.style.display = 'flex';
        modalEl.classList.add('show');
    }
}

// Đóng modal hướng dẫn
function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

// Hàm showHelp gốc (giữ tương thích)
function showHelp() {
    openHelpModal();
}

// Thêm sự kiện cho nút hướng dẫn
document.addEventListener('DOMContentLoaded', function() {
    // Tạo modal hướng dẫn
    createHelpModal();
    
    const btn = document.getElementById('btn-help');
    if (btn) {
        // Gỡ bỏ sự kiện cũ nếu có
        btn.removeEventListener('click', showHelp);
        btn.addEventListener('click', showHelp);
    }
});

// Xuất hàm ra toàn cục
window.showHelp = showHelp;
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;
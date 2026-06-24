// ===== HƯỚNG DẪN =====
function showHelp() {
    const content = `
    <div style="background:#1a3a2a; color:#e0e0e0; padding:16px; border-radius:8px; max-height:400px; overflow-y:auto; font-size:13px; line-height:1.6; text-align:left;">
        <h3 style="color:#ffd700; text-align:center; margin-top:0;">🎣 HƯỚNG DẪN CÂU CÁ</h3>
        <ul style="padding-left:18px; margin:8px 0;">
            <li><b>Mục tiêu:</b> Ăn bài để đạt điểm cao nhất.</li>
            <li><b>Luật ăn bài:</b> Hai lá có tổng bằng 10 (ví dụ 2+8, 3+7...).</li>
            <li><b>J, Q, K:</b> Chỉ ăn cùng loại (J ăn J, Q ăn Q, K ăn K).</li>
            <li><b>A + 9:</b> A tính 20 điểm, 9 tính 10 điểm.</li>
            <li><b>Điểm:</b> Chỉ tính cho lá <span style="color:#ff4444;">♥ (Cơ)</span> và <span style="color:#ff4444;">♦ (Rô)</span>.</li>
            <li><b>Ưu tiên:</b> Ăn Cơ/Rô trước, sau đó mới đến Chuồn/Bích.</li>
            <li><b>Lượt chơi:</b> Theo chiều kim đồng hồ: Tôi → Tây → Bắc → Đông.</li>
            <li><b>Thứ hạng:</b> Nhất (+10$), Nhì (+5$), Ba (-5$), Cuối (-10$).</li>
            <li><b>Hết tiền:</b> Được tặng 200$ để tiếp tục.</li>
            <li><b>Mẹo:</b> Chọn lá bài rồi nhấn "Đánh Bài".</li>
        </ul>
        <p style="text-align:center; margin:10px 0 4px; color:#aaa;">Chúc bạn may mắn! 🍀</p>
    </div>
    `;
    // Hiển thị hướng dẫn trong notification
    const notif = document.getElementById('notification');
    if (notif) {
        notif.innerHTML = content;
        notif.style.display = 'block';
        // Tự động ẩn sau 8 giây
        clearTimeout(window.helpTimeout);
        window.helpTimeout = setTimeout(() => {
            notif.style.display = 'none';
        }, 8000);
    }
}

// Thêm sự kiện cho nút hướng dẫn nếu chưa có
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-help');
    if (btn) {
        btn.addEventListener('click', showHelp);
    }
});
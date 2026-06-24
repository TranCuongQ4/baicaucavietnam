// ===== CẤU HÌNH =====
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':10,'Q':10,'K':10,'A':14 };
const PLAYER_IDS = ['south', 'east', 'north', 'west'];
const PLAYER_NAMES = { south:'Tôi (Nam)', east:'Đông', north:'Bắc', west:'Tây' };
const PLAYER_ORDER = ['south', 'west', 'north', 'east'];

let deck = [];
let players = {};
let tableCards = [];
let currentTurn = null;
let gameActive = false;
let selectedCard = null;
let isProcessing = false;

// DOM
const $ = id => document.getElementById(id);
const playerEls = {};
PLAYER_IDS.forEach(id => playerEls[id] = $('player-' + id));
const tableContainer = $('table-cards');
const notification = $('notification');
const btnNewGame = $('btn-new-game');
const btnPlay = $('btn-play');
const btnHelp = $('btn-help');
const endModal = $('end-modal');
const endResult = $('end-result');
const btnCloseModal = $('btn-close-modal');

// ===== KHỞI TẠO BỘ BÀI =====
function createDeck() {
    const d = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            d.push({ rank, suit, id: rank + suit });
        }
    }
    return d;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ===== KHỞI TẠO NGƯỜI CHƠI =====
function initPlayers() {
    players = {};
    PLAYER_IDS.forEach(id => {
        players[id] = {
            hand: [],
            score: 0,
            money: 1000,
            name: PLAYER_NAMES[id]
        };
    });
}

// ===== CHIA BÀI =====
function dealCards() {
    deck = shuffle(createDeck());
    
    PLAYER_IDS.forEach(id => {
        players[id].hand = deck.splice(0, 5);
    });
    
    tableCards = deck.splice(0, 12);
}

// ===== KIỂM TRA KẾT THÚC VÁN =====
function checkGameEnd() {
    let allEmpty = true;
    PLAYER_IDS.forEach(id => {
        if (players[id].hand.length > 0) {
            allEmpty = false;
        }
    });
    
    if (allEmpty) {
        return true;
    }
    
    if (deck.length === 0) {
        let hasCards = false;
        PLAYER_IDS.forEach(id => {
            if (players[id].hand.length > 0) {
                hasCards = true;
            }
        });
        if (!hasCards) {
            return true;
        }
    }
    
    return false;
}

// ===== HIỂN THỊ BÀI =====
function renderCard(card, container, isSelected = false) {
    const div = document.createElement('div');
    div.className = 'card' + (isSelected ? ' selected' : '');
    const isRed = card.suit === '♥' || card.suit === '♦';
    div.classList.add(isRed ? 'red' : 'black');
    
    const rankMain = document.createElement('span');
    rankMain.className = 'rank-main';
    rankMain.textContent = card.rank;
    div.appendChild(rankMain);
    
    const rankCorner = document.createElement('span');
    rankCorner.className = 'rank-corner';
    rankCorner.textContent = card.rank;
    div.appendChild(rankCorner);
    
    const suitCorner = document.createElement('span');
    suitCorner.className = 'suit-corner';
    suitCorner.textContent = card.suit;
    div.appendChild(suitCorner);
    
    const suitMain = document.createElement('span');
    suitMain.className = 'suit-main';
    suitMain.textContent = card.suit;
    div.appendChild(suitMain);
    
    return div;
}

function renderPlayerHand(playerId) {
    const el = playerEls[playerId];
    const handDiv = el.querySelector('.player-cards');
    handDiv.innerHTML = '';
    const hand = players[playerId].hand;
    hand.forEach((card, idx) => {
        const cardDiv = renderCard(card, handDiv);
        if (playerId === 'south') {
            cardDiv.addEventListener('click', () => {
                if (currentTurn === 'south' && !isProcessing && gameActive) {
                    selectCard(playerId, idx);
                }
            });
        }
        handDiv.appendChild(cardDiv);
    });
}

function renderTable() {
    tableContainer.innerHTML = '';
    
    const totalCards = tableCards.length;
    const colsPerRow = 6;
    const rows = Math.ceil(totalCards / colsPerRow);
    
    for (let row = 0; row < rows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        
        for (let col = 0; col < colsPerRow; col++) {
            const idx = row * colsPerRow + col;
            if (idx < totalCards) {
                const card = tableCards[idx];
                const cardDiv = renderCard(card, rowDiv);
                rowDiv.appendChild(cardDiv);
            }
        }
        tableContainer.appendChild(rowDiv);
    }
}

function renderAll() {
    PLAYER_IDS.forEach(id => {
        renderPlayerHand(id);
        updatePlayerInfo(id);
    });
    renderTable();
    updateActiveTurn();
}

function updatePlayerInfo(id) {
    const el = playerEls[id];
    const p = players[id];
    el.querySelector('.player-score').textContent = p.score + ' Điểm';
    el.querySelector('.player-money').textContent = p.money + '💰';
}

function updateActiveTurn() {
    PLAYER_IDS.forEach(id => {
        const el = playerEls[id];
        el.classList.toggle('active', id === currentTurn);
    });
}

// ===== CHỌN BÀI =====
function selectCard(playerId, index) {
    if (playerId !== 'south') return;
    if (currentTurn !== 'south') return;
    if (isProcessing) return;
    
    if (selectedCard) {
        const oldEl = playerEls['south'].querySelectorAll('.player-cards .card')[selectedCard.index];
        if (oldEl) oldEl.classList.remove('selected');
    }
    
    selectedCard = { playerId, index };
    const newEl = playerEls['south'].querySelectorAll('.player-cards .card')[index];
    if (newEl) newEl.classList.add('selected');
}

// ===== KIỂM TRA ĂN BÀI =====
function canEat(card1, card2) {
    // J ăn J, Q ăn Q, K ăn K
    if (['J','Q','K'].includes(card1.rank) && ['J','Q','K'].includes(card2.rank)) {
        return card1.rank === card2.rank;
    }
    // A + 9
    if ((card1.rank === 'A' && card2.rank === '9') || (card1.rank === '9' && card2.rank === 'A')) {
        return true;
    }
    // 10 ăn 10
    if (card1.rank === '10' && card2.rank === '10') {
        return true;
    }
    // Tổng = 10 (2+8, 3+7, 4+6, 5+5)
    const v1 = RANK_VALUES[card1.rank] || 0;
    const v2 = RANK_VALUES[card2.rank] || 0;
    return (v1 + v2) === 10;
}

// HÀM LẤY GIÁ TRỊ ĐIỂM CỦA 1 LÁ BÀI (CHỈ TÍNH CƠ/RÔ)
function getPointValue(card) {
    if (card.suit === '♥' || card.suit === '♦') {
        if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
            return 10;
        }
        if (card.rank === 'A') return 20;
        if (card.rank === '9') return 10;
        if (card.rank === '10') return 10;
        return RANK_VALUES[card.rank] || 0;
    }
    return 0;
}

// HÀM TÍNH ĐIỂM CHO CẶP BÀI ĂN
function calculatePoints(card1, card2) {
    const point1 = getPointValue(card1);
    const point2 = getPointValue(card2);
    return point1 + point2;
}

// HÀM ĂN TẤT CẢ CÁC LÁ CÙNG LOẠI (CHỈ KHI CÓ 3 LÁ TRÊN BÀN)
function eatAllSameRank(playerId, playedCard) {
    let totalPoints = 0;
    let ateCount = 0;
    const rank = playedCard.rank;
    
    // Chỉ áp dụng cho J, Q, K, 10
    if (!['J','Q','K','10'].includes(rank)) {
        return { points: 0, count: 0 };
    }
    
    // Tìm tất cả các lá cùng rank trên bàn
    let indicesToRemove = [];
    for (let i = 0; i < tableCards.length; i++) {
        if (tableCards[i].rank === rank) {
            indicesToRemove.push(i);
        }
    }
    
    // CHỈ ĂN TẤT CẢ KHI CÓ 3 LÁ TRÊN BÀN
    if (indicesToRemove.length === 3) {
        // Tính điểm của lá đánh ra
        const playedPoints = getPointValue(playedCard);
        if (playedPoints > 0) {
            players[playerId].score += playedPoints;
            totalPoints += playedPoints;
        }
        
        // Ăn từng lá
        for (let i = indicesToRemove.length - 1; i >= 0; i--) {
            const idx = indicesToRemove[i];
            const eaten = tableCards.splice(idx, 1)[0];
            const points = getPointValue(eaten);
            if (points > 0) {
                players[playerId].score += points;
                totalPoints += points;
            }
            ateCount++;
        }
    }
    
    return { points: totalPoints, count: ateCount };
}

// ===== XỬ LÝ ĂN TIẾP TỪ DECK =====
function processEatMore(playerId, drawnCard) {
    let totalPoints = 0;
    let ateCount = 0;
    let eatenCard = null;
    let isEat = false;
    
    // Kiểm tra xem có phải là J/Q/K/10 không (để ăn tất cả cùng loại)
    if (['J','Q','K','10'].includes(drawnCard.rank)) {
        let indicesToRemove = [];
        for (let i = 0; i < tableCards.length; i++) {
            if (tableCards[i].rank === drawnCard.rank) {
                indicesToRemove.push(i);
            }
        }
        
        // CHỈ ĂN TẤT CẢ KHI CÓ 3 LÁ TRÊN BÀN
        if (indicesToRemove.length === 3) {
            const playedPoints = getPointValue(drawnCard);
            if (playedPoints > 0) {
                players[playerId].score += playedPoints;
                totalPoints += playedPoints;
            }
            
            for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                const idx = indicesToRemove[i];
                const eaten = tableCards.splice(idx, 1)[0];
                const points = getPointValue(eaten);
                if (points > 0) {
                    players[playerId].score += points;
                    totalPoints += points;
                }
                ateCount++;
                isEat = true;
            }
            
            if (isEat) {
                return totalPoints;
            }
        }
    }
    
    // Nếu không phải J/Q/K/10 hoặc không có 3 lá cùng loại, kiểm tra ăn bình thường
    // ƯU TIÊN ĂN CƠ/RÔ TRƯỚC
    let redIndex = -1;
    let blackIndex = -1;
    
    for (let i = 0; i < tableCards.length; i++) {
        const card = tableCards[i];
        if (canEat(drawnCard, card)) {
            if (card.suit === '♥' || card.suit === '♦') {
                redIndex = i;
                break;
            } else {
                if (blackIndex === -1) {
                    blackIndex = i;
                }
            }
        }
    }
    
    // Ưu tiên ăn lá đỏ trước
    let eatIndex = -1;
    if (redIndex !== -1) {
        eatIndex = redIndex;
    } else if (blackIndex !== -1) {
        eatIndex = blackIndex;
    }
    
    if (eatIndex !== -1) {
        const eaten = tableCards.splice(eatIndex, 1)[0];
        const points = calculatePoints(drawnCard, eaten);
        if (points > 0) {
            players[playerId].score += points;
            totalPoints += points;
        }
        ateCount++;
        isEat = true;
    }
    
    if (!isEat) {
        // Không ăn được -> bỏ xuống bàn
        tableCards.push(drawnCard);
    }
    
    return totalPoints;
}

// ===== XỬ LÝ LƯỢT CHƠI =====
function playTurn(playerId, cardIndex) {
    if (isProcessing) return;
    if (currentTurn !== playerId) return;
    
    if (playerId === 'south' && selectedCard === null) {
        showNotification('⚠️ Hãy chọn một lá bài!', 2000);
        return;
    }
    
    isProcessing = true;
    const hand = players[playerId].hand;
    const cardIdx = (playerId === 'south') ? selectedCard.index : cardIndex;
    const playedCard = hand[cardIdx];
    
    // KIỂM TRA ĐẶC BIỆT: ĂN TẤT CẢ CÙNG LOẠI (CHỈ KHI CÓ 3 LÁ)
    const specialEat = eatAllSameRank(playerId, playedCard);
    
    // Xóa lá bài đã đánh khỏi tay
    hand.splice(cardIdx, 1);
    selectedCard = null;
    
    if (specialEat.count > 0) {
        let totalPoints = specialEat.points;
        let eatMsg = `${playedCard.rank}${playedCard.suit} ăn ${specialEat.count} lá ${playedCard.rank}`;
        
        renderAll();
        showNotification(`✅ ${eatMsg} = ${totalPoints} điểm`, 2000);
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🔄 Mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        totalPoints += extraPoints;
                        showNotification(`🎯 Ăn tiếp! +${extraPoints} điểm (Tổng: ${totalPoints})`, 2500);
                    } else {
                        showNotification(`❌ Không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
        
        return;
    }
    
    // TRƯỜNG HỢP BÌNH THƯỜNG: Tìm bài ăn được trên bàn
    // ƯU TIÊN ĂN CƠ/RÔ TRƯỚC
    let redIndex = -1;
    let blackIndex = -1;
    
    for (let i = 0; i < tableCards.length; i++) {
        const card = tableCards[i];
        if (canEat(playedCard, card)) {
            if (card.suit === '♥' || card.suit === '♦') {
                redIndex = i;
                break;
            } else {
                if (blackIndex === -1) {
                    blackIndex = i;
                }
            }
        }
    }
    
    let eatIndex = -1;
    if (redIndex !== -1) {
        eatIndex = redIndex;
    } else if (blackIndex !== -1) {
        eatIndex = blackIndex;
    }
    
    if (eatIndex !== -1) {
        // CÓ ĂN ĐƯỢC BÀI
        const eaten = tableCards.splice(eatIndex, 1)[0];
        const points = calculatePoints(playedCard, eaten);
        if (points > 0) {
            players[playerId].score += points;
        }
        
        let totalPoints = points;
        let eatMsg = `${playedCard.rank}${playedCard.suit} + ${eaten.rank}${eaten.suit}`;
        
        renderAll();
        showNotification(`✅ ${eatMsg} = ${points} điểm`, 2000);
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🔄 Mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        totalPoints += extraPoints;
                        showNotification(`🎯 Ăn tiếp! +${extraPoints} điểm (Tổng: ${totalPoints})`, 2500);
                    } else {
                        showNotification(`❌ Không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
        
    } else {
        // KHÔNG ĂN ĐƯỢC BÀI
        tableCards.push(playedCard);
        showNotification(`❌ Không ăn được! Đánh ${playedCard.rank}${playedCard.suit} xuống bàn`, 2000);
        renderAll();
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🔄 Mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        showNotification(`🎯 Ăn tiếp! +${extraPoints} điểm`, 2500);
                    } else {
                        showNotification(`❌ Không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
    }
}

// ===== AI VỚI MINIMAX =====
function playAI(playerId) {
    if (isProcessing) return;
    if (currentTurn !== playerId) return;
    if (players[playerId].hand.length === 0) {
        nextTurn();
        return;
    }
    
    isProcessing = true;
    
    const move = getAIMove(playerId, players, tableCards, deck);
    
    if (move && move.isEat) {
        const hand = players[playerId].hand;
        const playedCard = hand[move.cardIndex];
        
        const specialEat = eatAllSameRank(playerId, playedCard);
        
        if (specialEat.count > 0) {
            hand.splice(move.cardIndex, 1);
            let totalPoints = specialEat.points;
            
            renderAll();
            showNotification(`🤖 ${PLAYER_NAMES[playerId]} ăn ${specialEat.count} lá ${playedCard.rank} = ${totalPoints} điểm`, 2000);
            
            setTimeout(() => {
                if (deck.length > 0) {
                    const drawn = deck.pop();
                    showNotification(`🤖 ${PLAYER_NAMES[playerId]} mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                    renderAll();
                    
                    setTimeout(() => {
                        const extraPoints = processEatMore(playerId, drawn);
                        if (extraPoints > 0) {
                            totalPoints += extraPoints;
                            showNotification(`🤖 ${PLAYER_NAMES[playerId]} ăn tiếp! +${extraPoints} điểm (Tổng: ${totalPoints})`, 2500);
                        } else {
                            showNotification(`🤖 ${PLAYER_NAMES[playerId]} không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                        }
                        
                        renderAll();
                        
                        setTimeout(() => {
                            isProcessing = false;
                            renderAll();
                            
                            if (checkGameEnd()) {
                                setTimeout(() => endGame(), 1000);
                                return;
                            }
                            nextTurn();
                        }, 2500);
                        
                    }, 2000);
                    
                } else {
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 1500);
                }
            }, 2000);
            
            return;
        }
        
        const eaten = tableCards.splice(move.eatIndex, 1)[0];
        const points = calculatePoints(playedCard, eaten);
        if (points > 0) {
            players[playerId].score += points;
        }
        hand.splice(move.cardIndex, 1);
        
        let totalPoints = points;
        let eatMsg = `${playedCard.rank}${playedCard.suit} + ${eaten.rank}${eaten.suit}`;
        
        renderAll();
        showNotification(`🤖 ${PLAYER_NAMES[playerId]}: ${eatMsg} = ${points} điểm`, 2000);
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🤖 ${PLAYER_NAMES[playerId]} mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        totalPoints += extraPoints;
                        showNotification(`🤖 ${PLAYER_NAMES[playerId]} ăn tiếp! +${extraPoints} điểm (Tổng: ${totalPoints})`, 2500);
                    } else {
                        showNotification(`🤖 ${PLAYER_NAMES[playerId]} không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
        
    } else if (move) {
        const hand = players[playerId].hand;
        const playedCard = hand[move.cardIndex];
        hand.splice(move.cardIndex, 1);
        tableCards.push(playedCard);
        renderAll();
        showNotification(`🤖 ${PLAYER_NAMES[playerId]} đánh ${playedCard.rank}${playedCard.suit}`, 2000);
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🤖 ${PLAYER_NAMES[playerId]} mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        showNotification(`🤖 ${PLAYER_NAMES[playerId]} ăn tiếp! +${extraPoints} điểm`, 2500);
                    } else {
                        showNotification(`🤖 ${PLAYER_NAMES[playerId]} không ăn được ${drawn.rank}${drawn.suit}`, 2000);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
        
    } else {
        const hand = players[playerId].hand;
        const playedCard = hand[0];
        hand.splice(0, 1);
        tableCards.push(playedCard);
        renderAll();
        showNotification(`🤖 ${PLAYER_NAMES[playerId]} đánh bài`, 2000);
        
        setTimeout(() => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                showNotification(`🤖 ${PLAYER_NAMES[playerId]} mở bài: ${drawn.rank}${drawn.suit}`, 2000);
                renderAll();
                
                setTimeout(() => {
                    const extraPoints = processEatMore(playerId, drawn);
                    if (extraPoints > 0) {
                        showNotification(`🤖 ${PLAYER_NAMES[playerId]} ăn tiếp! +${extraPoints} điểm`, 2500);
                    }
                    
                    renderAll();
                    
                    setTimeout(() => {
                        isProcessing = false;
                        renderAll();
                        
                        if (checkGameEnd()) {
                            setTimeout(() => endGame(), 1000);
                            return;
                        }
                        nextTurn();
                    }, 2500);
                    
                }, 2000);
                
            } else {
                setTimeout(() => {
                    isProcessing = false;
                    renderAll();
                    
                    if (checkGameEnd()) {
                        setTimeout(() => endGame(), 1000);
                        return;
                    }
                    nextTurn();
                }, 1500);
            }
        }, 2000);
    }
}

// ===== CHUYỂN LƯỢT =====
function nextTurn() {
    if (isProcessing) return;
    
    if (checkGameEnd()) {
        setTimeout(() => endGame(), 1000);
        return;
    }
    
    const idx = PLAYER_ORDER.indexOf(currentTurn);
    let nextIdx = (idx + 1) % PLAYER_ORDER.length;
    let attempts = 0;
    while (players[PLAYER_ORDER[nextIdx]].hand.length === 0 && attempts < 4) {
        nextIdx = (nextIdx + 1) % PLAYER_ORDER.length;
        attempts++;
    }
    currentTurn = PLAYER_ORDER[nextIdx];
    updateActiveTurn();
    renderAll();
    
    if (checkGameEnd()) {
        setTimeout(() => endGame(), 1000);
        return;
    }
    
    if (currentTurn !== 'south') {
        showNotification(`⏳ Đến lượt ${PLAYER_NAMES[currentTurn]}`, 2000);
        setTimeout(() => {
            if (currentTurn !== null && currentTurn !== 'south' && gameActive) {
                playAI(currentTurn);
            }
        }, 2000);
    } else {
        selectedCard = null;
        showNotification('👋 Đến lượt của bạn!', 2000);
    }
}

// ===== KẾT THÚC VÁN =====
function endGame() {
    if (isProcessing) return;
    gameActive = false;
    
    const sorted = PLAYER_IDS.map(id => ({ id, score: players[id].score, money: players[id].money }));
    sorted.sort((a, b) => b.score - a.score);
    
    const ranks = ['🥇 Nhất', '🥈 Nhì', '🥉 Ba', '🙄 Cuối'];
    let html = '<h2>🏆 TỔNG KẾT ĐIỂM 🏆</h2>';
    sorted.forEach((p, idx) => {
        let delta = 0;
        if (idx === 0) delta = 10;
        else if (idx === 1) delta = 5;
        else if (idx === 2) delta = -5;
        else if (idx === 3) delta = -10;
        players[p.id].money += delta;
        if (players[p.id].money < 0) players[p.id].money = 0;
        html += `${PLAYER_NAMES[p.id]}: ${p.score} điểm - Hạng ${ranks[idx]} (${delta>=0?'+':''}${delta}💰)<br>`;
    });
    
    saveGame();
    renderAll();
    
    endResult.innerHTML = html;
    endModal.classList.add('show');
}

// ===== LƯU / TẢI =====
function saveGame() {
    const data = {};
    PLAYER_IDS.forEach(id => {
        data[id] = { money: players[id].money };
    });
    localStorage.setItem('cauca_game', JSON.stringify(data));
}

function loadGame() {
    const raw = localStorage.getItem('cauca_game');
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        PLAYER_IDS.forEach(id => {
            if (data[id]) {
                players[id].money = data[id].money || 1000;
            }
        });
        return true;
    } catch(e) { return false; }
}

// ===== VÁN MỚI =====
function newGame() {
    if (isProcessing) return;
    
    endModal.classList.remove('show');
    
    let allHaveMoney = true;
    PLAYER_IDS.forEach(id => {
        if (players[id].money <= 0) {
            players[id].money = 500;
            allHaveMoney = false;
        }
    });
    if (!allHaveMoney) {
        showNotification('💰 Có người hết tiền, đã tặng 500💰!', 2000);
    }
    
    PLAYER_IDS.forEach(id => {
        players[id].hand = [];
        players[id].score = 0;
    });
    tableCards = [];
    selectedCard = null;
    isProcessing = false;
    gameActive = true;
    
    const startIdx = Math.floor(Math.random() * PLAYER_ORDER.length);
    currentTurn = PLAYER_ORDER[startIdx];
    
    dealCards();
    renderAll();
    
    updateActiveTurn();
    showNotification('🔄 Ván mới! ' + PLAYER_NAMES[currentTurn] + ' đánh trước', 2000);
    
    if (currentTurn !== 'south') {
        setTimeout(() => {
            if (currentTurn !== null && currentTurn !== 'south' && gameActive) {
                playAI(currentTurn);
            }
        }, 2000);
    }
    saveGame();
}

// ===== HIỂN THỊ THÔNG BÁO =====
let notifTimeout = null;
function showNotification(msg, duration = 2000) {
    notification.innerHTML = msg;
    notification.style.display = 'block';
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => {
        notification.innerHTML = '&nbsp;';
    }, duration);
}

// ===== SỰ KIỆN =====
btnNewGame.addEventListener('click', newGame);
btnPlay.addEventListener('click', () => {
    if (currentTurn === 'south' && !isProcessing && gameActive) {
        if (selectedCard !== null) {
            playTurn('south', selectedCard.index);
        } else {
            showNotification('⚠️ Hãy chọn một lá bài!', 2000);
        }
    } else {
        showNotification('⛔ Chưa đến lượt hoặc đang xử lý!', 1500);
    }
});

btnHelp.addEventListener('click', () => {
    if (typeof showHelp === 'function') {
        showHelp();
    } else {
        showNotification('📖 Hướng dẫn đang cập nhật...', 2000);
    }
});

btnCloseModal.addEventListener('click', () => {
    endModal.classList.remove('show');
});

endModal.addEventListener('click', (e) => {
    if (e.target === endModal) {
        endModal.classList.remove('show');
    }
});

// ===== KHỞI ĐỘNG =====
function init() {
    initPlayers();
    loadGame();
    PLAYER_IDS.forEach(id => players[id].score = 0);
    gameActive = true;
    
    const startIdx = Math.floor(Math.random() * PLAYER_ORDER.length);
    currentTurn = PLAYER_ORDER[startIdx];
    
    dealCards();
    renderAll();
    
    updateActiveTurn();
    showNotification('🎣 Chào mừng! ' + PLAYER_NAMES[currentTurn] + ' đánh trước', 2000);
    
    if (currentTurn !== 'south') {
        setTimeout(() => {
            if (currentTurn !== null && currentTurn !== 'south' && gameActive) {
                playAI(currentTurn);
            }
        }, 2000);
    }
    saveGame();
}

// Chặn chuột phải
document.addEventListener('contextmenu', e => e.preventDefault());

init();




// ===== PHẦN MỞ RỘNG CHO CHẾ ĐỘ CHƠI =====
// Thêm vào cuối file script.js, sau dòng init()

// Biến lưu trạng thái chế độ chơi
window.gameMode = {
    west: 'bot',
    north: 'bot',
    east: 'bot'
};

// Biến lưu bài đã chọn của Human
window._humanSelectedCard = {};

// Hàm cập nhật chế độ chơi từ mode.js
window.updateGameMode = function(config) {
    if (config.west) window.gameMode.west = config.west;
    if (config.north) window.gameMode.north = config.north;
    if (config.east) window.gameMode.east = config.east;
    
    // Cập nhật hiển thị tên người chơi
    updateModeDisplay();
    
    // Reset selected card
    window._humanSelectedCard = {};
    
    console.log('✅ Chế độ chơi đã cập nhật:', window.gameMode);
};

// Hàm kiểm tra người chơi có phải Bot không
window.isBot = function(playerId) {
    if (playerId === 'south') return false;
    return window.gameMode[playerId] === 'bot';
};

// Hàm kiểm tra người chơi có phải Người không
window.isHuman = function(playerId) {
    if (playerId === 'south') return true;
    return window.gameMode[playerId] === 'human';
};

// Cập nhật hiển thị tên người chơi
function updateModeDisplay() {
    PLAYER_IDS.forEach(id => {
        if (id === 'south') return;
        const el = playerEls[id];
        if (!el) return;
        const nameEl = el.querySelector('.player-name');
        if (!nameEl) return;
        
        if (window.gameMode[id] === 'human') {
            nameEl.textContent = PLAYER_NAMES[id] + ' 👤';
            // Cho phép click vào bài của người chơi này
            enableHumanClick(id);
        } else {
            nameEl.textContent = PLAYER_NAMES[id] + ' 🤖';
            // Vô hiệu hóa click
            disableHumanClick(id);
        }
    });
}

// Kích hoạt click cho người chơi
function enableHumanClick(playerId) {
    const el = playerEls[playerId];
    if (!el) return;
    const handDiv = el.querySelector('.player-cards');
    if (!handDiv) return;
    
    const cards = handDiv.querySelectorAll('.card');
    cards.forEach((card, idx) => {
        card.style.cursor = 'pointer';
        // Xóa sự kiện cũ để tránh trùng lặp
        card.removeEventListener('click', window._humanClickHandler);
        // Thêm sự kiện mới
        const handler = function(e) {
            e.stopPropagation();
            handleHumanCardClick(playerId, idx);
        };
        card.addEventListener('click', handler);
        // Lưu handler để xóa sau
        card._clickHandler = handler;
    });
}

// Vô hiệu hóa click cho người chơi
function disableHumanClick(playerId) {
    const el = playerEls[playerId];
    if (!el) return;
    const handDiv = el.querySelector('.player-cards');
    if (!handDiv) return;
    
    const cards = handDiv.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.cursor = 'default';
        if (card._clickHandler) {
            card.removeEventListener('click', card._clickHandler);
            card._clickHandler = null;
        }
    });
}

// Xử lý click vào bài của Human
function handleHumanCardClick(playerId, index) {
    // Kiểm tra xem có phải lượt của người chơi này không
    if (currentTurn !== playerId) {
        showNotification(`⛔ Chưa đến lượt của ${PLAYER_NAMES[playerId]}!`, 1500);
        return;
    }
    
    if (isProcessing) {
        showNotification('⏳ Đang xử lý, vui lòng chờ!', 1500);
        return;
    }
    
    if (!gameActive) {
        showNotification('⛔ Ván chơi chưa bắt đầu!', 1500);
        return;
    }
    
    // Nếu là người chơi south, dùng selectCard của script
    if (playerId === 'south') {
        selectCard(playerId, index);
        return;
    }
    
    // Cho các vị trí khác
    // Bỏ chọn bài cũ
    if (window._humanSelectedCard[playerId] !== undefined) {
        const oldEl = playerEls[playerId].querySelectorAll('.player-cards .card')[window._humanSelectedCard[playerId]];
        if (oldEl) oldEl.classList.remove('selected');
    }
    
    // Chọn bài mới
    const newEl = playerEls[playerId].querySelectorAll('.player-cards .card')[index];
    if (newEl) {
        newEl.classList.add('selected');
        window._humanSelectedCard[playerId] = index;
        showNotification(`✅ ${PLAYER_NAMES[playerId]} đã chọn bài ${index + 1}`, 1000);
    }
}

// Ghi đè hàm playTurn để hỗ trợ Human
const _originalPlayTurn = playTurn;

playTurn = function(playerId, cardIndex) {
    // Nếu là Human và không phải south, xử lý đặc biệt
    if (playerId !== 'south' && isHuman(playerId)) {
        if (window._humanSelectedCard[playerId] !== undefined) {
            // Dùng bài đã chọn
            cardIndex = window._humanSelectedCard[playerId];
            // Gọi playTurn gốc với cardIndex đã chọn
            const tempSelected = selectedCard;
            selectedCard = { playerId: playerId, index: cardIndex };
            _originalPlayTurn(playerId, cardIndex);
            // Reset sau khi đánh
            setTimeout(() => {
                selectedCard = tempSelected;
                window._humanSelectedCard[playerId] = undefined;
                // Xóa highlight
                const el = playerEls[playerId];
                if (el) {
                    const cards = el.querySelectorAll('.player-cards .card');
                    cards.forEach(c => c.classList.remove('selected'));
                }
            }, 500);
            return;
        } else {
            showNotification(`⚠️ ${PLAYER_NAMES[playerId]}, hãy chọn một lá bài!`, 2000);
            return;
        }
    }
    
    // Gọi playTurn gốc
    _originalPlayTurn(playerId, cardIndex);
};

// Ghi đè hàm nextTurn để hỗ trợ Human
const _originalNextTurn = nextTurn;

nextTurn = function() {
    if (isProcessing) return;
    
    if (checkGameEnd()) {
        setTimeout(() => endGame(), 1000);
        return;
    }
    
    const idx = PLAYER_ORDER.indexOf(currentTurn);
    let nextIdx = (idx + 1) % PLAYER_ORDER.length;
    let attempts = 0;
    while (players[PLAYER_ORDER[nextIdx]].hand.length === 0 && attempts < 4) {
        nextIdx = (nextIdx + 1) % PLAYER_ORDER.length;
        attempts++;
    }
    currentTurn = PLAYER_ORDER[nextIdx];
    updateActiveTurn();
    renderAll();
    
    if (checkGameEnd()) {
        setTimeout(() => endGame(), 1000);
        return;
    }
    
    // Kiểm tra nếu người chơi tiếp theo là Human
    if (currentTurn !== 'south' && isHuman(currentTurn)) {
        showNotification(`👤 Đến lượt ${PLAYER_NAMES[currentTurn]} (Người chơi)`, 2000);
        // Reset selected card cho người chơi này
        window._humanSelectedCard[currentTurn] = undefined;
        // Xóa highlight bài cũ
        const el = playerEls[currentTurn];
        if (el) {
            const cards = el.querySelectorAll('.player-cards .card');
            cards.forEach(c => c.classList.remove('selected'));
        }
        return;
    }
    
    // Nếu là Bot hoặc South
    if (currentTurn !== 'south') {
        showNotification(`⏳ Đến lượt ${PLAYER_NAMES[currentTurn]}`, 2000);
        setTimeout(() => {
            if (currentTurn !== null && currentTurn !== 'south' && gameActive) {
                // Nếu là Human nhưng chưa đánh, không chạy AI
                if (isHuman(currentTurn)) {
                    return;
                }
                playAI(currentTurn);
            }
        }, 2000);
    } else {
        selectedCard = null;
        showNotification('👋 Đến lượt của bạn!', 2000);
    }
};

// Ghi đè hàm playAI để hỗ trợ Human
const _originalPlayAI = playAI;

playAI = function(playerId) {
    // Nếu người chơi này là Human, không chạy AI
    if (isHuman(playerId) && playerId !== 'south') {
        showNotification(`👤 ${PLAYER_NAMES[playerId]} (Người chơi)`, 1500);
        return;
    }
    
    // Chạy AI gốc
    _originalPlayAI(playerId);
};

// Ghi đè hàm renderPlayerHand để hỗ trợ Human
const _originalRenderPlayerHand = renderPlayerHand;

renderPlayerHand = function(playerId) {
    _originalRenderPlayerHand(playerId);
    
    // Nếu là Human, kích hoạt click sau khi render
    if (playerId !== 'south' && isHuman(playerId)) {
        enableHumanClick(playerId);
    }
};

// ===== SỬA LỖI NÚT ĐÁNH BÀI CHO HUMAN =====
// Gỡ bỏ sự kiện cũ và thêm sự kiện mới cho btnPlay
const oldBtnPlay = document.getElementById('btn-play');
if (oldBtnPlay) {
    // Clone nút mới để xóa hết sự kiện cũ
    const newBtnPlay = oldBtnPlay.cloneNode(true);
    oldBtnPlay.parentNode.replaceChild(newBtnPlay, oldBtnPlay);
    
    // Cập nhật biến btnPlay
    const btnPlayNew = document.getElementById('btn-play');
    
    // Thêm sự kiện mới
    btnPlayNew.addEventListener('click', function() {
        // Kiểm tra nếu đang xử lý
        if (isProcessing) {
            showNotification('⏳ Đang xử lý, vui lòng chờ!', 1500);
            return;
        }
        
        if (!gameActive) {
            showNotification('⛔ Ván chơi chưa bắt đầu!', 1500);
            return;
        }
        
        const currentPlayerId = currentTurn;
        
        // Nếu là South (người chơi chính)
        if (currentPlayerId === 'south') {
            if (selectedCard !== null) {
                playTurn('south', selectedCard.index);
            } else {
                showNotification('⚠️ Hãy chọn một lá bài!', 2000);
            }
            return;
        }
        
        // Nếu là Human (Tây, Bắc, Đông)
        if (isHuman(currentPlayerId)) {
            if (window._humanSelectedCard && window._humanSelectedCard[currentPlayerId] !== undefined) {
                const cardIndex = window._humanSelectedCard[currentPlayerId];
                playTurn(currentPlayerId, cardIndex);
            } else {
                showNotification(`⚠️ ${PLAYER_NAMES[currentPlayerId]}, hãy chọn một lá bài!`, 2000);
            }
            return;
        }
        
        // Nếu không phải Human và không phải South
        showNotification(`⛔ Chưa đến lượt của bạn! Đến lượt ${PLAYER_NAMES[currentPlayerId]}`, 1500);
    });
}

// Khởi tạo chế độ chơi từ localStorage khi load
function loadModeFromStorage() {
    const saved = localStorage.getItem('cauca_mode');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.west) window.gameMode.west = data.west;
            if (data.north) window.gameMode.north = data.north;
            if (data.east) window.gameMode.east = data.east;
            updateModeDisplay();
            console.log('✅ Đã tải chế độ chơi từ storage:', window.gameMode);
        } catch(e) {}
    }
}

// Gọi load mode khi khởi động
setTimeout(function() {
    loadModeFromStorage();
}, 100);

// Export các hàm và biến ra window
window.updateModeDisplay = updateModeDisplay;
window.enableHumanClick = enableHumanClick;
window.disableHumanClick = disableHumanClick;
window.handleHumanCardClick = handleHumanCardClick;
window.loadModeFromStorage = loadModeFromStorage;


// ===== ĐIỀU KHIỂN NHẠC NỀN =====
// Thêm vào cuối file script.js

// Biến trạng thái nhạc
let isMusicOn = true;
const audio = document.getElementById('bg-music');

// Hàm bật/tắt nhạc
function toggleMusic() {
    const musicBtn = document.getElementById('btn-music');
    if (!musicBtn) return;
    
    isMusicOn = !isMusicOn;
    
    if (isMusicOn) {
        audio.play().catch(function(error) {
            console.log('Không thể phát nhạc:', error);
        });
        musicBtn.textContent = '🎵 Nhạc Nền';
        musicBtn.classList.remove('muted');
        showNotification('🎵 Đã bật nhạc nền!', 1500);
    } else {
        audio.pause();
        musicBtn.textContent = '🔇 Nhạc Nền';
        musicBtn.classList.add('muted');
        showNotification('🔇 Đã tắt nhạc nền!', 1500);
    }
    
    // Lưu trạng thái vào localStorage
    localStorage.setItem('cauca_music', isMusicOn ? 'on' : 'off');
}

// Hàm khởi tạo nhạc
function initMusic() {
    const musicBtn = document.getElementById('btn-music');
    if (!musicBtn) return;
    
    // Lấy trạng thái từ localStorage
    const saved = localStorage.getItem('cauca_music');
    if (saved === 'off') {
        isMusicOn = false;
        musicBtn.textContent = '🔇 Nhạc Nền';
        musicBtn.classList.add('muted');
    } else {
        isMusicOn = true;
        musicBtn.textContent = '🎵 Nhạc Nền';
        musicBtn.classList.remove('muted');
        // Tự động phát nhạc
        setTimeout(function() {
            audio.play().catch(function(error) {
                console.log('Không thể phát nhạc tự động:', error);
            });
        }, 500);
    }
    
    // Thêm sự kiện click
    musicBtn.addEventListener('click', toggleMusic);
}

// Khởi tạo nhạc khi trang load
document.addEventListener('DOMContentLoaded', function() {
    initMusic();
});

// Gọi initMusic sau khi script load
setTimeout(function() {
    initMusic();
}, 200);

// Xuất hàm ra toàn cục
window.toggleMusic = toggleMusic;
window.initMusic = initMusic;


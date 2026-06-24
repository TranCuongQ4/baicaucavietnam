// ===== AI BOT THÔNG MINH VỚI MINIMAX =====

class AIPlayer {
    constructor() {
        this.depth = 2;
    }

    // Đánh giá trạng thái hiện tại
    evaluateState(playerId, players, tableCards, deck) {
        const player = players[playerId];
        let score = player.score;
        
        // Bonus cho số lượng bài trên tay
        score += player.hand.length * 0.3;
        
        // Bonus cho bài cơ/rô trong tay
        player.hand.forEach(card => {
            if (card.suit === '♥' || card.suit === '♦') {
                if (card.rank === 'A') score += 3.0;
                else if (['10','J','Q','K'].includes(card.rank)) score += 2.0;
                else if (['8','9'].includes(card.rank)) score += 1.0;
                else score += 0.5;
            }
        });
        
        // Bonus cho bài có thể ăn được từ bàn
        player.hand.forEach(card => {
            tableCards.forEach(tableCard => {
                if (this.canEat(card, tableCard)) {
                    const potentialPoints = this.calculatePoints(card, tableCard);
                    // Ăn được điểm lớn thì bonus cao
                    if (potentialPoints > 0) {
                        score += potentialPoints / 5;
                    }
                    // Bonus thêm nếu ăn bài đỏ
                    if (tableCard.suit === '♥' || tableCard.suit === '♦') {
                        score += 1.5;
                    }
                }
            });
        });
        
        // Kiểm tra xem có thể ăn A đỏ với 9 không
        player.hand.forEach(card => {
            if (card.rank === 'A' && (card.suit === '♥' || card.suit === '♦')) {
                tableCards.forEach(tableCard => {
                    if (tableCard.rank === '9') {
                        score += 5.0; // Bonus lớn cho cơ hội ăn A đỏ
                    }
                });
            }
        });
        
        // Kiểm tra xem có thể ăn 10/J/Q/K đỏ với bài tương ứng không
        ['10','J','Q','K'].forEach(rank => {
            player.hand.forEach(card => {
                if (card.rank === rank && (card.suit === '♥' || card.suit === '♦')) {
                    tableCards.forEach(tableCard => {
                        if (tableCard.rank === rank) {
                            score += 4.0; // Bonus cho cơ hội ăn 10/J/Q/K đỏ
                        }
                    });
                }
            });
        });
        
        return score;
    }

    // KIỂM TRA ĂN BÀI - ĐỒNG BỘ VỚI SCRIPT.JS
    canEat(card1, card2) {
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
        const v1 = this.getRankValue(card1.rank);
        const v2 = this.getRankValue(card2.rank);
        return (v1 + v2) === 10;
    }

    // LẤY GIÁ TRỊ RANK - ĐỒNG BỘ VỚI SCRIPT.JS
    getRankValue(rank) {
        const values = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':10,'Q':10,'K':10,'A':14 };
        return values[rank] || 0;
    }

    // LẤY ĐIỂM CỦA LÁ BÀI - ĐỒNG BỘ VỚI SCRIPT.JS
    getPointValue(card) {
        if (card.suit === '♥' || card.suit === '♦') {
            if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
                return 10;
            }
            if (card.rank === 'A') return 20;
            if (card.rank === '9') return 10;
            if (card.rank === '10') return 10;
            return this.getRankValue(card.rank);
        }
        return 0;
    }

    // Tính điểm của cặp bài ăn
    calculatePoints(card1, card2) {
        return this.getPointValue(card1) + this.getPointValue(card2);
    }

    // Đánh giá giá trị của lá bài để quyết định đánh ra
    getCardValue(card) {
        let value = 0;
        // Bài đỏ có giá trị cao hơn
        if (card.suit === '♥' || card.suit === '♦') {
            value += 10;
        }
        // Bài lớn có giá trị cao hơn
        const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        value += rankOrder.indexOf(card.rank);
        // A có giá trị cao nhất
        if (card.rank === 'A') value += 5;
        if (['10','J','Q','K'].includes(card.rank)) value += 3;
        return value;
    }

    // Tìm bài ăn tốt nhất với ưu tiên
    findBestEatTarget(card, tableCards) {
        let bestTarget = null;
        let bestPriority = -1;
        
        for (let j = 0; j < tableCards.length; j++) {
            const tableCard = tableCards[j];
            if (this.canEat(card, tableCard)) {
                const points = this.calculatePoints(card, tableCard);
                const isRed = tableCard.suit === '♥' || tableCard.suit === '♦';
                
                // Xác định ưu tiên dựa trên bài đánh ra và bài trên bàn
                let priority = 0;
                
                // 1. ƯU TIÊN CAO NHẤT: A đỏ ăn 9 (bất kỳ)
                if (card.rank === 'A' && (card.suit === '♥' || card.suit === '♦') && tableCard.rank === '9') {
                    priority = 100;
                }
                // 2. 9 đỏ ăn A (bất kỳ)
                else if (card.rank === '9' && (card.suit === '♥' || card.suit === '♦') && tableCard.rank === 'A') {
                    priority = 95;
                }
                // 3. 10/J/Q/K đỏ ăn bài tương ứng
                else if (['10','J','Q','K'].includes(card.rank) && (card.suit === '♥' || card.suit === '♦') && tableCard.rank === card.rank) {
                    priority = 90;
                }
                // 4. Ăn bài đỏ có điểm cao (A=20, 10/J/Q/K=10, 9=10)
                else if (isRed && points >= 10) {
                    priority = 80;
                }
                // 5. Ăn bài đỏ có điểm thấp
                else if (isRed && points > 0) {
                    priority = 70;
                }
                // 6. Ăn bài đen nhưng có điểm từ bài đánh ra
                else if (!isRed && points > 0) {
                    priority = 60;
                }
                // 7. Ăn bài đen không điểm
                else {
                    priority = 50;
                }
                
                // Nếu ưu tiên cao hơn hoặc bằng, chọn cái có điểm cao hơn
                if (priority > bestPriority || (priority === bestPriority && points > (bestTarget ? bestTarget.points : 0))) {
                    bestPriority = priority;
                    bestTarget = {
                        index: j,
                        card: tableCard,
                        points: points,
                        isRed: isRed,
                        priority: priority
                    };
                }
            }
        }
        
        return bestTarget;
    }

    // Tìm nước đi tốt nhất
    findBestMove(playerId, players, tableCards, deck) {
        const player = players[playerId];
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Xét từng lá bài trong tay
        for (let i = 0; i < player.hand.length; i++) {
            const card = player.hand[i];
            
            // Tìm bài ăn được với ưu tiên
            const target = this.findBestEatTarget(card, tableCards);
            
            if (target) {
                // Có bài ăn - chọn bài tốt nhất
                const remainingDeck = [...deck];
                const newTable = [...tableCards];
                const newHand = [...player.hand];
                newHand.splice(i, 1);
                newTable.splice(target.index, 1);
                
                // Mô phỏng kéo bài từ deck
                if (remainingDeck.length > 0) {
                    const drawn = remainingDeck.pop();
                    // Kiểm tra ăn tiếp với ưu tiên
                    const nextTarget = this.findBestEatTarget(drawn, newTable);
                    if (nextTarget) {
                        newTable.splice(nextTarget.index, 1);
                        // Cộng điểm ăn tiếp
                        target.points += nextTarget.points;
                    } else {
                        newTable.push(drawn);
                    }
                }
                
                // Đánh giá nước đi
                const evalScore = this.evaluateState(playerId, players, newTable, remainingDeck) + target.points;
                if (evalScore > bestScore) {
                    bestScore = evalScore;
                    bestMove = { 
                        cardIndex: i, 
                        eatIndex: target.index,
                        points: target.points,
                        isEat: true
                    };
                }
            } else {
                // KHÔNG CÓ BÀI ĂN - đánh lá ít quan trọng nhất
                let penalty = 0;
                // Bài đỏ: giữ lại
                if (card.suit === '♥' || card.suit === '♦') {
                    if (card.rank === 'A') penalty += 200;
                    else if (['10','J','Q','K'].includes(card.rank)) penalty += 150;
                    else if (['8','9'].includes(card.rank)) penalty += 80;
                    else penalty += 50;
                }
                // Bài lớn đen: giữ lại (có thể ăn sau)
                if (card.suit === '♣' || card.suit === '♠') {
                    if (['A','K','Q','J','10'].includes(card.rank)) {
                        penalty += 30;
                    } else {
                        // Bài nhỏ đen: đánh ra
                        penalty -= 20;
                        if (['2','3','4','5','6'].includes(card.rank)) {
                            penalty -= 30;
                        }
                    }
                }
                
                const newTable = [...tableCards, card];
                const newHand = [...player.hand];
                newHand.splice(i, 1);
                
                const evalScore = this.evaluateState(playerId, players, newTable, deck) - penalty;
                if (evalScore > bestScore) {
                    bestScore = evalScore;
                    bestMove = { 
                        cardIndex: i, 
                        eatIndex: -1,
                        points: 0,
                        isEat: false
                    };
                }
            }
        }
        
        // Nếu vẫn chưa có nước đi, đánh lá đầu tiên
        if (!bestMove && player.hand.length > 0) {
            bestMove = {
                cardIndex: 0,
                eatIndex: -1,
                points: 0,
                isEat: false
            };
        }
        
        return bestMove;
    }
}

// Khởi tạo AI
const aiPlayer = new AIPlayer();

// Hàm AI cho bot
function getAIMove(playerId, players, tableCards, deck) {
    return aiPlayer.findBestMove(playerId, players, tableCards, deck);
}
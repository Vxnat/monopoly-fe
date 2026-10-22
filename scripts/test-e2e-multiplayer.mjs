import { Client } from '@colyseus/sdk';

async function runE2EMultiplayerTest() {
  console.log('🚀 Bắt đầu kịch bản kiểm thử E2E 2 Người Chơi Online...');

  const serverUrl = 'ws://localhost:2567';
  const client1 = new Client(serverUrl);
  const client2 = new Client(serverUrl);

  // 1. Host kết nối phòng
  console.log('👤 [Client 1 - Host] Đang tạo phòng...');
  const room1 = await client1.joinOrCreate('monopoly_room', {
    name: 'Bé Tỷ Phú Host',
    avatar: '/images/avatars/char_male_a.jpg',
    tokenId: 'char_male_a',
  });
  console.log(`✅ [Client 1] Đã tạo phòng! Room ID: ${room1.roomId}, Session ID: ${room1.sessionId}`);

  // 2. Guest kết nối theo Room ID
  console.log(`👥 [Client 2 - Guest] Đang tham gia phòng #${room1.roomId}...`);
  const room2 = await client2.joinById(room1.roomId, {
    name: 'Sophia Guest',
    avatar: '/images/avatars/char_female_a.jpg',
    tokenId: 'char_female_a',
  });
  console.log(`✅ [Client 2] Đã tham gia phòng #${room2.roomId}! Session ID: ${room2.sessionId}`);

  // Chờ 500ms để cả 2 phòng nhận state
  await new Promise((r) => setTimeout(r, 600));

  console.log(`📊 Số lượng người chơi trong phòng (Client 1 thấy): ${room1.state.players.length}`);
  console.log(`📊 Số lượng người chơi trong phòng (Client 2 thấy): ${room2.state.players.length}`);
  if (room1.state.players.length !== 2 || room2.state.players.length !== 2) {
    throw new Error('Số người chơi không khớp 2!');
  }

  // 3. Host thêm Bot AI
  console.log('🤖 [Client 1] Yêu cầu Server thêm Bot AI...');
  room1.send('ADD_AI_BOT');
  await new Promise((r) => setTimeout(r, 600));

  console.log(`📊 Sau khi thêm Bot - Client 1 thấy: ${room1.state.players.length} người`);
  console.log(`📊 Sau khi thêm Bot - Client 2 thấy: ${room2.state.players.length} người`);
  if (room1.state.players.length !== 3) {
    throw new Error('Thêm Bot thất bại!');
  }

  // 4. Host bắt đầu ván đấu
  console.log('🏁 [Client 1] Host bấm BẮT ĐẦU VÁN ĐẤU...');
  room1.send('START_GAME');
  await new Promise((r) => setTimeout(r, 800));

  console.log(`🎲 Trạng thái ván đấu: turnPhase = ${room1.state.turnPhase}`);
  console.log(`👉 Người đang có lượt đi: Index = ${room1.state.currentTurnIndex}, Tên = ${room1.state.players[room1.state.currentTurnIndex]?.name}`);

  const activePlayer = room1.state.players[room1.state.currentTurnIndex];
  console.log(`🎯 Người chơi hiện tại: ${activePlayer.name} (${activePlayer.id})`);

  // 5. Nếu là Client 1 hoặc Client 2 thì đổ xúc xắc
  if (activePlayer.id === room1.sessionId) {
    console.log('🎲 [Client 1] Đổ xúc xắc...');
    room1.send('ROLL_DICE');
  } else if (activePlayer.id === room2.sessionId) {
    console.log('🎲 [Client 2] Đổ xúc xắc...');
    room2.send('ROLL_DICE');
  } else {
    console.log('🤖 Lượt của Bot AI, Bot tự hành động...');
  }

  // Chờ lượt di chuyển kết thúc
  await new Promise((r) => setTimeout(r, 2000));

  console.log(`🎲 Kết quả xúc xắc: Dice1 = ${room1.state.dice.dice1}, Dice2 = ${room1.state.dice.dice2}`);
  console.log(`📍 Vị trí sau khi đi: ${activePlayer.position}`);
  console.log(`✨ Modal hiện tại: ${room1.state.activeModal}`);

  // Nếu không vào ô đất (ví dụ ô Thuế/Khí vận), host xác nhận và đổ tiếp để vào ô đất
  let attempts = 0;
  while (room1.state.activeModal !== 'BUY_PROPERTY' && attempts < 5) {
    attempts++;
    console.log(`ℹ️ Đang ở ô ${room1.state.activeModal || 'Không có modal'}, tiếp tục lượt...`);
    if (room1.state.activeModal === 'RENT_PAID') {
      room1.send('PAY_RENT_CONFIRM');
    } else if (room1.state.activeModal === 'CARD_DRAW') {
      room1.send('CARD_CONFIRM');
    }
    await new Promise((r) => setTimeout(r, 600));

    if (room1.state.turnPhase === 'TURN_END') {
      room1.send('END_TURN');
      await new Promise((r) => setTimeout(r, 600));
    }

    const cur = room1.state.players[room1.state.currentTurnIndex];
    if (cur?.id === room1.sessionId) {
      room1.send('ROLL_DICE');
      await new Promise((r) => setTimeout(r, 2000));
    } else if (cur?.id === room2.sessionId) {
      room2.send('ROLL_DICE');
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // 6. Kiểm thử Sàn Đấu Giá Online: Nếu đang ở BUY_PROPERTY, Host từ chối mua -> Kích hoạt Đấu giá
  if (room1.state.activeModal === 'BUY_PROPERTY') {
    console.log('🏛️ [Client 1] Từ chối mua ô đất -> Chuyển sang Sàn Đấu Giá...');
    room1.send('DECLINE_PROPERTY');
    await new Promise((r) => setTimeout(r, 800));

    console.log(`🏷️ Trạng thái sau từ chối: turnPhase = ${room1.state.turnPhase}, activeModal = ${room1.state.activeModal}`);
    if (room1.state.turnPhase === 'AUCTION') {
      console.log(`🔨 Đấu giá ô ID: ${room1.state.auction.tileId}, Giá ban đầu: $${room1.state.auction.currentBid}`);

      // Client 2 (Guest) trả giá $30
      console.log(`🙋 [Client 2 - Guest (${room2.sessionId})] Trả giá $30...`);
      room2.send('AUCTION_BID', { amount: 30 });
      await new Promise((r) => setTimeout(r, 600));

      console.log(`👑 Người dẫn đầu sau lượt 1 (Client 1 thấy): ${room1.state.auction.highestBidderId}, Giá: $${room1.state.auction.currentBid}`);

      // Client 1 (Host) trả giá cao hơn hẳn để vượt qua Bot và Client 2 ($120)
      console.log(`🙋 [Client 1 - Host (${room1.sessionId})] Trả giá $120...`);
      room1.send('AUCTION_BID', { amount: 120 });
      await new Promise((r) => setTimeout(r, 800));

      console.log(`👑 Người dẫn đầu sau lượt 2 (Client 2 thấy): ${room2.state.auction.highestBidderId}, Giá: $${room2.state.auction.currentBid}`);
      if (room2.state.auction.highestBidderId !== room1.sessionId || room2.state.auction.currentBid !== 120) {
        throw new Error('Đấu giá Client 1 ($120) không ghi nhận đúng!');
      }

      // Client 2 rút lui khỏi đấu giá
      console.log(`🏳️ [Client 2] Rút lui khỏi đấu giá...`);
      room2.send('AUCTION_FOLD');
      await new Promise((r) => setTimeout(r, 600));
      console.log(`📊 Số người còn lại trong đấu giá: ${room1.state.auction.activeBidderIds.length}`);
      if (room1.state.auction.activeBidderIds.includes(room2.sessionId)) {
        throw new Error('Client 2 rút lui nhưng vẫn còn trong activeBidderIds!');
      }
    }
  }

  // Dọn dẹp rời phòng
  room1.leave();
  room2.leave();
  console.log('🎉 KIỂM THỬ E2E MULTIPLAYER & SÀN ĐẤU GIÁ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
}

runE2EMultiplayerTest().catch((err) => {
  console.error('❌ Lỗi E2E:', err);
  process.exit(1);
});

'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { getTileTransform, BOARD_TOTAL_SIZE, TILE_HEIGHT } from '@/utils/boardCoordinates';
import { Tile3D } from './Tile3D';
import { Token3D } from './Token3D';
import { Dice3D } from './Dice3D';

export const Board3D: React.FC = () => {
  const board = useGameStore((state) => state.board);
  const players = useGameStore((state) => state.players);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Mặt bàn cờ nền dưới (Light Ivory Maple Wood Frame) */}
      <mesh receiveShadow position={[0, -0.06, 0]}>
        <boxGeometry args={[BOARD_TOTAL_SIZE + 1.2, TILE_HEIGHT + 0.1, BOARD_TOTAL_SIZE + 1.2]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.12} />
      </mesh>

      {/* Viền kim loại vàng bao ngoài cùng của bàn cờ */}
      <mesh position={[0, TILE_HEIGHT / 2 + 0.01, 0]}>
        <boxGeometry args={[BOARD_TOTAL_SIZE + 0.8, 0.02, BOARD_TOTAL_SIZE + 0.8]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.18} metalness={0.88} />
      </mesh>

      {/* 2. Mặt nền trung tâm (Fresh Mint Emerald Arena) */}
      <mesh receiveShadow position={[0, TILE_HEIGHT / 2 - 0.01, 0]}>
        <boxGeometry args={[BOARD_TOTAL_SIZE - 6.4, 0.04, BOARD_TOTAL_SIZE - 6.4]} />
        <meshStandardMaterial color="#ECFDF5" roughness={0.3} metalness={0.06} />
      </mesh>

      {/* Đường viền vàng ánh kim bao quanh khu vực trung tâm */}
      <mesh position={[0, TILE_HEIGHT / 2 + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOARD_TOTAL_SIZE - 6.5, BOARD_TOTAL_SIZE - 6.5]} />
        <meshBasicMaterial color="#10B981" wireframe />
      </mesh>
      <mesh position={[0, TILE_HEIGHT / 2 + 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOARD_TOTAL_SIZE - 6.7, BOARD_TOTAL_SIZE - 6.7]} />
        <meshBasicMaterial color="#F59E0B" wireframe />
      </mesh>

      {/* 3. Logo & Tiêu đề trung tâm bàn cờ theo phong cách Monopoly Plus */}
      <group position={[0, TILE_HEIGHT / 2 + 0.03, -4.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={1.25}
          color="#059669"
          fontWeight="black"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          MONOPOLY
        </Text>
        <Text
          position={[0, -0.85, 0]}
          fontSize={0.42}
          color="#D97706"
          fontWeight="black"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          ★ VIETNAM 3D CITY ★
        </Text>
      </group>

      {/* 4. Khay đổ xúc xắc 3D ở trung tâm */}
      <Dice3D />

      {/* 5. Render 40 ô bàn cờ */}
      {board.map((tile) => {
        const transform = getTileTransform(tile.id);
        return <Tile3D key={tile.id} tile={tile} transform={transform} />;
      })}

      {/* 6. Render các quân cờ Token kim loại */}
      {players.map((player, index) => (
        <Token3D
          key={player.id}
          player={player}
          playerIndex={index}
          totalPlayers={players.length}
        />
      ))}
    </group>
  );
};

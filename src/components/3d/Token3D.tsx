'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { PlayerState } from '@/types/game';
import { getTileTransform, getPlayerTokenOffset, getTokenFacingRotation, TILE_HEIGHT } from '@/utils/boardCoordinates';
import { useGameStore } from '@/store/gameStore';
import { TOKENS_CONFIG, getTokenConfigById } from '@/constants/tokenConfig';
import { SkeletonUtils } from 'three-stdlib';

// Nạp trước (Preload) toàn bộ 8 model GLB để khi di chuyển không bị giật khung hình
TOKENS_CONFIG.forEach((token) => {
  useGLTF.preload(token.modelPath);
});

interface GLBTokenModelProps {
  modelPath: string;
  scale: number;
  playerHexColor: string;
  positionOffset?: [number, number, number];
  isMoving?: boolean;
}

/**
 * 📦 COMPONENT NẠP VÀ PHỦ VẬT LIỆU CHO FILE GLB (Dùng SkeletonUtils cho SkinnedMesh)
 */
const GLBTokenModel: React.FC<GLBTokenModelProps> = ({
  modelPath,
  scale,
  playerHexColor,
  positionOffset = [0, 0, 0],
  isMoving = false,
}) => {
  const { scene, animations } = useGLTF(modelPath);

  // Clone scene bằng SkeletonUtils để clone đúng cấu trúc xương (SkinnedMesh) cho từng người chơi
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group;
    const playerColor = new THREE.Color(playerHexColor);

    // Duyệt qua tất cả mesh để tối ưu hóa vật liệu PBR theo màu người chơi và giữ nguyên texture nhân vật
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (mat.map) {
            // Giữ nguyên texture màu sắc gốc sống động của nhân vật (tóc, da, trang phục)
            mat.color = new THREE.Color(0xffffff);
            mat.roughness = 0.4;
            mat.metalness = 0.05;
          } else {
            mat.color = playerColor;
            mat.metalness = Math.max(0.8, mat.metalness || 0.85);
            mat.roughness = Math.min(0.2, mat.roughness || 0.15);
          }
          mesh.material = mat;
        }
      }
    });

    return clone;
  }, [scene, playerHexColor]);

  // Hoạt ảnh (Animation): 'walk' / 'jump' khi di chuyển, 'idle' khi đứng yên
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!clonedScene || !animations || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const animName = isMoving ? 'jump' : 'idle';
    const clip =
      animations.find((a) => a.name.toLowerCase() === animName) ||
      animations.find((a) => a.name.toLowerCase() === 'idle') ||
      animations[0];

    if (clip) {
      const action = mixer.clipAction(clip);
      action.reset().fadeIn(0.2).play();
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [clonedScene, animations, isMoving]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <primitive
      object={clonedScene}
      scale={scale}
      position={positionOffset}
    />
  );
};

/**
 * 🌟 BỤC HÀO QUANG HOLOGRAM SIÊU MỎNG & VÒNG XOAY ĐA TẦNG (Holographic Luxury Pedestal)
 */
interface HolographicPedestalProps {
  playerHexColor: string;
  isActivePlayer: boolean;
}

const HolographicPedestal: React.FC<HolographicPedestalProps> = ({
  playerHexColor,
  isActivePlayer,
}) => {
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Vòng trong xoay theo chiều kim đồng hồ
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 1.2;
    }
    // Vòng ngoài xoay ngược chiều kim đồng hồ
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.8;
      if (isActivePlayer) {
        // Nhịp thở phát quang khi đến lượt
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.08;
        outerRingRef.current.scale.set(pulse, pulse, 1);
      } else {
        outerRingRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group position={[0, -0.28, 0]}>
      {/* 1. Đĩa Vàng Kim Vát Cạnh Kim Cương Siêu Mỏng Sát Mặt Đất (Beveled Gold Coin Disc) */}
      <mesh receiveShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.03, 32]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.94}
          roughness={0.12}
        />
      </mesh>

      {/* 2. Mặt Đĩa Thạch Men Sứ Phản Chiếu Màu Người Chơi (Player Gem Inlay) */}
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial
          color={playerHexColor}
          metalness={0.65}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Vòng Hào Quang Hologram Trong (Inner Neon Ring) */}
      <mesh ref={innerRingRef} position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.35, 32]} />
        <meshBasicMaterial
          color={playerHexColor}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Vòng Chỉ Vàng Phản Quang Ngoài Xoay Ngược Chiều (Outer Gold Ring) */}
      <mesh ref={outerRingRef} position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.44, 0.52, 32]} />
        <meshBasicMaterial
          color="#FCD34D"
          transparent
          opacity={isActivePlayer ? 0.85 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

interface Token3DProps {
  player: PlayerState;
  playerIndex: number;
  totalPlayers: number;
}

export const Token3D: React.FC<Token3DProps> = ({ player, playerIndex, totalPlayers }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dice = useGameStore((state) => state.dice);
  const turnPhase = useGameStore((state) => state.turnPhase);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const players = useGameStore((state) => state.players);

  const isActivePlayer = players[currentTurnIndex]?.id === player.id;
  const isMoving = isActivePlayer && turnPhase === 'MOVING' && !dice.isRolling;
  const diceSum = dice.dice1 + dice.dice2;
  const isDouble = dice.dice1 === dice.dice2 && dice.dice1 > 0;

  const tileTransform = getTileTransform(player.position);
  const offset = getPlayerTokenOffset(playerIndex, totalPlayers);
  const targetX = tileTransform.position[0] + offset[0];
  const targetY = TILE_HEIGHT + 0.32;
  const targetZ = tileTransform.position[2] + offset[2];

  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(targetX, targetY, targetZ));
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(targetX, targetY, targetZ));
  const jumpHeightRef = useRef(0);

  const tokenConfig = getTokenConfigById(player.tokenId || 'char_male_a');
  const targetFacingRotation = getTokenFacingRotation(player.position);
  const isFirstMount = useRef(true);

  useEffect(() => {
    targetPosRef.current.set(targetX, targetY, targetZ);
    if (isFirstMount.current) {
      isFirstMount.current = false;
      currentPosRef.current.set(targetX, targetY, targetZ);
      jumpHeightRef.current = 0;
      if (groupRef.current) {
        groupRef.current.rotation.y = targetFacingRotation;
      }
    } else {
      // Nhảy hình cánh cung (Arc Jump) 0.70m mỗi bước ô
      jumpHeightRef.current = 0.70;
    }
  }, [player.position, targetX, targetY, targetZ, targetFacingRotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (jumpHeightRef.current > 0.01) {
      jumpHeightRef.current = THREE.MathUtils.lerp(jumpHeightRef.current, 0, delta * 7.5);
    } else {
      jumpHeightRef.current = 0;
    }

    currentPosRef.current.x = THREE.MathUtils.lerp(currentPosRef.current.x, targetPosRef.current.x, delta * 12.0);
    currentPosRef.current.z = THREE.MathUtils.lerp(currentPosRef.current.z, targetPosRef.current.z, delta * 12.0);
    currentPosRef.current.y = targetPosRef.current.y + jumpHeightRef.current;

    groupRef.current.position.copy(currentPosRef.current);

    // 🧭 Xoay nhân vật mượt mà theo đúng hướng di chuyển của đường đi trên bàn cờ
    let diff = targetFacingRotation - groupRef.current.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    groupRef.current.rotation.y += diff * Math.min(1, delta * 9.0);
  });

  if (player.isBankrupt) {
    return null;
  }

  return (
    <group ref={groupRef} position={[targetX, targetY, targetZ]}>
      {/* 🌟 HUY HIỆU NỔI TRÊN ĐẦU QUÂN CỜ KHI DI CHUYỂN (FLOATING HEAD BADGE - LUXURY MINT & GOLD) */}
      {isMoving && (
        <Html position={[0, 1.6, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border-2 border-amber-400 shadow-[0_8px_25px_rgba(16,185,129,0.35),0_0_15px_rgba(245,158,11,0.4)] backdrop-blur-md animate-bounce select-none pointer-events-none whitespace-nowrap ring-2 ring-emerald-500/20">
            <span className="text-base drop-shadow-sm">
              {isDouble ? '⚡' : '🎲'}
            </span>
            <span className="text-emerald-950 font-black text-xs tracking-wider uppercase">
              +<span className="text-emerald-600 text-sm font-black">{diceSum}</span> bước
            </span>
            {isDouble && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-full shadow-sm">
                ĐÔI {dice.dice1}-{dice.dice2}
              </span>
            )}
          </div>
        </Html>
      )}

      {/* 🌟 BỤC HÀO QUANG HOLOGRAM VÀNG HOÀNG GIA ĐA TẦNG XOAY ĐỒNG TÂM */}
      <HolographicPedestal
        playerHexColor={player.hexColor}
        isActivePlayer={isActivePlayer}
      />

      {/* 🌟 MODEL GLB NHÂN VẬT 3D CHUYỂN ĐỘNG THEO HƯỚNG BÀN CỜ */}
      <GLBTokenModel
        modelPath={tokenConfig.modelPath}
        scale={tokenConfig.scale}
        playerHexColor={player.hexColor}
        positionOffset={tokenConfig.positionOffset}
        isMoving={isMoving}
      />
    </group>
  );
};

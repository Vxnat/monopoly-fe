'use client';

import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, useTexture } from '@react-three/drei';
import { TileData, PlayerState } from '@/types/game';
import { TileTransform3D } from '@/utils/boardCoordinates';
import { COLOR_GROUP_HEX } from '@/constants/gameConfig';
import { useGameStore } from '@/store/gameStore';

/**
 * 🖼️ BIỂU TƯỢNG HÌNH ẢNH DANH LAM THẮNG CẢNH 3D (TILE TEXTURE ICON)
 * Nạp texture vector/PNG nền trong suốt, hòa trộn với ánh sáng bàn cờ PBR
 */
interface TileTextureIcon3DProps {
  iconUrl: string;
  size: [number, number];
  position: [number, number, number];
  isCorner?: boolean;
}

const TileTextureIcon3D: React.FC<TileTextureIcon3DProps> = ({
  iconUrl,
  size,
  position,
  isCorner = false,
}) => {
  const texture = useTexture(iconUrl);
  const radius = Math.max(size[0], size[1]) * (isCorner ? 0.52 : 0.58);

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 1. Lớp Đĩa Lót & Viền Mạ Vàng Decal UV Sang Trọng (UV Print Base Plate) */}
      {isCorner ? (
        <>
          {/* Viền ngoài mạ vàng lớn */}
          <mesh position={[0, 0, 0.001]}>
            <ringGeometry args={[radius * 0.90, radius, 48]} />
            <meshStandardMaterial
              color="#F59E0B"
              metalness={0.88}
              roughness={0.16}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Viền chỉ vàng phản quang */}
          <mesh position={[0, 0, 0.0015]}>
            <ringGeometry args={[radius * 0.82, radius * 0.85, 48]} />
            <meshBasicMaterial color="#FCD34D" transparent opacity={0.65} />
          </mesh>
          {/* Đĩa nền men sứ / kính mờ */}
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[radius * 0.82, 48]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.18}
              metalness={0.06}
              transparent
              opacity={0.35}
            />
          </mesh>
        </>
      ) : (
        <>
          {/* Viền mạ vàng thanh lịch cho ô thông thường */}
          <mesh position={[0, 0, 0.001]}>
            <ringGeometry args={[radius * 0.88, radius * 0.96, 32]} />
            <meshStandardMaterial
              color="#F59E0B"
              metalness={0.82}
              roughness={0.2}
              transparent
              opacity={0.65}
            />
          </mesh>
          {/* Đĩa mờ men sứ */}
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[radius * 0.88, 32]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.18}
              metalness={0.05}
              transparent
              opacity={0.25}
            />
          </mesh>
        </>
      )}

      {/* 2. Lớp Decal UV In Chìm Sắc Nét (100% Nằm Phẳng Trên Mặt Ô Đất) */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          map={texture}
          transparent
          roughness={0.24}
          metalness={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/**
 * 🏷️ THẺ GIÁ TIỀN 3D SANG TRỌNG (3D TACTILE PRICE RIBBON)
 * Khối hộp Xanh Ngọc Emerald #059669 nguyên khối nổi bật trên nền ô đất trắng
 * Chữ số Trắng Tinh #FFFFFF in hoa đậm nét, cỡ to vượt trội
 */
interface PriceTagRibbon3DProps {
  price: number;
  width: number;
  depth: number;
  position: [number, number, number];
}

const PriceTagRibbon3D: React.FC<PriceTagRibbon3DProps> = ({
  price,
  width,
  depth,
  position,
}) => {
  const ribbonWidth = width * 0.86;
  const ribbonDepth = depth * 0.19;

  return (
    <group position={position}>
      {/* 1. Khối hộp Xanh Ngọc Emerald nguyên khối (#059669) nổi bật trên nền ô đất trắng */}
      <RoundedBox
        args={[ribbonWidth, 0.024, ribbonDepth]}
        radius={0.010}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#059669"
          roughness={0.2}
          metalness={0.12}
        />
      </RoundedBox>

      {/* 2. Lớp đệm xanh ngọc tươi sáng tạo chiều sâu 3D */}
      <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ribbonWidth * 0.94, ribbonDepth * 0.88]} />
        <meshStandardMaterial
          color="#047857"
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* 3. Text số tiền màu Trắng Tinh #FFFFFF in hoa đậm nét, cỡ to vượt trội */}
      <Text
        position={[0, 0.016, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="black"
        letterSpacing={0.02}
      >
        {`$${price}`}
      </Text>
    </group>
  );
};

/**
 * 🏠 MÔ HÌNH 3D NGÔI NHÀ MÁI CHÓP XANH NGỌC (EMERALD GABLE ROOF COTTAGE)
 * Chuẩn Monopoly Plus: Thân xanh ngọc, mái chóp 4 mặt dốc, cửa gỗ ấm, cửa sổ & ống khói mạ vàng
 */
interface HouseModel3DProps {
  position: [number, number, number];
  spawnDelay?: number;
}

const HouseModel3D: React.FC<HouseModel3DProps> = ({ position, spawnDelay = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    animTimeRef.current += delta;
    const t = Math.max(0, animTimeRef.current - spawnDelay);

    // Hiệu ứng Thả nảy đàn hồi (Juicy Drop & Bounce)
    if (t < 0.55) {
      let bounceY = 0;
      let scale = 1;
      if (t < 0.22) {
        const p = t / 0.22;
        bounceY = 0.9 * (1 - p * p);
        scale = THREE.MathUtils.lerp(0.4, 1.0, p);
      } else if (t < 0.40) {
        const p = (t - 0.22) / 0.18;
        bounceY = 0.24 * 4 * p * (1 - p);
      } else {
        const p = (t - 0.40) / 0.15;
        bounceY = 0.06 * 4 * p * (1 - p);
      }
      groupRef.current.position.y = position[1] + bounceY;
      groupRef.current.scale.set(scale, scale, scale);
    } else {
      groupRef.current.position.y = position[1];
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Thân nhà khối bo tròn góc màu xanh ngọc đồ chơi cao cấp */}
      <RoundedBox args={[0.26, 0.20, 0.26]} radius={0.03} smoothness={4} castShadow receiveShadow position={[0, 0.10, 0]}>
        <meshStandardMaterial
          color="#10B981"
          roughness={0.16}
          metalness={0.12}
        />
      </RoundedBox>

      {/* 2. Mái nhà hình chóp tam giác 4 mặt dốc (Hip/Gable Roof) */}
      <mesh castShadow position={[0, 0.26, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.21, 0.14, 4]} />
        <meshStandardMaterial
          color="#047857"
          roughness={0.18}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Cửa chính gỗ ấm phía trước */}
      <mesh position={[0, 0.06, 0.132]}>
        <planeGeometry args={[0.07, 0.11]} />
        <meshStandardMaterial color="#B45309" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* 4. Ô cửa sổ phản quang */}
      <mesh position={[0.06, 0.13, 0.132]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial color="#E0F2FE" roughness={0.1} metalness={0.4} />
      </mesh>
      <mesh position={[-0.06, 0.13, 0.132]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial color="#E0F2FE" roughness={0.1} metalness={0.4} />
      </mesh>

      {/* 5. Ống khói mini mạ vàng trên mái */}
      <mesh castShadow position={[0.06, 0.28, 0.05]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
};

/**
 * 🏨 MÔ HÌNH 3D KHÁCH SẠN HOÀNG GIA VIP (RUBY GRAND HOTEL 3D)
 * Đa tầng đồ sộ, màu đỏ Ruby, sảnh mạ vàng kim, 2 ống khói hoàng gia & huy hiệu sao VIP
 */
interface HotelModel3DProps {
  width: number;
  position: [number, number, number];
}

const HotelModel3D: React.FC<HotelModel3DProps> = ({ width, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    animTimeRef.current += delta;
    const t = animTimeRef.current;

    // Hiệu ứng Thả nảy đàn hồi (Juicy Drop & Bounce)
    if (t < 0.6) {
      let bounceY = 0;
      let scale = 1;
      if (t < 0.24) {
        const p = t / 0.24;
        bounceY = 1.1 * (1 - p * p);
        scale = THREE.MathUtils.lerp(0.3, 1.0, p);
      } else if (t < 0.44) {
        const p = (t - 0.24) / 0.20;
        bounceY = 0.28 * 4 * p * (1 - p);
      } else {
        const p = (t - 0.44) / 0.16;
        bounceY = 0.07 * 4 * p * (1 - p);
      }
      groupRef.current.position.y = position[1] + bounceY;
      groupRef.current.scale.set(scale, scale, scale);
    } else {
      groupRef.current.position.y = position[1];
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  const hotelWidth = Math.min(width * 0.72, 1.1);

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Tầng trệt & Thân khách sạn chính màu Đỏ Ruby sang trọng */}
      <RoundedBox
        args={[hotelWidth, 0.28, 0.38]}
        radius={0.04}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0.14, 0]}
      >
        <meshStandardMaterial
          color="#DC2626"
          roughness={0.14}
          metalness={0.15}
        />
      </RoundedBox>

      {/* 2. Mái hiên sảnh mạ vàng ánh kim chia tầng */}
      <mesh castShadow position={[0, 0.285, 0]}>
        <boxGeometry args={[hotelWidth * 1.04, 0.04, 0.41]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* 3. Tầng thượng Penthouse VIP */}
      <RoundedBox
        args={[hotelWidth * 0.65, 0.16, 0.28]}
        radius={0.03}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0.38, 0]}
      >
        <meshStandardMaterial
          color="#B91C1C"
          roughness={0.15}
          metalness={0.18}
        />
      </RoundedBox>

      {/* 4. Mái chóp thượng mạ vàng */}
      <mesh castShadow position={[0, 0.47, 0]}>
        <boxGeometry args={[hotelWidth * 0.68, 0.035, 0.30]} />
        <meshStandardMaterial color="#FCD34D" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* 5. Hai ống khói vàng hoàng gia hai bên */}
      <mesh castShadow position={[-hotelWidth * 0.24, 0.48, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.14, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh castShadow position={[hotelWidth * 0.24, 0.48, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.14, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.18} />
      </mesh>

      {/* 6. Biển hiệu sao vàng VIP ★ HOTEL ★ */}
      <group position={[0, 0.15, 0.192]}>
        <Text
          fontSize={0.11}
          color="#FCD34D"
          fontWeight="black"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          ★ GRAND HOTEL ★
        </Text>
      </group>
    </group>
  );
};

/**
 * 🚩 CỘT MỐC / LÁ CỜ CHỦ QUYỀN 3D (3D OWNERSHIP FLAGPOLE)
 * Xuất hiện khi người chơi mua được đất: Cột inox mạ bóng, chóp cầu vàng & lá cờ mang màu người chơi
 */
interface OwnershipFlag3DProps {
  owner: PlayerState;
  position: [number, number, number];
}

const OwnershipFlag3D: React.FC<OwnershipFlag3DProps> = ({ owner, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const animTimeRef = useRef(0);

  useFrame((_, delta) => {
    animTimeRef.current += delta;
    const t = animTimeRef.current;

    // Nảy nhẹ khi cắm cờ
    if (groupRef.current && t < 0.45) {
      const p = t / 0.45;
      const bounceY = 0.5 * (1 - p * p);
      groupRef.current.position.y = position[1] + bounceY;
    } else if (groupRef.current) {
      groupRef.current.position.y = position[1];
    }

    // Hiệu ứng phấp phới nhẹ của lá cờ
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 3.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Đế cắm kim loại tròn viền vàng */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.04, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 2. Thân cột cờ Inox mạ bóng */}
      <mesh castShadow position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.016, 0.02, 0.44, 16]} />
        <meshStandardMaterial color="#F1F5F9" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 3. Chóp đỉnh hình cầu mạ vàng */}
      <mesh castShadow position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#FCD34D" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 4. Lá cờ chủ quyền mang màu sắc của người sở hữu */}
      <group position={[0, 0.38, 0]}>
        <mesh ref={flagRef} position={[0.11, 0, 0]}>
          <planeGeometry args={[0.22, 0.14]} />
          <meshStandardMaterial
            color={owner.hexColor}
            roughness={0.25}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};

/**
 * 👑 VƯƠNG MIỆN VÀNG 3D MONOPOLY (GOLDEN MONOPOLY CROWN)
 * Hiển thị khi người chơi gom trọn bộ khu đất (Monopoly Full-Set)
 */
interface MonopolyCrown3DProps {
  position: [number, number, number];
}

const MonopolyCrown3D: React.FC<MonopolyCrown3DProps> = ({ position }) => {
  const crownRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!crownRef.current) return;
    crownRef.current.rotation.y += delta * 1.5;
  });

  return (
    <group ref={crownRef} position={position}>
      {/* Vành vương miện */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.09, 0.10, 0.06, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* 4 Đỉnh chóp vương miện */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
        <mesh
          key={i}
          position={[Math.cos(ang) * 0.08, 0.08, Math.sin(ang) * 0.08]}
        >
          <coneGeometry args={[0.025, 0.06, 8]} />
          <meshStandardMaterial color="#FCD34D" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Viên ngọc Ruby ở giữa */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#EF4444" roughness={0.1} metalness={0.3} />
      </mesh>
    </group>
  );
};

interface Tile3DProps {
  tile: TileData;
  transform: TileTransform3D;
}

export const Tile3D: React.FC<Tile3DProps> = ({ tile, transform }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectTile = useGameStore((state) => state.selectTile);
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const players = useGameStore((state) => state.players);
  const board = useGameStore((state) => state.board);

  const isSelected = selectedTileId === tile.id;
  const owner = tile.ownerId ? players.find((p) => p.id === tile.ownerId) : null;
  const colorStripHex = tile.colorGroup ? COLOR_GROUP_HEX[tile.colorGroup] : undefined;

  // Kiểm tra gom trọn bộ khu đất
  const isMonopolyOwned = useMemo(() => {
    if (!tile.colorGroup || !tile.ownerId) return false;
    const groupTiles = board.filter((t) => t.colorGroup === tile.colorGroup);
    return groupTiles.length > 0 && groupTiles.every((t) => t.ownerId === tile.ownerId);
  }, [board, tile.colorGroup, tile.ownerId]);

  const [width, height, depth] = transform.size;

  return (
    <group
      ref={meshRef}
      position={transform.position}
      rotation={transform.rotation}
      onClick={(e) => {
        e.stopPropagation();
        selectTile(tile.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. Khối thân ô đất (Glossy Board Tile) */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.96, height, depth * 0.96]} />
        <meshStandardMaterial
          color={isSelected ? '#FEF9C3' : hovered ? '#F8FAFC' : '#FFFFFF'}
          roughness={0.18}
          metalness={0.08}
        />
      </mesh>

      {/* Viền phát sáng ánh kim khi hover / chọn / gom trọn bộ */}
      {(hovered || isSelected || isMonopolyOwned) && (
        <mesh position={[0, height / 2 + 0.015, 0]}>
          <planeGeometry args={[width * 0.96, depth * 0.96]} />
          <meshBasicMaterial
            color={isSelected ? '#F59E0B' : isMonopolyOwned ? '#FCD34D' : '#38BDF8'}
            wireframe
            transparent
            opacity={isMonopolyOwned ? 0.75 : 0.9}
          />
        </mesh>
      )}

      {/* Dải neon phát quang bao quanh cạnh ô đất theo màu của chủ sở hữu */}
      {owner && (
        <mesh position={[0, height / 2 + 0.008, 0]}>
          <planeGeometry args={[width * 0.94, depth * 0.94]} />
          <meshBasicMaterial
            color={owner.hexColor}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* 2. Dải màu phân khu đất (Saturated Color Strip + Golden Accent Line ở mép trong) */}
      {colorStripHex && !transform.isCorner && (
        <group>
          {/* Dải màu chính ở mép trong hướng về trung tâm bàn cờ */}
          <mesh position={[0, height / 2 + 0.01, -depth * 0.36]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width * 0.94, depth * 0.22]} />
            <meshStandardMaterial
              color={colorStripHex}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          {/* Viền chỉ vàng ngăn cách sang trọng */}
          <mesh position={[0, height / 2 + 0.012, -depth * 0.24]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width * 0.94, 0.03]} />
            <meshBasicMaterial color="#FCD34D" />
          </mesh>

          {/* 👑 Vương miện Monopoly khi gom trọn bộ màu */}
          {isMonopolyOwned && (
            <MonopolyCrown3D position={[width * 0.35, height / 2 + 0.04, -depth * 0.36]} />
          )}
        </group>
      )}

      {/* 3. Cột mốc / Lá cờ chủ quyền 3D cắm trên ô đất */}
      {owner && !transform.isCorner && (
        <OwnershipFlag3D
          owner={owner}
          position={[-width * 0.32, height / 2 + 0.01, depth * 0.34]}
        />
      )}

      {/* Thẻ gắn tên chủ sở hữu ở viền ngoài */}
      {owner && (
        <mesh position={[0, height / 2 + 0.018, depth * 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.85, depth * 0.08]} />
          <meshStandardMaterial color={owner.hexColor} roughness={0.3} metalness={0.3} />
        </mesh>
      )}

      {/* 4. TẦNG 3: Biểu tượng hình ảnh danh lam thắng cảnh / tính năng (Decal UV Phóng To) */}
      {!transform.isCorner && tile.icon && (
        <React.Suspense fallback={null}>
          <TileTextureIcon3D
            iconUrl={tile.icon}
            size={
              colorStripHex
                ? [Math.min(width * 0.70, 0.76), Math.min(depth * 0.38, 0.62)]
                : [Math.min(width * 0.76, 0.82), Math.min(depth * 0.46, 0.75)]
            }
            position={[0, height / 2 + 0.012, colorStripHex ? depth * 0.04 : depth * 0.02]}
          />
        </React.Suspense>
      )}

      {/* 5. TẦNG 2: Text hiển thị tên ô đất (Độc lập, không bị đè lên ảnh) */}
      {!transform.isCorner ? (
        <>
          <group position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Tên ô: Đặt phía trên ảnh (gần dải màu mép trong) với cỡ chữ to, đậm nét */}
            <Text
              position={[0, colorStripHex ? depth * 0.16 : depth * 0.28, 0]}
              fontSize={colorStripHex ? 0.21 : 0.22}
              color="#0F172A"
              anchorX="center"
              anchorY="middle"
              maxWidth={width * 0.88}
              textAlign="center"
              fontWeight="black"
            >
              {tile.shortName || tile.name}
            </Text>
          </group>

          {/* TẦNG 4: Thẻ giá tiền 3D Tactile Ribbon ở mép ngoài cùng của bàn cờ */}
          {tile.price && (
            <PriceTagRibbon3D
              price={tile.price}
              width={width}
              depth={depth}
              position={[0, height / 2 + 0.018, depth * 0.34]}
            />
          )}
        </>
      ) : (
        /* Ô Góc (Corner Tile) - Huy hiệu Decal lớn trung tâm & Text tên ô ở đáy */
        <>
          {tile.icon && (
            <React.Suspense fallback={null}>
              <TileTextureIcon3D
                iconUrl={tile.icon}
                size={[width * 0.54, depth * 0.54]}
                position={[0, height / 2 + 0.012, -depth * 0.08]}
                isCorner
              />
            </React.Suspense>
          )}
          <group position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <Text
              position={[0, -depth * 0.32, 0]}
              fontSize={0.28}
              color={tile.id === 0 ? '#15803D' : tile.id === 30 ? '#B91C1C' : '#0F172A'}
              anchorX="center"
              anchorY="middle"
              maxWidth={width * 0.85}
              textAlign="center"
              fontWeight="black"
            >
              {tile.name}
            </Text>
          </group>
        </>
      )}

      {/* 6. Công trình Nhà & Khách sạn 3D đỉnh cao (Xây ở mép trong dọc theo dải màu) */}
      {tile.houses && tile.houses > 0 && (
        <group position={[0, height / 2 + 0.01, -depth * 0.36]}>
          {tile.houses === 5 ? (
            /* Khách Sạn Đỏ Hoàng Gia VIP 3D (Grand Hotel) */
            <HotelModel3D width={width} position={[0, 0, 0]} />
          ) : (
            /* 1 - 4 Ngôi Nhà Mái Chóp Xanh Ngọc 3D (Emerald Houses) */
            <group>
              {Array.from({ length: tile.houses }).map((_, idx) => {
                const spacing = Math.min((width * 0.72) / (tile.houses || 1), 0.32);
                const startX = -((tile.houses! - 1) * spacing) / 2;
                return (
                  <HouseModel3D
                    key={idx}
                    position={[startX + idx * spacing, 0, 0]}
                    spawnDelay={idx * 0.06}
                  />
                );
              })}
            </group>
          )}
        </group>
      )}
    </group>
  );
};

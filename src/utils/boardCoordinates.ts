export interface TileTransform3D {
  id: number;
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [rotX, rotY, rotZ] in radians
  size: [number, number, number];     // [width, height, depth]
  isCorner: boolean;
  edge: 'bottom' | 'left' | 'top' | 'right' | 'corner';
}

export const BOARD_TOTAL_SIZE = 24;      // Kích thước tổng cạnh bàn cờ 3D
export const CORNER_SIZE = 3.2;          // Kích thước ô góc (hình vuông)
export const SIDE_TILE_COUNT = 9;        // 9 ô mỗi cạnh
export const SIDE_TILE_WIDTH = (BOARD_TOTAL_SIZE - CORNER_SIZE * 2) / SIDE_TILE_COUNT; // 1.955
export const TILE_DEPTH = CORNER_SIZE;   // Chiều sâu của ô đất = 3.2
export const TILE_HEIGHT = 0.4;          // Độ dày của mặt bàn cờ 3D

/**
 * Tính toán vị trí 3D, góc xoay và kích thước cho từng ô (0 - 39)
 */
export function getTileTransform(id: number): TileTransform3D {
  const halfBoard = BOARD_TOTAL_SIZE / 2;
  const halfCorner = CORNER_SIZE / 2;
  const y = TILE_HEIGHT / 2;

  // 1. GÓC 0: Khởi Hành (Bottom-Right)
  if (id === 0) {
    return {
      id,
      position: [halfBoard - halfCorner, y, halfBoard - halfCorner],
      rotation: [0, 0, 0],
      size: [CORNER_SIZE, TILE_HEIGHT, CORNER_SIZE],
      isCorner: true,
      edge: 'corner',
    };
  }

  // 2. CẠNH DƯỚI (Bottom: 1 -> 9) Đi từ Phải sang Trái
  if (id >= 1 && id <= 9) {
    const offsetIndex = id; // 1..9
    const startX = halfBoard - CORNER_SIZE;
    const x = startX - (offsetIndex - 0.5) * SIDE_TILE_WIDTH;
    const z = halfBoard - halfCorner;
    return {
      id,
      position: [x, y, z],
      rotation: [0, 0, 0],
      size: [SIDE_TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH],
      isCorner: false,
      edge: 'bottom',
    };
  }

  // 3. GÓC 10: Nhà Tù / Thăm Tù (Bottom-Left)
  if (id === 10) {
    return {
      id,
      position: [-halfBoard + halfCorner, y, halfBoard - halfCorner],
      rotation: [0, 0, 0],
      size: [CORNER_SIZE, TILE_HEIGHT, CORNER_SIZE],
      isCorner: true,
      edge: 'corner',
    };
  }

  // 4. CẠNH TRÁI (Left: 11 -> 19) Đi từ Dưới lên Trên
  if (id >= 11 && id <= 19) {
    const offsetIndex = id - 10; // 1..9
    const startZ = halfBoard - CORNER_SIZE;
    const z = startZ - (offsetIndex - 0.5) * SIDE_TILE_WIDTH;
    const x = -halfBoard + halfCorner;
    return {
      id,
      position: [x, y, z],
      rotation: [0, Math.PI / 2, 0],
      size: [SIDE_TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH],
      isCorner: false,
      edge: 'left',
    };
  }

  // 5. GÓC 20: Bãi Đỗ Xe (Top-Left)
  if (id === 20) {
    return {
      id,
      position: [-halfBoard + halfCorner, y, -halfBoard + halfCorner],
      rotation: [0, 0, 0],
      size: [CORNER_SIZE, TILE_HEIGHT, CORNER_SIZE],
      isCorner: true,
      edge: 'corner',
    };
  }

  // 6. CẠNH TRÊN (Top: 21 -> 29) Đi từ Trái sang Phải
  if (id >= 21 && id <= 29) {
    const offsetIndex = id - 20; // 1..9
    const startX = -halfBoard + CORNER_SIZE;
    const x = startX + (offsetIndex - 0.5) * SIDE_TILE_WIDTH;
    const z = -halfBoard + halfCorner;
    return {
      id,
      position: [x, y, z],
      rotation: [0, Math.PI, 0],
      size: [SIDE_TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH],
      isCorner: false,
      edge: 'top',
    };
  }

  // 7. GÓC 30: Vào Tù (Top-Right)
  if (id === 30) {
    return {
      id,
      position: [halfBoard - halfCorner, y, -halfBoard + halfCorner],
      rotation: [0, 0, 0],
      size: [CORNER_SIZE, TILE_HEIGHT, CORNER_SIZE],
      isCorner: true,
      edge: 'corner',
    };
  }

  // 8. CẠNH PHẢI (Right: 31 -> 39) Đi từ Trên xuống Dưới
  const offsetIndex = id - 30; // 1..9
  const startZ = -halfBoard + CORNER_SIZE;
  const z = startZ + (offsetIndex - 0.5) * SIDE_TILE_WIDTH;
  const x = halfBoard - halfCorner;
  return {
    id,
    position: [x, y, z],
    rotation: [0, -Math.PI / 2, 0],
    size: [SIDE_TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH],
    isCorner: false,
    edge: 'right',
  };
}

/**
 * Tính toán vị trí offset của Token người chơi khi nhiều người cùng đứng chung 1 ô
 */
export function getPlayerTokenOffset(playerIndex: number, totalPlayers = 4): [number, number, number] {
  const radius = 0.6;
  const angle = (playerIndex / totalPlayers) * Math.PI * 2;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

/**
 * Tính toán góc quay hướng mặt nhân vật (Heading Rotation) theo chiều di chuyển trên bàn cờ
 */
export function getTokenFacingRotation(tileId: number): number {
  // Cạnh Dưới (0 -> 9): Đi từ Phải sang Trái (-X)
  if (tileId >= 0 && tileId < 10) {
    return -Math.PI / 2;
  }
  // Cạnh Trái (10 -> 19): Đi từ Dưới lên Trên (-Z)
  if (tileId >= 10 && tileId < 20) {
    return Math.PI;
  }
  // Cạnh Trên (20 -> 29): Đi từ Trái sang Phải (+X)
  if (tileId >= 20 && tileId < 30) {
    return Math.PI / 2;
  }
  // Cạnh Phải (30 -> 39): Đi từ Trên xuống Dưới (+Z)
  return 0;
}

'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/store/gameStore';

// Kích thước của viên xúc xắc
const DIE_SIZE = 1.35;
const HALF = DIE_SIZE / 2;
const OFFSET = 0.32;         // Khoảng cách các chấm
const DOT_RADIUS = 0.11;     // Bán kính chấm đen
const RED_DOT_RADIUS = 0.18; // Bán kính chấm đỏ mặt 1
const EPSILON = 0.005;       // Độ nhô nhẹ để không bị z-fighting

// Góc quay tương ứng để từng mặt (1 -> 6) hướng thẳng lên trên (+Y)
const TARGET_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [0, 0, Math.PI / 2],
  5: [0, 0, -Math.PI / 2],
  3: [-Math.PI / 2, 0, 0],
  4: [Math.PI / 2, 0, 0],
};

/**
 * 🎲 COMPONENT TỪNG VIÊN XÚC XẮC 3D VỚI CHẤM HÌNH HỌC SIÊU NÉT (Geometric 3D Pips)
 * Luôn hiển thị rõ nét trên mặt bàn cờ
 */
const SingleDie: React.FC = () => {
  return (
    <group>
      {/* 1. Thân xúc xắc trắng ngà bóng bẩy bo tròn góc chuẩn Monopoly Plus */}
      <RoundedBox
        args={[DIE_SIZE, DIE_SIZE, DIE_SIZE]}
        radius={0.18}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#FAFAFA"
          roughness={0.06}
          metalness={0.05}
        />
      </RoundedBox>

      {/* 2. MẶT 1 (+Y - Hướng lên trên): 1 Chấm Đỏ Ruby to ở giữa */}
      <group position={[0, HALF + EPSILON, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[RED_DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#DC2626"
            roughness={0.08}
            metalness={0.15}
          />
        </mesh>
        {/* Vòng viền vàng trang nhã quanh chấm đỏ */}
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[RED_DOT_RADIUS * 1.05, RED_DOT_RADIUS * 1.25, 32]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.85}
            roughness={0.18}
          />
        </mesh>
      </group>

      {/* 3. MẶT 6 (-Y - Hướng xuống dưới): 6 Chấm Đen */}
      <group position={[0, -HALF - EPSILON, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {[-OFFSET, OFFSET].map((x) =>
          [-OFFSET, 0, OFFSET].map((y) => (
            <mesh key={`6_${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[DOT_RADIUS, 32]} />
              <meshStandardMaterial
                color="#0F172A"
                roughness={0.15}
              />
            </mesh>
          ))
        )}
      </group>

      {/* 4. MẶT 2 (+X - Phía Phải): 2 Chấm Đen chéo */}
      <group position={[HALF + EPSILON, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[-OFFSET, -OFFSET, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
        <mesh position={[OFFSET, OFFSET, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* 5. MẶT 5 (-X - Phía Trái): 5 Chấm (4 góc + 1 giữa) */}
      <group position={[-HALF - EPSILON, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[-OFFSET, OFFSET].map((x) =>
          [-OFFSET, OFFSET].map((y) => (
            <mesh key={`5_${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[DOT_RADIUS, 32]} />
              <meshStandardMaterial
                color="#0F172A"
                roughness={0.15}
              />
            </mesh>
          ))
        )}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* 6. MẶT 3 (+Z - Phía Trước): 3 Chấm Đen đường chéo */}
      <group position={[0, 0, HALF + EPSILON]}>
        <mesh position={[-OFFSET, -OFFSET, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
        <mesh position={[OFFSET, OFFSET, 0]}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* 7. MẶT 4 (-Z - Phía Sau): 4 Chấm Đen 4 góc */}
      <group position={[0, 0, -HALF - EPSILON]} rotation={[0, Math.PI, 0]}>
        {[-OFFSET, OFFSET].map((x) =>
          [-OFFSET, OFFSET].map((y) => (
            <mesh key={`4_${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[DOT_RADIUS, 32]} />
              <meshStandardMaterial
                color="#0F172A"
                roughness={0.15}
              />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
};

// Hàm tính toán quỹ đạo rơi tự do và các nhịp nảy vật lý chuẩn xác (Physical Gravity & Damped Bounce)
function computePhysicalBounce(
  t: number,
  initialHeight: number,
  groundY: number
): number {
  if (t <= 0.42) {
    // 1. Rơi tự do từ trên cao với gia tốc trọng trường g (t: 0 -> 0.42s)
    const p = t / 0.42;
    return groundY + initialHeight * (1 - p * p);
  } else if (t <= 0.76) {
    // 2. Nhịp nảy 1 (Bounce 1: 0.42s -> 0.76s, cao ~28% ban đầu)
    const p = (t - 0.42) / 0.34;
    const h = initialHeight * 0.28;
    return groundY + 4 * h * p * (1 - p);
  } else if (t <= 1.02) {
    // 3. Nhịp nảy 2 (Bounce 2: 0.76s -> 1.02s, cao ~8.5% ban đầu)
    const p = (t - 0.76) / 0.26;
    const h = initialHeight * 0.085;
    return groundY + 4 * h * p * (1 - p);
  } else if (t <= 1.22) {
    // 4. Nhịp nảy 3 vi mô (Micro Bounce 3: 1.02s -> 1.22s)
    const p = (t - 1.02) / 0.20;
    const h = initialHeight * 0.022;
    return groundY + 4 * h * p * (1 - p);
  } else {
    // 5. Đã tiếp đất hoàn toàn và nằm im trên mặt bàn cờ
    return groundY;
  }
}

/**
 * Hàm sinh điểm rơi ngẫu nhiên trong vùng an toàn (Safe Bounding Box)
 * Đảm bảo 2 xúc xắc cách nhau tối thiểu minDistance để không va lồng vào nhau
 */
function generateSafeLandingTargets(minDistance = 2.4): {
  pos1: [number, number, number];
  pos2: [number, number, number];
} {
  const SAFE_BOUND = 4.2; // Lòng bàn cờ an toàn (-4.2 -> +4.2)
  const groundY = HALF + 0.05;

  let x1 = (Math.random() - 0.5) * 2 * SAFE_BOUND;
  let z1 = (Math.random() - 0.5) * 2 * SAFE_BOUND;

  let x2 = (Math.random() - 0.5) * 2 * SAFE_BOUND;
  let z2 = (Math.random() - 0.5) * 2 * SAFE_BOUND;

  // Lặp tối đa 15 lần để tìm cặp điểm cách nhau đủ xa
  let attempts = 0;
  while (Math.hypot(x1 - x2, z1 - z2) < minDistance && attempts < 15) {
    x2 = (Math.random() - 0.5) * 2 * SAFE_BOUND;
    z2 = (Math.random() - 0.5) * 2 * SAFE_BOUND;
    attempts++;
  }

  // Nếu vẫn gần nhau thì đẩy cưỡng bức theo hướng đối xứng
  if (Math.hypot(x1 - x2, z1 - z2) < minDistance) {
    x1 = -1.8;
    z1 = 0.5;
    x2 = 1.8;
    z2 = -0.5;
  }

  return {
    pos1: [x1, groundY, z1],
    pos2: [x2, groundY, z2],
  };
}

export const Dice3D: React.FC = () => {
  const dice = useGameStore((state) => state.dice);
  const turnPhase = useGameStore((state) => state.turnPhase);
  const rollDice = useGameStore((state) => state.rollDice);

  const [hovered, setHovered] = useState(false);
  const dice1Ref = useRef<THREE.Group>(null);
  const dice2Ref = useRef<THREE.Group>(null);

  // Dynamic Contact Shadow meshes
  const shadow1Ref = useRef<THREE.Mesh>(null);
  const shadow2Ref = useRef<THREE.Mesh>(null);
  const haloMeshRef = useRef<THREE.Mesh>(null);

  const rollTimeRef = useRef(0);

  // Tọa độ xuất phát & điểm rơi ngẫu nhiên cho mỗi lượt tung xúc xắc
  const startPos1Ref = useRef<[number, number, number]>([-4.5, 13.5, -3.5]);
  const startPos2Ref = useRef<[number, number, number]>([4.5, 14.5, 3.5]);
  const targetPos1Ref = useRef<[number, number, number]>([-1.8, HALF + 0.05, 0.5]);
  const targetPos2Ref = useRef<[number, number, number]>([1.8, HALF + 0.05, -0.5]);
  const randomYRot1Ref = useRef<number>(0);
  const randomYRot2Ref = useRef<number>(0);

  const targetQuat1Ref = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const targetQuat2Ref = useRef<THREE.Quaternion>(new THREE.Quaternion());

  // Hiệu ứng pháo hoa khi đổ ra đôi
  useEffect(() => {
    if (!dice.isRolling && dice.dice1 === dice.dice2 && dice.dice1 > 0 && turnPhase === 'MOVING') {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#38BDF8'],
      });
    }
  }, [dice.isRolling, dice.dice1, dice.dice2, turnPhase]);

  // Sinh ngẫu nhiên góc ném và vị trí tiếp đất an toàn mỗi khi bấm Đổ xúc xắc
  useEffect(() => {
    if (dice.isRolling) {
      rollTimeRef.current = 0;

      // Điểm ném xuất phát ngẫu nhiên từ trên không góc chéo
      const startAngle1 = Math.random() * Math.PI * 2;
      const startDist1 = 6.0 + Math.random() * 2.5;
      startPos1Ref.current = [
        Math.cos(startAngle1) * startDist1,
        13.0 + Math.random() * 2.5,
        Math.sin(startAngle1) * startDist1,
      ];

      const startAngle2 = startAngle1 + Math.PI * 0.7 + (Math.random() - 0.5) * 0.5;
      const startDist2 = 6.0 + Math.random() * 2.5;
      startPos2Ref.current = [
        Math.cos(startAngle2) * startDist2,
        14.0 + Math.random() * 2.5,
        Math.sin(startAngle2) * startDist2,
      ];

      // Điểm tiếp đất ngẫu nhiên phân tán khắp lòng bàn cờ không trùng nhau
      const targets = generateSafeLandingTargets(2.5);
      targetPos1Ref.current = targets.pos1;
      targetPos2Ref.current = targets.pos2;

      // Góc xoay nghiêng tự nhiên ngẫu nhiên quanh trục đứng Y (± 45 độ)
      randomYRot1Ref.current = (Math.random() - 0.5) * 1.5;
      randomYRot2Ref.current = (Math.random() - 0.5) * 1.5;
    }
  }, [dice.isRolling]);

  useFrame((_, delta) => {
    const groundY = HALF + 0.05;
    const targetRot1 = TARGET_ROTATIONS[dice.dice1] || [0, 0, 0];
    const targetRot2 = TARGET_ROTATIONS[dice.dice2] || [0, 0, 0];

    // Luôn đảm bảo target quaternion chuẩn xác theo điểm số xúc xắc
    const targetEuler1 = new THREE.Euler(
      targetRot1[0],
      targetRot1[1] + randomYRot1Ref.current,
      targetRot1[2],
      'YXZ'
    );
    targetQuat1Ref.current.setFromEuler(targetEuler1);

    const targetEuler2 = new THREE.Euler(
      targetRot2[0],
      targetRot2[1] + randomYRot2Ref.current,
      targetRot2[2],
      'YXZ'
    );
    targetQuat2Ref.current.setFromEuler(targetEuler2);

    rollTimeRef.current += delta;
    const t = rollTimeRef.current;

    if (dice.isRolling) {
      // 1. Giai đoạn đang rơi và nảy vật lý (t: 0 -> 1.25s)
      const height1 = computePhysicalBounce(t, startPos1Ref.current[1], groundY);
      const height2 = computePhysicalBounce(Math.max(0, t - 0.04), startPos2Ref.current[1], groundY);

      const horizontalProgress = Math.min(1, t / 1.15);
      const easeProgress = THREE.MathUtils.smoothstep(horizontalProgress, 0, 1);
      const rotSpeed = Math.max(0, 1 - t / 1.25);

      // Cập nhật vị trí & xoay Xúc xắc 1
      if (dice1Ref.current) {
        dice1Ref.current.position.y = height1;
        dice1Ref.current.position.x = THREE.MathUtils.lerp(
          startPos1Ref.current[0],
          targetPos1Ref.current[0],
          easeProgress
        );
        dice1Ref.current.position.z = THREE.MathUtils.lerp(
          startPos1Ref.current[2],
          targetPos1Ref.current[2],
          easeProgress
        );

        if (t < 0.75) {
          // Xoay tự do nhiều vòng trên không
          const deltaQ = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(delta * 24 * rotSpeed, delta * 28 * rotSpeed, delta * 20 * rotSpeed)
          );
          dice1Ref.current.quaternion.multiply(deltaQ);
        } else {
          // Slerp góc quay ngắn nhất về đích phẳng hoàn hảo
          const settleProgress = (t - 0.75) / 0.45;
          const factor = THREE.MathUtils.smoothstep(Math.min(1, Math.max(0, settleProgress)), 0, 1);
          dice1Ref.current.quaternion.slerp(
            targetQuat1Ref.current,
            Math.min(1, delta * (14 + factor * 18))
          );
        }
      }

      // Cập nhật bóng tiếp xúc động (Dynamic Contact Shadow 1)
      if (shadow1Ref.current && dice1Ref.current) {
        shadow1Ref.current.position.x = dice1Ref.current.position.x;
        shadow1Ref.current.position.z = dice1Ref.current.position.z;
        const distFromGround = Math.max(0, height1 - groundY);
        const shadowScale = THREE.MathUtils.lerp(1.0, 2.2, Math.min(1, distFromGround / 10));
        shadow1Ref.current.scale.set(shadowScale, shadowScale, 1);
        const mat = shadow1Ref.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.55 / (1 + distFromGround * 0.45);
        }
      }

      // Cập nhật vị trí & xoay Xúc xắc 2
      if (dice2Ref.current) {
        dice2Ref.current.position.y = height2;
        dice2Ref.current.position.x = THREE.MathUtils.lerp(
          startPos2Ref.current[0],
          targetPos2Ref.current[0],
          easeProgress
        );
        dice2Ref.current.position.z = THREE.MathUtils.lerp(
          startPos2Ref.current[2],
          targetPos2Ref.current[2],
          easeProgress
        );

        if (t < 0.75) {
          const deltaQ = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(delta * 26 * rotSpeed, delta * 22 * rotSpeed, delta * 30 * rotSpeed)
          );
          dice2Ref.current.quaternion.multiply(deltaQ);
        } else {
          const settleProgress = (t - 0.75) / 0.45;
          const factor = THREE.MathUtils.smoothstep(Math.min(1, Math.max(0, settleProgress)), 0, 1);
          dice2Ref.current.quaternion.slerp(
            targetQuat2Ref.current,
            Math.min(1, delta * (14 + factor * 18))
          );
        }
      }

      // Cập nhật bóng tiếp xúc động (Dynamic Contact Shadow 2)
      if (shadow2Ref.current && dice2Ref.current) {
        shadow2Ref.current.position.x = dice2Ref.current.position.x;
        shadow2Ref.current.position.z = dice2Ref.current.position.z;
        const distFromGround = Math.max(0, height2 - groundY);
        const shadowScale = THREE.MathUtils.lerp(1.0, 2.2, Math.min(1, distFromGround / 10));
        shadow2Ref.current.scale.set(shadowScale, shadowScale, 1);
        const mat = shadow2Ref.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.55 / (1 + distFromGround * 0.45);
        }
      }
    } else {
      // 2. Giai đoạn tiếp đất: Xúc xắc nằm yên phẳng 100% trên mặt bàn cờ, không bao giờ bị nghiêng
      if (dice1Ref.current) {
        dice1Ref.current.position.set(targetPos1Ref.current[0], groundY, targetPos1Ref.current[2]);
        dice1Ref.current.quaternion.copy(targetQuat1Ref.current);
      }

      if (shadow1Ref.current) {
        shadow1Ref.current.position.x = targetPos1Ref.current[0];
        shadow1Ref.current.position.z = targetPos1Ref.current[2];
        shadow1Ref.current.scale.set(1, 1, 1);
        const mat = shadow1Ref.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = 0.55;
      }

      if (dice2Ref.current) {
        dice2Ref.current.position.set(targetPos2Ref.current[0], groundY, targetPos2Ref.current[2]);
        dice2Ref.current.quaternion.copy(targetQuat2Ref.current);
      }

      if (shadow2Ref.current) {
        shadow2Ref.current.position.x = targetPos2Ref.current[0];
        shadow2Ref.current.position.z = targetPos2Ref.current[2];
        shadow2Ref.current.scale.set(1, 1, 1);
        const mat = shadow2Ref.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = 0.55;
      }
    }
  });

  const canClickToRoll = turnPhase === 'ROLLING' && !dice.isRolling;

  return (
    <group
      position={[0, 0.25, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (canClickToRoll) {
          rollDice();
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (canClickToRoll) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 🌟 Vòng hào quang phát sáng khi rê chuột hoặc đổ đôi */}
      {(hovered || (dice.dice1 === dice.dice2 && !dice.isRolling && dice.dice1 > 0)) && (
        <mesh ref={haloMeshRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 5.0, 48]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.35} />
        </mesh>
      )}

      {/* 🌑 Bóng tiếp xúc động dưới mặt đất cho Xúc Xắc 1 */}
      <mesh ref={shadow1Ref} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.55} />
      </mesh>

      {/* 🌑 Bóng tiếp xúc động dưới mặt đất cho Xúc Xắc 2 */}
      <mesh ref={shadow2Ref} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.55} />
      </mesh>

      {/* 1. Viên Xúc Xắc 1 */}
      <group ref={dice1Ref} position={[-1.8, HALF + 0.05, 0.5]}>
        <SingleDie />
      </group>

      {/* 2. Viên Xúc Xắc 2 */}
      <group ref={dice2Ref} position={[1.8, HALF + 0.05, -0.5]}>
        <SingleDie />
      </group>
    </group>
  );
};

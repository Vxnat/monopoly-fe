'use client';

import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import '@/utils/threePatch';
import { Board3D } from './Board3D';
import { CameraController } from './CameraController';

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        camera={{ position: [0, 22, 17], fov: 44 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* 1. Phản chiếu môi trường chân thực (Image-Based Lighting - IBL) */}
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.65} />
        </Suspense>

        {/* 2. Ánh sáng môi trường tự nhiên */}
        <ambientLight intensity={1.25} color="#FFFFFF" />

        {/* 3. Ánh sáng mặt trời chính (Warm Sun Key Light) chiếu xiên 45 độ tạo bóng đổ sắc nét */}
        <directionalLight
          position={[16, 32, 16]}
          intensity={2.0}
          color="#FFFDF5"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={70}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-bias={-0.0001}
        />

        {/* 4. Đèn viền phản quang Cyan & Gold (Dual Rim Lights chuẩn Monopoly Plus) */}
        <pointLight position={[-18, 16, -18]} intensity={0.8} color="#38BDF8" distance={60} />
        <pointLight position={[18, 12, -18]} intensity={0.8} color="#F59E0B" distance={60} />
        <pointLight position={[0, 10, 18]} intensity={0.5} color="#10B981" distance={40} />

        {/* 5. Toàn bộ Thế giới Bàn Cờ 3D */}
        <Suspense fallback={null}>
          <Board3D />
          {/* Đổ bóng tiếp xúc mặt sàn mềm mại màu ngọc bích */}
          <ContactShadows
            position={[0, -0.22, 0]}
            opacity={0.35}
            scale={36}
            blur={2.5}
            far={12}
            color="#064E3B"
          />
        </Suspense>

        {/* 6. Điều khiển Camera xoay và zoom mượt mà */}
        <CameraController />
        <OrbitControls
          makeDefault
          minDistance={12}
          maxDistance={42}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 8}
          enableDamping
          dampingFactor={0.06}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

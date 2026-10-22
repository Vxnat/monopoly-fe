// Polyfill FileReader cho môi trường Node.js
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      if (typeof this.onloadend === 'function') {
        this.onloadend();
      }
    });
  }
};

import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const OUTPUT_DIR = path.resolve('public/models/tokens');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Hàm hỗ trợ xuất GLB dạng binary
function exportToGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const buffer = Buffer.from(gltf);
        const filePath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Đã xuất thành công: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
        resolve(filePath);
      },
      (error) => {
        console.error(`❌ Lỗi xuất ${filename}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// 1. 🏎️ XE ĐUA THỂ THAO (Race Car / Supercar)
function createRaceCar() {
  const group = new THREE.Group();
  group.name = 'RaceCar';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.85, roughness: 0.15 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9, roughness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.95, roughness: 0.05 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xFCD34D, metalness: 0.95, roughness: 0.1 });

  // Thân xe chính (Chassis)
  const chassisGeo = new THREE.BoxGeometry(0.7, 0.2, 1.4);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.y = 0.15;
  group.add(chassis);

  // Mũi xe vát nhọn khí động học
  const noseGeo = new THREE.ConeGeometry(0.35, 0.45, 4);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  nose.position.set(0, 0.12, 0.85);
  group.add(nose);

  // Buồng lái kính thể thao
  const cockpitGeo = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
  cockpit.position.set(0, 0.24, -0.05);
  cockpit.scale.set(0.9, 0.8, 1.3);
  group.add(cockpit);

  // Cánh gió sau (Rear Wing)
  const wingGeo = new THREE.BoxGeometry(0.85, 0.04, 0.2);
  const wing = new THREE.Mesh(wingGeo, trimMat);
  wing.position.set(0, 0.42, -0.65);
  group.add(wing);

  const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2), trimMat);
  strut1.position.set(-0.25, 0.32, -0.65);
  const strut2 = strut1.clone();
  strut2.position.set(0.25, 0.32, -0.65);
  group.add(strut1, strut2);

  // 4 Bánh xe thể thao có vành đúc mạ vàng
  const wheelPositions = [
    [-0.38, 0.14, 0.45],
    [0.38, 0.14, 0.45],
    [-0.38, 0.14, -0.45],
    [0.38, 0.14, -0.45],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const tireGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
    const tire = new THREE.Mesh(tireGeo, wheelMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.105, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);

    group.add(tire, rim);
  });

  return group;
}

// 2. 🛥️ DU THUYỀN TRIỆU ĐÔ (Luxury Yacht)
function createLuxuryYacht() {
  const group = new THREE.Group();
  group.name = 'LuxuryYacht';

  const hullMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.6, roughness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.95, roughness: 0.05 });

  // Thân thuyền chính vát nhọn
  const hullGeo = new THREE.CylinderGeometry(0.35, 0.15, 1.5, 4);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.rotation.x = Math.PI / 2;
  hull.rotation.y = Math.PI / 4;
  hull.scale.set(0.7, 1.2, 0.4);
  hull.position.y = 0.15;
  group.add(hull);

  // Tầng cabin 1
  const deck1Geo = new THREE.BoxGeometry(0.42, 0.16, 0.7);
  const deck1 = new THREE.Mesh(deck1Geo, hullMat);
  deck1.position.set(0, 0.3, -0.1);
  group.add(deck1);

  // Tầng cabin 2 (Buồng lái thượng hạng)
  const deck2Geo = new THREE.BoxGeometry(0.32, 0.14, 0.45);
  const deck2 = new THREE.Mesh(deck2Geo, glassMat);
  deck2.position.set(0, 0.44, -0.12);
  group.add(deck2);

  // Mui che mạ vàng phía trên
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.5), goldMat);
  roof.position.set(0, 0.52, -0.12);
  group.add(roof);

  // Cột Radar / Antenna vàng
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), goldMat);
  mast.position.set(0, 0.66, -0.25);
  group.add(mast);

  return group;
}

// 3. 🎩 MŨ CHÓP QUÝ TỘC (Classic Top Hat)
function createTopHat() {
  const group = new THREE.Group();
  group.name = 'TopHat';

  const feltMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.3, roughness: 0.4 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.7, roughness: 0.2 });
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.95, roughness: 0.1 });

  // Vành mũ rộng uốn lượn nhẹ
  const brimGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 32);
  const brim = new THREE.Mesh(brimGeo, feltMat);
  brim.position.y = 0.02;
  group.add(brim);

  // Thân mũ cao hình trụ hơi nở trên
  const crownGeo = new THREE.CylinderGeometry(0.44, 0.38, 0.75, 32);
  const crown = new THREE.Mesh(crownGeo, feltMat);
  crown.position.y = 0.4;
  group.add(crown);

  // Dải ruy băng đỏ quanh chân mũ
  const ribbonGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.12, 32);
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.y = 0.12;
  group.add(ribbon);

  // Khóa cài vàng kim (Gold Buckle)
  const buckleGeo = new THREE.BoxGeometry(0.12, 0.1, 0.04);
  const buckle = new THREE.Mesh(buckleGeo, buckleMat);
  buckle.position.set(0, 0.12, 0.39);
  group.add(buckle);

  return group;
}

// 4. ✈️ CHUYÊN CƠ PHẢN LỰC (Private Jet)
function createPrivateJet() {
  const group = new THREE.Group();
  group.name = 'PrivateJet';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.85, roughness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.95, roughness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9, roughness: 0.1 });

  // Thân máy bay khí động học
  const bodyGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.4, 24);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.25;
  group.add(body);

  // Mũi máy bay mạ vàng
  const noseGeo = new THREE.ConeGeometry(0.14, 0.35, 24);
  const nose = new THREE.Mesh(noseGeo, goldMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0.25, 0.85);
  group.add(nose);

  // Kính buồng lái
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.25), glassMat);
  cockpit.position.set(0, 0.35, 0.5);
  group.add(cockpit);

  // Đôi cánh chính (Swept Wings)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(-0.9, -0.3);
  wingShape.lineTo(0.9, -0.3);
  wingShape.lineTo(0.3, 0.2);
  wingShape.lineTo(-0.3, 0.2);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.03, bevelEnabled: false });
  const wings = new THREE.Mesh(wingGeo, goldMat);
  wings.rotation.x = Math.PI / 2;
  wings.position.set(0, 0.24, 0.1);
  group.add(wings);

  // Đuôi đứng (Vertical Tail)
  const tailGeo = new THREE.BoxGeometry(0.03, 0.35, 0.3);
  const tail = new THREE.Mesh(tailGeo, goldMat);
  tail.position.set(0, 0.45, -0.55);
  tail.rotation.x = -0.3;
  group.add(tail);

  return group;
}

// 5. 👑 VƯƠNG MIỆN HOÀNG GIA (Royal Crown)
function createRoyalCrown() {
  const group = new THREE.Group();
  group.name = 'RoyalCrown';

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.95, roughness: 0.1 });
  const rubyMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.8, roughness: 0.1 });
  const velvetMat = new THREE.MeshStandardMaterial({ color: 0x7E22CE, roughness: 0.5 });

  // Đế vương miện tròn
  const baseGeo = new THREE.CylinderGeometry(0.45, 0.48, 0.15, 32);
  const base = new THREE.Mesh(baseGeo, goldMat);
  base.position.y = 0.08;
  group.add(base);

  // Lớp đệm nhung tím quý tộc bên trong
  const velvet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), velvetMat);
  velvet.position.y = 0.12;
  group.add(velvet);

  // 5 Đỉnh vương miện đính ngọc Ruby
  const numPoints = 6;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const r = 0.44;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    // Chóp nhọn vàng
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 12), goldMat);
    spike.position.set(x, 0.3, z);
    group.add(spike);

    // Viên ngọc đỏ trên đỉnh
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), rubyMat);
    gem.position.set(x, 0.48, z);
    group.add(gem);
  }

  // Thánh giá hoàng gia ở chính giữa đỉnh
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), goldMat);
  crossV.position.set(0, 0.54, 0);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), goldMat);
  crossH.position.set(0, 0.58, 0);
  group.add(crossV, crossH);

  return group;
}

// 6. 🐱 MÈO THẦN TÀI (Lucky Cat / Maneki-Neko)
function createLuckyCat() {
  const group = new THREE.Group();
  group.name = 'LuckyCat';

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.12 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.6, roughness: 0.2 });

  // Thân mèo tròn trịa
  const bodyGeo = new THREE.SphereGeometry(0.42, 24, 24);
  const body = new THREE.Mesh(bodyGeo, goldMat);
  body.scale.set(0.9, 1.1, 0.9);
  body.position.y = 0.45;
  group.add(body);

  // Đầu mèo
  const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
  const head = new THREE.Mesh(headGeo, goldMat);
  head.position.set(0, 0.85, 0.05);
  group.add(head);

  // 2 Tai mèo nhọn
  const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 12), redMat);
  ear1.position.set(-0.2, 1.15, 0.05);
  ear1.rotation.z = 0.3;
  const ear2 = ear1.clone();
  ear2.position.set(0.2, 1.15, 0.05);
  ear2.rotation.z = -0.3;
  group.add(ear1, ear2);

  // Tay vẫy tài lộc (Paw Raised)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 12), goldMat);
  arm.position.set(-0.35, 0.8, 0.2);
  arm.rotation.x = -0.6;
  arm.rotation.z = -0.4;
  group.add(arm);

  // Đồng xu vàng Koban trước ngực
  const coinGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24);
  const coin = new THREE.Mesh(coinGeo, redMat);
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, 0.42, 0.4);
  group.add(coin);

  // Vòng cổ chuông đỏ
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 12, 24), redMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.65, 0.05);
  group.add(collar);

  return group;
}

// 7. 🚀 TÊN LỬA KHÁM PHÁ (Rocket)
function createRocket() {
  const group = new THREE.Group();
  group.name = 'Rocket';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.7, roughness: 0.15 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, metalness: 0.8, roughness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.95, roughness: 0.05 });
  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.1 });

  // Thân tên lửa thon tròn
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 24);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55;
  group.add(body);

  // Mũi nhọn tên lửa màu đỏ
  const noseGeo = new THREE.ConeGeometry(0.24, 0.45, 24);
  const nose = new THREE.Mesh(noseGeo, redMat);
  nose.position.y = 1.15;
  group.add(nose);

  // Cửa sổ phi hành gia hình tròn
  const windowGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
  const win = new THREE.Mesh(windowGeo, glassMat);
  win.rotation.x = Math.PI / 2;
  win.position.set(0, 0.65, 0.25);
  group.add(win);

  // 3 Cánh đuôi điều hướng đỏ
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.35), redMat);
    fin.position.set(Math.cos(angle) * 0.32, 0.3, Math.sin(angle) * 0.32);
    fin.rotation.y = -angle;
    group.add(fin);
  }

  // Ống xả phản lực vàng
  const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.2, 16), thrusterMat);
  thruster.position.y = 0.05;
  group.add(thruster);

  return group;
}

// 8. 💎 KIM CƯƠNG KHỔNG LỒ (Giant Diamond)
function createGiantDiamond() {
  const group = new THREE.Group();
  group.name = 'GiantDiamond';

  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    metalness: 0.9,
    roughness: 0.05,
  });

  const goldStandMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Viên đá quý cắt góc đa diện (Octahedron Diamond)
  const gemGeo = new THREE.OctahedronGeometry(0.5, 0);
  const gem = new THREE.Mesh(gemGeo, gemMat);
  gem.position.y = 0.55;
  gem.scale.set(1.1, 1.3, 1.1);
  group.add(gem);

  // Chân đế đỡ kim cương mạ vàng hoàng gia
  const standGeo = new THREE.CylinderGeometry(0.4, 0.48, 0.12, 24);
  const stand = new THREE.Mesh(standGeo, goldStandMat);
  stand.position.y = 0.06;
  group.add(stand);

  // 4 Ngàm giữ kim cương
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const prong = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), goldStandMat);
    prong.position.set(Math.cos(angle) * 0.38, 0.2, Math.sin(angle) * 0.38);
    prong.rotation.z = Math.sin(angle) * 0.2;
    prong.rotation.x = Math.cos(angle) * 0.2;
    group.add(prong);
  }

  return group;
}

// Chạy tạo toàn bộ 8 file GLB
async function generateAllTokens() {
  console.log('🚀 Bắt đầu tạo 8 Model Quân Cờ 3D (.GLB)...');

  const models = [
    { fn: createRaceCar, name: 'race_car.glb' },
    { fn: createLuxuryYacht, name: 'luxury_yacht.glb' },
    { fn: createTopHat, name: 'top_hat.glb' },
    { fn: createPrivateJet, name: 'private_jet.glb' },
    { fn: createRoyalCrown, name: 'royal_crown.glb' },
    { fn: createLuckyCat, name: 'lucky_cat.glb' },
    { fn: createRocket, name: 'rocket.glb' },
    { fn: createGiantDiamond, name: 'giant_diamond.glb' },
  ];

  for (const item of models) {
    const scene = new THREE.Scene();
    const tokenMesh = item.fn();
    scene.add(tokenMesh);
    await exportToGLB(scene, item.name);
  }

  console.log('🎉 Hoàn thành xuất trọn bộ 8 Token 3D GLB vào public/models/tokens/!');
}

generateAllTokens().catch(console.error);

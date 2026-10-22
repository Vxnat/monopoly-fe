import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const artifactsDir = '/home/ubuntu/.gemini/antigravity-ide/brain/9438a089-9cdf-468c-a742-721e22b34408';
const outputDir = path.join(process.cwd(), 'public', 'tiles');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Danh sách 5 ảnh thí điểm và file đích
const files = [
  {
    src: 'tile_go_arrow_1791451768214.jpg',
    dest: 'go.png',
  },
  {
    src: 'tile_ho_guom_1791451786263.jpg',
    dest: 'ho_guom.png',
  },
  {
    src: 'tile_landmark81_1791451814743.jpg',
    dest: 'landmark81.png',
  },
  {
    src: 'tile_chest_gold_1791451834392.jpg',
    dest: 'chest.png',
  },
  {
    src: 'tile_dragon_bridge_1791451967820.jpg',
    dest: 'da_nang.png',
  },
];

async function removeWhiteBackground(srcPath, destPath) {
  const image = sharp(srcPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Thuật toán tách nền trắng:
  // 1. Dùng Flood Fill từ 4 góc để xác định vùng nền ngoài cùng
  const visited = new Uint8Array(width * height);
  const queue = [];

  function getIdx(x, y) {
    return (y * width + x) * channels;
  }

  function isWhite(x, y) {
    const idx = getIdx(x, y);
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Ngưỡng màu trắng/gần trắng
    return r > 235 && g > 235 && b > 235;
  }

  // Đẩy 4 cạnh viền ngoài cùng vào queue
  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) { queue.push([x, 0]); visited[0 * width + x] = 1; }
    if (isWhite(x, height - 1)) { queue.push([x, height - 1]); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y)) { queue.push([0, y]); visited[y * width + 0] = 1; }
    if (isWhite(width - 1, y)) { queue.push([width - 1, y]); visited[y * width + width - 1] = 1; }
  }

  // BFS Flood fill
  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const pIdx = getIdx(cx, cy);

    // Tính độ trong suốt dựa trên độ trắng
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];
    const brightness = (r + g + b) / 3;

    if (brightness >= 248) {
      data[pIdx + 3] = 0; // Trong suốt hoàn toàn
    } else if (brightness >= 232) {
      // Làm mịn viền (Antialiasing)
      const alphaFactor = (248 - brightness) / 16;
      data[pIdx + 3] = Math.round(alphaFactor * 255);
    }

    // Duyệt 4 hướng lân cận
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isWhite(nx, ny)) {
          visited[nPos] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  // Lưu ra file PNG
  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(destPath);

  console.log(`✓ Processed and saved transparent PNG: ${destPath}`);
}

async function run() {
  console.log('Processing 5 pilot 3D images to transparent PNG...');
  for (const item of files) {
    const srcPath = path.join(artifactsDir, item.src);
    const destPath = path.join(outputDir, item.dest);
    if (fs.existsSync(srcPath)) {
      await removeWhiteBackground(srcPath, destPath);
    } else {
      console.warn(`File not found: ${srcPath}`);
    }
  }
  console.log('All pilot PNGs processed successfully!');
}

run().catch(console.error);

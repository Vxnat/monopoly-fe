export interface TokenDefinition {
  id: string;
  name: string;
  icon: string;
  imagePath: string;
  tagline: string;
  description: string;
  modelPath: string;
  scale: number;
  rotationOffset?: [number, number, number];
  positionOffset?: [number, number, number];
}

export interface MetalFinish {
  id: string;
  name: string;
  hexColor: string;
  metalness: number;
  roughness: number;
  glowColor: string;
}

export interface AvatarDefinition {
  id: string;
  name: string;
  role: string;
  imagePath: string;
  fallbackEmoji: string;
}

export const TOKENS_CONFIG: TokenDefinition[] = [
  {
    id: 'char_male_a',
    name: 'Anh chàng đẹp trai',
    icon: '🤵',
    imagePath: '/images/avatars/char_male_a.jpg',
    tagline: 'Đĩnh đạc & Quyết đoán',
    description: 'Nhà đầu tư lão luyện với phong thái đĩnh đạc và những thương vụ bất động sản triệu đô.',
    modelPath: '/models/characters/character-male-a.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_female_a',
    name: 'Cô gái năng động',
    icon: '👩‍💼',
    imagePath: '/images/avatars/char_female_a.jpg',
    tagline: 'Sang trọng & Tầm nhìn',
    description: 'Nữ tài phiệt sở hữu chuỗi khách sạn 5 sao và các bất động sản đắt đỏ nhất đại lộ.',
    modelPath: '/models/characters/character-female-a.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_male_b',
    name: 'Anh hói',
    icon: '🧑‍💻',
    imagePath: '/images/avatars/char_male_b.jpg',
    tagline: 'Sáng tạo & Đột phá',
    description: 'Tài năng công nghệ trẻ tuổi với chiến lược tính toán dòng tiền đầu tư cực kỳ chuẩn xác.',
    modelPath: '/models/characters/character-male-b.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_female_b',
    name: 'Tiểu Thư Triệu Phú',
    icon: '👸',
    imagePath: '/images/avatars/char_female_b.jpg',
    tagline: 'Thông minh & Nhạy bén',
    description: 'Thâu tóm toàn bộ chuỗi nhà ga và công ty dịch vụ tiện ích chỉ trong chớp mắt.',
    modelPath: '/models/characters/character-female-b.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_male_c',
    name: 'Pikachu xanh',
    icon: '💼',
    imagePath: '/images/avatars/char_male_c.jpg',
    tagline: 'Chắc chắn & Bền vững',
    description: 'Bậc thầy quản lý tài sản với khả năng xoay chuyển dòng vốn và thế chấp tài tình.',
    modelPath: '/models/characters/character-male-c.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_female_c',
    name: 'Nữ già',
    icon: '🎨',
    imagePath: '/images/avatars/char_female_c.jpg',
    tagline: 'Tinh tế & Khéo léo',
    description: 'Nghệ thuật thương lượng xuất chúng và khả năng gom trọn bộ các khu đất hoàng gia.',
    modelPath: '/models/characters/character-female-c.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_male_d',
    name: 'Tỷ phú',
    icon: '🏃‍♂️',
    imagePath: '/images/avatars/char_male_d.jpg',
    tagline: 'Tốc độ & Nhiệt huyết',
    description: 'Di chuyển thần tốc trên bàn cờ, vượt qua mọi cạm bẫy phạt tiền và nhà tù.',
    modelPath: '/models/characters/character-male-d.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
  {
    id: 'char_female_d',
    name: 'Nữ văn phòng',
    icon: '✨',
    imagePath: '/images/avatars/char_female_d.jpg',
    tagline: 'May mắn & Vui tươi',
    description: 'Mang đến vận may dồi dào trong các lượt tung xúc xắc và bốc thẻ bài Cơ hội.',
    modelPath: '/models/characters/character-female-d.glb',
    scale: 0.72,
    positionOffset: [0, -0.05, 0],
  },
];

export const METAL_FINISHES: MetalFinish[] = [
  {
    id: 'gold_24k',
    name: 'Vàng Hoàng Gia 24K',
    hexColor: '#F59E0B',
    metalness: 0.95,
    roughness: 0.12,
    glowColor: '#FCD34D',
  },
  {
    id: 'platinum_silver',
    name: 'Bạc Platinum',
    hexColor: '#E2E8F0',
    metalness: 0.9,
    roughness: 0.15,
    glowColor: '#FFFFFF',
  },
  {
    id: 'ruby_red',
    name: 'Đỏ Ruby Kim Loại',
    hexColor: '#EF4444',
    metalness: 0.85,
    roughness: 0.18,
    glowColor: '#FCA5A5',
  },
  {
    id: 'emerald_green',
    name: 'Xanh Lục Bảo',
    hexColor: '#10B981',
    metalness: 0.88,
    roughness: 0.15,
    glowColor: '#6EE7B7',
  },
  {
    id: 'cyan_diamond',
    name: 'Lam Pha Lê',
    hexColor: '#06B6D4',
    metalness: 0.92,
    roughness: 0.1,
    glowColor: '#67E8F9',
  },
  {
    id: 'sapphire_blue',
    name: 'Xanh Sapphire',
    hexColor: '#2563EB',
    metalness: 0.9,
    roughness: 0.14,
    glowColor: '#93C5FD',
  },
  {
    id: 'amethyst_purple',
    name: 'Tím Thạch Anh',
    hexColor: '#8B5CF6',
    metalness: 0.88,
    roughness: 0.16,
    glowColor: '#C4B5FD',
  },
  {
    id: 'rose_gold',
    name: 'Vàng Hồng Quý Phái',
    hexColor: '#FB7185',
    metalness: 0.9,
    roughness: 0.15,
    glowColor: '#FECDD3',
  },
];

export const AVATAR_LIST: AvatarDefinition[] = [
  {
    id: 'char_male_a',
    name: 'Quý Ông Lịch Lãm',
    role: 'Bậc thầy địa ốc (David)',
    imagePath: '/images/avatars/char_male_a.jpg',
    fallbackEmoji: '🤵',
  },
  {
    id: 'char_female_a',
    name: 'Nữ Tỷ Phú Bản Lĩnh',
    role: 'Nữ hoàng đầu tư (Sophia)',
    imagePath: '/images/avatars/char_female_a.jpg',
    fallbackEmoji: '👩‍💼',
  },
  {
    id: 'char_male_b',
    name: 'Chàng Trai Công Nghệ',
    role: 'Nhà sáng lập trẻ (Alex)',
    imagePath: '/images/avatars/char_male_b.jpg',
    fallbackEmoji: '🧑‍💻',
  },
  {
    id: 'char_female_b',
    name: 'Tiểu Thư Triệu Phú',
    role: 'Tài phiệt thế hệ mới (Emma)',
    imagePath: '/images/avatars/char_female_b.jpg',
    fallbackEmoji: '👸',
  },
  {
    id: 'char_male_c',
    name: 'Chuyên Gia Tài Chính',
    role: 'Quản lý tài sản (Marcus)',
    imagePath: '/images/avatars/char_male_c.jpg',
    fallbackEmoji: '💼',
  },
  {
    id: 'char_female_c',
    name: 'Nữ Quản Lý Sáng Tạo',
    role: 'Nghệ thuật đàm phán (Olivia)',
    imagePath: '/images/avatars/char_female_c.jpg',
    fallbackEmoji: '🎨',
  },
  {
    id: 'char_male_d',
    name: 'Vận Động Viên Thể Thao',
    role: 'Tốc độ & Quyết đoán (Leo)',
    imagePath: '/images/avatars/char_male_d.jpg',
    fallbackEmoji: '🏃‍♂️',
  },
  {
    id: 'char_female_d',
    name: 'Cô Nàng Năng Động',
    role: 'May mắn & Tươi vui (Mia)',
    imagePath: '/images/avatars/char_female_d.jpg',
    fallbackEmoji: '✨',
  },
];

export function getTokenConfigById(id?: string): TokenDefinition {
  return TOKENS_CONFIG.find((t) => t.id === id) || TOKENS_CONFIG[0];
}

export function getAvatarById(id?: string): AvatarDefinition {
  return AVATAR_LIST.find((a) => a.id === id || a.imagePath === id) || AVATAR_LIST[0];
}

export function getMetalFinishByColor(hexColor?: string): MetalFinish {
  return (
    METAL_FINISHES.find((m) => m.hexColor.toLowerCase() === hexColor?.toLowerCase()) ||
    METAL_FINISHES[0]
  );
}

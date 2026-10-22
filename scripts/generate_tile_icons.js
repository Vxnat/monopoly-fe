import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, '..', 'public', 'tiles');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function svgWrap(content, viewBox = '0 0 120 120') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="120" height="120" fill="none">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F87171"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#7E22CE"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  ${content}
</svg>`;
}

const ICONS = {
  // 1. Ô GÓC & ĐẶC BIỆT
  'go.svg': `
    <circle cx="60" cy="60" r="52" fill="url(#rubyGrad)" filter="url(#glow)"/>
    <circle cx="60" cy="60" r="44" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="6 4" fill="none"/>
    <path d="M45 40 L78 60 L45 80 Z" fill="#FFFFFF"/>
    <path d="M30 60 L75 60" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="54" stroke="url(#goldGrad)" stroke-width="3" fill="none"/>
  `,

  'jail.svg': `
    <rect x="15" y="15" width="90" height="90" rx="16" fill="#1E293B" filter="url(#glow)"/>
    <rect x="22" y="22" width="76" height="76" rx="10" stroke="#E2E8F0" stroke-width="3" fill="#0F172A"/>
    <!-- Song sắt -->
    <line x1="36" y1="22" x2="36" y2="98" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    <line x1="52" y1="22" x2="52" y2="98" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    <line x1="68" y1="22" x2="68" y2="98" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    <line x1="84" y1="22" x2="84" y2="98" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    <!-- Ổ khóa vàng -->
    <rect x="50" y="58" width="20" height="24" rx="4" fill="url(#goldGrad)"/>
    <path d="M54 58 V50 A6 6 0 0 1 66 50 V58" stroke="url(#goldGrad)" stroke-width="4" fill="none"/>
    <circle cx="60" cy="68" r="2.5" fill="#0F172A"/>
  `,

  'parking.svg': `
    <circle cx="60" cy="60" r="50" fill="url(#rubyGrad)" filter="url(#glow)"/>
    <circle cx="60" cy="60" r="42" fill="#0F172A" stroke="url(#goldGrad)" stroke-width="3"/>
    <!-- Chữ P lớn -->
    <text x="50%" y="62%" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#FCD34D" text-anchor="middle" dominant-baseline="middle">P</text>
    <path d="M42 85 Q60 92 78 85" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none"/>
  `,

  'gotojail.svg': `
    <circle cx="60" cy="60" r="50" fill="#450A0A" filter="url(#glow)" stroke="#EF4444" stroke-width="3"/>
    <!-- Còi cảnh sát & Huy hiệu -->
    <path d="M60 25 L85 38 V62 C85 78 60 92 60 92 C60 92 35 78 35 62 V38 Z" fill="url(#goldGrad)"/>
    <circle cx="60" cy="55" r="14" fill="#0F172A"/>
    <path d="M60 46 L63 52 L69 53 L65 57 L66 63 L60 60 L54 63 L55 57 L51 53 L57 52 Z" fill="#FCD34D"/>
  `,

  'station.svg': `
    <rect x="20" y="20" width="80" height="80" rx="20" fill="#0F172A" filter="url(#glow)" stroke="url(#goldGrad)" stroke-width="3"/>
    <!-- Đầu tàu cao tốc -->
    <path d="M38 32 C38 28 82 28 82 32 L86 68 C86 78 78 86 60 86 C42 86 34 78 34 68 Z" fill="url(#cyanGrad)"/>
    <rect x="42" y="38" width="36" height="18" rx="4" fill="#0F172A"/>
    <!-- 2 Đèn pha tàu rực sáng -->
    <circle cx="44" cy="72" r="5" fill="#FCD34D"/>
    <circle cx="76" cy="72" r="5" fill="#FCD34D"/>
    <rect x="48" y="76" width="24" height="4" rx="2" fill="#E2E8F0"/>
  `,

  'electric.svg': `
    <circle cx="60" cy="60" r="50" fill="#0F172A" filter="url(#glow)" stroke="#F59E0B" stroke-width="3"/>
    <!-- Bóng đèn & Tia sét -->
    <path d="M60 26 C46 26 36 37 36 50 C36 60 44 67 48 72 H72 C76 67 84 60 84 50 C84 37 74 26 60 26 Z" fill="url(#goldGrad)"/>
    <rect x="48" y="76" width="24" height="6" rx="2" fill="#CBD5E1"/>
    <rect x="52" y="84" width="16" height="5" rx="2" fill="#94A3B8"/>
    <!-- Tia sét vàng rực -->
    <path d="M62 34 L52 52 H64 L58 66 L72 48 H58 Z" fill="#FEF08A"/>
  `,

  'water.svg': `
    <circle cx="60" cy="60" r="50" fill="#0F172A" filter="url(#glow)" stroke="#0284C7" stroke-width="3"/>
    <!-- Vòi nước & Giọt nước xanh -->
    <path d="M60 25 C60 25 36 55 36 70 C36 83 47 94 60 94 C73 94 84 83 84 70 C84 55 60 25 60 25 Z" fill="url(#cyanGrad)"/>
    <ellipse cx="52" cy="68" rx="6" ry="12" fill="#BAE6FD" opacity="0.6"/>
  `,

  'chance.svg': `
    <rect x="18" y="18" width="84" height="84" rx="22" fill="url(#goldGrad)" filter="url(#glow)"/>
    <rect x="24" y="24" width="72" height="72" rx="16" fill="#EA580C"/>
    <!-- Dấu hỏi chấm hoàng gia -->
    <text x="50%" y="58%" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="#FEF08A" text-anchor="middle" dominant-baseline="middle">?</text>
    <circle cx="60" cy="80" r="4.5" fill="#FEF08A"/>
  `,

  'chest.svg': `
    <rect x="18" y="18" width="84" height="84" rx="22" fill="#0369A1" filter="url(#glow)" stroke="url(#goldGrad)" stroke-width="3"/>
    <!-- Rương kho báu mở nắp -->
    <rect x="30" y="52" width="60" height="38" rx="6" fill="#854D0E" stroke="url(#goldGrad)" stroke-width="3"/>
    <path d="M26 52 Q60 32 94 52 Z" fill="#A16207" stroke="url(#goldGrad)" stroke-width="3"/>
    <circle cx="60" cy="64" r="5" fill="#FCD34D"/>
    <!-- Ánh sáng châu báu lóe ra -->
    <path d="M50 42 L60 30 L70 42 Z" fill="#FDE047"/>
    <circle cx="45" cy="46" r="3" fill="#38BDF8"/>
    <circle cx="75" cy="46" r="3.5" fill="#EC4899"/>
  `,

  'tax_income.svg': `
    <circle cx="60" cy="60" r="50" fill="#0F172A" filter="url(#glow)" stroke="#10B981" stroke-width="3"/>
    <!-- Túi tiền đô la -->
    <path d="M42 42 C42 34 50 30 60 30 C70 30 78 34 78 42 C78 46 88 56 88 74 C88 88 75 92 60 92 C45 92 32 88 32 74 C32 56 42 46 42 42 Z" fill="url(#emeraldGrad)"/>
    <path d="M42 42 Q60 48 78 42" stroke="#FCD34D" stroke-width="4" fill="none"/>
    <text x="50%" y="68%" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">$</text>
  `,

  'tax_luxury.svg': `
    <circle cx="60" cy="60" r="50" fill="#0F172A" filter="url(#glow)" stroke="url(#goldGrad)" stroke-width="3"/>
    <!-- Nhẫn kim cương xa xỉ -->
    <circle cx="60" cy="68" r="22" stroke="url(#goldGrad)" stroke-width="6" fill="none"/>
    <!-- Viên kim cương đỉnh nhẫn -->
    <path d="M46 38 L52 26 H68 L74 38 L60 52 Z" fill="url(#cyanGrad)" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M52 26 L60 38 L68 26 M52 38 L60 52 L68 38" stroke="#E0F2FE" stroke-width="1.5"/>
  `,

  // 2. BẤT ĐỘNG SẢN VIỆT NAM
  'pho_co.svg': `
    <!-- Cổng làng / Mái ngói Phố Cổ -->
    <path d="M20 75 H100 V95 H20 Z" fill="#78350F"/>
    <path d="M15 75 Q60 50 105 75 Z" fill="#DC2626"/>
    <path d="M30 52 Q60 34 90 52 Z" fill="#991B1B"/>
    <!-- Đèn lồng đỏ -->
    <circle cx="36" cy="66" r="6" fill="#EF4444"/>
    <circle cx="84" cy="66" r="6" fill="#EF4444"/>
    <!-- Cổng vòm gạch -->
    <path d="M48 95 V78 Q60 72 72 78 V95 Z" fill="#FEF08A"/>
  `,

  'ho_guom.svg': `
    <!-- Tháp Rùa Hồ Gươm 3 tầng -->
    <ellipse cx="60" cy="94" rx="46" ry="12" fill="#0284C7" opacity="0.8"/>
    <!-- Tầng 1 -->
    <rect x="36" y="66" width="48" height="22" rx="2" fill="#D97706"/>
    <path d="M42 88 V76 Q48 72 54 76 V88 M66 88 V76 Q72 72 78 76 V88" stroke="#FEF08A" stroke-width="2" fill="#78350F"/>
    <!-- Tầng 2 -->
    <rect x="42" y="48" width="36" height="18" rx="2" fill="#B45309"/>
    <path d="M34 66 Q60 58 86 66 M38 48 Q60 42 82 48" stroke="#991B1B" stroke-width="3" fill="none"/>
    <!-- Tầng 3 & Chóp đỉnh -->
    <rect x="50" y="36" width="20" height="12" rx="1" fill="#92400E"/>
    <path d="M46 36 Q60 28 74 36 Z" fill="#DC2626"/>
    <circle cx="60" cy="27" r="3" fill="#FCD34D"/>
  `,

  'sam_son.svg': `
    <!-- Biển Sầm Sơn: Sóng biển & Dừa xanh -->
    <circle cx="60" cy="60" r="50" fill="#E0F2FE"/>
    <circle cx="82" cy="38" r="14" fill="#F59E0B"/>
    <path d="M15 75 Q40 65 60 75 T105 75 V105 H15 Z" fill="#0284C7"/>
    <path d="M15 85 Q40 78 60 85 T105 85 V105 H15 Z" fill="#0369A1"/>
    <!-- Cây dừa nghiêng -->
    <path d="M35 88 Q48 60 42 42" stroke="#78350F" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M42 42 Q30 35 24 45 M42 42 Q48 30 58 36 M42 42 Q35 48 28 56" stroke="#15803D" stroke-width="3" fill="none"/>
  `,

  'cua_lo.svg': `
    <!-- Biển Cửa Lò: Thuyền buồm trắng & Hải đăng -->
    <circle cx="60" cy="60" r="50" fill="#BAE6FD"/>
    <path d="M10 82 Q35 74 60 82 T110 82 V105 H10 Z" fill="#0284C7"/>
    <!-- Thuyền buồm -->
    <path d="M40 76 L80 76 L72 86 L48 86 Z" fill="#B45309"/>
    <path d="M60 42 V74 M60 44 L78 72 H60 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M60 48 L46 72 H60 Z" fill="#F1F5F9" stroke="#0F172A" stroke-width="1.5"/>
  `,

  'vinh_ha_long.svg': `
    <!-- Vịnh Hạ Long: Đảo đá vôi & Thuyền buồm nâu -->
    <circle cx="60" cy="60" r="50" fill="#CCFBF1"/>
    <!-- Đảo đá vôi Karst -->
    <path d="M22 86 C25 55 35 42 44 86 Z" fill="#047857"/>
    <path d="M66 86 C72 38 86 46 95 86 Z" fill="#065F46"/>
    <path d="M42 86 C48 60 56 62 62 86 Z" fill="#059669"/>
    <path d="M10 85 Q60 75 110 85 V105 H10 Z" fill="#0D9488"/>
    <!-- Cánh buồm đỏ thắm -->
    <path d="M52 68 L60 52 L68 68 Z" fill="#DC2626"/>
  `,

  'da_lat.svg': `
    <!-- Đà Lạt: Đồi thông & Tháp chuông hoa -->
    <circle cx="60" cy="60" r="50" fill="#FCE7F3"/>
    <!-- 3 Cây thông xanh -->
    <path d="M40 75 L30 85 H50 Z M40 65 L32 75 H48 Z M40 55 L35 65 H45 Z" fill="#047857"/>
    <path d="M78 75 L68 85 H88 Z M78 65 L70 75 H86 Z M78 55 L73 65 H83 Z" fill="#059669"/>
    <!-- Tháp chuông hoa hồng -->
    <rect x="54" y="42" width="12" height="42" fill="#DB2777" rx="2"/>
    <path d="M50 42 L60 26 L70 42 Z" fill="#9D174D"/>
    <circle cx="60" cy="52" r="3" fill="#FEF08A"/>
  `,

  'nha_trang.svg': `
    <!-- Tháp Trầm Hương Nha Trang -->
    <circle cx="60" cy="60" r="50" fill="#E0F2FE"/>
    <path d="M10 85 Q60 78 110 85 V105 H10 Z" fill="#0284C7"/>
    <!-- Cánh sen Trầm Hương vươn cao -->
    <path d="M48 85 Q42 55 60 30 Q78 55 72 85 Z" fill="url(#rubyGrad)"/>
    <path d="M54 85 Q52 62 60 44 Q68 62 66 85 Z" fill="#FEF08A"/>
    <circle cx="60" cy="28" r="4" fill="#F59E0B"/>
  `,

  'mui_ne.svg': `
    <!-- Mũi Né: Đồi cát bay vàng & Ván trượt -->
    <circle cx="60" cy="60" r="50" fill="#FEF3C7"/>
    <circle cx="85" cy="35" r="14" fill="#F97316"/>
    <!-- Cồn cát uốn lượn -->
    <path d="M10 70 Q40 50 70 65 T110 58 V105 H10 Z" fill="#F59E0B"/>
    <path d="M10 82 Q50 68 85 82 T110 78 V105 H10 Z" fill="#D97706"/>
    <!-- Cây dừa ốc đảo -->
    <path d="M30 68 Q36 50 32 38" stroke="#78350F" stroke-width="3" fill="none"/>
    <circle cx="32" cy="38" r="8" fill="#15803D"/>
  `,

  'phu_quoc.svg': `
    <!-- Phú Quốc: Vỏ sò ngọc trai & Biển ngọc -->
    <circle cx="60" cy="60" r="50" fill="#ECFDF5"/>
    <path d="M10 80 Q60 72 110 80 V105 H10 Z" fill="#059669"/>
    <!-- Vỏ sò mở hé -->
    <path d="M35 78 C35 55 85 55 85 78 Z" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
    <path d="M38 78 C38 90 82 90 82 78 Z" fill="#FCD34D" stroke="#D97706" stroke-width="2"/>
    <!-- Viên ngọc trai sáng lấp lánh -->
    <circle cx="60" cy="74" r="9" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#glow)"/>
  `,

  'vung_tau.svg': `
    <!-- Ngọn Hải Đăng Vũng Tàu -->
    <circle cx="60" cy="60" r="50" fill="#E0F2FE"/>
    <path d="M10 85 Q60 76 110 85 V105 H10 Z" fill="#0284C7"/>
    <!-- Thân hải đăng trắng vươn cao -->
    <path d="M52 86 L55 42 H65 L68 86 Z" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
    <rect x="52" y="36" width="16" height="8" rx="2" fill="#DC2626"/>
    <circle cx="60" cy="40" r="3" fill="#FEF08A"/>
    <!-- Tia sáng quét -->
    <path d="M60 40 L20 25 M60 40 L100 25" stroke="#FCD34D" stroke-width="2" stroke-dasharray="4 3"/>
  `,

  'can_tho.svg': `
    <!-- Cần Thơ: Chợ nổi & Trái cây miền Tây -->
    <circle cx="60" cy="60" r="50" fill="#ECFCCB"/>
    <path d="M10 80 Q60 74 110 80 V105 H10 Z" fill="#65A30D"/>
    <!-- Thuyền ba lá chở hoa quả -->
    <path d="M25 76 Q60 92 95 76 L85 86 Q60 96 35 86 Z" fill="#78350F"/>
    <circle cx="50" cy="70" r="6" fill="#EF4444"/>
    <circle cx="60" cy="68" r="7" fill="#F59E0B"/>
    <circle cx="70" cy="71" r="5.5" fill="#84CC16"/>
  `,

  'da_nang.svg': `
    <!-- Cầu Rồng Đà Nẵng phun lửa -->
    <circle cx="60" cy="60" r="50" fill="#0F172A"/>
    <!-- Thân Rồng Vàng uốn lượn -->
    <path d="M18 80 Q35 50 50 75 T82 65 L92 52" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M10 85 Q60 80 110 85" stroke="#0284C7" stroke-width="4" fill="none"/>
    <!-- Đầu Rồng & Ngọn lửa -->
    <circle cx="92" cy="52" r="6" fill="#F59E0B"/>
    <path d="M96 50 Q106 42 108 50 Q102 56 96 54 Z" fill="#EF4444"/>
  `,

  'hoi_an.svg': `
    <!-- Chùa Cầu Hội An & Đèn lồng -->
    <circle cx="60" cy="60" r="50" fill="#FEF3C7"/>
    <!-- Thân Chùa Cầu mái ngói cong -->
    <path d="M24 78 Q60 62 96 78 L90 88 Q60 78 30 88 Z" fill="#991B1B"/>
    <rect x="42" y="58" width="36" height="20" fill="#78350F" rx="2"/>
    <path d="M36 58 Q60 46 84 58 Z" fill="#B91C1C"/>
    <!-- 3 Đèn lồng treo rực rỡ -->
    <circle cx="40" cy="72" r="4" fill="#EF4444"/>
    <circle cx="60" cy="70" r="4.5" fill="#F59E0B"/>
    <circle cx="80" cy="72" r="4" fill="#06B6D4"/>
  `,

  'hue.svg': `
    <!-- Cố Đô Huế: Cổng Ngọ Môn lầu Ngũ Phụng -->
    <circle cx="60" cy="60" r="50" fill="#FAF5FF"/>
    <rect x="25" y="65" width="70" height="22" rx="3" fill="#B45309"/>
    <!-- Cổng vòm 3 lối vào -->
    <path d="M35 87 V75 Q40 70 45 75 V87 M54 87 V72 Q60 66 66 72 V87 M75 87 V75 Q80 70 85 75 V87" stroke="#FEF08A" stroke-width="2" fill="#451A03"/>
    <!-- Lầu Ngũ Phụng 2 tầng mái đỏ rực -->
    <path d="M30 65 Q60 52 90 65 Z" fill="#DC2626"/>
    <rect x="40" y="46" width="40" height="12" fill="#92400E"/>
    <path d="M35 46 Q60 36 85 46 Z" fill="#B91C1C"/>
  `,

  'hai_phong.svg': `
    <!-- Hải Phòng: Cảng biển & Hoa phượng đỏ -->
    <circle cx="60" cy="60" r="50" fill="#EFF6FF"/>
    <path d="M10 85 Q60 78 110 85 V105 H10 Z" fill="#1D4ED8"/>
    <!-- Cần cẩu bốc dỡ cảng biển -->
    <path d="M32 85 L44 48 L76 48 M44 48 L44 85 M60 48 V65" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Bông hoa phượng đỏ 5 cánh -->
    <circle cx="78" cy="42" r="14" fill="#EF4444"/>
    <circle cx="78" cy="42" r="5" fill="#FEF08A"/>
  `,

  'quang_ninh.svg': `
    <!-- Quảng Ninh: Bảo tàng khối than pha lê đen -->
    <circle cx="60" cy="60" r="50" fill="#F1F5F9"/>
    <!-- Khối đa giác than đen tuyền lấp lánh -->
    <path d="M30 82 L42 42 L88 48 L78 88 Z" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
    <path d="M42 42 L65 62 L88 48 M65 62 L78 88 M42 42 L30 82" stroke="#64748B" stroke-width="1.5"/>
    <text x="58" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#38BDF8">QN</text>
  `,

  'ninh_binh.svg': `
    <!-- Ninh Bình: Danh thắng Tràng An & Tháp Bái Đính -->
    <circle cx="60" cy="60" r="50" fill="#ECFDF5"/>
    <!-- Núi đá vôi xanh -->
    <path d="M15 88 Q35 45 55 88 Z" fill="#047857"/>
    <path d="M45 88 Q70 35 95 88 Z" fill="#065F46"/>
    <!-- Tháp Bái Đính nhiều tầng -->
    <path d="M72 88 L75 42 L81 42 L84 88 Z" fill="#B45309"/>
    <path d="M70 75 H86 M71 62 H85 M73 50 H83" stroke="#FCD34D" stroke-width="2"/>
    <circle cx="78" cy="38" r="2.5" fill="#F59E0B"/>
  `,

  'dinh_doc_lap.svg': `
    <!-- Dinh Độc Lập: Kiến trúc rèm hoa đá & Cờ đỏ -->
    <circle cx="60" cy="60" r="50" fill="#F8FAFC"/>
    <rect x="22" y="52" width="76" height="34" rx="2" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
    <!-- Các thanh lam bê tông đặc trưng -->
    <line x1="32" y1="56" x2="32" y2="82" stroke="#475569" stroke-width="2"/>
    <line x1="42" y1="56" x2="42" y2="82" stroke="#475569" stroke-width="2"/>
    <line x1="52" y1="56" x2="52" y2="82" stroke="#475569" stroke-width="2"/>
    <line x1="68" y1="56" x2="68" y2="82" stroke="#475569" stroke-width="2"/>
    <line x1="78" y1="56" x2="78" y2="82" stroke="#475569" stroke-width="2"/>
    <line x1="88" y1="56" x2="88" y2="82" stroke="#475569" stroke-width="2"/>
    <!-- Lầu tứ giác & Cột cờ Tổ quốc -->
    <rect x="46" y="40" width="28" height="12" fill="#CBD5E1"/>
    <line x1="60" y1="40" x2="60" y2="25" stroke="#0F172A" stroke-width="2"/>
    <rect x="60" y="25" width="12" height="8" fill="#DC2626"/>
    <circle cx="66" cy="29" r="1.5" fill="#FEF08A"/>
  `,

  'nha_tho_duc_ba.svg': `
    <!-- Nhà Thờ Đức Bà Sài Gòn: 2 Tháp chuông gạch đỏ -->
    <circle cx="60" cy="60" r="50" fill="#EFF6FF"/>
    <!-- Tháp Trái -->
    <rect x="30" y="46" width="18" height="42" fill="#B91C1C"/>
    <path d="M28 46 L39 22 L50 46 Z" fill="#475569"/>
    <!-- Tháp Phải -->
    <rect x="72" y="46" width="18" height="42" fill="#B91C1C"/>
    <path d="M70 46 L81 22 L92 46 Z" fill="#475569"/>
    <!-- Thân giáo đường & Cửa sổ hoa hồng tròn -->
    <rect x="48" y="56" width="24" height="32" fill="#991B1B"/>
    <circle cx="60" cy="66" r="6" fill="#FEF08A" stroke="#78350F" stroke-width="1.5"/>
  `,

  'cho_ben_thanh.svg': `
    <!-- Chợ Bến Thành: Tháp đồng hồ 3 mặt cửa nam -->
    <circle cx="60" cy="60" r="50" fill="#FEF2F2"/>
    <rect x="36" y="52" width="48" height="36" fill="#F8FAFC" stroke="#991B1B" stroke-width="2"/>
    <!-- Mái ngói đỏ tháp đồng hồ -->
    <path d="M30 52 Q60 40 90 52 Z" fill="#DC2626"/>
    <rect x="45" y="32" width="30" height="18" fill="#FFFFFF" stroke="#991B1B" stroke-width="2"/>
    <path d="M42 32 Q60 22 78 32 Z" fill="#B91C1C"/>
    <!-- Mặt đồng hồ tròn -->
    <circle cx="60" cy="41" r="5" fill="#FEF08A" stroke="#0F172A" stroke-width="1.5"/>
  `,

  'pho_di_bo.svg': `
    <!-- Phố Đi Bộ Nguyễn Huệ: Đài phun nước & Tòa nhà hiện đại -->
    <circle cx="60" cy="60" r="50" fill="#0F172A"/>
    <!-- Tòa nhà chọc trời phía sau -->
    <rect x="32" y="32" width="16" height="56" fill="#1E293B"/>
    <rect x="72" y="38" width="16" height="50" fill="#1E293B"/>
    <!-- Đài phun nước lung linh ánh đèn -->
    <ellipse cx="60" cy="85" rx="34" ry="10" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <path d="M60 85 V60 M52 85 Q54 68 60 62 M68 85 Q66 68 60 62" stroke="#BAE6FD" stroke-width="2" fill="none"/>
  `,

  'landmark81.svg': `
    <!-- Tòa tháp chọc trời Landmark 81 vút cao -->
    <circle cx="60" cy="60" r="50" fill="#0B132B" stroke="#38BDF8" stroke-width="2.5" filter="url(#glow)"/>
    <!-- Khối bó tre nhiều tầng giật cấp -->
    <rect x="48" y="58" width="24" height="32" fill="url(#cyanGrad)"/>
    <rect x="52" y="40" width="16" height="26" fill="#0284C7"/>
    <rect x="56" y="24" width="8" height="20" fill="#38BDF8"/>
    <!-- Kim thu lôi đỉnh tháp xuyên mây -->
    <line x1="60" y1="24" x2="60" y2="12" stroke="#FCD34D" stroke-width="2.5"/>
    <circle cx="60" cy="11" r="2.5" fill="#EF4444"/>
  `,
};

console.log('Generating 40 high-resolution Monopoly 3D SVG tile icons...');
for (const [filename, content] of Object.entries(ICONS)) {
  const fullSvg = svgWrap(content);
  fs.writeFileSync(path.join(targetDir, filename), fullSvg, 'utf8');
  console.log(`Created ${filename}`);
}

console.log('Successfully generated all tile icons!');

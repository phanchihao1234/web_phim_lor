export const listTabs = [
  { label: "Mới cập nhật", type: "latest", slug: "phim-moi-cap-nhat" },
  { label: "Phim bộ", type: "list", slug: "phim-bo" },
  { label: "Phim lẻ", type: "list", slug: "phim-le" },
  { label: "Hoạt hình", type: "list", slug: "hoat-hinh" },
  { label: "TV Shows", type: "list", slug: "tv-shows" }
];

export const genres = [
  ["hanh-dong", "Hành động"],
  ["tinh-cam", "Tình cảm"],
  ["hai-huoc", "Hài hước"],
  ["co-trang", "Cổ trang"],
  ["tam-ly", "Tâm lý"],
  ["hinh-su", "Hình sự"],
  ["chien-tranh", "Chiến tranh"],
  ["vo-thuat", "Võ thuật"],
  ["vien-tuong", "Viễn tưởng"],
  ["phieu-luu", "Phiêu lưu"],
  ["kinh-di", "Kinh dị"],
  ["bi-an", "Bí ẩn"],
  ["chinh-kich", "Chính kịch"],
  ["gia-dinh", "Gia đình"]
].map(([slug, label]) => ({ slug, label }));

export const countries = [
  ["trung-quoc", "Trung Quốc"],
  ["han-quoc", "Hàn Quốc"],
  ["nhat-ban", "Nhật Bản"],
  ["thai-lan", "Thái Lan"],
  ["au-my", "Âu Mỹ"],
  ["viet-nam", "Việt Nam"],
  ["hong-kong", "Hồng Kông"],
  ["dai-loan", "Đài Loan"],
  ["an-do", "Ấn Độ"],
  ["anh", "Anh"],
  ["phap", "Pháp"]
].map(([slug, label]) => ({ slug, label }));

export const years = Array.from({ length: 18 }, (_, index) => {
  const year = String(2026 - index);
  return { slug: year, label: year };
});

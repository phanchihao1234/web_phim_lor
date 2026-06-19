const API_BASE = "https://phim.nguonc.com/api";

async function request(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const payload = await response.json();

  if (payload.status && payload.status !== "success") {
    throw new Error(payload.message || "API returned an unsuccessful response");
  }

  return payload;
}

export function getLatest(page = 1, signal) {
  return request(`/films/phim-moi-cap-nhat?page=${page}`, signal);
}

export function getList(slug, page = 1, signal) {
  return request(`/films/danh-sach/${slug}?page=${page}`, signal);
}

export function getGenre(slug, page = 1, signal) {
  return request(`/films/the-loai/${slug}?page=${page}`, signal);
}

export function getCountry(slug, page = 1, signal) {
  return request(`/films/quoc-gia/${slug}?page=${page}`, signal);
}

export function getYear(slug, page = 1, signal) {
  return request(`/films/nam-phat-hanh/${slug}?page=${page}`, signal);
}

export function searchFilms(keyword, page = 1, signal) {
  return request(`/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`, signal);
}

export function getFilm(slug, signal) {
  return request(`/film/${slug}`, signal);
}

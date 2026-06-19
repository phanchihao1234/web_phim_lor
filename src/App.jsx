import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Film,
  Home,
  Loader2,
  Play,
  Search,
  Server,
  Star,
  Tv,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCountry, getFilm, getGenre, getLatest, getList, getYear, searchFilms } from "./api";
import { countries, genres, listTabs, years } from "./catalog";
import { compactText, getAllEpisodes, getCategoryGroups, getFirstEpisode } from "./utils";

function parseRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(window.location.search);
  const parts = path.split("/").filter(Boolean);
  const page = Math.max(1, Number(params.get("page") || "1"));

  if (parts[0] === "film" && parts[1]) {
    return { view: "detail", slug: parts[1] };
  }

  if (parts[0] === "list" && parts[1]) {
    return { view: "catalog", mode: "list", slug: parts[1], page };
  }

  if (parts[0] === "genre" && parts[1]) {
    return { view: "catalog", mode: "genre", slug: parts[1], page };
  }

  if (parts[0] === "country" && parts[1]) {
    return { view: "catalog", mode: "country", slug: parts[1], page };
  }

  if (parts[0] === "year" && parts[1]) {
    return { view: "catalog", mode: "year", slug: parts[1], page };
  }

  if (parts[0] === "search") {
    return { view: "catalog", mode: "search", keyword: params.get("keyword") || "", page };
  }

  return { view: "catalog", mode: "latest", slug: "phim-moi-cap-nhat", page };
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getTitle(route, payload) {
  if (route.mode === "latest") return "Phim mới cập nhật";
  if (route.mode === "search") return route.keyword ? `Tìm kiếm: ${route.keyword}` : "Tìm kiếm";
  return payload?.cat?.title || payload?.cat?.name || "Danh sách phim";
}

function getFetchForRoute(route) {
  if (route.mode === "list") return (signal) => getList(route.slug, route.page, signal);
  if (route.mode === "genre") return (signal) => getGenre(route.slug, route.page, signal);
  if (route.mode === "country") return (signal) => getCountry(route.slug, route.page, signal);
  if (route.mode === "year") return (signal) => getYear(route.slug, route.page, signal);
  if (route.mode === "search") return (signal) => searchFilms(route.keyword, route.page, signal);
  return (signal) => getLatest(route.page, signal);
}

function App() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const syncRoute = () => setRoute(parseRoute());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  return (
    <div className="app-shell">
      <Header route={route} />
      <main>
        {route.view === "detail" ? <MovieDetail slug={route.slug} /> : <CatalogPage route={route} />}
      </main>
      <Footer />
    </div>
  );
}

function Header({ route }) {
  const [keyword, setKeyword] = useState(route.mode === "search" ? route.keyword : "");

  useEffect(() => {
    setKeyword(route.mode === "search" ? route.keyword : "");
  }, [route.keyword, route.mode]);

  const submit = (event) => {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    if (nextKeyword) {
      navigate(`/search?keyword=${encodeURIComponent(nextKeyword)}`);
    }
  };

  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/")} type="button">
        <span className="brand-mark">
          <Clapperboard size={22} />
        </span>
        <span>NguonC Movie</span>
      </button>

      <nav className="quick-nav" aria-label="Danh mục nhanh">
        {listTabs.map((tab) => (
          <button
            className={route.mode === tab.type && route.slug === tab.slug ? "nav-pill active" : "nav-pill"}
            key={tab.slug}
            onClick={() => navigate(tab.type === "latest" ? "/" : `/list/${tab.slug}`)}
            type="button"
          >
            {tab.type === "latest" ? <Home size={16} /> : <Tv size={16} />}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <form className="search-form" onSubmit={submit}>
        <Search size={18} />
        <input
          aria-label="Tìm phim"
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm tên phim, diễn viên..."
          value={keyword}
        />
        {keyword ? (
          <button aria-label="Xóa tìm kiếm" className="icon-button" onClick={() => setKeyword("")} type="button">
            <X size={16} />
          </button>
        ) : null}
      </form>
    </header>
  );
}

function CatalogPage({ route }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getFetchForRoute(route)(controller.signal)
      .then(setPayload)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Không tải được dữ liệu");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [route.mode, route.slug, route.keyword, route.page]);

  const films = payload?.items || [];
  const title = getTitle(route, payload);
  const hero = films[0];

  return (
    <>
      <section className="hero-band">
        {hero ? (
          <img alt="" className="hero-backdrop" src={hero.poster_url || hero.thumb_url} />
        ) : (
          <div className="hero-backdrop empty" />
        )}
        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">
              <Star size={16} /> {title}
            </span>
            <h1>{hero?.name || "Kho phim trực tuyến"}</h1>
            <p>{hero?.description || "Khám phá phim mới, tìm kiếm nhanh và xem trực tiếp từ nguồn NguonC."}</p>
            <div className="hero-actions">
              {hero ? (
                <button className="primary-button" onClick={() => navigate(`/film/${hero.slug}`)} type="button">
                  <Play size={18} />
                  Xem ngay
                </button>
              ) : null}
              <span>{payload?.paginate?.total_items ? `${payload.paginate.total_items.toLocaleString("vi-VN")} phim` : ""}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap">
        <FilterBar route={route} />

        <div className="section-head">
          <div>
            <span className="kicker">Danh sách</span>
            <h2>{title}</h2>
          </div>
          {payload?.paginate ? (
            <span className="page-indicator">
              Trang {payload.paginate.current_page} / {payload.paginate.total_page}
            </span>
          ) : null}
        </div>

        {loading ? <LoadingState /> : null}
        {error ? <MessageState title="Không tải được phim" message={error} /> : null}
        {!loading && !error && !films.length ? (
          <MessageState title="Chưa có kết quả" message="Thử đổi từ khóa hoặc bộ lọc khác." />
        ) : null}

        {!loading && !error && films.length ? (
          <>
            <div className="movie-grid">
              {films.map((film) => (
                <MovieCard film={film} key={film.slug} />
              ))}
            </div>
            <Pagination route={route} paginate={payload?.paginate} />
          </>
        ) : null}
      </section>
    </>
  );
}

function FilterBar({ route }) {
  const goSelect = (event) => {
    const value = event.target.value;
    if (value) navigate(value);
  };

  const selectedList = route.mode === "list" ? `/list/${route.slug}` : route.mode === "latest" ? "/" : "";
  const selectedGenre = route.mode === "genre" ? `/genre/${route.slug}` : "";
  const selectedCountry = route.mode === "country" ? `/country/${route.slug}` : "";
  const selectedYear = route.mode === "year" ? `/year/${route.slug}` : "";

  return (
    <div className="filter-bar">
      <label>
        <Film size={17} />
        <select onChange={goSelect} value={selectedList}>
          <option value="/">Mới cập nhật</option>
          {listTabs
            .filter((tab) => tab.type === "list")
            .map((tab) => (
              <option key={tab.slug} value={`/list/${tab.slug}`}>
                {tab.label}
              </option>
            ))}
        </select>
      </label>
      <label>
        <Star size={17} />
        <select onChange={goSelect} value={selectedGenre}>
          <option value="">Thể loại</option>
          {genres.map((genre) => (
            <option key={genre.slug} value={`/genre/${genre.slug}`}>
              {genre.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <Home size={17} />
        <select onChange={goSelect} value={selectedCountry}>
          <option value="">Quốc gia</option>
          {countries.map((country) => (
            <option key={country.slug} value={`/country/${country.slug}`}>
              {country.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <CalendarDays size={17} />
        <select onChange={goSelect} value={selectedYear}>
          <option value="">Năm phát hành</option>
          {years.map((year) => (
            <option key={year.slug} value={`/year/${year.slug}`}>
              {year.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function MovieCard({ film }) {
  return (
    <article className="movie-card">
      <button className="poster-button" onClick={() => navigate(`/film/${film.slug}`)} type="button">
        <img
          alt={film.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src={film.thumb_url || film.poster_url}
        />
        <span className="play-float">
          <Play size={18} />
        </span>
        <span className="episode-badge">{compactText(film.current_episode, "HD")}</span>
      </button>
      <div className="movie-card-body">
        <button className="movie-title" onClick={() => navigate(`/film/${film.slug}`)} type="button">
          {film.name}
        </button>
        <p>{film.original_name}</p>
        <div className="movie-meta">
          <span>{compactText(film.quality, "HD")}</span>
          <span>{compactText(film.language, "Vietsub")}</span>
          <span>{compactText(film.time, `${film.total_episodes || "?"} tập`)}</span>
        </div>
      </div>
    </article>
  );
}

function Pagination({ route, paginate }) {
  if (!paginate || paginate.total_page <= 1) return null;

  const page = paginate.current_page;
  const total = paginate.total_page;
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  const goPage = (nextPage) => {
    params.set("page", String(nextPage));
    navigate(`${path}?${params.toString()}`);
  };

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => goPage(page - 1)} type="button">
        <ChevronLeft size={18} />
        Trước
      </button>
      <span>
        {page} / {total}
      </span>
      <button disabled={page >= total} onClick={() => goPage(page + 1)} type="button">
        Sau
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function MovieDetail({ slug }) {
  const [payload, setPayload] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setPayload(null);
    setSelected(null);

    getFilm(slug, controller.signal)
      .then((data) => {
        setPayload(data);
        setSelected(getFirstEpisode(data.movie));
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Không tải được chi tiết phim");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <section className="content-wrap detail-wrap">
        <LoadingState />
      </section>
    );
  }

  if (error || !payload?.movie) {
    return (
      <section className="content-wrap detail-wrap">
        <MessageState title="Không tải được phim" message={error || "Không tìm thấy phim."} />
      </section>
    );
  }

  const movie = payload.movie;
  const groups = getCategoryGroups(movie.category);
  const episodes = getAllEpisodes(movie);

  return (
    <>
      <section className="watch-stage">
        <img alt="" className="detail-backdrop" src={movie.poster_url || movie.thumb_url} />
        <div className="watch-layout">
          <div className="player-shell">
            {selected?.embed ? (
              <iframe
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                key={selected.embed}
                referrerPolicy="no-referrer"
                src={selected.embed}
                title={`${movie.name} - tập ${selected.name}`}
              />
            ) : (
              <div className="no-player">
                <Play size={42} />
                <span>Chưa có nguồn phát</span>
              </div>
            )}
          </div>
          <aside className="now-watching">
            <span className="eyebrow">
              <Server size={16} /> {selected?.serverName || "Nguồn phát"}
            </span>
            <h1>{movie.name}</h1>
            <p>{movie.original_name}</p>
            <div className="hero-actions">
              {selected?.m3u8 ? (
                <a className="ghost-link" href={selected.m3u8} rel="noreferrer" target="_blank">
                  Mở m3u8
                </a>
              ) : null}
              <span>{selected ? `Tập ${selected.name}` : compactText(movie.current_episode)}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="content-wrap detail-wrap">
        <div className="detail-grid">
          <div>
            <div className="section-head detail-head">
              <div>
                <span className="kicker">Nội dung phim</span>
                <h2>{movie.name}</h2>
              </div>
            </div>
            <p className="description">{movie.description}</p>
            <div className="fact-grid">
              <Fact label="Trạng thái" value={compactText(movie.current_episode)} />
              <Fact label="Số tập" value={compactText(movie.total_episodes)} />
              <Fact label="Thời lượng" value={compactText(movie.time)} />
              <Fact label="Chất lượng" value={compactText(movie.quality)} />
              <Fact label="Ngôn ngữ" value={compactText(movie.language)} />
              <Fact label="Đạo diễn" value={compactText(movie.director)} />
              <Fact label="Diễn viên" value={compactText(movie.casts)} wide />
            </div>

            <div className="category-cloud">
              {groups.map((group) => (
                <div key={group.name}>
                  <strong>{group.name}</strong>
                  <span>
                    {group.items.map((item) => (
                      <b key={item.id || item.name}>{item.name}</b>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="episode-panel">
            <div className="section-head compact">
              <div>
                <span className="kicker">Tập phim</span>
                <h2>{episodes.length} tập</h2>
              </div>
            </div>
            {movie.episodes?.map((server) => (
              <div className="server-block" key={server.server_name}>
                <h3>{server.server_name}</h3>
                <div className="episode-grid">
                  {(server.items || []).map((episode) => (
                    <button
                      className={selected?.embed === episode.embed ? "episode-button active" : "episode-button"}
                      key={`${server.server_name}-${episode.slug}`}
                      onClick={() => setSelected({ ...episode, serverName: server.server_name })}
                      type="button"
                    >
                      {episode.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}

function Fact({ label, value, wide = false }) {
  return (
    <div className={wide ? "fact wide" : "fact"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="state-box">
      <Loader2 className="spin" size={30} />
      <span>Đang tải dữ liệu...</span>
    </div>
  );
}

function MessageState({ title, message }) {
  return (
    <div className="state-box">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>Nguồn dữ liệu: phim.nguonc.com</span>
      <button onClick={() => navigate("/")} type="button">
        <Home size={16} />
        Trang chủ
      </button>
    </footer>
  );
}

export default App;

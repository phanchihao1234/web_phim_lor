export function compactText(value, fallback = "Đang cập nhật") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export function getCategoryGroups(category) {
  if (!category) return [];

  return Object.values(category)
    .map((group) => ({
      name: group?.group?.name,
      items: group?.list || []
    }))
    .filter((group) => group.name && group.items.length);
}

export function getFirstEpisode(movie) {
  return movie?.episodes?.find((server) => server.items?.length)?.items?.[0] || null;
}

export function getAllEpisodes(movie) {
  return (movie?.episodes || []).flatMap((server) =>
    (server.items || []).map((episode) => ({
      ...episode,
      serverName: server.server_name
    }))
  );
}

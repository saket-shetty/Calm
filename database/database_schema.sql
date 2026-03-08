CREATE TABLE IF NOT EXISTS calm_users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS song (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    song_id TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    media_url TEXT
);

CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES calm_users(id) ON DELETE CASCADE,
    song_played_id TEXT NOT NULL REFERENCES song(song_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favourite (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES calm_users(id) ON DELETE CASCADE,
    song_played_id TEXT NOT NULL REFERENCES song(song_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlist (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES calm_users(id) ON DELETE CASCADE,
    playlist_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS playlistsongs (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlist(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL REFERENCES song(song_id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW user_most_played_songs AS
SELECT 
    H.user_id,
    S.song_id, 
    S.title, 
    S.description, 
    S.image_url, 
    S.media_url, 
    COUNT(H.id) AS play_count
FROM song S
INNER JOIN history H ON S.song_id = H.song_played_id
GROUP BY H.user_id, S.song_id, S.title, S.description, S.image_url, S.media_url;
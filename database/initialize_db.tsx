import { SongDetails } from "@/script/media_player_helper";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export interface Playlist {
    id: number,
    playlist_name: string
}

/**
 * Ensures the database is initialized before any operation.
 * This prevents the "NativeDatabase.prepareAsync" rejected errors.
 */
async function ensureDb(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        const instance = await SQLite.openDatabaseAsync('calm.db');
        // Enable WAL mode for better concurrency
        await instance.execAsync('PRAGMA journal_mode = WAL;');
        
        // Use a transaction for table creation to ensure integrity
        await instance.withTransactionAsync(async () => {
            await instance.execAsync(`
                CREATE TABLE IF NOT EXISTS song (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    song_id TEXT NOT NULL UNIQUE,
                    image_url TEXT NOT NULL,
                    media_url TEXT
                );
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    song_played_id INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS favourite (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    song_played_id INTEGER NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS playlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    playlist_name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS playlistsongs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    playlist_id INTEGER NOT NULL,
                    song_id INTEGER NOT NULL
                );
            `);
        });
        db = instance;
        return instance;
    })();

    return initializationPromise;
}

export async function CreateDatabase() {
    await ensureDb();
}

export async function InsertSong(title: string, description: string, song_id: string, image_url: string, media_url: string) {
    const database = await ensureDb();
    try {
        const result = await database.runAsync(
            "INSERT OR IGNORE INTO song (title, description, song_id, image_url, media_url) VALUES (?, ?, ?, ?, ?)",
            [title, description, song_id, image_url, media_url]
        );

        if (result.changes === 0) {
            console.log("Song already exists, skipping insert.");
        } else {
            console.log("New song inserted! ID:", result.lastInsertRowId);
        }

        await InsertSongInHistory(song_id);
    } catch (error) {
        console.error("Insert failed:", error);
    }
}

async function InsertSongInHistory(song_id: string) {
    const database = await ensureDb();
    await database.runAsync(
        `INSERT INTO history (song_played_id) 
         SELECT id FROM song WHERE song_id = ?`,
        [song_id]
    );
}

export async function GetSongHistory(): Promise<SongDetails[]> {
    const database = await ensureDb();
    const result = await database.getAllAsync<any>(`
        SELECT S.* FROM history AS H
        INNER JOIN song AS S
        ON H.song_played_id = S.id
        ORDER BY H.id DESC
    `);

    return result.map(row => ({
        title: row.title,
        description: row.description,
        id: row.song_id,
        image: row.image_url,
        media_url: row.media_url
    }));
}

export async function GetMostPlayedSong(): Promise<SongDetails[]> {
    const database = await ensureDb();
    const result = await database.getAllAsync<any>(`
        SELECT S.id, S.title, S.description, S.song_id, S.image_url, S.media_url, COUNT(1) AS C
        FROM song AS S
        INNER JOIN history AS H
        ON S.id = H.song_played_id
        GROUP BY S.id, S.title, S.description, S.song_id, S.image_url, S.media_url
        ORDER BY C DESC
    `);

    return result.map(row => ({
        title: row.title,
        description: row.description,
        id: row.song_id,
        image: row.image_url,
        media_url: row.media_url
    }));
}

export async function SetFavouriteSong(songId: string) {
    const database = await ensureDb();
    try {
        const result = await database.runAsync(
            `INSERT OR IGNORE INTO favourite (song_played_id) 
             SELECT id FROM song WHERE song_id = ?`,
            [songId]
        );

        if (result.changes === 0) {
            // Toggle off: if already favorite, remove it
            await database.runAsync(
                `DELETE FROM favourite WHERE song_played_id = (
                 SELECT id FROM song WHERE song_id = ?)`,
                [songId]
            );
        }
    } catch (error) {
        console.error("SetFavourite failed:", error);
    }
}

export async function IsSongFavourite(songId: string): Promise<boolean> {
    const database = await ensureDb();
    const result = await database.getAllAsync<any>(`
        SELECT S.song_id
        FROM favourite AS F
        INNER JOIN song AS S
        ON S.id = F.song_played_id
        WHERE S.song_id = ?
    `, [songId]); // Wrapped in array to fix crash

    return result.length > 0;
}

export async function GetAllFavouriteSongs(): Promise<SongDetails[]> {
    const database = await ensureDb();
    const result = await database.getAllAsync<any>(`
        SELECT S.id, S.title, S.description, S.song_id, S.image_url, S.media_url
        FROM favourite AS F
        INNER JOIN song AS S
        ON S.id = F.song_played_id
    `);

    return result.map(row => ({
        title: row.title,
        description: row.description,
        id: row.song_id,
        image: row.image_url,
        media_url: row.media_url
    }));
}

export async function InsertNewPlaylist(playlistName: string) {
    const database = await ensureDb();
    try {
        await database.runAsync(
            "INSERT OR IGNORE INTO playlist (playlist_name) VALUES (?)",
            [playlistName]
        );
    } catch (error) {
        console.error("Playlist insert failed:", error);
    }
}

export async function GetAllPlaylists(): Promise<Playlist[]> {
    const database = await ensureDb();
    try {
        const result = await database.getAllAsync<any>("SELECT * FROM playlist");
        return result.map(row => ({ id: row.id, playlist_name: row.playlist_name }));
    } catch (error) {
        console.error("Get playlists failed:", error);
        return [];
    }
}

export async function InsertSongInMultiplePlaylists(songId: string, playlistIds: number[]) {
    const database = await ensureDb();
    try {
        const songRecord = await database.getFirstAsync<{ id: number }>(
            'SELECT id FROM song WHERE song_id = ?',
            [songId]
        );

        if (!songRecord) return;

        await database.withTransactionAsync(async () => {
            for (const pId of playlistIds) {
                await database.runAsync(
                    `INSERT OR IGNORE INTO playlistsongs (playlist_id, song_id) VALUES (?, ?)`,
                    [pId, songRecord.id]
                );
            }
        });
    } catch (error) {
        console.error("Multi-insert failed:", error);
    }
}

export async function GetSongFromPerticularPlaylist(playlistId: number): Promise<SongDetails[]> {
    const database = await ensureDb();
    try {
        const result = await database.getAllAsync<any>(`
            SELECT S.* FROM playlistsongs AS PS
            INNER JOIN song AS S
            ON PS.song_id = S.id
            WHERE playlist_id = ?
        `, [playlistId]);

        return result.map(row => ({
            title: row.title,
            description: row.description,
            id: row.song_id,
            image: row.image_url,
            media_url: row.media_url
        }));
    } catch (error) {
        console.error("Get songs from playlist failed:", error);
        return [];
    }
}
import { SongDetails } from "@/script/media_player_helper";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export async function CreateDatabase() {
    db = await SQLite.openDatabaseAsync('calm.db');
    // Enable WAL mode for better concurrency
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await CreateTables();
}

async function CreateTables() {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS song (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            song_id TEXT NOT NULL UNIQUE,
            image_url TEXT NOT NULL
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            song_played_id INTEGER NOT NULL
        );
    `);
}

export async function InsertSong(title: string, description: string, song_id: string, image_url: string) {
    if (!db) return;

    try {
        const result = await db.runAsync(
            "INSERT OR IGNORE INTO song (title, description, song_id, image_url) VALUES (?, ?, ?, ?)",
            [title, description, song_id, image_url]
        );

        if (result.changes === 0) {
            console.log("Song already exists, skipping insert.", result);
        } else {
            console.log("New song inserted! ID:", result.lastInsertRowId);
        }

        await InsertSongInHistory(song_id)

    } catch (error) {
        console.error("Insert failed:", error);
    }
}

async function InsertSongInHistory(song_id: string) {
    await db.runAsync(
        `INSERT INTO history (song_played_id) 
        SELECT id FROM song WHERE song_id = ?`,
        [song_id]
    );
}


export async function GetSongHistory() : Promise<SongDetails[]> {
    const result = await db.getAllAsync<any>(`
        SELECT S.* 
        FROM history AS H
        INNER JOIN song AS S
        ON H.song_played_id = S.id
        ORDER BY H.id DESC
        `)

    let AllHistory: SongDetails[] = []
    
    for (const row of result) {
        const song: SongDetails = {title: row.title, description: row.description, id: row.song_id, image: row.image_url, media_url: ""}
        AllHistory.push(song)
    }
    return AllHistory
}


export async function GetMostPlayedSong() : Promise<SongDetails[]> {
    const result = await db.getAllAsync<any>(`
            SELECT S.id, S.title, S.description, S.song_id, S.image_url, COUNT(1) AS C
            FROM song AS S
            INNER JOIN history AS H
            ON S.id = H.song_played_id
            GROUP BY S.id, S.title, S.description, S.song_id, S.image_url
            ORDER BY COUNT(1) DESC
        `)

    let AllHistory: SongDetails[] = []

    console.log(result)
    
    for (const row of result) {
        const song: SongDetails = {title: row.title, description: row.description, id: row.song_id, image: row.image_url, media_url: ""}
        AllHistory.push(song)
    }
    return AllHistory
}
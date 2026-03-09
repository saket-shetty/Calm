import { SongDetails } from "@/script/media_player_helper";
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GetUserIdFromCache } from "@/script/user_details";

let supabase: SupabaseClient<any, "public", "public", any, any> | null = null;

export interface Playlist {
    id: number,
    playlist_name: string,
    playlist_description: string
}

async function GetSupabaseDB() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_HOST
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    if (supabase) return supabase
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                storage: AsyncStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        })
    }
    return supabase
}

export async function InsertUserIntoDB(google_id: string, name: string, email: string, image_url: string) {
    const spdb = await GetSupabaseDB()
    if (spdb) {
        const { data, error } = await spdb.from("calm_users").insert([
            {
                name: name,
                email: email,
                image_url: image_url,
                id: google_id
            },
        ])

        if (error) {
            console.log("error", error);
        } else {
            console.log("log", data);
        }
    }
}

export async function InsertSong(title: string, description: string, song_id: string, image_url: string, media_url: string) {

    const spdb = await GetSupabaseDB()
    try {
        if (spdb) {
            const { data, error } = await spdb.from("song").insert([{
                title: title,
                description: description,
                song_id: song_id,
                image_url: image_url,
                media_url: media_url
            }])

            if (error) {
                console.log("error", error);
            } else {
                console.log("data", data);
            }
            await InsertSongInHistory(song_id);
        }
    } catch (error) {
        console.error("Insert failed:", error);
    }
}

async function InsertSongInHistory(song_id: string) {
    const user_id = await GetUserIdFromCache()
    const spdb = await GetSupabaseDB()
    if (spdb) {
        const { data, error } = await spdb.from("history").insert([{
            user_id: user_id,
            song_played_id: song_id,
        }])

        if (error) {
            console.log("error", error);
        } else {
            console.log("data", data);
        }
    }
}

export async function GetSongHistory(offset: number): Promise<SongDetails[]> {
    const limit = 15;
    const from = offset * limit;
    const to = from + limit - 1;

    const spdb = await GetSupabaseDB()
    const user_id = await GetUserIdFromCache()

    if (!spdb) return []

    const { data, error } = await spdb
        .from('history')
        .select(`
            id,
            song:song_played_id (
                song_id,
                title,
                description,
                image_url,
                media_url
            )
        `)
        .eq("user_id", user_id)
        .order('id', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching history:', error.message);
        return [];
    }

    return (data || [])
        .filter(row => row.song)
        .map(row => {
            const s = row.song as any;
            return {
                title: s.title,
                description: s.description,
                id: s.song_id,
                image: s.image_url,
                media_url: s.media_url
            };
        });
}

export async function GetMostPlayedSong(): Promise<SongDetails[]> {
    const spdb = await GetSupabaseDB()
    const user_id = await GetUserIdFromCache()

    if (!spdb) return []

    const { data, error } = await spdb
        .from('user_most_played_songs')
        .select('*')
        .eq('user_id', user_id)
        .order('play_count', { ascending: false })
        .limit(10); // Adjust limit as needed

    if (error) {
        console.error('Error fetching top songs:', error.message);
        return [];
    }

    return (data || []).map(row => ({
        title: row.title,
        description: row.description,
        id: row.song_id,
        image: row.image_url,
        media_url: row.media_url
    }));
}

export async function SetFavouriteSong(songId: string) {
    try {
        // 1. Keep your existing user_id fetch
        const user_id = await GetUserIdFromCache();
        const supabase = await GetSupabaseDB()

        if (!supabase) return

        // 2. Check if this song is already in the 'favourite' table
        const { data: existing, error: fetchError } = await supabase
            .from('favourite')
            .select('id')
            .eq('user_id', user_id)
            .eq('song_played_id', songId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            // 3. If it exists, DELETE it (Unfavourite)
            const { error: deleteError } = await supabase
                .from('favourite')
                .delete()
                .eq('user_id', user_id)
                .eq('song_played_id', songId);

            if (deleteError) throw deleteError;
        } else {
            // 4. If it doesn't exist, INSERT it (Favourite)
            const { error: insertError } = await supabase
                .from('favourite')
                .insert([{
                    user_id: user_id,
                    song_played_id: songId
                }]);

            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error("SetFavourite failed:", error);
    }
}

export async function IsSongFavourite(songId: string): Promise<boolean> {
    const user_id = await GetUserIdFromCache();
    const spdb = await GetSupabaseDB();

    if (!spdb || !user_id) return false;

    const { data, error } = await spdb
        .from('favourite')
        .select('id')
        .eq('user_id', user_id)
        .eq('song_played_id', songId)
        .maybeSingle();

    if (error) {
        console.error("IsSongFavourite error:", error.message);
        return false;
    }

    return !!data;
}

export async function GetAllFavouriteSongs(): Promise<SongDetails[]> {
    const user_id = await GetUserIdFromCache();
    const spdb = await GetSupabaseDB();

    if (!spdb || !user_id) return [];

    const { data, error } = await spdb
        .from('favourite')
        .select(`
            song:song_played_id (
                song_id,
                title,
                description,
                image_url,
                media_url
            )
        `)
        .eq('user_id', user_id);

    if (error) {
        console.error("GetAllFavouriteSongs failed:", error.message);
        return [];
    }

    return (data || [])
        .filter(item => item.song)
        .map(item => {
            const s = item.song as any;
            return {
                title: s.title,
                description: s.description,
                id: s.song_id,
                image: s.image_url,
                media_url: s.media_url
            };
        });
}

export async function InsertNewPlaylist(playlistName: string, playlistDescription: string) {
    const user_id = await GetUserIdFromCache();
    const spdb = await GetSupabaseDB();

    if (!spdb || !user_id) return;

    try {
        const { error } = await spdb
            .from('playlist')
            .insert([
                { playlist_name: playlistName, user_id: user_id, playlist_description: playlistDescription }
            ]);

        if (error && error.code !== '23505') throw error;
    } catch (error) {
        console.error("Playlist insert failed:", error);
    }
}

export async function GetAllPlaylists(): Promise<Playlist[]> {
    const user_id = await GetUserIdFromCache();
    const spdb = await GetSupabaseDB();

    if (!spdb || !user_id) return [];

    try {
        const { data, error } = await spdb
            .from('playlist')
            .select('id, playlist_name, playlist_description')
            .eq('user_id', user_id)
            .order('id');

        if (error) throw error;
        return data.map(row => ({ id: row.id, playlist_name: row.playlist_name, playlist_description: row.playlist_description }));
    } catch (error) {
        console.log("Get playlists failed:", error);
        return [];
    }
}

export async function InsertSongInMultiplePlaylists(songId: string, playlistIds: number[]) {
    const spdb = await GetSupabaseDB();
    if (!spdb) return;

    try {
        const insertData = playlistIds.map(pId => ({
            playlist_id: pId,
            song_id: songId
        }));

        // Standard bulk insert
        const { error } = await spdb
            .from('playlistsongs')
            .insert(insertData);

        if (error && error.code !== '23505') throw error;
    } catch (error) {
        console.error("Multi-insert failed:", error);
    }
}

export async function GetSongFromPerticularPlaylist(playlistId: number): Promise<SongDetails[]> {
    const spdb = await GetSupabaseDB();
    if (!spdb) return [];

    try {
        const { data, error } = await spdb
            .from('playlistsongs')
            .select(`
                song:song_id (
                    song_id,
                    title,
                    description,
                    image_url,
                    media_url
                )
            `)
            .eq('playlist_id', playlistId);

        if (error) throw error;

        return (data || [])
            .filter(row => row.song)
            .map(row => {
                const s = row.song as any;
                return {
                    title: s.title,
                    description: s.description,
                    id: s.song_id,
                    image: s.image_url,
                    media_url: s.media_url
                };
            });
    } catch (error) {
        console.error("Get songs from playlist failed:", error);
        return [];
    }
}

export async function DeleteSongFromPlaylist(playlistId: number, songIds: string[]) {
    const spdb = await GetSupabaseDB();
    if (!spdb) return;

    try {
        const { error } = await spdb
            .from('playlistsongs')
            .delete()
            .eq('playlist_id', playlistId)
            .in('song_id', songIds); // Matches any ID in the array

        if (error) throw error;
        console.log("Deleted successfully.");
    } catch (error) {
        console.error("Deletion failed:", error);
    }
}
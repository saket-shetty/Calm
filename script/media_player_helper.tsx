import { GetSongDetailsFromIDs } from "@/database/initialize_db";
import { search_song_url, search_song_details_by_id, search_media_url } from "../endpoints/url";
import { Paths, File } from "expo-file-system"

export interface SongDetails {
    title: string,
    description: string,
    id: string,
    image: string,
    media_url: string
}

export async function SearchSong(songName: string): Promise<SongDetails[]> {

    const res = await fetch(search_song_url + songName)

    const res_json = await res.json()

    const SongArray: SongDetails[] = []

    if (res_json && res_json["songs"] && res_json["songs"]["data"]) {
        const res_song_data = res_json["songs"]["data"]
        for (let i = 0; i < res_song_data.length; i++) {
            let Details: SongDetails = {
                title: res_song_data[i]["title"],
                description: res_song_data[i]["description"],
                id: res_song_data[i]["id"],
                image: res_song_data[i]["image"],
                media_url: ""
            }

            SongArray.push(Details)
        }
    }
    return SongArray
}

export async function SearchSongDetailsByID(id: string): Promise<string> {

    const res = await fetch(search_song_details_by_id + id)

    const res_json = await res.json()

    const encrypted_media_url = res_json["songs"][0]["more_info"]["encrypted_media_url"]

    return GetMediaUrl(encrypted_media_url)
}

async function GetMediaUrl(encrypted_media_url: string): Promise<string> {

    const EMU_QueryEscape = encodeURIComponent(encrypted_media_url)

    const url = search_media_url.replaceAll("{ecrypted_media_url}", EMU_QueryEscape)

    const res = await fetch(url)

    const res_json = await res.json()

    let auth_url: string = res_json["auth_url"]

    auth_url = auth_url.replaceAll("web", "aac").split("?")[0]

    return auth_url

}

export async function DownloadSongLocal(songId: string, mediaUrl: string) {

    const songFile = new File(Paths.cache, `${songId}.m4a`);

    console.log("Downloading", songFile);

    if (!songFile.exists) {
        await File.downloadFileAsync(mediaUrl, songFile)
    } else {
        console.log("Already downloaded.")
    }

    console.log("Download completed", songFile);
}

export async function GetAllDownloadedSongs(): Promise<SongDetails[]> {

    let AllDownloadedSongs: SongDetails[] = []

    try {
        const files = Paths.cache.list()

        for (const x of files) {
            if (x.uri.endsWith(".m4a")) {
                const songIdFromFilename = x.name.split(".")[0]
                let s: SongDetails = await GetSongDetailsFromIDs(songIdFromFilename)
                s.media_url = x.uri
                AllDownloadedSongs.push(s)
            }
        }
    } catch (error) {
        console.error("Could not list cache:", error);
    } finally {
        return AllDownloadedSongs
    }
}
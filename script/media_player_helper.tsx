import { cache } from "@/global_cache/cache";
import CookieManager from '@react-native-cookies/cookies';
import { File, Paths } from "expo-file-system";
import { get_english_trending_songs, search_media_url, search_movie_url, search_song_details_by_id, search_song_url } from "../endpoints/url";

export interface SongDetails {
    title: string,
    description: string,
    id: string,
    image: string,
    media_url: string
}

export interface MovieDetails {
    title: string,
    description: string,
    id: string,
    image: string,
    media_type: string
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

export async function DownloadSongLocal(song: SongDetails) {
    const songFile = new File(Paths.cache, `${song.id}_-_${song.title}_-_${song.description}.m4a`);
    if (!songFile.exists) {
        await File.downloadFileAsync(song.media_url, songFile)
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
                const song_file_name = x.name.split(".")[0]
                const song_details = song_file_name.split("_-_")
                let s: SongDetails = {
                    id: song_details[0],
                    title: song_details[1],
                    description: song_details[2],
                    image: "https://cdn-icons-png.flaticon.com/512/3043/3043665.png",
                    media_url: x.uri
                }
                AllDownloadedSongs.push(s)
            }
        }
    } catch (error) {
        console.log("Could not list cache:", error);
    } finally {
        return AllDownloadedSongs
    }
}

export async function GetTrendingSongs(language: string): Promise<SongDetails[]> {

    let AllTrendingSongs: SongDetails[] = []

    const cache_songs = await cache.get(language)

    if (cache_songs) {
        try {
            const json_trending_songs = (JSON.parse(cache_songs) as SongDetails[])
            if (json_trending_songs && json_trending_songs.length > 0) {
                return json_trending_songs
            }
        } catch (error) {
            console.error(error);
        }
    }

    try {
        const domain = "www.jiosaavn.com";
        await CookieManager.set(`https://${domain}`, {
            name: 'DL',
            value: 'english',
            domain: domain,
            path: '/',
        });
        await CookieManager.set(`https://${domain}`, {
            name: 'L',
            value: language.toLowerCase(),
            domain: domain,
            path: '/',
        });

        const res = await fetch(get_english_trending_songs)

        const res_json = await res.json()

        if (res_json && res_json["list"]) {
            const res_song_data = res_json["list"]
            for (let i = 0; i < res_song_data.length; i++) {
                let Details: SongDetails = {
                    title: res_song_data[i]["title"],
                    description: res_song_data[i]["subtitle"],
                    id: res_song_data[i]["id"],
                    image: res_song_data[i]["image"].replaceAll("150x150.jpg", "500x500.jpg"),
                    media_url: await SearchSongDetailsByID(res_song_data[i]["id"])
                }
                AllTrendingSongs.push(Details)
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        await cache.set(language, JSON.stringify(AllTrendingSongs))
        return AllTrendingSongs
    }
}


export async function GetMovieDetails(movieTitle: string) {
    const res = await fetch(search_movie_url + movieTitle)
    const res_json = await res.json()
    const MovieArray: MovieDetails[] = []

    if (res_json && res_json["results"]) {
        const res_song_data = res_json["results"]
        for (let i = 0; i < res_song_data.length; i++) {
            let Details: MovieDetails = {
                title: res_song_data[i]["title"] || res_song_data[i]["name"],
                description: res_song_data[i]["overview"],
                id: res_song_data[i]["id"],
                image: "https://image.tmdb.org/t/p/w342" + res_song_data[i]["poster_path"] + "&output=webp&q=50&n=-1",
                media_type: res_song_data[i]["media_type"],
            }

            MovieArray.push(Details)
        }
    }
    return MovieArray
}
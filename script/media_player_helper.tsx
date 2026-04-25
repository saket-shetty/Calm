import { cache } from "@/global_cache/cache";
import CookieManager from '@react-native-cookies/cookies';
import { File, Paths } from "expo-file-system";
import { cineby_url, get_english_trending_songs, get_new_release_songs, get_trending_movies, search_media_url, search_movie_url, search_song_details_by_id, search_song_url } from "../endpoints/url";

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
        for (let i = 0; i < res_song_data.length && i < 10; i++) {
            if (res_song_data[i]["media_type"] !== "movie" && res_song_data[i]["media_type"] !== "tv") {
                continue
            }
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

export async function GetTrendingMovies(): Promise<Map<string, MovieDetails[]>> {
    const buildId = await GetCinebySourceCode()
    const res = await fetch(get_trending_movies.replaceAll("build_id", buildId))
    const res_json = await res.json()

    const TrendingTopics = new Map<string, MovieDetails[]>();

    if (res_json && res_json["pageProps"]) {
        if (res_json["pageProps"]["trendingSections"]) {
            const trendSec = res_json["pageProps"]["trendingSections"]
            if (trendSec[0]["name"] == "popularMovies") {
                const res = trendSec[0]["movies"]
                const MovieArray: MovieDetails[] = []
                for (let i = 0; i < res.length && i < 10; i++) {
                    let Details: MovieDetails = {
                        title: res[i]["title"],
                        description: res[i]["description"],
                        id: res[i]["id"],
                        image: res[i]["poster"],
                        media_type: "movie",
                    }
                    MovieArray.push(Details)
                }
                TrendingTopics.set("Trending Movies", MovieArray)
            }

            if (trendSec[1]["name"] == "popularShowTV") {
                const res = trendSec[1]["movies"]
                const MovieArray: MovieDetails[] = []
                for (let i = 0; i < res.length && i < 10; i++) {
                    let Details: MovieDetails = {
                        title: res[i]["title"],
                        description: res[i]["description"],
                        id: res[i]["id"],
                        image: res[i]["poster"],
                        media_type: "tv",
                    }
                    MovieArray.push(Details)
                }
                TrendingTopics.set("Trending TV Shows", MovieArray)
            }

        }

        if (res_json["pageProps"]["defaultSections"]) {
            const defaultSection = res_json["pageProps"]["defaultSections"]
            if (defaultSection[0]["name"] === "trending") {
                const res = defaultSection[0]["movies"]
                const MovieArray: MovieDetails[] = []
                for (let i = 0; i < res.length && i < 10; i++) {
                    let Details: MovieDetails = {
                        title: res[i]["title"],
                        description: res[i]["description"],
                        id: res[i]["id"],
                        image: res[i]["poster"],
                        media_type: res[i]["mediaType"],
                    }
                    MovieArray.push(Details)
                }
                TrendingTopics.set("TOP 10 Today", MovieArray)
            }

            if (defaultSection[2]["name"] === "topratedmovie") {
                const res = defaultSection[2]["movies"]
                const MovieArray: MovieDetails[] = []
                for (let i = 0; i < res.length && i < 10; i++) {
                    let Details: MovieDetails = {
                        title: res[i]["title"],
                        description: res[i]["description"],
                        id: res[i]["id"],
                        image: res[i]["poster"],
                        media_type: res[i]["mediaType"],
                    }
                    MovieArray.push(Details)
                }
                TrendingTopics.set("Top rated movies", MovieArray)
            }

            if (defaultSection[3]["name"] === "topratedtv") {
                const res = defaultSection[3]["movies"]
                const MovieArray: MovieDetails[] = []
                for (let i = 0; i < res.length && i < 10; i++) {
                    let Details: MovieDetails = {
                        title: res[i]["title"],
                        description: res[i]["description"],
                        id: res[i]["id"],
                        image: res[i]["poster"],
                        media_type: res[i]["mediaType"],
                    }
                    MovieArray.push(Details)
                }
                TrendingTopics.set("Top rated TV Shows", MovieArray)
            }
        }

    }

    return TrendingTopics
}

async function GetCinebySourceCode(): Promise<string> {

    const html = await fetch(cineby_url).then(r => r.text());

    const buildId = (html.match(/"buildId":"(.*?)"/)?.[1] as string)

    return buildId
}

export async function GetNewReleases(): Promise<Map<string, SongDetails[]>> {
    const NewReleaseSongs = new Map<string, SongDetails[]>();

    let data = await GetNewReleaseFromLanguage("english")
    NewReleaseSongs.set("English New Release", data)

    data = await GetNewReleaseFromLanguage("hindi")
    NewReleaseSongs.set("Hindi New Release", data)

    return NewReleaseSongs
}

async function GetNewReleaseFromLanguage(lang: string): Promise<SongDetails[]> {

    let NewReleasesSongs: SongDetails[] = []

    const res = await fetch(get_new_release_songs + lang)

    const res_json = await res.json()

    if (res_json && res_json["data"]) {
        const songData = res_json["data"]
        for (let i = 0; i < songData.length; i++) {
            
            if (songData[i]["type"] !== "song") {
                continue
            }

            let song: SongDetails = {
                title: songData[i]["title"],
                description: songData[i]["subtitle"],
                id: songData[i]["id"],
                image: songData[i]["image"],
                media_url: ""
            }
            NewReleasesSongs.push(song)
            if (NewReleasesSongs.length == 10) {
                break
            }
        }
    }

    return NewReleasesSongs
}
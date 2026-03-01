import { GetSongHistory } from "@/database/initialize_db"
import { SongDetails } from "@/script/media_player_helper"
import { useState } from "react"
import SongTiles from "./component/song_tiles"
import { useFocusEffect } from "expo-router"

export default function History() {

    const [historySongs, setHistorySongs] = useState<SongDetails[]>([])

    const GetHistory = async () => {
        const songs: SongDetails[] = await GetSongHistory()
        setHistorySongs(songs)
    }

    useFocusEffect(() => {
        const setup = async () => {
            await GetHistory()
        };
        setup();
    });


    return (
        <SongTiles songList={historySongs}/>
    )
}
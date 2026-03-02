import { GetMostPlayedSong, GetSongHistory } from "@/database/initialize_db"
import { SongDetails } from "@/script/media_player_helper"
import { useState } from "react"
import SongTiles from "./component/song_tiles"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { View } from "react-native"

export default function PlaylistSongs() {

    const insets = useSafeAreaInsets();

    const { playlistName } = useLocalSearchParams();

    const [songsList, setSongsList] = useState<SongDetails[]>([])


    const GetHistory = async () => {
        const songs: SongDetails[] = await GetSongHistory()
        setSongsList(songs)
    }

    const GetMPSong = async () => {
        const songs: SongDetails[] = await GetMostPlayedSong()
        setSongsList(songs)
    }

    useFocusEffect(() => {
        const setup = async () => {
            if (playlistName === "history") {
                await GetHistory()
            } else if (playlistName === "most played") {
                await GetMPSong()
            }
        };
        setup();
    });

    return (
        <View style={{flex: 1, paddingBottom: insets.bottom}}>
        <SongTiles songList={songsList} displayBanner={false} />
        </View>
    )
}
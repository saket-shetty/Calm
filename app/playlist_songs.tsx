import { GetMostPlayedSong, GetSongHistory } from "@/database/initialize_db"
import { SongDetails } from "@/script/media_player_helper"
import { useState } from "react"
import SongTiles from "./component/song_tiles"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/native";


export default function PlaylistSongs() {

    const insets = useSafeAreaInsets();

    const { playlistName } = useLocalSearchParams();

    const [songsList, setSongsList] = useState<SongDetails[]>([])

    const navigation = useNavigation();


    const GetHistory = async () => {
        const songs: SongDetails[] = await GetSongHistory()
        setSongsList(songs)
    }

    const GetMPSong = async () => {
        const songs: SongDetails[] = await GetMostPlayedSong()
        setSongsList(songs)
    }

    useFocusEffect(() => {
        navigation.setOptions({ title: playlistName })

        const PlaylistName: string = (playlistName as string)

        const setup = async () => {
            if (PlaylistName.toLowerCase() === "history") {
                await GetHistory()
            } else if (PlaylistName.toLowerCase() === "most played") {
                await GetMPSong()
            }
        };
        setup();
    });

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
            <SongTiles songList={songsList} displayBanner={true} autoplay={playlistName !== "History"} />
        </View>
    )
}
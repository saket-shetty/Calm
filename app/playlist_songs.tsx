import { GetAllFavouriteSongs, GetMostPlayedSong, GetSongFromPerticularPlaylist, GetSongHistory } from "@/database/initialize_db"
import { GetAllDownloadedSongs, SongDetails } from "@/script/media_player_helper"
import { useEffect, useState } from "react"
import SongTiles from "./component/song_tiles"
import { useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/native";


export default function PlaylistSongs() {

    const insets = useSafeAreaInsets();

    const { playlistName, playlistId } = useLocalSearchParams();

    const [songsList, setSongsList] = useState<SongDetails[]>([])
    const [scrolledToBottom, setScrolledToBottom] = useState(false)

    const navigation = useNavigation();
    const [offset, setOffset] = useState(0)

    const GetHistory = async () => {
        const songs: SongDetails[] = await GetSongHistory(offset)
        setSongsList([...songsList, ...songs])
    }

    const GetMPSong = async () => {
        const songs: SongDetails[] = await GetMostPlayedSong()
        setSongsList(songs)
    }

    const GetFavSongs = async () => {
        const songs: SongDetails[] = await GetAllFavouriteSongs()
        setSongsList(songs)
    }

    const GetCustomPlaylistSongs = async () => {
        const songs: SongDetails[] = await GetSongFromPerticularPlaylist(playlistId as unknown as number)
        setSongsList(songs)
    }

    const GetDwnldSongs = async () => {
        const songs: SongDetails[] = await GetAllDownloadedSongs()
        setSongsList(songs)
    }

    const setup = async () => {
        const PlaylistName: string = (playlistName as string)
        if (PlaylistName.toLowerCase() === "history") {
            await GetHistory()
        } else if (PlaylistName.toLowerCase() === "most played") {
            await GetMPSong()
        } else if (PlaylistName.toLowerCase() === "favourites") {
            await GetFavSongs()
        } else if (PlaylistName.toLowerCase() === "downloaded songs") {
            await GetDwnldSongs()
        } else {
            await GetCustomPlaylistSongs()
        }
        setScrolledToBottom(false)
    };

    useEffect(() => {
        navigation.setOptions({ title: playlistName })
        setOffset(offset + 1)
        setup();
    }, []);

    useEffect(() => {
        if (scrolledToBottom) {
            setOffset(offset + 1)
            setup()
        }
    }, [scrolledToBottom])

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: '#121212' }}>
            <SongTiles
                songList={songsList}
                displayBanner={true}
                autoplay={playlistName !== "History"}
                playlistId={playlistId as unknown as number}
                playlistName={playlistName as string}
                scrolledToBottom={scrolledToBottom}
                setScrolledToBottom={setScrolledToBottom}
            />
        </View>
    )
}
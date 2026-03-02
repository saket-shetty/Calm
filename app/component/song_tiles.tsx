import { InsertSong } from "@/database/initialize_db";
import { SearchSongDetailsByID, SongDetails } from "@/script/media_player_helper";
import { useMusicStore } from "@/store/musicStore";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { List } from "react-native-paper";


export default function SongTiles({ songList, displayBanner = true, autoplay = false }: { songList: SongDetails[], displayBanner: boolean, autoplay: boolean }) {
    const [loadingSong, setLoadingSong] = useState<boolean>(false);
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);

    const currentSong = useMusicStore((state) => state.currentSong);
    const setSong = useMusicStore((state) => state.setSong);
    const sound = useMusicStore((state) => state.sound);
    const loadingRef = useRef(loadingSong);

    useEffect(() => {
        loadingRef.current = loadingSong;
    }, [loadingSong]);

    useEffect(() => {
        if (!autoplay) return
        const interval = setInterval(() => {
            if (!loadingRef.current && sound && sound.currentTime >= sound.duration) {
                if (songList[currentSongIndex + 1]) {
                    playSong(songList[currentSongIndex + 1], currentSongIndex + 1, true);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [sound, currentSongIndex]);

    const playSong = async (song: SongDetails, i: number, autoplay: boolean = false) => {
        if (loadingRef.current) return;

        setCurrentSongIndex(i);
        setLoadingSong(true);

        try {
            const mediaUrl = await SearchSongDetailsByID(song.id);
            const storeSong = useMusicStore.getState().currentSong;
            // If the song is already playing, just navigate to the player
            if (storeSong && storeSong.id === song.id) {
                router.push({ pathname: "/music_player" });
                setLoadingSong(false)
                return;
            }

            await setSong({ ...song, media_url: mediaUrl });
            if (song) {
                InsertSong(song.title, song.description, song.id, song.image)
            }

            if (!autoplay) {
                router.push({ pathname: "/music_player" });
            }
        } catch (error) {
            console.error("Failed to play song:", error);
        } finally {
            setLoadingSong(false);
        }
    };


    return (
        <>
            <View style={styles.content}>
                <ScrollView keyboardShouldPersistTaps="always">
                    {songList.map((song, i) => (
                        <List.Item
                            key={i}
                            title={song.title}
                            description={song.description}
                            left={() => <Image source={{ uri: song.image }} style={{ width: 60, height: 60 }} />}
                            onPress={() => playSong(song, i)}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            style={styles.songDetailContainer}
                        />
                    ))}
                </ScrollView>
            </View>

            {currentSong && displayBanner && (
                <TouchableOpacity
                    style={styles.nowPlayingBanner}
                    onPress={() => router.push({ pathname: "/music_player" })}
                >
                    <Image source={{ uri: currentSong.image }} style={styles.bannerImage} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.bannerTitle} numberOfLines={1}>
                            {currentSong.title}
                        </Text>
                        <Text style={styles.bannerArtist} numberOfLines={1}>
                            {currentSong.description}
                        </Text>
                    </View>
                    {loadingSong ? (
                        <ActivityIndicator size="small" color="#0000ff" style={{ marginRight: 10 }} />
                    ) : (
                        <Text style={{ fontSize: 18, marginRight: 10 }}>▶</Text>
                    )}
                </TouchableOpacity>
            )}

        </>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    searchContainer: {
        padding: 10,
        backgroundColor: "#f2f2f2",
    },

    searchInput: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 10
    },

    banner: {
        height: 60,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
    },

    bannerText: {
        color: "#fff",
        fontWeight: "bold",
    },

    songDetailContainer: {
        minWidth: '98%',
        maxWidth: '98%',
        borderWidth: 1,
        borderRadius: 10,
        margin: 2,
        padding: 10
    },

    // Now Playing Banner
    nowPlayingBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1DB954",
        padding: 10,
    },
    bannerImage: { width: 50, height: 50, borderRadius: 5 },
    bannerTitle: { color: "#fff", fontWeight: "bold" },
    bannerArtist: { color: "#eee", fontSize: 12 },
});
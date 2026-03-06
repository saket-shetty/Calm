import { InsertSong, DeleteSongFromPlaylist } from "@/database/initialize_db";
import { SearchSongDetailsByID, SongDetails } from "@/script/media_player_helper";
import { useMusicStore } from "@/store/musicStore";
import { AudioStatus } from "expo-audio";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { List } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";


export default function SongTiles({ songList, displayBanner = true, autoplay = false, playlistId = -1, playlistName, setScrolledToBottom, scrolledToBottom }: { songList: SongDetails[], displayBanner: boolean, autoplay: boolean, playlistId: number, playlistName: string, setScrolledToBottom: React.Dispatch<React.SetStateAction<boolean>>, scrolledToBottom: boolean }) {
    const [loadingSong, setLoadingSong] = useState<boolean>(false);
    const currentSong = useMusicStore((state) => state.currentSong);
    const currentIndex = useMusicStore((state) => state.currentIndex);
    const setSong = useMusicStore((state) => state.setSong);
    const sound = useMusicStore((state) => state.sound);
    const loadingRef = useRef(loadingSong);
    const navigation = useNavigation();
    const [selectedSongToDelete, setSelectedSongToDelete] = useState<string[]>([]);
    const [showDeleteRadioButton, setShowDeleteRadioButton] = useState<boolean>(false);

    const toggleSelect = (id: string) => {
        setSelectedSongToDelete(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                selectedSongToDelete.length !== 0 && <Text style={styles.deleteText} onPress={() => DeleteSelectedSongs()}>Delete</Text>
            ),
        })
    }, [selectedSongToDelete])

    const DeleteSelectedSongs = async () => {
        await DeleteSongFromPlaylist(playlistId, selectedSongToDelete);
        router.back()
        router.push({ pathname: "/playlist_songs", params: { playlistName: playlistName, playlistId: playlistId } });
    }

    useEffect(() => {
        loadingRef.current = loadingSong;
    }, [loadingSong]);

    useEffect(() => {
        if (!sound) return;

        const handleSongEnd = (s: AudioStatus) => {
            if (!s.didJustFinish || !autoplay) return
            const nextIndex = currentIndex + 1;
            if (songList[nextIndex]) {
                playSong(nextIndex, true);
            }
        };

        sound.addListener('playbackStatusUpdate', handleSongEnd)

        return () => {
            sound.removeListener('playbackStatusUpdate', handleSongEnd);
        };
    }, [sound, currentIndex]);

    const playSong = async (i: number, autoplay: boolean = false) => {
        if (loadingRef.current) return;
        setLoadingSong(true);
        try {
            const storeSong = useMusicStore.getState().currentSong;
            const song = songList[i]
            // If the song is already playing, just navigate to the player
            if (storeSong && storeSong.id === song.id) {
                router.push({ pathname: "/music_player" });
                setLoadingSong(false)
                return;
            }

            let mediaUrl: string = song.media_url
            if (mediaUrl === "") {
                mediaUrl = await SearchSongDetailsByID(song.id);
            }

            song.media_url = mediaUrl;
            songList[i] = song;

            setSong(i, songList);
            if (song) {
                InsertSong(song.title, song.description, song.id, song.image, song.media_url)
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
                <FlatList
                    data={songList}
                    keyExtractor={(_, i) => i.toString()}
                    onEndReached={() => {
                        if (songList.length >= 15){
                            setScrolledToBottom(true)
                        }
                    }}
                    ListFooterComponent={() => {
                        return scrolledToBottom ? <ActivityIndicator size="large" color="#0000ff" /> : null
                    }}
                    renderItem={({ item, index }) => (
                        <List.Item
                            title={item.title}
                            description={item.description}
                            left={() => <Image source={{ uri: item.image }} style={{ width: 60, height: 60 }} />}
                            onPress={() => playSong(index)}
                            onLongPress={() => setShowDeleteRadioButton(playlistId != -1)}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            style={styles.songDetailContainer}
                            right={() => {
                                const isSelected = selectedSongToDelete.includes(item.id);
                                return (
                                    showDeleteRadioButton && <MaterialIcons
                                        name={isSelected ? "check-circle" : "radio-button-unchecked"}
                                        size={24}
                                        color={isSelected ? "#1DB954" : "#444"}
                                        onPress={() => toggleSelect(item.id)}
                                        style={styles.radioButtonAlign}
                                    />
                                );
                            }}
                        />
                    )}
                />
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

    bannerImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },

    bannerTitle: {
        color: "#fff",
        fontWeight: "bold",
    },

    bannerArtist: {
        color: "#eee",
        fontSize: 12,
    },

    radioButtonAlign: {
        flexDirection: 'row',
        alignSelf: 'center',
        fontSize: 35,
        padding: 10,
    },

    deleteText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
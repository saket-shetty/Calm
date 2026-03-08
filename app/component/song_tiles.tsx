import { InsertSong, DeleteSongFromPlaylist } from "@/database/initialize_db";
import { SearchSongDetailsByID, SongDetails } from "@/script/media_player_helper";
import { useMusicStore } from "@/store/musicStore";
import { AudioStatus } from "expo-audio";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
                song.media_url = mediaUrl;
                songList[i] = song;
            }

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

    const renderSongItem = ({ item, index }: { item: SongDetails, index: number }) => (
        <TouchableOpacity style={renderstyle.songCard}
            onPress={() => playSong(index)}
            onLongPress={() => setShowDeleteRadioButton(playlistId != -1)}>
            <Image source={{ uri: item.image.replaceAll("50x50.jpg", "500x500.jpg") }} style={renderstyle.thumbnail} />
            <View style={renderstyle.textContainer}>
                <Text style={renderstyle.title} numberOfLines={1}>{item.title}</Text>
                <Text style={renderstyle.description} numberOfLines={1}>{item.description}</Text>
            </View>
            {showDeleteRadioButton && <MaterialIcons
                name={selectedSongToDelete.includes(item.id) ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={selectedSongToDelete.includes(item.id) ? "#1DB954" : "#444"}
                onPress={() => toggleSelect(item.id)}
                style={styles.radioButtonAlign}
            />}
        </TouchableOpacity>
    );

    return (
        <>
            <View style={styles.content}>
                <FlatList
                    data={songList}
                    keyExtractor={(_, i) => i.toString()}
                    onEndReached={() => {
                        if (songList.length >= 15) {
                            setScrolledToBottom(true)
                        }
                    }}
                    contentContainerStyle={songList.length === 0 ? { flex: 1 } : renderstyle.listContent}
                    renderItem={renderSongItem}
                    ListEmptyComponent={() => playlistName !== "" && <ActivityIndicator style={{ flex: 1 }} size="large" color="white" />}
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

    content: {
        flex: 1,
        backgroundColor: '#1B263B'
    },

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
        fontSize: 25,
        padding: 10,
    },

    deleteText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const renderstyle = StyleSheet.create({
    listContent: { padding: 15 },
    songCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    thumbnail: { width: 60, height: 60, borderRadius: 5, backgroundColor: '#333' },
    textContainer: { marginLeft: 15, flex: 1 },
    title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    description: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },
    empty: { color: '#fff', textAlign: 'center', marginTop: 50 },
});
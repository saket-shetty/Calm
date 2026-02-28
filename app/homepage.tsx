import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { List } from "react-native-paper";
import { SearchSong, SearchSongDetailsByID, SongDetails } from "../script/media_player_helper";
import { useRouter } from "expo-router";
import { useMusicStore } from "../store/musicStore";

export default function Homepage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [songDetails, setSongDetails] = useState<SongDetails[]>([]);
    const [loadingSong, setLoadingSong] = useState<boolean>(false);
    const [songClicked, setSongClicked] = useState<SongDetails>();

    const currentSong = useMusicStore((state) => state.currentSong);
    const setSong = useMusicStore((state) => state.setSong);

    const OnSongSearch = async (songName: string) => {
        setSearch(songName);
        const details = await SearchSong(songName);
        setSongDetails(details);
    };

    const playSong = async (song: SongDetails) => {
        setSongClicked(song)
        setLoadingSong(true)
        const mediaUrl = await SearchSongDetailsByID(song.id);
        const storeSong = useMusicStore.getState().currentSong;
        // If the song is already playing, just navigate to the player
        if (storeSong && storeSong.id === song.id) {
            router.push({ pathname: "/music_player" });
            setLoadingSong(false)
            return;
        }

        // Otherwise, load new song
        await setSong({ ...song, media_url: mediaUrl });
        router.push({ pathname: "/music_player" });
        setLoadingSong(false)
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Search..."
                    value={search}
                    onChangeText={OnSongSearch}
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.content}>
                <ScrollView keyboardShouldPersistTaps="always">
                    {songDetails.map((song) => (
                        <List.Item
                            key={song.id}
                            title={song.title}
                            description={song.description}
                            left={() => <Image source={{ uri: song.image }} style={{ width: 60, height: 60 }} />}
                            onPress={() => playSong(song)}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            style={styles.songDetailContainer}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Now Playing Banner */}
            {songClicked && (
                <TouchableOpacity
                    style={styles.nowPlayingBanner}
                    onPress={() => router.push({ pathname: "/music_player" })}
                >
                    <Image source={{ uri: songClicked.image }} style={styles.bannerImage} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.bannerTitle} numberOfLines={1}>
                            {songClicked.title}
                        </Text>
                        <Text style={styles.bannerArtist} numberOfLines={1}>
                            {songClicked.description}
                        </Text>
                    </View>
                    {loadingSong ? (
                        <ActivityIndicator size="small" color="#0000ff" style={{ marginRight: 10 }} />
                    ) : (
                        <Text style={{ fontSize: 18, marginRight: 10 }}>▶</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
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
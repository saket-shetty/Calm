import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { SearchSong, SongDetails } from "../script/media_player_helper";
import SongTiles from "./component/song_tiles";
import Header from "./component/header";

export default function Homepage() {
    const [search, setSearch] = useState("");
    const [songDetails, setSongDetails] = useState<SongDetails[]>([]);
    const [scrolledToBottom, setScrolledToBottom] = useState(false)

    const OnSongSearch = async (songName: string) => {
        setSearch(songName);
        const details = await SearchSong(songName);
        setSongDetails(details);
    };

    return (
        <View style={styles.container}>
            <Header title="Home" />
            <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        placeholder="Search for music..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={OnSongSearch}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <SongTiles
                songList={songDetails}
                displayBanner={true}
                autoplay={false}
                playlistId={-1}
                playlistName=""
                scrolledToBottom={scrolledToBottom}
                setScrolledToBottom={setScrolledToBottom}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    searchSection: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1B263B'

    },
    searchWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle glass effect
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    searchInput: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
});
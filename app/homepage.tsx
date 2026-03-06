import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { SearchSong, SongDetails } from "../script/media_player_helper";
import SongTiles from "./component/song_tiles";

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
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Search..."
                    value={search}
                    onChangeText={OnSongSearch}
                    style={styles.searchInput}
                />
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

    searchContainer: {
        padding: 10,
        backgroundColor: "#1B263B",
    },

    searchInput: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
});
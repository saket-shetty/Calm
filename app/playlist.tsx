import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { List } from "react-native-paper";

export default function Playlist() {

    const [playlists, setPlaylists] = useState(["History", "Most Played", "Favourites"])

    return (
        <ScrollView>
            {playlists.map((playlist, i) => (
                <List.Item
                    key={i}
                    title={playlist}
                    titleNumberOfLines={1}
                    descriptionNumberOfLines={1}
                    style={styles.container}
                    titleStyle={styles.containerText}
                    onPress={() => { router.push({ pathname: "/playlist_songs", params:{playlistName: playlist} }); }}
                />
            ))
            }
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1B263B",
        borderRadius: 10,
        borderWidth: 1,
        padding: 15,
        margin: 5,
    },

    containerText: {
        color: "#E0E1DD",
        fontWeight: "700"
    }
})
import { GetAllPlaylists, Playlist } from "@/database/initialize_db";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { FAB } from 'react-native-elements';
import { List } from "react-native-paper";
import Header from "./component/header";

export default function Playlists() {

    const [playlists, setPlaylists] = useState<Playlist[]>([])

    useFocusEffect(
        useCallback(() => {
            GetAllPList();
        }, [])
    );

    async function GetAllPList() {
        let defaultPlist: Playlist[] = [{ id: -1, playlist_name: "History" }, { id: -1, playlist_name: "Most Played" }, { id: -1, playlist_name: "Favourites" }, { id: -1, playlist_name: "Downloaded Songs" }]
        const plist = await GetAllPlaylists()
        defaultPlist.push(...plist)
        setPlaylists(defaultPlist)
    }

    return (
        <View style={{ flex: 1 }}>
            <Header title="Playlist" />
            <ScrollView>
                {playlists.map((playlist, i) => (
                    <List.Item
                        key={i}
                        title={playlist.playlist_name}
                        titleNumberOfLines={1}
                        descriptionNumberOfLines={1}
                        style={styles.container}
                        titleStyle={styles.containerText}
                        onPress={() => { router.push({ pathname: "/playlist_songs", params: { playlistName: playlist.playlist_name, playlistId: playlist.id } }); }}
                    />
                ))}
            </ScrollView >
            <FAB title="+" onPress={() => { router.push("/create_playlist") }} placement="right" />
        </View>
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
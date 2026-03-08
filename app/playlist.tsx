import { GetAllPlaylists, Playlist } from "@/database/initialize_db";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View, Text, TouchableOpacity } from "react-native";
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
        setPlaylists(defaultPlist)
        const plist = await GetAllPlaylists()
        defaultPlist.push(...plist)
        setPlaylists(defaultPlist)
    }

    const renderPlaylistItem = ({ item }: { item: Playlist }) => (
        <TouchableOpacity
            style={styles.playlistCard}
            onPress={() => { router.push({ pathname: "/playlist_songs", params: { playlistName: item.playlist_name, playlistId: item.id } }); }}
        >
            <View style={styles.iconPlaceholder}>
                <Text style={styles.playlistIcon}>♪</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.playlistName}>{item.playlist_name}</Text>
                <Text style={styles.subtitle}>Playlist • {item.id}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title="My Playlists" />
            <FlatList
                data={playlists}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderPlaylistItem}
                contentContainerStyle={styles.listContent}
            />
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => { router.push("/create_playlist") }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A'
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20
    },
    playlistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 12,
        marginBottom: 5,
    },
    iconPlaceholder: {
        width: 50,
        height: 50,
        backgroundColor: '#1DB954',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playlistIcon: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginLeft: 15,
    },
    playlistName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#1DB954',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '300',
        marginTop: -3, // Visual centering for the plus sign
    },
});
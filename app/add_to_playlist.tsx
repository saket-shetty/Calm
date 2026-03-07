import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GetAllPlaylists, InsertSongInMultiplePlaylists, Playlist } from '@/database/initialize_db';

export default function AddToPlaylist() {
    const router = useRouter();
    const { songId, songTitle } = useLocalSearchParams();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useFocusEffect(
        useCallback(() => {
            GetAllPList();
        }, [])
    );

    async function GetAllPList() {
        const plist = await GetAllPlaylists()
        setPlaylists(plist)
    }

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (selectedIds.length === 0) return;

        console.log(`Adding song ${songId} to playlists:`, selectedIds);
        await InsertSongInMultiplePlaylists(songId as string, selectedIds);

        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add to Playlists</Text>

                {/* 3. Save Button */}
                <TouchableOpacity onPress={handleSave} disabled={selectedIds.length === 0}>
                    <Text style={[styles.saveText, selectedIds.length === 0 && { opacity: 0.5 }]}>
                        Done
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.subHeader}>
                <Text style={styles.infoText}>Adding: {songTitle}</Text>
                <Text style={styles.countText}>{selectedIds.length} selected</Text>
            </View>

            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            style={[styles.item, isSelected && styles.itemSelected]}
                            onPress={() => toggleSelect(item.id)}
                        >
                            <MaterialIcons
                                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                                size={24}
                                color={isSelected ? "#1DB954" : "#444"}
                            />
                            <Text style={[styles.itemText, isSelected && { color: '#1DB954' }]}>
                                {item.playlist_name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    saveText: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15
    },
    infoText: { color: '#888', fontSize: 14 },
    countText: { color: '#1DB954', fontSize: 14, fontWeight: '600' },
    item: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        alignItems: 'center'
    },
    itemSelected: { backgroundColor: '#1a1a1a' },
    itemText: { color: '#fff', fontSize: 18, marginLeft: 15 }
});
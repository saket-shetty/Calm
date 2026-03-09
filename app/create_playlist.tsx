import { InsertNewPlaylist } from '@/database/initialize_db';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreatePlaylistScreen() {
    const [playlistName, setPlaylistName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        if (playlistName.trim().length === 0) return;
        await InsertNewPlaylist(playlistName, description)
        setPlaylistName('');
        router.back()
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => { router.back() }}>
                        <MaterialIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Playlist</Text>
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={!playlistName.trim()}
                    >
                        <Text style={[styles.createText, !playlistName.trim() && { opacity: 0.5 }]}>
                            Create
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="queue-music" size={80} color="#444" />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Playlist Name"
                        placeholderTextColor="#888"
                        value={playlistName}
                        onChangeText={setPlaylistName}
                        autoFocus
                    />

                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        placeholder="Description (Optional)"
                        placeholderTextColor="#888"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },

    inner: {
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },

    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    createText: {
        color: '#1DB954', // Brand color
        fontSize: 16,
        fontWeight: '600',
    },

    content: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 40,
    },

    imagePlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#282828',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    input: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 10,
        marginBottom: 20,
    },

    descriptionInput: {
        fontSize: 16,
        fontWeight: '400',
        borderBottomWidth: 0,
    },

    closeButton: {
        padding: 10
    }
});
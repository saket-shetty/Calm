import { GetTrendingSongs, SongDetails } from '@/script/media_player_helper';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SongTiles from './component/song_tiles';
import Header from './component/header';

export const TrendingPage = () => {
    const [activeTab, setActiveTab] = useState<'English' | 'Hindi' | 'Global'>('English');
    const [scrolledToBottom, setScrolledToBottom] = useState(false)
    const [englishSongs, setEnglishSongs] = useState<SongDetails[]>([])
    const [hindiSongs, setHindiSongs] = useState<SongDetails[]>([])
    const [songs, setSongs] = useState<SongDetails[]>([])

    useEffect(() => {
        GetSongs()
    }, [activeTab])

    useEffect(() => {
        setSongs(englishSongs)
    }, [englishSongs])

    useEffect(() => {
        setSongs(hindiSongs)
    }, [hindiSongs])

    const GetSongs = async () => {     
        setSongs([])   
        if (activeTab === "English" || activeTab === "Global") {
            if (englishSongs.length === 0) {
                setEnglishSongs(await GetTrendingSongs("English"))
            } else {
                setSongs(englishSongs)
            }
        } else if (activeTab === "Hindi") {
            if (hindiSongs.length === 0) {
                setHindiSongs(await GetTrendingSongs(activeTab))
            } else {
                setSongs(hindiSongs)
            }
        }
    }

    const TabButton = ({ name }: { name: 'English' | 'Hindi' | 'Global' }) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === name && styles.activeTab]}
            onPress={() => setActiveTab(name)}
        >
            <Text style={[styles.tabText, activeTab === name && styles.activeTabText]}>{name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0D1B2A' }} >
            <Header title='Trending' />
            <View style={styles.tabContainer}>
                <TabButton name="English" />
                <TabButton name="Hindi" />
                <TabButton name="Global" />
            </View>
            <SongTiles
                songList={songs}
                displayBanner={true}
                autoplay={true}
                playlistId={-1}
                playlistName={"Trending"}
                scrolledToBottom={scrolledToBottom}
                setScrolledToBottom={setScrolledToBottom} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: { fontSize: 28, fontWeight: 'bold', color: '#fff', padding: 20 },
    tabContainer: { flexDirection: 'row', marginBottom: 15, paddingHorizontal: 15 },
    tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, backgroundColor: '#1a1a1a' },
    activeTab: { backgroundColor: '#1DB954' },
    tabText: { color: '#888', fontWeight: '600' },
    activeTabText: { color: '#fff' },
});

export default TrendingPage;
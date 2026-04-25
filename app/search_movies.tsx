import { GetMovieDetails, GetTrendingMovies, MovieDetails } from "@/script/media_player_helper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "./component/header";

export default function SearchMovies() {

    useEffect(() => {
        GetTrendTopics()
    }, [])

    const GetTrendTopics = async () => {
        const allTrendingTopicsMovie = await GetTrendingMovies()
        setTrendingTopicsMap(allTrendingTopicsMovie)
    }

    const [search, setSearch] = useState("");
    const [movies, setMovies] = useState<MovieDetails[]>([])
    const [trendingTopicsMap, setTrendingTopicsMap] = useState<Map<string, MovieDetails[]>>()


    const OnMovieSearch = async (moviesTitle: string) => {
        setSearch(moviesTitle);
        const details = await GetMovieDetails(moviesTitle);
        setMovies(details)
    };

    const playMovie = (media: MovieDetails) => {
        router.push({ pathname: "/movie_player", params: { movie_id: media.id, media_type: media.media_type } });
    }

    const renderMovieItem = ({ item, index }: { item: MovieDetails, index: number }) => (
        <TouchableOpacity style={renderstyle.songCard}
            onPress={() => playMovie(item)}
        >
            <Image source={{ uri: item.image }} style={renderstyle.thumbnail} />
            <View style={renderstyle.textContainer}>
                <Text style={renderstyle.title} numberOfLines={1}>{item.title}</Text>
                <Text style={renderstyle.description} numberOfLines={1}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <Header title="Search Movies" />
            <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        placeholder="Search for movies..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={OnMovieSearch}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <FlatList
                data={movies}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={movies.length === 0  ? { flex: 1 } : renderstyle.listContent}
                keyboardShouldPersistTaps="always"
                renderItem={renderMovieItem}
                style={{
                    backgroundColor: '#1B263B'
                }}
            />

            {movies.length === 0 && trendingTopicsMap && (
                <TrendingTopicMediaList data={trendingTopicsMap} />
            )}

        </View>
    );
}

const TrendingTopicMediaList = ({ data }: { data: Map<string, MovieDetails[]> }) => {

    const playMovie = (media: MovieDetails) => {
        router.push({
            pathname: "/movie_player",
            params: { movie_id: media.id, media_type: media.media_type }
        });
    }

    return (
        <FlatList
            data={Array.from(data.entries())}
            keyExtractor={([key]) => key}
            renderItem={({ item }) => {
                const [topic, movies] = item;

                return (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={topicStyles.topicTitle}>{topic}</Text>

                        <FlatList
                            data={movies}
                            horizontal
                            keyExtractor={(m) => m.id}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={topicStyles.card}
                                    onPress={() => playMovie(item)}
                                >
                                    <Image
                                        source={{ uri: item.image }}
                                        style={topicStyles.image}
                                    />
                                    <Text
                                        style={topicStyles.title}
                                        numberOfLines={1}
                                    >
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A'
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
})

const renderstyle = StyleSheet.create({
    listContent: { padding: 15 },
    songCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    thumbnail: { width: 60, height: 60, borderRadius: 5, backgroundColor: '#333' },
    textContainer: { marginLeft: 15, flex: 1 },
    title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    description: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },
    empty: { color: '#fff', textAlign: 'center', marginTop: 50 },
});

const topicStyles = StyleSheet.create({
    topicTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 15
    },
    card: {
        marginLeft: 15,
        width: 120
    },
    image: {
        width: 120,
        height: 160,
        borderRadius: 10,
        backgroundColor: '#333'
    },
    title: {
        color: '#fff',
        marginTop: 6,
        fontSize: 13
    }
});
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusicStore } from "../store/musicStore";
import { InsertSong } from "../database/initialize_db"


export default function MusicPlayer() {
    const currentSong = useMusicStore((state) => state.currentSong);
    const sound = useMusicStore((state) => state.sound);
    const isPlaying = useMusicStore((state) => state.isPlaying);
    const play = useMusicStore((state) => state.play);
    const pause = useMusicStore((state) => state.pause);

    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const wasPlayingRef = useRef(false);

    if (!currentSong) return null;

    useEffect(() => {
        const interval = setInterval(async () => {
            if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    setPosition(status.positionMillis ?? 0);  // fallback to 0 if undefined
                    setDuration(status.durationMillis ?? 1);  // fallback to 1 if undefined
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [sound]);

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) await pause();
        else await play();
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    if (!currentSong) return null;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: currentSong.image.replaceAll("50x50.jpg", "500x500.jpg") }}
                style={styles.artwork}
            />
            <Text style={styles.title}>{currentSong.title}</Text>
            <Text style={styles.artist}>{currentSong.description}</Text>

            <Slider
                style={{ width: "100%", marginTop: 20 }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#555"
                thumbTintColor="#1DB954"
                onSlidingStart={() => {
                    wasPlayingRef.current = isPlaying;
                    sound?.pauseAsync();
                }}
                onSlidingComplete={async (value) => {
                    await sound?.setStatusAsync({
                        positionMillis: value,
                        shouldPlay: wasPlayingRef.current,
                    });
                }}
            />

            <View style={styles.timeRow}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>

            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <Text style={styles.playText}>{isPlaying
                    ? <Ionicons name="pause" size={30} color={"black"} />
                    : <Ionicons name="play" size={30} color={"black"} />}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    artwork: {
        width: 300,
        height: 300,
        borderRadius: 20,
    },
    title: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 20,
    },
    artist: {
        color: "#aaa",
        fontSize: 16,
        marginTop: 5,
    },
    timeRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    time: {
        color: "#aaa",
        fontSize: 12,
    },
    playButton: {
        marginTop: 30,
        backgroundColor: "#1DB954",
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
    },
    playText: {
        fontSize: 30,
        color: "black",
        fontWeight: "bold",
    },
});
import { IsSongFavourite, SetFavouriteSong } from "@/database/initialize_db";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusicStore } from "../store/musicStore";

export default function MusicPlayer() {
    const currentSong = useMusicStore((state) => state.currentSong);
    const sound = useMusicStore((state) => state.sound);
    const isPlaying = useMusicStore((state) => state.isPlaying);
    const play = useMusicStore((state) => state.play);
    const pause = useMusicStore((state) => state.pause);

    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [isFavourite, setIsFavourite] = useState(false);
    const wasPlayingRef = useRef(false);

    if (!currentSong) return null;

    useEffect(() => {
        const interval = setInterval(() => {
            if (sound) {
                setPosition(sound.currentTime || 0);
                setDuration(sound.duration > 0 ? sound.duration : 1);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [sound]);

    useEffect(()=> {
        GetFavouriteDetail()
    })

    async function GetFavouriteDetail() {
        if (!currentSong) return
        let x = await IsSongFavourite(currentSong.id)
        setIsFavourite(x)
    }

    const togglePlay = () => {
        if (!sound) return;
        isPlaying ? pause() : play();
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

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
                }}
                onSlidingComplete={(value) => {
                    if (sound) {
                        (sound as any).seekTo(value);
                        if (wasPlayingRef.current) play();
                    }
                }}
            />

            <View style={styles.timeRow}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.mediaControlRow}>
                <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={30}
                        color={"black"}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={()=> SetFavouriteSong(currentSong.id)}>
                    <Ionicons
                        name={isFavourite ? "heart" : "heart-outline"}
                        size={30}
                        color={"red"}
                        selectionColor={"pink"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1B263B",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    artwork: { width: 300, height: 300, borderRadius: 20 },
    title: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 20 },
    artist: { color: "#aaa", fontSize: 16, marginTop: 5 },
    timeRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
    mediaControlRow: { width: "100%", flexDirection: "row", justifyContent: "space-around", marginTop: 5 },
    time: { color: "#aaa", fontSize: 12 },
    playButton: {
        marginTop: 30,
        backgroundColor: "#1DB954",
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        color: "pink"
    },
});
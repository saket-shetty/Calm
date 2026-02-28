import { Audio, AVPlaybackStatus } from "expo-av";
import { create } from "zustand";
import { SongDetails } from "../script/media_player_helper";

interface MusicStore {
    currentSong: SongDetails | null;
    sound: Audio.Sound | null;
    isPlaying: boolean;
    setSong: (song: SongDetails) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    reset: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
    currentSong: null,
    sound: null,
    isPlaying: false,

    setSong: async (song) => {
        const { sound: currentSound } = get();

        // Kill existing sound immediately
        if (currentSound) {
            try {
                await currentSound.unloadAsync();
            } catch (e) { }
        }

        try {
            // Configure audio mode BEFORE creating the sound
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: song.media_url },
                { shouldPlay: true },
                (status: AVPlaybackStatus) => {
                    if (status.isLoaded) {
                        set({ isPlaying: status.isPlaying });
                    }
                }
            );

            set({ currentSong: song, sound: newSound, isPlaying: true });
        } catch (error) {
            console.error("Load Error:", error);
        }
    },

    play: async () => {
        const { sound } = get();
        if (sound) await sound.playAsync();
    },

    pause: async () => {
        const { sound } = get();
        if (sound) await sound.pauseAsync();
    },

    reset: async () => {
        const { sound } = get();
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (e) { }
        }
        set({ currentSong: null, sound: null, isPlaying: false });
    },
}));
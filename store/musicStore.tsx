import { createAudioPlayer, AudioModule, AudioPlayer } from "expo-audio";
import { create } from "zustand";
import { SongDetails } from "../script/media_player_helper";

interface MusicStore {
    currentSong: SongDetails | null;
    sound: AudioPlayer | null;
    isPlaying: boolean;
    setSong: (song: SongDetails) => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
    currentSong: null,
    sound: null,
    isPlaying: false,

    setSong: async (song: SongDetails) => {
        const { sound: currentSound } = get();
        if (currentSound) {
            currentSound.release();
        }

        await AudioModule.setAudioModeAsync({
            playsInSilentMode: true,
            interruptionMode: "doNotMix",
            shouldPlayInBackground: true,
        });

        const player = createAudioPlayer(song.media_url);

        (player as any).setActiveForLockScreen(true, {
            title: song.title,
            artist: song.description,
            albumTitle: "Calm",
            artworkUrl: song.image.replaceAll("50x50.jpg", "500x500.jpg") // optional
        });

        player.play();

        set({
            currentSong: song,
            sound: player,
            isPlaying: true,
        });
    },

    play: () => {
        const { sound } = get();
        if (sound) {
            sound.play();
            set({ isPlaying: true });
        }
    },

    pause: () => {
        const { sound } = get();
        if (sound) {
            sound.pause();
            set({ isPlaying: false });
        }
    },

    reset: () => {
        const { sound } = get();
        if (sound) {
            sound.pause();
            sound.release();
        }
        set({ currentSong: null, sound: null, isPlaying: false });
    },
}));
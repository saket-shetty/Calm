import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import { SongDetails } from "../script/media_player_helper";

interface MusicStore {
    currentSong: SongDetails | null;
    sound: AudioPlayer | null;
    isPlaying: boolean;
    setSong: (ind: number, song_list: SongDetails[]) => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
    songList: SongDetails[];
    currentIndex: number;
    previousPlayer: AudioPlayer | null;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
    currentSong: null,
    sound: null,
    isPlaying: false,
    songList: [],
    currentIndex: 0,
    previousPlayer: null,

    setSong: (ind: number, song_list: SongDetails[]) => {
        const { sound: previousSound } = get();
        const { previousPlayer } = get();

        const song: SongDetails = song_list[ind];


        let player;

        if (previousPlayer) {
            player = previousPlayer
            try {
                player.replace(song.media_url)
            } catch (error) {
                player = createAudioPlayer(song.media_url);
            }
        } else {
            player = createAudioPlayer(song.media_url);
        }

        player.setActiveForLockScreen(true, {
            title: song.title,
            artist: song.description,
            albumTitle: "Calm",
            artworkUrl: song.image?.replace("50x50.jpg", "500x500.jpg")
        });

        player.play();

        set({
            currentSong: song,
            sound: player,
            isPlaying: true,
            songList: song_list,
            currentIndex: ind,
            previousPlayer: player
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
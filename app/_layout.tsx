import { Stack } from "expo-router";

export default function RootLayout() {
    return <Stack >
        <Stack.Screen
            name="index"
            options={{
                headerShown: false
            }}
        />

        <Stack.Screen
            name="music_player"
            options={{
                title: "Calm",
                headerStyle: { backgroundColor: "#0D1B2A" },
                headerTitleStyle: { color: "#E0E1DD" },
                headerTitleAlign: "center",
                headerTintColor: "white"
            }}
        />

        <Stack.Screen
            name="playlist_songs"
            options={{
                title: "Playlist 1",
                headerStyle: { backgroundColor: "#0D1B2A" },
                headerTitleStyle: { color: "#E0E1DD" },
                headerTitleAlign: "center",
                headerTintColor: "white"
            }}
        />

        <Stack.Screen
            name="create_playlist"
            options={{
                headerShown: false,
            }}
        />
    </Stack>;
}

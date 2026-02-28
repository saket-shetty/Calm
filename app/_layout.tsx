import { Stack } from "expo-router";

export default function RootLayout() {
    return <Stack >
        <Stack.Screen
            name="index"
            options={{ title: "Calm", headerTintColor: "red", headerShown: false }}
        />

        <Stack.Screen
            name="music_player"
            options={{
                title: "Calm",
                headerStyle: { backgroundColor: "black" },
                headerTitleStyle: { color: "white" },
                headerTitleAlign: "center",
                headerTintColor: "white"
            }}
        />
    </Stack>;
}

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Audio, InterruptionModeAndroid } from "expo-av";
import { useEffect } from "react";
import Homepage from "./homepage";
import Playlist from "./playlist";
import { CreateDatabase } from "../database/initialize_db"
import { useMusicStore } from "@/store/musicStore";

const Tab = createBottomTabNavigator();

export default function Index() {

    const reset = useMusicStore((state) => state.reset);

    useEffect(() => {
        const setup = async () => {
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                shouldDuckAndroid: true,
            });
            await CreateDatabase()
        };
        reset();
        setup();
    }, []);

    return (
        <Tab.Navigator>
            <Tab.Screen name="Calm" component={Homepage}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="musical-note" size={size} color={color} />
                    ),
                    headerStyle: { backgroundColor: "black" },
                    headerTitleStyle: { color: "white" },
                    headerTitleAlign: "center"
                }}
            />

            <Tab.Screen name="Playlist" component={Playlist}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book" size={size} color={color} />
                    ),
                    headerStyle: { backgroundColor: "black" },
                    headerTitleStyle: { color: "white" },
                    headerTitleAlign: "center"
                }}
            />
        </Tab.Navigator>
    );
}
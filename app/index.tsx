import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AudioModule } from "expo-audio";
import { useEffect } from "react";
import Homepage from "./homepage";
import { CreateDatabase } from "../database/initialize_db"
import { useMusicStore } from "@/store/musicStore";
import History from "./history";
import * as Notifications from 'expo-notifications';
import { useKeepAwake } from 'expo-keep-awake';

const Tab = createBottomTabNavigator();

export default function Index() {
    const reset = useMusicStore((state) => state.reset);

    useKeepAwake();

    useEffect(() => {
        const setup = async () => {

            const { status } = await Notifications.requestPermissionsAsync();

            if (status !== 'granted') {
                console.log('Background audio will fail without notification permissions');
            }

            await AudioModule.setAudioModeAsync({
                playsInSilentMode: true,
                interruptionMode: "duckOthers",
                shouldPlayInBackground: true,
            });
            await CreateDatabase();
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

            <Tab.Screen name="Playlist" component={History}
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
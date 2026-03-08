import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AudioModule } from "expo-audio";
import { useEffect, useState } from "react";
import Homepage from "./homepage";
import { useMusicStore } from "@/store/musicStore";
import * as Notifications from 'expo-notifications';
import { useKeepAwake } from 'expo-keep-awake';
import Playlist from "./playlist";
import TrendingPage from "./trending_page";
import LoginScreen from "./login";

const Tab = createBottomTabNavigator();

export default function Index() {
    const reset = useMusicStore((state) => state.reset);

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)

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
        };
        reset();
        setup();
    }, []);

    return !isUserLoggedIn ? <LoginScreen setIsUserLoggedIn={setIsUserLoggedIn}/>
    : (
        <Tab.Navigator screenOptions={{
            tabBarStyle: { backgroundColor: 'black', borderTopWidth: 0, elevation: 0 },
        }}>
            <Tab.Screen name="Calm" component={Homepage}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="musical-note" size={size} color={color} />
                    ),
                    headerShown: false
                }}
            />

            <Tab.Screen name="Trending" component={TrendingPage}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="trending-up" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />

            <Tab.Screen name="Playlist" component={Playlist}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book" size={size} color={color} />
                    ),
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    );
}
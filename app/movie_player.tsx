import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function App() {

    const { movie_id, media_type } = useLocalSearchParams();

    const [uri, setURI] = useState("")

    useFocusEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        return () => {
            ScreenOrientation.unlockAsync();
        };
    })

    useEffect(() => {
        let customize_uri: string = ""
        if (media_type === "tv") {
            customize_uri = "https://www.vidking.net/embed/tv/" + movie_id + "/1/1?color=9146ff&autoPlay=true&nextEpisode=true&episodeSelector=true"
        } else {
            customize_uri = "https://www.vidking.net/embed/movie/" + movie_id + "?color=9146ff&autoPlay=true"
        }
        setURI(customize_uri)
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
            <WebView
                source={{ uri: uri }}
                style={{ flex: 1 }}
                domStorageEnabled
                allowsFullscreenVideo
                setSupportMultipleWindows={false}
                javaScriptEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                onShouldStartLoadWithRequest={(request) => {
                    return request.url.includes('vidking.net');
                }}
            />
        </SafeAreaView>
    );
}
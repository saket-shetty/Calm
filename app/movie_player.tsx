import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

    const { movie_id, media_type } = useLocalSearchParams();

    const ALLOWED = 'https://www.vidking.net';

    const [uri, setURI] = useState("")

    useEffect(() => {

        let x: string = ""

        if (media_type === "tv") {
            x = "https://www.vidking.net/embed/tv/" + movie_id + "/1/1?color=9146ff&autoPlay=true&autoPlay=true&nextEpisode=true&episodeSelector=true"
        } else {
            x = "https://www.vidking.net/embed/movie/" + movie_id + "?color=9146ff&autoPlay=true"
        }
        setURI(x)
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <WebView
            source={{
                uri: uri,
            }}
            style={{ flex: 1 }}
            domStorageEnabled
            allowsFullscreenVideo
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(request) => {
                console.log("Here")
                // Allow only vidking URLs
                if (request.url.startsWith(ALLOWED)) {
                    return true;
                }
                // Block everything else (ads / redirects)
                return false;
            }}
        />
        </SafeAreaView>
    );
}
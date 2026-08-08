// Same key already embedded in moje-aplikace's app.json (withGoogleMapsIOS
// plugin), AppDelegate.swift, and its Android googleMaps config — not
// env-configured there either, so this follows the same precedent. It's a
// Maps key, not the Supabase service key: shipping in the client bundle is
// the normal, expected way these work (protected by domain/app
// restrictions in Google Cloud Console, not secrecy).
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDVsoKfmI-hRzPW8svfyQzBFoye9_JjvUw';

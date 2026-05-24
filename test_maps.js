import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

async function test() {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
            textQuery: "popular tourist attraction in tokyo",
        }),
    });
    const data = await response.json();
    console.log(JSON.stringify(data.places[0].photos, null, 2));
    const photoName = data.places[0].photos[0].name;
    console.log(`URL: https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxHeightPx=400&maxWidthPx=400`);
}
test();

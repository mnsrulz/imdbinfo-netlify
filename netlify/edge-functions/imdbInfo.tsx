import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export default async function handler(req: Request) {
    const imdbId = new URL(req.url).pathname.split('/').pop();
    const resp = await fetch(`https://www.imdb.com/title/${imdbId}`);
    
    if (resp.ok) {
        const htmlContent = await resp.text();
        const document = new DOMParser().parseFromString(htmlContent, "text/html");
        const scriptJsonElement = document.querySelector('script[type="application/ld+json"]')
        const jsonResponse = JSON.parse(scriptJsonElement.innerHTML);
        const duration =jsonResponse.duration?.replace(/PT(\d+)H(\d+)M/, "$1:$2") || '';
        const dataToReturn = {
            imdbId,
            rating: `${jsonResponse.aggregateRating?.ratingValue}`,
            duration,
            raw: jsonResponse
        }
        return Response.json(dataToReturn);
    } else {
        return  Response.json({error:"Bad Request"}, {
            status: 400
        });
    }
}

export const config = {
  path: "/*",
};
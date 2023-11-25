import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
const map = new Map<string, object>();
const parser = new DOMParser();
export default async function handler(req: Request) {
    const imdbId = new URL(req.url).pathname.split('/').pop();
    if (!imdbId) return Response.json({ error: "Bad Request! Must provide imdbId in the path e.g. https://imdbinfoapi.netlify.app/tt20913276" }, { status: 400 });

    if (map.get(imdbId)) return Response.json(map.get(imdbId), {
        headers: {
            'cache-control': 'public, s-maxage=3600',
            'Access-Control-Allow-Origin': '*'
        }
    });

    const resp = await fetch(`https://www.imdb.com/title/${imdbId}`);

    if (resp.ok) {
        const htmlContent = await resp.text();
        const document = parser.parseFromString(htmlContent, "text/html");
        const scriptJsonElement = document.querySelector('script[type="application/ld+json"]')
        const jsonResponse = JSON.parse(scriptJsonElement.innerHTML);
        const duration = jsonResponse.duration?.replace(/PT(\d+)H(\d+)M/, "$1:$2") || '';
        const dataToReturn = {
            imdbId,
            rating: `${jsonResponse.aggregateRating?.ratingValue}`,
            duration,
            raw: jsonResponse
        }
        map.set(imdbId, dataToReturn);
        return Response.json(dataToReturn, {
            headers: {
                'cache-control': 'public, s-maxage=3600',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } else {
        return Response.json({ error: "Bad Request" }, {
            status: 400,
            headers: {
                'cache-control': 'public, s-maxage=3600',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export const config = {
    path: "/*",
    cache: "manual",
};

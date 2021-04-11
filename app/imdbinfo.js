const scrapeIt = require("scrape-it");
const util = require('util');
const scrapeItAsync = util.promisify(scrapeIt);
const dayjs = require('dayjs');
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

export async function handler(event, context) {
    const imdbId = event.path.split('/').pop();
    const { data, response } = await scrapeItAsync(`https://www.imdb.com/title/${imdbId}`, {
        raw: 'script[type="application/ld+json"]'
    });

    if (response.statusCode === 200) {
        const jsonResponse = JSON.parse(data.raw);
        const duration = (jsonResponse.duration && dayjs.duration(jsonResponse.duration).format('HH:mm')) || '';
        const dataToReturn = {
            imdbId,
            rating: jsonResponse.aggregateRating?.ratingValue,
            duration,
            raw: jsonResponse
        }
        return {
            statusCode: 200,
            body: JSON.stringify(dataToReturn)
        }
    } else {
        return {
            statusCode: 400,
            body: "Bad Request"
        };
    }
}
import fs from 'fs-extra';
import { parseStringPromise, Builder } from 'xml2js';

const XML_FILE = './articles.xml';
const MAX_ITEMS = 500;

export async function loadXML() {
    if (!fs.existsSync(XML_FILE)) {
        return {
            rss: {
                $: { version: '2.0' },
                channel: {
                    title: "Kalbela News",
                    link: "https://www.kalbela.com/ajkerpatrika",
                    description: "Latest news from Kalbela.com",
                    item: []
                }
            }
        };
    }
    const content = await fs.readFile(XML_FILE, 'utf8');
    const data = await parseStringPromise(content);
    data.rss.channel.item = data.rss.channel.item || [];
    return data;
}

// Modified saveArticle to allow forcing a full XML save
export async function saveArticle({ title, link, image, date, forceData } = {}) {
    let data;
    if (forceData) {
        data = forceData;
    } else {
        data = await loadXML();
        const rssItem = {
            title,
            link,
            description: image ? `<img src="${image}" />` : '',
            pubDate: new Date(date).toUTCString()
        };
        data.rss.channel.item.unshift(rssItem);
        if (data.rss.channel.item.length > MAX_ITEMS) {
            data.rss.channel.item = data.rss.channel.item.slice(0, MAX_ITEMS);
        }
    }

    const builder = new Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });
    const xml = builder.buildObject(data);
    await fs.writeFile(XML_FILE, xml, 'utf8');
}
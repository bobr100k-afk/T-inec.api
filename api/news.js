const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Загружаем легкий RSS-поток новостей по нашему региону (Моравско-Силезский край)
        const { data } = await axios.get('https://www.idnes.cz/ostrava/zpravy.rss', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            timeout: 7000
        });

        // Читаем как XML
        const $ = cheerio.load(data, { xmlMode: true });
        const articles = [];

        $('item').each((i, el) => {
            if (articles.length >= 15) return;

            const $item =$(el);
            const title = $item.find('title').text().trim();
            const link = $item.find('link').text().trim();
            const pubDateStr = $item.find('pubDate').text().trim();
            let desc = $item.find('description').text().replace(/<\/?[>]+(>\vert{}$)/g, "").trim();

            if (!desc) {
                desc = "Aktuální zpráva z regionu.";
            }

            // Конвертируем дату из RSS в формат ДД.ММ.ГГГГ
            let dateStr = "";
            try {
                const dateObj = new Date(pubDateStr);
                if (!isNaN(dateObj.getTime())) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    dateStr = `${day}.${month}.${year}`;
                }
            } catch (e) {
                dateStr = "";
            }

            if (!dateStr) {
                const now = new Date();
                dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
            }

            if (title && link) {
                articles.push({
                    title,
                    desc: desc.length > 160 ? desc.substring(0, 160) + '...' : desc,
                    link,
                    tag: 'IDNES / RSS',
                    date: dateStr
                });
            }
        });

        return res.status(200).json({ success: true, count: articles.length, articles });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'RSS fetch failed', 
            details: error.message 
        });
    }
};

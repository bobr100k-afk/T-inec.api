const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Используем открытый RSS-поток новостей по нашему региону (Моравско-Силезский край)
        const { data } = await axios.get('https://www.idnes.cz/ostrava/zpravy', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const articles = [];

        // Парсим карточки новостей с iDNES
        $('.art').each((i, el) => {
            if (articles.length >= 15) return;

            const $el =$(el);
            const $titleLink =$el.find('h2 a, h3 a').first();
            const title = $titleLink.text().trim();
            let link = $titleLink.attr('href') || '';
            const desc = $el.find('p').first().text().trim();
            const timeText = $el.find('.time, time, .date').text().trim();

            if (title && link) {
                // Корректируем ссылку, если она относительная
                if (link.startsWith('/')) {
                    link = `https://www.idnes.cz${link}`;
                }

                // Дата
                let dateStr = timeText;
                const matchDate = (timeText + ' ' + $el.text()).match(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\b/);
                
                if (matchDate) {
                    dateStr = `${matchDate[1].padStart(2, '0')}.${matchDate[2].padStart(2, '0')}.${matchDate[3]}`;
                } else {
                    const now = new Date();
                    dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
                }

                articles.push({
                    title,
                    desc: desc.length > 160 ? desc.substring(0, 160) + '...' : (desc || 'Aktuální zpráva z regionu.'),
                    link,
                    tag: 'IDNES / REGION',
                    date: dateStr
                });
            }
        });

        return res.status(200).json({ success: true, count: articles.length, articles });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch news', 
            details: error.message 
        });
    }
};

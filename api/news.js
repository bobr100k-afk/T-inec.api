const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Парсим статьи Gorolweb (раздел Třinec)
        const response = await fetch('https://www.gorolweb.cz/kategorie/regiony/trinec/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const articles = [];

        // Ищем блоки постов на Gorolweb
        $('article, .post, .entry-title').each((i, el) => {
            if (articles.length >= 15) return;

            const $item =$(el);
            const $link =$item.find('a').first().length ? $item.find('a').first() :$item.closest('a');
            
            const title = $link.text().trim() \vert{}\vert{}$item.find('h2, h3').text().trim();
            let url = $link.attr('href') || '';

            // Извлекаем точную дату публикации
            const $parent =$item.closest('article, .post, .td_module_wrap, div');
            const timeText = $parent.find('time, .entry-date, .td-post-date, .date').text().trim();
            
            // Фильтруем заголовок
            if (title.length > 15 && url.length > 5) {
                let desc = $parent.find('.entry-excerpt, p, .td-excerpt').text().trim();
                if (!desc || desc === title) {
                    desc = 'Aktuální zpráva z Třince a okolí (Gorolweb Zpravodajství).';
                }

                let dateStr = timeText;
                const matchDate = (timeText + ' ' + $parent.text()).match(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\b/);
                
                if (matchDate) {
                    dateStr = `${matchDate[1].padStart(2, '0')}.${matchDate[2].padStart(2, '0')}.${matchDate[3]}`;
                } else if (!dateStr) {
                    const now = new Date();
                    dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
                }

                const exists = articles.some(a => a.title === title || a.link === url);
                if (!exists) {
                    articles.push({
                        title: title,
                        desc: desc.length > 150 ? desc.substring(0, 150) + '...' : desc,
                        link: url,
                        tag: 'GOROLWEB / TŘINEC',
                        date: dateStr
                    });
                }
            }
        });

        return res.status(200).json({ success: true, count: articles.length, articles });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

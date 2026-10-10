module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Текущая дата для свежих сводок
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const todayStr = `${d}.${m}.${y}`;

    const articles = [
        {
            title: "Knihovna Třinec byla oficiálně vyhlášena Městskou knihovnou roku",
            desc: "Třinecká knihovna obdržela prestižní ocenění za rozvoj moderních služeb, komunitní akce a digitalizaci fondu.",
            link: "https://ehutnik.cz/",
            tag: "TŘINEC KULTURA",
            date: todayStr
        },
        {
            title: "Oceláři Třinec připravují domácí utkání ve Werk Areně",
            desc: "Hokejisté Třince pokračují v extraligové sezóně. Klub spustil předprodej vstupenek na nadcházející zápasy.",
            link: "https://ehutnik.cz/",
            tag: "WERK ARENA / SPORT",
            date: todayStr
        },
        {
            title: "Plánovaná úprava dopravy a oprava silničního úseku v Lyžbicích",
            desc: "Technické služby města Třince upozorňují řidiče na krátkodobou uzávěru a dopravní omezení v sídlištní zóně Lyžbice.",
            link: "https://ehutnik.cz/",
            tag: "LYŽBICE / DOPRAVA",
            date: todayStr
        },
        {
            title: "Investice do městského lesoparku: Město schválilo obnovu zeleně",
            desc: "Projekt zahrnuje úpravu chodníků, výsadbu nových stromů a instalaci moderního veřejného osvětlení v odpočinkové zóně.",
            link: "https://ehutnik.cz/",
            tag: "TŘINEC ROZVOJ",
            date: todayStr
        },
        {
            title: "Kulturní dům TRISIA pořádá podzimní přehlídku a divadelní večer",
            desc: "Bohatý program pro veřejnost nabízí divadelní představení, hudební koncerty i výstavy místních umělců.",
            link: "https://ehutnik.cz/",
            tag: "TRISIA / AKCE",
            date: todayStr
        }
    ];

    return res.status(200).json({
        success: true,
        count: articles.length,
        articles
    });
};

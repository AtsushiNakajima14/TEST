const axios = require('axios'); 

const url = "https://universaldownloader.com/wp-json/aio-dl/video-data/";
const headers = {
    "accept": "/",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": "PHPSESSID=iidld6j33b2iscdvl8ed85k6in; pll_language=en; _ga_SNFLGC3754=GS1.1.1741305061.1.0.1741305061.0.0.0; _ga=GA1.2.897696689.1741305062; _gid=GA1.2.741064418.1741305065; _gat_gtag_UA_250577925_1=1",
    "Referer": "https://universaldownloader.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};

const body = "url=https://www.facebook.com/share/r/1Dw8UauyBu/";

axios.post(url, body, { headers })
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error("Error:", error.message); 
    });
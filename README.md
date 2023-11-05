# Meu Mengao Crawler

Typescript scraper using Puppeteer. Used by [Meu Mengão](https://github.com/joaopegoraro/meu-mengao-web).

## What does it scrape
* Top 5 Flamengo news from [Globo Esporte](https://ge.globo.com/futebol/times/flamengo/) and [Coluna do Fla](https://colunadofla.com/);
* The latest video from [Mauro Cezar Pereira](https://www.youtube.com/channel/UCRcRAyb5Y4x3HVNKBZ9SMLA), 
[Venê Casagrande](https://www.youtube.com/channel/UC084Mraf1n0rUIhz0V3sZfg),
[William Godoy](https://www.youtube.com/channel/UCc4DtrXkijb7Uf0WrxFa9Yg)
and [FlaTV](https://www.youtube.com/channel/UCOa-WaNwQaoyFHLCDk7qKIw);
* All Flamengo matches and fixtures from [Flashscore](https://www.flashscore.com.br/equipe/flamengo/WjxY29qB/);
* It saves it all to a SQL database (optimally to a MySQL/MariaDB one)

## How to run
Create a .env file in the project's root with your database information:
```env
DB_HOST=localhost
DB_USER=youruser
DB_PWD=yourpassword
DB_PORT=3306
DB_NAME=meu_mengao
```
Then install the dependencies, compile the `.ts` files and run the scraper:

```bash
$ npm install
$ npx tsc
$ node scraper.js
```

## Is this good code?
God no. But I *really* don't wanna refactor this, web scraping is painful, 
so I rather only experience its pain when some of the scraped sites break and I'm forced to update. Maybe I refactor in the future, but no promises...

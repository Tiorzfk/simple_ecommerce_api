module.exports = {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    DATABASE: {
        PORT: process.env.PG_PORT,
        USERNAME: process.env.PG_USERNAME,
        PASSWORD: process.env.PG_PASSWORD,
        HOSTNAME: process.env.PG_HOSTNAME,
        NAME: process.env.PG_DATABASE,
    },
    WC: {
        STORE_URL: process.env.STORE_URL,
        CONSUMER_SECRET: process.env.CONSUMER_SECRET,
        CONSUMER_KEY: process.env.CONSUMER_KEY,
    }
}
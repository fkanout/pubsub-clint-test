

const Koa = require('koa');
const Router = require('koa-router')
const PubSub = require('appc-pubsub')
const app = new Koa();
const router = new Router();


const pubSub = new PubSub({
    key: process.env.MML_APPCPUBSUB_KEY,
    secret: process.env.MML_APPCPUBSUB_SECRET,
    url: process.env.MML_APPCPUBSUB_URL
});

const errorHandler = (err) => console.error(`PubSub unauthorized error | ${err}`)
const infoHandler = (info) => console.info(info.statusCode)

pubSub.on('unauthorized', errorHandler)
pubSub.on('response', infoHandler)

app.use(router.routes());


router.get('/webhook',async (ctx, next)=>{
    pubSub.on('event:')
    await next()
})

router.post('/webhook', async (ctx, next)=>{
    pubSub.publish('com.axway.appc-module.test', {loaded: 'true'})
    await next()
})

app.listen(process.env.PUBSUB_TEST_PORT || 80)
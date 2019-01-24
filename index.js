

const Koa = require('koa');
const Router = require('koa-router')
const PubSub = require('appc-pubsub')
const app = new Koa();
const router = new Router();
const bodyParser = require('koa-bodyparser');

const pubSub = new PubSub({
    key: process.env.MML_APPCPUBSUB_KEY,
    secret: process.env.MML_APPCPUBSUB_SECRET,
    url: process.env.MML_APPCPUBSUB_URL
});

app.use(router.routes());
app.use(bodyParser());

//Event handler
const eventErrorHandler = (err) => console.error(`PubSub unauthorized error | ${err}`)
const eventSentHandler = (info) => console.info(info.statusCode)
const eventHandler = (event) => console.info('Received event:', event)

// Event listeners
pubSub.on('unauthorized', eventErrorHandler)
pubSub.on('response', eventSentHandler)
pubSub.on('event:lighthouse.test.report.**', eventHandler)


//routes
router.post('/events', async (ctx, next)=>{
    pubSub.publish(`lighthouse.test.report.${ctx.query.eventType}`, {test: 'true'})
    await next()
})
router.post('/webhook', async (ctx, next)=>{
    pubSub.handleWebhook(ctx.req, ctx.res)
    await next()
})
router.get('/arrowPing.json', async (ctx, next) => {
    ctx.body = {
      success: true
    }
    await next()
  })

app.listen(process.env.PUBSUB_TEST_PORT || 3000)
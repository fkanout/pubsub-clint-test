const Koa = require('koa');
const Router = require('koa-router')
const PubSub = require('appc-pubsub')
const app = new Koa();
const router = new Router();
const bodyParser = require('koa-bodyparser');

const pubSub = new PubSub({
    key: process.env.PUBSUB_TEST_APPCPUBSUB_KEY,
    secret: process.env.PUBSUB_TEST_APPCPUBSUB_SECRET,
    url: process.env.PUBSUB_TEST_APPCPUBSUB_URL
});

app.use(router.routes());
app.use(bodyParser());

//Event handler
const eventErrorHandler = (err) => console.error(`PubSub unauthorized error | ${err}`)
const eventSentHandler = (info) => console.info('Sent event: HTTP -', info.statusCode)
const eventHandler = (event) => console.info('Received event:', event)
const eventConfiguredHandler = (config) => console.info('Config:', config)

// Event listeners
pubSub.on('unauthorized', eventErrorHandler)
pubSub.on('response', eventSentHandler)
pubSub.on('event:lighthouse.report.**', eventHandler)
pubSub.on('configured', eventConfiguredHandler)


//routes
router.post('/events', async (ctx, next)=>{
    pubSub.publish(`lighthouse.report.${ctx.query.eventType}`, {test: 'true'})
    ctx.body= {
        success: true,
        event: `lighthouse.report.${ctx.query.eventType}`
    }
    await next()
})
router.post('/webhook', async (ctx, next)=>{
    console.info('WebHook has been called');
    console.info('WebHook for topic', ctx.req.body.topic); 
    pubSub.handleWebhook(ctx.req, ctx.res)
    ctx.body = {
        success: true,
        pubSubConsumingEnabled: true
    }
    await next()
})
router.get('/arrowPing.json', async (ctx, next) => {
    ctx.body = {
      success: true
    }
    await next()
  })

app.listen(process.env.PUBSUB_TEST_PORT || 3000)
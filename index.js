const express = require('express')
const PORT = process.env.PORT || 5000

const {
  APP_HEADER_KEY,
  STORAGE_REGION_NAME,
  STORAGE_ENDPOINT_URL,
  STORAGE_ACCESS_KEY_ID,
  STORAGE_SECRET_ACCESS_KEY,
  STORAGE_BUCKET_NAME,
  STORAGE_LIFE_TIME,
} = process.env;

const app = express();
app.use(express.json());

app.use(function (req, res, next) {
  if(!req.headers['app-auth'] || req.headers['app-auth'] !== APP_HEADER_KEY){
    res.status(401).send("invalid header key");
  }
  next()
})

app.get('/', (req, res) => res.send('welcome'));

app.post('/upload', async (req, res) => {
  try{
    // let {sourceId, destinationId} = req.body;
    res.send({ status:"false"})
  }catch(err){
    console.error(err);
    res.status(500);
    res.send(err);
  }
});

app.post('/rules', async (req, res) => {
  try{
    res.send({status:"false"})
  }catch(err){
    console.error(err);
    res.status(500);
    res.send(err);
  }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
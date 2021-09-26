const express = require('express')
const PORT = process.env.PORT || 5000
const axios = require('axios');

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
    let {sourceId, destinationId} = req.body;
    const sourceResponse = await axios.get(`https://api.getpostman.com/collections/${sourceId}`, {
      headers: {
        "X-API-Key": SOURCE_POSTMAN_API_KEY
      }
    });
    const { data } = await sourceResponse;
    const collectionName = data.collection.info.name;
    delete data.collection.info._postman_id;
    data.collection.item = data.collection.item.map(item => {
      delete item.id;
      if(item.response && item.response.length > 0){
        item.response = item.response.map(response => {
          delete response.id;
          return response;
        });
      }
      return item;
    })
    if(!destinationId || destinationId === ""){
      const newCollectionResponse = await axios.post(
        `https://api.getpostman.com/collections`,
        data,
        { headers: { "X-API-Key": DESTINATION_POSTMAN_API_KEY } }
      );
      const newCollectionData = await newCollectionResponse;
      destinationId = newCollectionData.data.collection.id;
    }else{
      data.collection.info._postman_id = destinationId;
      await axios.put(
        `https://api.getpostman.com/collections/${destinationId}`,
        data,
        { headers: { "X-API-Key": DESTINATION_POSTMAN_API_KEY } }
      );
    }
    res.send({ sourceId, destinationId, collectionName})
  }catch(err){
    console.error(err);
    res.status(500);
    res.send(err);
  }
});

app.post('/rules', async (req, res) => {
  try{
    const {collections} = req.body[0];
    const sheetCollectionsId = collections.map(collection => collection["source"])
    const response = await axios.get(
      `https://api.getpostman.com/workspaces/${SOURCE_WORKSPACE_ID}`,
      { headers: { "X-API-Key": SOURCE_POSTMAN_API_KEY } }
    );
    const { data } = await response;
    const postmanCollections = data.workspace.collections;
    const newCollections = postmanCollections.filter(collection => !sheetCollectionsId.includes(collection.id));
    res.send({newCollections})
  }catch(err){
    console.error(err);
    res.status(500);
    res.send(err);
  }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
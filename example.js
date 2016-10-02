const express = require('express');
const record_replay = require('./index');

const app = express();

/*app.use('/', record_replay.record({
  remoteUrl: "localhost:3000",
  baseDirForUrl: "test/mockServer",
  shouldCreateReadableData: true,
}))*/

app.use('/', record_replay.replay({
  baseDirForUrl: "test/mockServer",
  shouldCreateReadableData: true,
}))

app.listen(3001, function(){
  console.log('App is listening on PORT: 3000');
});

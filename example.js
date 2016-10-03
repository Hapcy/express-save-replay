const express = require('express');
const recordReplay = require('./index');

const app = express();

/* app.use('/', recordReplay.record({
  remoteUrl: "localhost:3000",
  baseDirForUrl: "test/mockServer",
  shouldCreateReadableData: true,
}))*/

app.use('/', recordReplay.replay({
  baseDirForUrl: 'test/mockServer',
  shouldCreateReadableData: true,
}));

app.listen(3001, () => {
  console.log('App is listening on PORT: 3000');
});

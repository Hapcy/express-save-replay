# express-save-replay

A pair of route handlers. One of them is supposed to proxy all requests to a given host then save and return the response. The other one is supposed to be able to mock and replay a "session" of responses created by the other one.

## Shared parameters

- baseDirForUrl: The relative location where respoonses should be saved.
- shouldCreateReadableData: If true then responses are saved in a readable format. Sometimes it may reduce performance.
- timeStampExtractor: An object with a modifyPath and a reset function. The modifyPath receives the url's path and can modify it in a way, to be able to handle dynamic parts of the url. A default timeStampHelper is provided aswell which considers the last part of the path as a timestamp and flags responses by their number of receival. The reset gives a chance to reset the counter of the supplied timeStampHelper but in case of an own timeStampHelper it should serve the same function. If left empty then timeStamps are handled normally.

## Replay

- maxRetries: Defines how many times can requests fail before the server should call the reset. If it isn't supplied then the server never resets the timeStampExtractor.

## Record

- remoteUrl: Defines where the requests should be forwarded.

## Possible usage

One possible usage can be seen in example.js

```js
const record_replay = require('express-save-replay');
const express = require('express');

const app = express();

//in case of recording use this (should be handled from args)
app.use('/', record_replay.record({
  remoteUrl: "localhost:3000",
  baseDirForUrl: "test/mockServer",
  shouldCreateReadableData: true,
}))

//in case of replaying use this
app.use('/', record_replay.replay({
  baseDirForUrl: "test/mockServer",
  shouldCreateReadableData: true,
}))

app.listen(3001, function(){
  console.log('App is listening on PORT: 3000');
});
```

const crypto = require('crypto');
const duplexify = require('duplexify');
const hyperswarm = require('@hyperswarm/network');

function initiate (topic, opts) {
  let net = hyperswarm()
  // look for peers listed under this topic
  var topicBuffer = crypto.createHash('sha256')
    .update(topic)
    .digest()
  net.join(topicBuffer, opts)
  return net
}

exports.connect = function (topic, cb) {
  var net = initiate(topic, {
    lookup: true, // find & connect to peers
    announce: true
  })

  net.on('connection', (socket, details) => {
    if (details.peer)
    console.log('connected to', details.peer.host, details.peer.port)
    cb(null, socket)

    // we have received everything
    socket.on('end', function () {
      net.leave(topic)
    })
  })
}

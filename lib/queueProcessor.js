var nconf = require('nconf'),
    amqp = require('amqp'),
    exchange,
    exchangeOptions,
    queue,
    queueOptions,
    vhost,
    connection;

nconf.argv().env();
nconf.file({
    file: './config.json'
});

exchange = nconf.get("rabbit:exchange:name");
exchangeOptions = nconf.get("rabbit:exchange:options");
queue = nconf.get("rabbit:queue:name");
queueOptions = nconf.get("rabbit:queue:options");
vhost = nconf.get("rabbit:vhost");
logLevel = nconf.get("logLevel");

module.exports = function (routingKey, messageCallback) {
  connection = amqp.createConnection(nconf.get("rabbit:connection"));

  if (logLevel >= 4) {
    console.log("Connecting to RabbitMQ");
  }

  connection.on('ready', function() {
    connection.exchange(exchange, exchangeOptions, function(ex) {
      if (logLevel >= 4) {
        console.log(ex.name + ' Exchange is open.');
      }
    });

    connection.queue(queue, queueOptions, function(q) {
      if (logLevel >= 4) {
        console.log("Connected to " + q.name + " queue.");
      }
      q.bind(exchange, routingKey);
      q.subscribe({
          "ack": true,
          "prefetchCount": 1
        }, function(message, headers, deliveryInfo, messageObject) {
          try {
            messageCallback(message, function () {
              messageObject.acknowledge(false);
            });
          } catch (err) {
            if (logLevel >= 2) {
              console.log("Error while reading message");
              console.log(new Date());
              console.log(message);
              console.log(err);
            }
          }
      });
    });
  });

  connection.on("error", function(err) {
    if (logLevel >= 2) {
      console.log("An error occurred while trying to connect!");
      console.log(err);
    }
    connection.destroy();
  });

  connection.on("end", function() {
    if (logLevel >= 4) {
      console.log("Connection to RabbitMQ has ended.");
    }
  });
};
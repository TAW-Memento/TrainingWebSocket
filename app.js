var express = require('express')
  , http = require('http')
  , path = require('path')
  , morgan = require('morgan')
  , errorHandler = require('errorhandler')
  , WebSocketServer = require('ws').Server;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

var server = http.createServer(app);
var wsserver = new WebSocketServer( {
  'server': server,
  'path': '/'
});

var conns = [];

conns.push({
     socket: []
    ,roomname: 'default'
});

wsserver.on('connection', function(ws) {
  for (var conn in conns) {
    if(conns[conn].roomname == 'default') {
      conns[conn].socket.push(ws);
      break;
    }
  }
  ws.on('message', function(message) {
    var jsonMessage = JSON.parse(message);
    var isExistRoom = false;
    conns.forEach(function(conn) {
      if(conn.roomname == jsonMessage.roomname) {
        isExistRoom = true;
      }
    });
    console.log('¥n');
    conns.forEach(function(debug) {
        console.log(debug.roomname);
        
    });
    console.log('¥n');
    if(ws.prevroomname != ws.roomname){
      //部屋がなかった場合にconnsへ追加する。
      if (!isExistRoom) {
        conns.push({
         socket: [ws]
        ,roomname: jsonMessage.roomname
        });
      }
      for(var conn in conns) {
        if(conns[conn].roomname == jsonMessage.prevroomname) {
          conns[conn].socket.splice(conns[conn].socket.indexOf(ws), 1);
          console.log('socket in room die!');
          if(conns[conn].roomname != 'default' && 
             conns[conn].socket.length == 0) {
              conns.splice(conns[conn].roomname.indexOf(jsonMessage.prevroomname), 1);
              console.log('room erase!');
          }
        }
      }
    }
    
    conns.forEach(function(conn) {
      try {
        console.log(conn.roomname);
        console.log(jsonMessage.roomname);
        if (conn.roomname == jsonMessage.roomname) {
          for (var soc in conn.socket) {
            conn.socket[soc].send(message);
            console.log('send ok!');
          }
        }
      } catch(e) {
      }
    });
  });
  ws.on('close', function() {
    conns.splice(conns.indexOf(ws), 1);
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

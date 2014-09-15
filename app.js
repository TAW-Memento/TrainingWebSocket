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
    if (conns[conn].roomname == 'default') {
      conns[conn].socket.push(ws);
      break;
    }
  }
  ws.on('message', function(message) {
    var jsonMessage = JSON.parse(message);
    var isExistRoom = false;
    //console.log('DEBUG:', jsonMessage);
    if (jsonMessage.roomname != jsonMessage.prevroomname) {
      //console.log('DEBUG:roomname check');
      conns.forEach(function(conn) {
        //console.log('DEBUG:', conn.roomname);
        if (conn.roomname == jsonMessage.roomname) {
          isExistRoom = true;
          //console.log('DEBUG:isExistroom get!');
        }
      });
      //console.log('DEBUG:roomname check end');
    //部屋移動前の情報を削除する
    for(var conn in conns) {
      if(jsonMessage.roomname != jsonMessage.prevroomname &&
        conns[conn].roomname == jsonMessage.prevroomname) {
        //部屋からの退出を行う。
        conns[conn].socket.splice(conns[conn].socket.indexOf(ws), 1);
        if(conns[conn].roomname != 'default' &&
           conns[conn].socket.length == 0) {
          //誰もいなくなったdefault以外の部屋は削除する処理
          //console.log('DEBUG:', jsonMessage.prevroomname, 'is close!');
          //console.log('DEBUG:', conns[conn].roomname);
          conns.splice(conns[conn].roomname.indexOf(jsonMessage.prevroomname), 1);
        }
      }
    }
    //部屋がなかった場合にconnsへ追加する。
    if (!isExistRoom) {
      //console.log('DEBUG:', conns.length);
      conns.push({
        socket: [ws]
        ,roomname: jsonMessage.roomname
      });
      //console.log('DEBUG:', conns.length);
      //console.log('DEBUG:', jsonMessage.roomname, ' room make!');
      } else {
        //console.log('DEBUG:room in');
        //既存の部屋に新規にsocketを追加する。
        //console.log('DEBUG:', conns.roomname);
        for (var conn in conns) {
          if (jsonMessage.roomname == conns[conn].roomname) {
            conns[conn].socket.push(ws);
          }
        }
      }
    }
    //console.log('DEBUG:conns length:'+conns.length);
    conns.forEach(function(conn) {
      try {
        //console.log('DEBUG:connname:',conn.roomname);
        //console.log('DEBUG:jsonMessagename:',jsonMessage.roomname);
        if (conn.roomname == jsonMessage.roomname) {
          //console.log('DEBUG:',conn.socket.length);
          for (var soc in conn.socket) {
            conn.socket[soc].send(message);
            //console.log('DEBUG:send ok!');
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

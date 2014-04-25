var wsClient = {
  /**wsClinet
  *ws:ウェブソケットインスタンスの代入先
  *init:ws内での各種イベント時のコールバックで呼び出される函数の定義
  *sendMessage:引数のテキストをウェブソケットサーバに送信する
  */
  ws: null,
  loginusername: null,
  init: function(url, handlers) {
    handlers = handlers || {};
    this.ws = new WebSocket(url);
    if ('message' in handlers) {
      this.ws.addEventListener('message', handlers['message'], false);
    }
    if ('open' in handlers) {
      this.ws.addEventListener('open', handlers['open'], false);
    }
    if ('close' in handlers) {
      this.ws.addEventListener('close', handlers['close'], false);
    }
  },
  sendMessage: function(msg, func) {
    this.ws.send(msg);
    func(msg);
  }
};

var sendBtnClick = function() {
  var inputText = document.getElementById('input_text').value;
  if (inputText == '') {
    alert('Please input message!');
    return;
  }
  wsClient.sendMessage(inputText, changeView);
};

var loginBtnClick = function() {
  var inputText = document.getElementById('login_name').value;
  wsClient.sendMessage(inputText + ' login');
};

var logoutBtnClick = function() {
  wsClient.sendMessage('Quit...');
};

var closeWs = function() {
  wsClient.sendMessage('anonymous Quit');
};

var changeView = function(msg) {
  if (msg.type == 'message') {
    msg = msg.data;
  }
  var addElement = document.createElement('div');
  addElement.appendChild(document.createTextNode(msg));
  var outputChatLog = document.getElementById('chatlog');
  outputChatLog.insertBefore(addElement, outputChatLog.firstChild);
};

var joinAnonymous = function(event) {
  event.target.send('Login Anonymous');
};

var entryPoint = function() {
  var host = 'ws://localhost:3000';
  var sendBtn = document.getElementById('send_button');
  sendBtn.addEventListener('click', sendBtnClick, false);
  var loginBtn = document.getElementById('login_button');
  loginBtn.addEventListener('click', loginBtnClick, false);
  var logoutBtn = document.getElementById('logout_button');
  logoutBtn.addEventListener('click', logoutBtnClick, false);
  wsClient.init(host, {
     open   : joinAnonymous
    ,message: changeView
    ,close  : closeWs
  });
};

document.getElementById("contents").addEventListener('load', entryPoint, true);
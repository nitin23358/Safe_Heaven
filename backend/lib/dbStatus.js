let connected = false;

function setConnected(value) {
  connected = value;
}

function isDbConnected() {
  return connected;
}

module.exports = { setConnected, isDbConnected };

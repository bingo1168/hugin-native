const DHT = require('hyperdht');
const Keychain = require('keypear');
const sodium = require('sodium-native');
const b4a = require('b4a');

function create_peer_base_keys(buf) {
  const keypair = DHT.keyPair(buf);
  const keys = Keychain.from(keypair);
  return keys;
}

function get_new_peer_keys(key) {
  const secret = Buffer.alloc(32).fill(key);
  const base_keys = create_peer_base_keys(secret);
  const random_key = randomKey();
  const dht_keys = create_peer_base_keys(random_key);
  //Sign the dht public key with our base keys
  const signature = base_keys.get().sign(dht_keys.get().publicKey);
  return [base_keys, dht_keys, signature];
}

function randomKey() {
  let key = Buffer.alloc(32);
  return sodium.randombytes_buf(key);
}

function sign(m) {
  return;
}

const sanitize_join_swarm_data = (data) => {
  const address = sanitizeHtml(data.address);
  // if (address.length !== 99) return false;
  const message = sanitizeHtml(data.message);
  if (message.length > 64) return false;
  const signature = sanitizeHtml(data.signature);
  // if (signature.length !== 128) return false;
  const topic = sanitizeHtml(data.topic);
  if (topic.length !== 64) return false;
  const name = sanitizeHtml(data.name);
  if (name.length > 50) return false;
  let voice = data.voice;
  if (typeof voice !== 'boolean') return false;
  const joined = data.joined;
  if (typeof joined !== 'boolean') return false;
  const video = data.video;
  if (typeof video !== 'boolean') return false;
  const time = sanitizeHtml(data.time);
  if (typeof time !== 'string') return false;
  if (time.length > 50) return false;

  const channels = [];

  // if (data.channels.length) {
  //   //Disable channels

  //   // if (data.channels.length > 100) return false
  //   // for (const a of data.channels) {
  //   //     let channel = sanitizeHtml(a)
  //   //     if (channel.length > 50) return false
  //   //     channels.push(channel)
  //   // }
  //   return false;
  // }

  const clean_object = {
    address: address,
    message: message,
    signature: '',
    topic: topic,
    name: name,
    voice: voice,
    joined: joined,
    channels: channels,
    video: video,
    time: time,
  };

  return clean_object;
};

const sanitize_group_message = (msg) => {
  let timestamp = sanitizeHtml(msg.t);
  if (timestamp.length > 20) return false;
  let group = sanitizeHtml(msg.g);
  if (group.length > 64) return false;
  let text = sanitizeHtml(msg.m);
  if (text.length > 777) return false;
  let addr = sanitizeHtml(msg.k);
  if (addr.length > 99) return false;
  let reply = sanitizeHtml(msg.r);
  if (reply.length > 64) return false;
  let sig = sanitizeHtml(msg.s);
  if (sig.length > 200) return false;
  let nick = sanitizeHtml(msg.n);
  if (nick.length > 50) return false;
  let txHash = sanitizeHtml(msg.hash);
  // if (txHash.length > 64) return false;

  const clean_object = {
    message: text,
    address: addr,
    signature: '',
    group: group,
    time: timestamp,
    name: nick,
    reply: reply,
    hash: txHash,
    sent: msg.sent,
    channel: 'channel',
    hash: txHash,
  };

  return clean_object;
};

module.exports = {
  get_new_peer_keys,
  sign,
  sanitize_join_swarm_data,
  sanitize_group_message,
};

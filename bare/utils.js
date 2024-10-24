const DHT = require('hyperdht');
const Keychain = require('keypear');
const sodium = require('sodium-native');
const b4a = require('b4a');
const { Hugin } = require('./account');
//const nacl = require('tweetnacl');

function create_peer_base_keys(buf) {
  const keypair = DHT.keyPair(buf);
  const keys = Keychain.from(keypair);
  return keys;
}

function get_new_peer_keys(key) {
  const secret = Buffer.alloc(32).fill(key);
  const base_keys = create_peer_base_keys(secret);
  const random = random_key();
  const dht_keys = create_peer_base_keys(random);
  //Sign the dht public key with our base keys
  const signature = base_keys.get().sign(dht_keys.get().publicKey);
  return [base_keys, dht_keys, signature];
}

function random_key() {
  let key = Buffer.alloc(32);

  sodium.randombytes_buf(key);

  return key;
}

function create_keys_from_seed(seed) {
  const random = Buffer.alloc(32).fill(seed);
  return create_peer_base_keys(random);
}

function create_room_invite() {
  const seed = random_key();
  const rand = random_key();
  const admin = create_keys_from_seed(seed);
  //[invite, admin seed]
  return JSON.stringify([
    rand.toString('hex') + admin.get().publicKey.toString('hex'),
    seed.toString('hex'),
  ]);
}

function group_key() {
  return create_room_invite();
}

function sign(m) {
  return;
}

const sanitize_join_swarm_data = (data) => {
  const address = sanitizeHtml(data.address);
  if (address.length > 99) return false;
  const message = sanitizeHtml(data.message);
  if (message.length > 128) return false;
  const signature = sanitizeHtml(data.signature);
  if (data.signature.length > 128) return false;
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
  // if (typeof time !== 'string') return false;
  if (time.length > 50) return false;

  const idPub = data.idPub;
  if (typeof idPub !== 'string' || idPub.length > 64) return false;
  const idSig = data.idSig;
  if (typeof idSig !== 'string' || idSig.length > 128) return false;

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
    signature: signature,
    topic: topic,
    name: name,
    voice: voice,
    joined: joined,
    channels: channels,
    video: video,
    time: time,
    idSig,
    idPub,
  };

  return clean_object;
};

const sanitize_group_message = (msg) => {
  let timestamp = sanitizeHtml(msg.t);
  if (timestamp.length > 20) return false;
  let room = sanitizeHtml(msg.g);
  if (room.length > 128) return false;
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
  if (txHash.length > 64) return false;

  const clean_object = {
    message: text,
    address: addr,
    signature: sig,
    room: room,
    timestamp: timestamp,
    name: nick,
    reply: reply,
    hash: txHash,
    sent: msg.sent,
    channel: 'channel',
    hash: txHash,
  };

  return clean_object;
};

const sanitize_voice_status_data = (data) => {
  const address = sanitizeHtml(data.address);
  if (address.length > 99) return false;
  const message = sanitizeHtml(data.message);
  if (message.length > 64) return false;
  const signature = sanitizeHtml(data.signature);
  if (signature.length > 128) return false;
  const topic = sanitizeHtml(data.topic);
  if (topic.length !== 64) return false;
  const name = sanitizeHtml(data.name);
  if (name.length > 50) return false;
  const voice = data.voice;
  if (typeof voice !== 'boolean') return false;
  const video = data.video;
  if (typeof video !== 'boolean') return false;

  const clean_object = {
    address: address,
    message: message,
    signature: signature,
    topic: topic,
    name: name,
    voice: voice,
    video: video,
  };

  return clean_object;
};

const sanitize_file_message = (data) => {
  console.log('sanitize', data);
  //Check standard message
  const fileName = sanitizeHtml(data?.fileName);
  if (typeof data?.fileName !== 'string' || fileName.length > 100) return false;

  const address = sanitizeHtml(data?.address);
  if (typeof data?.address !== 'string' || address.length > 99) return false;

  const topic = sanitizeHtml(data?.topic);
  if (typeof data?.topic !== 'string' || topic.length > 64) return false;

  const type = sanitizeHtml(data?.type);
  if (typeof data?.type !== 'string' || type.length > 25) return false;

  const info = sanitizeHtml(data?.info);
  if (typeof data?.info !== 'string' || info.length > 25) return false;

  const size = sanitizeHtml(data?.size);
  if (size.length > 20) return false;

  const time = sanitizeHtml(data?.time);
  if (time.length > 25) return false;

  const sig = sanitizeHtml(data?.sig);
  if (size.length > 128) return false;

  //Check optional
  const key = sanitizeHtml(data?.key);
  if (data?.key !== undefined) {
    if (typeof data?.key !== 'string' || key.length > 128) return false;
  }
  const hash = sanitizeHtml(data?.hash);
  if (data?.hash !== undefined) {
    console.log('Hash not undefined', hash, data.hash);
    if (typeof hash !== 'string' || hash.length > 64) return false;
  }

  if (typeof data?.file === 'boolean') return false;

  const object = {
    fileName,
    address,
    topic,
    info,
    type,
    size,
    time,
    hash,
    key: key,
    sig,
  };

  return object;
};

const sanitizeHtml = (data) => {
  //Bare js seems not to be working with sanitize-html package.
  //Sanitze input later and only check relevant types and length for now
  return data;
};

//Check if it is an image or video with allowed type
function check_if_image_or_video(path, size) {
  if (path === undefined) return false;
  if (size >= 50000000) return false;
  const types = [
    '.png',
    '.jpg',
    '.gif',
    '.jpeg',
    '.mp4',
    '.webm',
    '.avi',
    '.webp',
    '.mov',
    '.wmv',
    '.mkv',
    '.mpeg',
  ];
  for (a in types) {
    if (path.toLowerCase().endsWith(types[a])) {
      return true;
    }
  }
  return false;
}

const toUintArray = (val) => {
  return Uint8Array.from(val.split(',').map((x) => parseInt(x, 10)));
};

const verify_signature = (message, signature, invite) => {
  if (signature.length !== 64) return false;
  return Keychain.verify(message, signature, invite);
};

const sign_admin_message = (dht_keys, admin) => {
  const keys = create_keys_from_seed(admin);
  return keys.get().sign(dht_keys.get().publicKey);
};

async function sign_joined_message(dht_keys) {
  const key = await Hugin.request({
    type: 'get-priv',
  });
  const keys = create_keys_from_seed(key);
  return [
    keys.get().sign(dht_keys.get().publicKey).toString('hex'),
    keys.publicKey.toString('hex'),
  ];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  get_new_peer_keys,
  sign,
  sanitize_join_swarm_data,
  sanitize_group_message,
  sanitize_voice_status_data,
  sanitize_file_message,
  group_key,
  random_key,
  toUintArray,
  verify_signature,
  sign_admin_message,
  sleep,
  check_if_image_or_video,
  sign_joined_message,
};

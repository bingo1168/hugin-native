const HyperSwarm = require('hyperswarm');
const { get_new_peer_keys } = require('./utils');
const ce = require('compact-encoding');
const { Hugin } = require('./account');
let RPC;
let RPC_SENDER;
const LOCAL_VOICE_STATUS_OFFLINE = [
  JSON.stringify({ voice: false, video: false, topic: '' }),
];
let active_voice_channel = LOCAL_VOICE_STATUS_OFFLINE;

class Swarm {
  constructor(rpc) {
    if (RPC) return;
    this.rpc = rpc;
  }
  async start(key) {
    return await create_swarm(key);
  }

  async end() {
    await end_swarm(topic);
  }

  channel() {
    if (RPC) return;
    //Set up stream rpc if we need to send files somewhere
    //I think this can go both ways
    //Use it for ipc messages for now
    RPC = this.rpc.register(2, {
      request: ce.string,
      response: ce.string,
    });
    RPC_SENDER = RPC.createRequestStream();
  }
}

let active_swarms = [];

const create_swarm = async (key) => {
  console.log('Creating swarm!');
  const [base_keys, dht_keys, sig] = get_new_peer_keys(key);

  //The topic is public so lets use the pubkey from the new base keypair
  const hash = base_keys.publicKey.toString('hex');
  const time = Date.now();
  let discovery;
  let swarm;
  try {
    swarm = new HyperSwarm({}, sig, dht_keys, base_keys);
  } catch (e) {
    error_message('Error starting swarm');
    return;
  }
  let active = {
    key,
    topic: hash,
    connections: [],
    call: [],
    time,
    swarm,
  };
  active_swarms.push(active);
  sender('new-swarm', {
    topic: hash,
    key,
    channels: [],
    voice_channel: [],
    connections: [],
    time,
  });

  swarm.on('connection', (connection, information) => {
    console.log('New connection ', information);
    new_connection(connection, hash, key);
  });

  process.once('SIGINT', function () {
    swarm.on('close', function () {
      process.exit();
    });
    swarm.destroy();
    setTimeout(() => process.exit(), 2000);
  });

  const topic = Buffer.alloc(32).fill(hash);
  discovery = swarm.join(topic, { server: true, client: true });
  active.discovery = discovery;
  // check_if_online(hash);
  // return hash;
};

const new_connection = (connection, hash, key) => {
  console.log('New connection incoming');
  let active = get_active_topic(hash);

  if (!active) {
    console.log('no longer active in topic');
    connection_closed(connection, hash);
    return;
  }

  console.log('*********Got new Connection! ************');
  active.connections.push({
    connection,
    topic: hash,
    voice: false,
    name: '',
    address: '',
    video: false,
  });
  send_joined_message(hash);
  connection.on('data', async (data) => {
    incoming_message(data, hash, connection, key);
  });

  connection.on('close', () => {
    console.log('Got close signal');
    connection_closed(connection, hash);
  });

  connection.on('error', () => {
    console.log('Got error connection signal');
    connection_closed(connection, hash);
  });
};

const send_joined_message = async (topic) => {
  //Use topic as signed message?
  const msg = topic;
  const active = get_active_topic(topic);
  if (!active) return;
  const sig =
    'await signMessage(msg, keychain.getXKRKeypair().privateSpendKey)';
  let [voice, video] = get_local_voice_status(topic);
  if (video) voice = true;
  //const channels = await get_my_channels(key)
  console.log('Video?', video);
  const data = JSON.stringify({
    address: Hugin.address,
    signature: sig,
    message: msg,
    joined: true,
    topic: topic,
    name: Hugin.name,
    voice: voice,
    channels: [],
    video: video,
    time: active.time,
  });

  send_swarm_message(data, topic);
};

const send_swarm_message = (message, topic) => {
  const active = get_active_topic(topic);
  if (!active) return;
  active.connections.forEach((chat) => {
    try {
      console.log('Writing to channel');
      chat.connection.write(message);
    } catch (e) {
      error_message('Connection offline');
    }
  });

  console.log('Swarm msg sent!');
};

const incoming_message = async (data, topic, connection, key) => {
  const str = ce.string.decode(data);
  console.log('Str!', str);
  if (str === 'Ping') return;
  // Check
  const check = await check_data_message(data, connection, topic);
  if (check === 'Error') {
    connection_closed(connection, topic);
    return;
  }
  if (check) return;
  console.log('Got data!', data);
  const message = sanitize_group_message(data);
  sender('swarm-message', { message, topic });
};

const check_data_message = async (data, connection, topic) => {
  try {
    data = JSON.parse(data);
  } catch (e) {
    return false;
  }

  //Check if active in this topic
  const active = get_active_topic(topic);
  if (!active) return 'Error';

  //Check if this connection is still in our list
  let con = active.connections.find((a) => a.connection === connection);
  if (!con) return 'Error';

  //If the connections send us disconnect message, return. **todo double check closed connection
  if ('type' in data) {
    if (data.type === 'disconnected') {
      connection_closed(connection, active.topic);
      return true;
    }
  }

  // if ('info' in data) {
  //     const fileData = sanitize_file_message(data)
  //     if (!fileData) return "Error"
  //     check_file_message(fileData, topic, con.address)
  //     return true
  // }

  // //Double check if connection is joined voice?
  // if ('offer' in data) {
  //     //Check if this connection has voice status activated.
  //     if (active.connections.some(a => a.connection === connection && a.voice === true)) {
  //         const [voice, video] = get_local_voice_status(topic)
  //         if ((!voice && !video) || !voice) {
  //             //We are not connected to a voice channel
  //             //Return true bc we do not need to check it again
  //             return true
  //         }

  //         //There are too many in the voice call
  //         const users = active.connections.filter(a => a.voice === true)
  //         if (users.length > 9) return true

  //             //Joining == offer
  //         if (data.offer === true) {
  //             if ('retry' in data) {
  //                 if (data.retry === true) {
  //                     sender('got-expanded-voice-channel', [data.data, data.address])
  //                     return
  //                 }
  //             }
  //             answer_call(data)
  //         } else {
  //             got_answer(data)
  //         }
  //     }
  //     return true
  // }

  if (typeof data === 'object') {
    if ('joined' in data) {
      const joined = sanitize_join_swarm_data(data);
      if (!joined) return 'Error';

      if (con.joined) {
        //Connection is already joined
        return;
      }

      //Check signature
      // const verified = await verifySignature(joined.message, joined.address, joined.signature)
      // if(!verified) return "Error"
      con.joined = true;
      con.address = joined.address;
      con.name = joined.name;
      con.voice = joined.voice;

      const time = parseInt(joined.time);
      //     //If our new connection is also in voice, check who was connected first to decide who creates the offer
      //     const [in_voice, video] = get_local_voice_status(topic)
      //     if (con.voice && in_voice && (parseInt(active.time) > time)  ) {
      //         join_voice_channel(active.key, topic, joined.address)
      //     }

      con.video = joined.video;
      console.log('Connection updated: Joined:', con.joined);
      sender('peer-connected', joined);
    }
    if ('voice' in data) {
      const voice_status = check_peer_voice_status(data, con);
      if (!voice_status) return 'Error';
    }
  }

  return false;
};

const connection_closed = (conn, topic) => {
  console.log('Closing connection...');
  const active = get_active_topic(topic);
  if (!active) return;
  try {
    conn.end();
    conn.destroy();
  } catch (e) {
    console.log('failed close connection');
  }
  const user = active.connections.find((a) => a.connection === conn);
  if (!user) return;
  // sender('close-voice-channel-with-peer', user.address);
  sender('peer-disconnected', { address: user.address, topic });
  const still_active = active.connections.filter((a) => a.connection !== conn);
  console.log('Connection closed');
  console.log('Still active:', still_active);
  active.connections = still_active;
};

const end_swarm = async (topic) => {
  const active = get_active_topic(topic);
  if (!active) return;
  sender('end-swarm', { topic });
  update_local_voice_channel_status(LOCAL_VOICE_STATUS_OFFLINE);

  active.connections.forEach((chat) => {
    console.log('Disconnecting from:', chat.address);
    chat.connection.write(JSON.stringify({ type: 'disconnected' }));
  });

  await active.swarm.leave(Buffer.from(topic));
  await active.discovery.destroy();
  await active.swarm.destroy();
  const still_active = active_swarms.filter((a) => a.topic !== topic);
  active_swarms = still_active;
  console.log('***** Ended swarm *****');
};

const update_local_voice_channel_status = (data) => {
  const updated = data;
  active_voice_channel = [updated];
  return true;
};

const get_local_voice_status = (topic) => {
  let voice = false;
  let video = false;
  let channel;
  //We do this bc stringified data is set locally from the status messages.
  //This can change
  try {
    channel = JSON.parse(active_voice_channel[0]);
    if (channel.topic !== topic) return [false, false];
  } catch (e) {
    return [false];
  }

  voice = channel.voice;
  video = channel.video;

  return [voice, video, topic];
};

const get_active_topic = (topic) => {
  const active = active_swarms.find((a) => a.topic === topic);
  if (!active) return false;
  return active;
};

const check_if_online = (topic) => {
  let interval = setInterval(ping, 10 * 1000);
  function ping() {
    let active = active_swarms.find((a) => a.topic === topic);
    if (!active) {
      clearInterval(interval);
      return;
    } else {
      active.connections.forEach((a) => a.connection.write('Ping'));
    }
  }
};

const sender = (channel, data) => {
  let obj = data;
  obj.rpc = channel;
  const send = JSON.stringify(obj);
  RPC_SENDER.write(send);
};

const error_message = (message) => {
  sender('error-message', { message });
};

module.exports = { create_swarm, Swarm };

// File: src/network/p2p.rs

use libp2p::{
    futures::StreamExt,
    gossipsub, kad, noise, swarm::SwarmEvent, tcp, yamux, PeerId, Swarm,
};
use std::error::Error;
use std::time::Duration;
use tokio::sync::mpsc;

use crate::network::messages::NetworkMessage;

#[derive(libp2p::swarm::NetworkBehaviour)]
pub struct KortanaBehaviour {
    pub gossipsub: gossipsub::Behaviour,
    pub kademlia: kad::Behaviour<kad::store::MemoryStore>,
}

pub struct KortanaNetwork {
    swarm: Swarm<KortanaBehaviour>,
    tx_receiver: mpsc::Receiver<NetworkMessage>,
    node_tx: mpsc::Sender<NetworkMessage>,
    peer_reputation: std::collections::HashMap<PeerId, i32>,
    pub bootnodes: Vec<libp2p::Multiaddr>,
}

impl KortanaNetwork {
    pub async fn new(
        tx_receiver: mpsc::Receiver<NetworkMessage>,
        node_tx: mpsc::Sender<NetworkMessage>
    ) -> Result<Self, Box<dyn Error>> {
        let mut swarm = libp2p::SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )?
            .with_behaviour(|key| {
                let message_id_fn = |message: &gossipsub::Message| {
                    let mut s = std::collections::hash_map::DefaultHasher::new();
                    std::hash::Hash::hash(&message.data, &mut s);
                    gossipsub::MessageId::from(std::hash::Hasher::finish(&s).to_string())
                };

                let gossipsub_config = gossipsub::ConfigBuilder::default()
                    .heartbeat_interval(Duration::from_secs(1))
                    .validation_mode(gossipsub::ValidationMode::Strict)
                    .message_id_fn(message_id_fn)
                    .build()
                    .map_err(std::io::Error::other)
                    .expect("Failed to build gossipsub config");

                let gossipsub = gossipsub::Behaviour::new(
                    gossipsub::MessageAuthenticity::Signed(key.clone()),
                    gossipsub_config,
                ).expect("Failed to create gossipsub behaviour");

                let store = kad::store::MemoryStore::new(key.public().to_peer_id());
                let kademlia = kad::Behaviour::new(key.public().to_peer_id(), store);

                KortanaBehaviour { gossipsub, kademlia }
            })
            .expect("Failed to build behaviour")
            .build();

        let block_topic = gossipsub::IdentTopic::new("kortana-blocks");
        let tx_topic = gossipsub::IdentTopic::new("kortana-transactions");
        swarm.behaviour_mut().gossipsub.subscribe(&block_topic)?;
        swarm.behaviour_mut().gossipsub.subscribe(&tx_topic)?;

        Ok(Self { 
            swarm, 
            tx_receiver, 
            node_tx,
            peer_reputation: std::collections::HashMap::new(),
            bootnodes: Vec::new(),
        })
    }

    pub fn add_bootnode(&mut self, addr: libp2p::Multiaddr) {
        self.bootnodes.push(addr.clone());
        let _ = self.swarm.dial(addr);
    }

    pub async fn run(mut self, listen_addr: String) {
        self.swarm.listen_on(listen_addr.parse().unwrap()).unwrap();

        loop {
            tokio::select! {
                // Incoming from Node -> P2P
                Some(msg) = self.tx_receiver.recv() => {
                    let data = serde_json::to_vec(&msg).unwrap();
                    let topic = match msg {
                        NetworkMessage::NewBlock(_) => "kortana-blocks",
                        _ => "kortana-transactions",
                    };
                    let _ = self.swarm.behaviour_mut().gossipsub.publish(gossipsub::IdentTopic::new(topic), data);
                }
                // Incoming from P2P -> Node
                event = self.swarm.select_next_some() => match event {
                    SwarmEvent::NewListenAddr { address, .. } => {
                        println!("P2P Node listening on {:?}", address);
                    }
                    SwarmEvent::Behaviour(event) => match event {
                        KortanaBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                            message, ..
                        }) => {
                            let peer_id = message.source.unwrap_or(PeerId::random());
                            match serde_json::from_slice::<NetworkMessage>(&message.data) {
                                Ok(msg) => {
                                    let _ = self.node_tx.send(msg).await;
                                }
                                Err(_) => {
                                    // Penalize for malformed messages
                                    let rep = self.peer_reputation.entry(peer_id).or_insert(0);
                                    *rep -= 10;
                                    if *rep < -50 {
                                        println!("[P2P] Disconnecting malicious peer {:?}", peer_id);
                                        let _ = self.swarm.disconnect_peer_id(peer_id);
                                    }
                                }
                            }
                        }
                        _ => {}
                    },
                    _ => {}
                }
            }
        }
    }
}

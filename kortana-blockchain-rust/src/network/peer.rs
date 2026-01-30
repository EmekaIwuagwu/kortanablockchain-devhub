// File: src/network/peer.rs

use std::net::SocketAddr;
use std::time::SystemTime;
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct PeerId(pub [u8; 32]);

impl PeerId {
    pub fn random() -> Self {
        let mut bytes = [0u8; 32];
        let id = Uuid::new_v4();
        bytes[0..16].copy_from_slice(id.as_bytes());
        PeerId(bytes)
    }
}

pub struct Peer {
    pub id: PeerId,
    pub addresses: Vec<SocketAddr>,
    pub version: String,
    pub last_seen: SystemTime,
    pub is_connected: bool,
}

pub struct P2PHandler {
    pub local_id: PeerId,
    pub peers: Vec<Peer>,
}

impl P2PHandler {
    pub fn new() -> Self {
        Self {
            local_id: PeerId::random(),
            peers: Vec::new(),
        }
    }

    pub fn add_peer(&mut self, id: PeerId, addr: SocketAddr) {
        if !self.peers.iter().any(|p| p.id == id) {
            self.peers.push(Peer {
                id,
                addresses: vec![addr],
                version: "1.0.0".to_string(),
                last_seen: SystemTime::now(),
                is_connected: true,
            });
        }
    }

    pub fn connected_count(&self) -> usize {
        self.peers.iter().filter(|p| p.is_connected).count()
    }
}

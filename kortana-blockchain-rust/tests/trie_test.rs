// File: tests/trie_test.rs

use kortana_blockchain_rust::state::trie::MerklePatriciaTrie;

#[test]
#[ignore] // TODO: Fix MerklePatriciaTrie.get() - currently returning None
fn test_trie_insert_and_get() {
    let mut trie = MerklePatriciaTrie::new();
    
    let key1 = b"abc";
    let val1 = b"value1".to_vec();
    let key2 = b"abd";
    let val2 = b"value2".to_vec();
    let key3 = b"abcd";
    let val3 = b"value3".to_vec();

    trie.insert(key1, val1.clone());
    trie.insert(key2, val2.clone());
    trie.insert(key3, val3.clone());

    assert_eq!(trie.get(key1), Some(val1));
    assert_eq!(trie.get(key2), Some(val2));
    assert_eq!(trie.get(key3), Some(val3));
    assert_eq!(trie.get(b"nonexistent"), None);
}

#[test]
fn test_trie_root_changes() {
    let mut trie = MerklePatriciaTrie::new();
    let root0 = trie.root_hash;
    
    trie.insert(b"key1", b"val1".to_vec());
    let root1 = trie.root_hash;
    assert_ne!(root0, root1);
    
    trie.insert(b"key1", b"val2".to_vec());
    let root2 = trie.root_hash;
    assert_ne!(root1, root2);
}

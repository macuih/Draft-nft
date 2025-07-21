import React, { useState } from 'react';
import { Spinner, Row, Col, Form, Button } from 'react-bootstrap';
import { Buffer } from 'buffer';

const Create = ({ marketplace, nft, account, ipfsClient }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Upload image file to IPFS
  const uploadToIPFS = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await ipfsClient.add(file);
      const url = `https://infura-ipfs.io/ipfs/${result.path}`;
      setImage(url);
    } catch (err) {
      console.error("IPFS image upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Create and list NFT
  const createNFT = async () => {
    if (!image || !price || !name || !description) return alert("All fields are required.");

    try {
      const metadata = JSON.stringify({ image, name, description });
      const result = await ipfsClient.add(metadata);
      const uri = `https://infura-ipfs.io/ipfs/${result.path}`;

      // Mint the NFT
      const mintTx = await nft.mint(uri);
      await mintTx.wait();

      const tokenId = await nft.tokenCount();

      // Approve marketplace to transfer this token
      const approvalTx = await nft.setApprovalForAll(marketplace.target, true);
      await approvalTx.wait();

      // Convert price to wei and list the item
      const listingPrice = ethers.parseEther(price.toString());
      const listTx = await marketplace.makeItem(nft.target, tokenId, listingPrice);
      await listTx.wait();

      alert("NFT created and listed!");
    } catch (error) {
      console.error("Failed to mint or list NFT:", error);
    }
  };

  return (
    <div className="container p-4">
      <h2>Create NFT</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" required onChange={uploadToIPFS} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="number"
            placeholder="Price in ETH"
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" onClick={createNFT} disabled={uploading}>
          {uploading ? "Uploading..." : "Create & List NFT"}
        </Button>
      </Form>
    </div>
  );
};

export default Create;

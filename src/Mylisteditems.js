import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card } from 'react-bootstrap';

export default function MyListedItems({ marketplace, nft, account }) {
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadListedItems = async () => {
    const itemCount = await marketplace.getItemCount();
    let listed = [];
    let sold = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (item.seller.toLowerCase() === account.toLowerCase()) {
        const uri = await nft.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(item.itemId);

        const listedItem = {
          totalPrice,
          itemId: item.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          sold: item.sold
        };

        listed.push(listedItem);
        if (item.sold) sold.push(listedItem);
      }
    }

    setListedItems(listed);
    setSoldItems(sold);
    setLoading(false);
  };

  useEffect(() => {
    loadListedItems();
  }, []);

  if (loading) return <h2>Loading listed NFTs...</h2>;

  return (
    <div className="px-5 container">
      <h2 className="py-3">My Listed NFTs</h2>
      {listedItems.length > 0 ? (
        <Row xs={1} md={2} lg={4} className="g-4">
          {listedItems.map((item, idx) => (
            <Col key={idx}>
              <Card>
                <Card.Img variant="top" src={item.image} />
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                </Card.Body>
                <Card.Footer>
                  <strong>{ethers.formatEther(item.totalPrice)} ETH</strong>
                  {item.sold && <span className="text-danger ms-2">(SOLD)</span>}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>You haven't listed any NFTs yet.</p>
      )}
    </div>
  );
}

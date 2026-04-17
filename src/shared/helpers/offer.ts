import { Offer, OfferType } from '../types/index.js';

export function createOffer(offerData: string): Offer {
  const fields = offerData.replace('\n', '').split('\t');
  const title = fields[0];
  const description = fields[1];
  const createdDate = fields[2];
  const image = fields[3];
  const type = fields[4];
  const price = fields[5];
  const firstname = fields[7];
  const lastname = fields[8];
  const email = fields[9];
  const avatarPath = fields[10];

  const user = {
    email,
    firstname,
    lastname,
    avatarPath,
    userType: 'ordinary' as const,
  };

  return {
    title,
    description,
    image,
    user,
    postDate: new Date(createdDate),
    type: type as OfferType,
    price: Number.parseInt(price, 10),
  };
}

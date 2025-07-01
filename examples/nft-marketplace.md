# NFT Marketplace

A decentralized marketplace for trading non-fungible tokens with escrow protection and royalty support.

## list_nft

List an NFT for sale on the marketplace

- nft_id: unique identifier of your NFT (required)
- price: sale price in tokens (required)
- currency: token contract address for payment (optional, defaults to platform token)
- description: marketing description of the NFT (optional)
- duration: listing duration in days (optional, defaults to 30)

Creates a marketplace listing for your NFT. You must own the NFT and it will be held in escrow until sold or delisted.

## buy_nft

Purchase a listed NFT from the marketplace

- nft_id: identifier of the NFT you want to buy (required)
- max_price: maximum price you're willing to pay (optional, defaults to current listing price)

Instantly purchases an NFT if you have sufficient balance. The NFT is transferred to you and payment goes to the seller (minus fees).

## cancel_listing

Remove your NFT listing from the marketplace

- nft_id: identifier of the NFT to delist (required)

Removes your NFT from sale and returns it to your wallet. Only the original lister can cancel their listing.

## make_offer

Make an offer on any NFT (listed or not)

- nft_id: identifier of the NFT (required)
- offer_amount: your offer price in tokens (required)
- currency: token contract for payment (optional, defaults to platform token)
- expiration: offer expiration time in hours (optional, defaults to 24)

Creates an offer that the NFT owner can accept. Your tokens are held in escrow until the offer expires or is accepted.

## accept_offer

Accept an offer on your NFT

- nft_id: identifier of your NFT (required)
- offer_id: identifier of the offer to accept (required)

Accepts a pending offer and transfers the NFT to the buyer. You receive the offer amount minus marketplace fees.

## reject_offer

Decline an offer on your NFT

- nft_id: identifier of your NFT (required)
- offer_id: identifier of the offer to reject (required)

Rejects an offer and returns the escrowed tokens to the bidder.

## get_listings

View current marketplace listings

- category: filter by NFT category (optional)
- min_price: minimum price filter in tokens (optional)
- max_price: maximum price filter in tokens (optional)
- seller: filter by seller wallet address (optional)
- sort: sort order - 'price_low', 'price_high', 'newest', 'oldest' (optional)

Returns a list of active NFT listings matching your criteria.

## get_offers

View offers on NFTs

- nft_id: get offers for specific NFT (optional)
- buyer: filter offers by buyer address (optional)
- status: filter by 'active', 'expired', 'accepted', 'rejected' (optional)

Returns offers matching your criteria. If no nft_id specified, returns all offers.

## get_nft_history

View transaction history for an NFT

- nft_id: identifier of the NFT (required)
- limit: maximum number of transactions to return (optional, defaults to 10)

Returns the ownership and sale history of an NFT including prices and dates.

## get_user_activity

View a user's marketplace activity

- user: wallet address to check (optional, defaults to caller)
- activity_type: filter by 'listings', 'purchases', 'offers', 'sales' (optional)
- limit: maximum results to return (optional, defaults to 20)

Returns recent marketplace activity for a user.

## set_royalty

Set creator royalty for your NFT collection (creator only)

- collection_id: identifier of your NFT collection (required)
- royalty_percentage: royalty percentage (0-10) (required)
- recipient: address to receive royalties (optional, defaults to caller)

Sets royalty terms that apply to all secondary sales of NFTs in your collection.

## withdraw_earnings

Withdraw your accumulated marketplace earnings

- amount: amount to withdraw in tokens (optional, withdraws all available)
- currency: token contract to withdraw (optional, defaults to platform token)

Withdraws your earned fees, royalties, and sale proceeds from the marketplace.

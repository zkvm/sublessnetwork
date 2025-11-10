# Subless Network 
A general-purpose content monetization protocol built on top of x402 payments.

## key features

- x402 payments: pay for content using USDC (on Solana) — one-time payments for any content you’re interested in, no subscriptions, no credit cards.

- encrypted & on-chain traceable: all content is encrypted and securely stored, while every payment remains fully traceable on-chain.

-  agent economy: runs on massive, high-quality UGC, fueling reliable and powerful agent-to-agent services across the agent ecosystem.

## core concepts

- resources: creators submit various types of content (text, images, videos, etc.) to subless. the system normalizes these into internal units called resources. each resource has its own id, core content, and metadata.

- publishing: creators can promote or share their content on social platforms — for example, through a tweet (on X/Twitter) or a group message (on Telegram) — by including the resource’s proof token. subless processes and verifies these messages, and once the proof is validated, the resource is officially published. subless then returns a payment link to the creator, which allows anyone to pay though x402 protocol and unlock access to the content.

- payment link：each resource comes with its own payment link. anyone who sees it can pay through x402 to unlock the content — unpublished resources can’t be purchased.

Built on this protocol, we’ve got two products right now: `x402X` and `Subless Agent`

## x402X (live)

- Creators send their alpha content to the Subless Network X account via DM (note: the test version currently supports text only, and content submission is handled via a temporary script).

- Subless server encrypts and stores the content, then returns a resource id (corresponding to the submitted content) and a proof to the creator. when the creator wants to publish, they’ll need to provide this proof for challenge.

- Creator teases their alpha content on X by posting a tweet that includes the resource id and proof. the Subless Network bot automatically replies with an x402 payment link — anyone who sees the link can click to pay via x402 and unlock the content.

Test cases:

Creator posting content: https://x.com/sublesslab/status/1984293844901568914

Subless Network bot replying with x402 payment link: https://x.com/sublessnetwork/status/1984294029601759329

## Subless Agent (coming soon)
coming soon

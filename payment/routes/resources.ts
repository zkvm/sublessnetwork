import { Router, Request, Response } from 'express';
import { X402PaymentHandler } from 'x402-solana/server';
import { config, usdToMicroUsdc } from '../config.js';
import { db } from '../db.js';
import {
  decryptContent,
  embedTextWatermark,
  generateWatermarkId,
  verifyContentHash
} from '../crypto.js';

const router = Router();

// Initialize x402 payment handler
const x402 = new X402PaymentHandler({
  network: config.network,
  treasuryAddress: config.treasuryWalletAddress!,
  facilitatorUrl: config.facilitatorUrl,
  rpcUrl: config.solanaRpcUrl,
});

/**
 * GET /resources/:id
 * 
 * Protected endpoint using x402 payment protocol.
 * 
 * Flow:
 * 1. Extract X-PAYMENT header
 * 2. Fetch resource from database (get price)
 * 3. If no payment header -> return 402 with payment requirements
 * 4. Verify payment with facilitator
 * 5. Decrypt content and embed watermark
 * 6. Settle payment with facilitator
 * 7. Return content to user
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;

  try {
    // 1. Extract payment header
    const paymentHeader = x402.extractPayment(req.headers);

    // 2. Get resource from database
    const resource = await db.getResource(resourceId);

    if (!resource) {
      return res.status(404).json({
        error: 'Resource not found',
        message: 'The requested content does not exist or is no longer available'
      });
    }

    // 3. Create payment requirements
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: usdToMicroUsdc(resource.price_usd_cents / 100), // Convert cents to USDC micro-units
        asset: {
          address: config.usdcMintAddress, // USDC mint address
          decimals: 6,
        }
      },
      network: config.network,
      config: {
        description: `Content by @${resource.twitter_username}`,
        resource: `https://${config.baseUrl}/resources/${resourceId}`,
        mimeType: resource.content_type || 'application/json',
      }
    });

    // 4. If no payment header, return 402 Payment Required
    if (!paymentHeader) {
      const response = x402.create402Response(paymentRequirements);
      return res.status(response.status).json(response.body);
    }

    // 5. Verify payment
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return res.status(402).json({
        error: 'Invalid payment',
        message: 'Payment verification failed. Please try again.'
      });
    }

    // 6. Process resource access (decrypt content + watermark)
    const result = await processResourceAccess(req, resource, paymentHeader);

    // 7. Settle payment with facilitator
    await x402.settlePayment(paymentHeader, paymentRequirements);

    // 8. Return content
    return res.json(result);

  } catch (error) {
    console.error('❌ Error processing resource request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
});

/**
 * Process resource access after payment verification
 */
async function processResourceAccess(
  req: Request,
  resource: any,
  paymentHeader: string
): Promise<any> {
  // TODO: Parse payment header to extract transaction info
  // Can not extract txSignature and fromAddress here because paymentHeader format may vary
  //  const [txSignature, fromAddress] = paymentHeader.split(':');

  const purchase = await db.createPurchase({
    resourceId: resource.id,
    pricePaidCents: resource.price_usd_cents,
    currency: resource.currency,
    chain: 'solana',
  });

  // Update resource statistics
  await db.updateResourceStats(resource.id, resource.price_usd_cents);

  console.log(`💰 New purchase recorded: ${purchase.id}`);


  // Decrypt content
  let decryptedContent: Buffer;
  try {
    decryptedContent = decryptContent(
      resource.content_ciphertext,
      resource.content_iv
    );
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw new Error('Unable to decrypt content');
  }

  // Verify content integrity
  if (resource.content_hash) {
    const isValid = verifyContentHash(decryptedContent, resource.content_hash);
    if (!isValid) {
      console.error('❌ Content integrity check failed');
      throw new Error('Content integrity check failed');
    }
  }

  return {
    content: resource.content_type.startsWith('text/')
      ? decryptedContent.toString('utf-8')
      : decryptedContent.toString('base64'),
    metadata: {
      resourceId: resource.id,
      creator: resource.user_id,
      purchasedAt: new Date().toISOString(),
      contentType: resource.content_type,
    }
  };
}

/**
 * GET /resources/:id/preview
 * 
 * Get public preview/metadata of a resource (no payment required)
 */
router.get('/:id/preview', async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;

  try {
    const resource = await db.getResource(resourceId);

    if (!resource) {
      return res.status(404).json({
        error: 'Resource not found'
      });
    }

    return res.json({
      id: resource.id,
      creator: resource.user_id,
      contentType: resource.content_type,
      price: {
        usd: (resource.price_usd_cents / 100).toFixed(2),
        currency: resource.currency,
      },
      chain: 'solana',
      network: config.network,
      tweetId: resource.tweet_id,
    });

  } catch (error) {
    console.error('❌ Error fetching resource preview:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;

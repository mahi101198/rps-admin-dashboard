// Email template types and utilities

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'promotional' | 'offer' | 'announcement' | 'seasonal' | 'custom';
  template: (data: any) => string;
}

// Template 1: Flash Sale
export const flashSaleTemplate: EmailTemplate = {
  id: 'flash-sale',
  name: 'Flash Sale',
  description: 'Promote limited-time flash sales with countdown',
  category: 'promotional',
  template: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .product-item { background: white; padding: 15px; border-radius: 5px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 10px; }
        .price { font-size: 20px; font-weight: bold; color: #667eea; }
        .original-price { text-decoration: line-through; color: #999; font-size: 14px; }
        .discount { background: #ff6b6b; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; display: inline-block; margin-left: 5px; }
        .countdown { background: #ff6b6b; color: white; padding: 15px; text-align: center; border-radius: 5px; font-size: 18px; font-weight: bold; margin: 20px 0; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ FLASH SALE IS LIVE!</h1>
          <p>Limited time offers on your favorite products</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>Get ready for incredible savings! Our Flash Sale is happening RIGHT NOW.</p>
          
          <div class="countdown">
            ⏰ Sale Ends In: ${data.endTime || '24 Hours'}
          </div>

          <div class="product-grid">
            ${data.products?.map((product: any) => `
              <div class="product-item">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <div class="original-price">₹${product.originalPrice}</div>
                <div class="price">₹${product.salePrice} <span class="discount">${product.discount}% OFF</span></div>
              </div>
            `).join('') || '<p>Featured products coming soon</p>'}
          </div>

          <center>
            <a href="${data.shopUrl || '#'}" class="cta-button">🛍️ SHOP NOW</a>
          </center>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Don't miss out on these amazing deals. Offer valid for a limited time only.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Store. All rights reserved.</p>
          <p><a href="#" style="color: white;">Unsubscribe</a> | <a href="#" style="color: white;">Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Template 2: New Product Launch
export const newProductTemplate: EmailTemplate = {
  id: 'new-product',
  name: 'New Product Launch',
  description: 'Announce new products to your customers',
  category: 'announcement',
  template: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2ecc71; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; }
        .product-showcase { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 300px; object-fit: cover; border-radius: 5px; margin-bottom: 20px; }
        .product-name { font-size: 24px; font-weight: bold; color: #2ecc71; margin-bottom: 10px; }
        .product-desc { color: #666; margin-bottom: 15px; }
        .features { list-style: none; padding: 0; margin: 20px 0; }
        .features li { padding: 8px 0; padding-left: 25px; position: relative; }
        .features li:before { content: "✓"; position: absolute; left: 0; color: #2ecc71; font-weight: bold; }
        .price-section { background: #2ecc71; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .price { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .cta-button { display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px auto; display: block; width: fit-content; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 NEW PRODUCT LAUNCH</h1>
          <p>Be the first to get exclusive access!</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>We're excited to introduce you to our latest collection!</p>

          <div class="product-showcase">
            <img src="${data.productImage}" alt="New Product" class="product-image">
            <div class="product-name">${data.productName}</div>
            <div class="product-desc">${data.productDescription}</div>

            ${data.features ? `
              <h4>Key Features:</h4>
              <ul class="features">
                ${data.features.map((f: string) => `<li>${f}</li>`).join('')}
              </ul>
            ` : ''}

            <div class="price-section">
              <p>Special Launch Price</p>
              <div class="price">₹${data.price}</div>
              ${data.originalPrice ? `<p style="text-decoration: line-through;">₹${data.originalPrice}</p>` : ''}
            </div>
          </div>

          <center>
            <a href="${data.shopUrl || '#'}" class="cta-button">View Product</a>
          </center>

          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Limited stock available. Don't miss out on this exclusive launch offer!
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Store. All rights reserved.</p>
          <p><a href="#" style="color: white;">Unsubscribe</a> | <a href="#" style="color: white;">Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Template 3: Weekly Deals
export const weeklyDealsTemplate: EmailTemplate = {
  id: 'weekly-deals',
  name: 'Weekly Deals',
  description: 'Share best weekly deals and promotions',
  category: 'promotional',
  template: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f39c12; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; }
        .deals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .deal-card { background: white; padding: 15px; border-radius: 5px; text-align: center; border-left: 4px solid #f39c12; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .deal-card h3 { margin: 10px 0; color: #f39c12; }
        .deal-price { font-size: 24px; font-weight: bold; color: #e74c3c; }
        .deal-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 3px; font-size: 11px; font-weight: bold; }
        .category-badge { background: #f39c12; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; margin-top: 10px; display: inline-block; }
        .cta-button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px auto; display: block; width: fit-content; }
        .newsletter { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #f39c12; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 Weekly Deals Are Here!</h1>
          <p>This Week's Best Bargains</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>We've handpicked the best deals of the week just for you!</p>

          <div class="deals-grid">
            ${data.deals?.map((deal: any) => `
              <div class="deal-card">
                <h3>${deal.name}</h3>
                <div class="deal-price">₹${deal.price}</div>
                <span class="deal-badge">${deal.discount}% OFF</span>
                <span class="category-badge">${deal.category}</span>
              </div>
            `).join('') || '<p>Deals coming soon</p>'}
          </div>

          <div class="newsletter">
            <h3>💡 Pro Tip</h3>
            <p>Sign up for our newsletter to get exclusive deals delivered to your inbox every week!</p>
          </div>

          <center>
            <a href="${data.shopUrl || '#'}" class="cta-button">Browse All Deals</a>
          </center>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Store. All rights reserved.</p>
          <p><a href="#" style="color: white;">Unsubscribe</a> | <a href="#" style="color: white;">Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Template 4: Seasonal Promotions
export const seasonalTemplate: EmailTemplate = {
  id: 'seasonal',
  name: 'Seasonal Promotion',
  description: 'Holiday and seasonal campaign emails',
  category: 'seasonal',
  template: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; position: relative; overflow: hidden; }
        .header h1 { font-size: 36px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { margin: 10px 0 0 0; font-size: 18px; }
        .content { background: #f8f9fa; padding: 30px; }
        .offer-banner { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #e74c3c; }
        .offer-banner h2 { color: #e74c3c; margin: 0; font-size: 28px; }
        .offer-banner .subtitle { color: #666; margin: 10px 0; }
        .promo-code { background: #e74c3c; color: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 24px; font-weight: bold; margin: 15px 0; letter-spacing: 2px; }
        .cta-button { display: inline-block; background: #e74c3c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px auto; display: block; width: fit-content; font-weight: bold; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.seasonTitle || '🎉 SPECIAL CELEBRATION'}</h1>
          <p>${data.seasonSubtitle || 'Limited Time Offer'}</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>${data.message || 'Join us in celebrating with amazing discounts and exclusive offers!'}</p>

          <div class="offer-banner">
            <h2>GET UP TO</h2>
            <h1 style="color: #e74c3c; margin: 10px 0;">${data.discount || '50'}% OFF</h1>
            <p class="subtitle">${data.offerDescription || 'On selected items'}</p>
            
            ${data.promoCode ? `
              <p style="margin: 20px 0;">Use Code:</p>
              <div class="promo-code">${data.promoCode}</div>
            ` : ''}
          </div>

          <p style="text-align: center; font-weight: bold; color: #e74c3c;">
            ⏰ Offer Valid Until: ${data.validUntil || 'December 31, 2024'}
          </p>

          <center>
            <a href="${data.shopUrl || '#'}" class="cta-button">GRAB THE DEAL NOW</a>
          </center>

          <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
            Hurry! Limited stocks available. Offer cannot be combined with other promotions.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Store. All rights reserved.</p>
          <p><a href="#" style="color: white;">Unsubscribe</a> | <a href="#" style="color: white;">Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Template 5: Abandoned Cart Recovery
export const abandonedCartTemplate: EmailTemplate = {
  id: 'abandoned-cart',
  name: 'Abandoned Cart',
  description: 'Recover abandoned shopping carts',
  category: 'promotional',
  template: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3498db; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; }
        .cart-items { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .item-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
        .item-name { font-weight: bold; }
        .item-price { color: #3498db; font-weight: bold; }
        .item-row:last-child { border-bottom: none; }
        .totals { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .total-line { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-amount { font-size: 20px; font-weight: bold; color: #3498db; }
        .discount-banner { background: #2ecc71; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .cta-button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px auto; display: block; width: fit-content; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 You Left Items in Your Cart!</h1>
          <p>Complete your purchase now</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>We noticed you left some items in your cart. Don't worry, they're still available!</p>

          <div class="cart-items">
            ${data.items?.map((item: any) => `
              <div class="item-row">
                <div>
                  <div class="item-name">${item.name}</div>
                  <div style="font-size: 12px; color: #666;">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">₹${item.price}</div>
              </div>
            `).join('') || '<p>No items in cart</p>'}

            <div class="totals">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>₹${data.subtotal || 0}</span>
              </div>
              ${data.discount ? `
                <div class="total-line" style="color: #2ecc71;">
                  <span>Discount:</span>
                  <span>-₹${data.discount}</span>
                </div>
              ` : ''}
              <div class="total-line" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <span style="font-weight: bold;">Total:</span>
                <span class="total-amount">₹${data.total || 0}</span>
              </div>
            </div>

            ${data.specialOffer ? `
              <div class="discount-banner">
                <strong>🎁 Special Offer!</strong>
                <p>${data.specialOffer}</p>
              </div>
            ` : ''}
          </div>

          <center>
            <a href="${data.cartUrl || '#'}" class="cta-button">Complete Your Purchase</a>
          </center>

          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            If you have any questions, feel free to reach out to our customer support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Store. All rights reserved.</p>
          <p><a href="#" style="color: white;">Unsubscribe</a> | <a href="#" style="color: white;">Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export const templates: EmailTemplate[] = [
  flashSaleTemplate,
  newProductTemplate,
  weeklyDealsTemplate,
  seasonalTemplate,
  abandonedCartTemplate,
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return templates.find(t => t.id === id);
}

export function getAllTemplates(): EmailTemplate[] {
  return templates;
}

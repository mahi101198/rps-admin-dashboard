import { getFirebaseAdmin } from "@/data/firebase.admin";
import { NextRequest, NextResponse } from "next/server";

interface CartItem {
  productId: string;
  title: string;
  subtitle?: string;
  price: number;
  mrp: number;
  imageUrl: string;
  quantity: number;
  currency: string;
  skuId: string;
  addedAt?: any;
}

interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    return {
      uid,
      firstName: userData?.firstName || "Customer",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

async function getCartItems(uid: string): Promise<CartItem[]> {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    const db = firebaseAdmin.firestore();
    const cartDoc = await db.collection("carts").doc(uid).get();

    if (!cartDoc.exists) {
      return [];
    }

    const cartData = cartDoc.data();
    return cartData?.items || [];
  } catch (error) {
    console.error("Error getting cart items:", error);
    return [];
  }
}

function buildCartRecoveryEmail(
  customerName: string,
  cartItems: CartItem[]
): { htmlContent: string; subtotalMrp: number; subtotalPrice: number; discountAmount: number } {
  const subtotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalMrp = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const discountAmount = subtotalMrp - subtotalPrice;

  const productCardsHtml = cartItems
    .map((item) => {
      const discountPercent = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
      return `<div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; gap: 14px; align-items: flex-start;">
  <div style="position: relative; flex: 0 0 90px; height: 90px;">
    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block; background: #f5f5f5;" />
    ${discountPercent > 0 ? `<div style="position: absolute; top: 4px; right: 4px; background: #e53935; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">${discountPercent}% OFF</div>` : ''}
  </div>
  <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; padding-top: 2px;">
    <h3 style="font-size: 14px; font-weight: 600; color: #212121; margin: 0; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.title}</h3>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 15px; font-weight: 700; color: #1976d2;">₹${item.price}</span>
      ${item.mrp > item.price ? `<span style="font-size: 12px; color: #9e9e9e; text-decoration: line-through;">₹${item.mrp}</span>` : ''}
    </div>
    <p style="font-size: 12px; color: #757575; margin: 0; margin-top: 2px;">Qty: <span style="font-weight: 600; color: #424242;">${item.quantity}</span></p>
  </div>
</div>`;
    })
    .join("");

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Cart is Waiting</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #212121; background: #fafafa; }
.wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
.header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 32px 24px; text-align: center; }
.header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; line-height: 1.2; letter-spacing: -0.3px; }
.header p { font-size: 15px; opacity: 0.95; font-weight: 400; }
.content { padding: 24px; }
.greeting { font-size: 15px; color: #424242; margin-bottom: 20px; font-weight: 500; line-height: 1.5; }
.products { margin-bottom: 24px; }
.empty-state { text-align: center; padding: 40px 20px; color: #757575; font-size: 14px; }
.summary-box { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eeeeee; }
.summary-row:last-child { border-bottom: none; }
.summary-label { color: #757575; font-weight: 500; }
.summary-value { font-weight: 600; color: #212121; font-size: 15px; }
.summary-total-row .summary-label { color: #1976d2; font-weight: 600; font-size: 15px; }
.summary-total-row .summary-value { color: #1976d2; font-weight: 700; font-size: 16px; }
.summary-savings { color: #43a047; }
.cta-button { display: block; width: 100%; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3); transition: all 0.3s ease; border: none; cursor: pointer; text-align: center; margin-bottom: 16px; }
.cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4); }
.secondary-cta { background: #e0e0e0; color: #212121; box-shadow: none; margin-bottom: 20px; }
.secondary-cta:hover { background: #d0d0d0; }
.footer { background: #fafafa; padding: 20px 24px; text-align: center; font-size: 12px; color: #9e9e9e; border-top: 1px solid #eeeeee; }
.footer p { margin: 4px 0; }
.trust-badge { text-align: center; padding: 16px 24px; color: #757575; font-size: 12px; background: #fff9e6; border-top: 1px solid #ffe082; }
@media (max-width: 480px) {
  .header { padding: 28px 16px; } .header h1 { font-size: 24px; } .header p { font-size: 13px; } .content { padding: 16px; } .greeting { font-size: 14px; margin-bottom: 16px; } .summary-box { padding: 16px; } .summary-row { padding: 8px 0; font-size: 13px; } .summary-label { font-size: 13px; } .summary-value { font-size: 14px; } .cta-button { padding: 12px 20px; font-size: 14px; }
}
</style>
</head>
<body>
<div class="wrapper">
<div class="header">
<h1>Your Cart is Waiting! 🛍️</h1>
<p>Hi ${customerName}, complete your order and save ₹${discountAmount}</p>
</div>
<div class="content">
<p class="greeting">You left ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart. Don't miss out on these great deals!</p>
<div class="products">
${cartItems.length > 0 ? productCardsHtml : '<div class="empty-state">No items in cart. Start shopping to see products here.</div>'}
</div>
<div class="summary-box">
<div class="summary-row">
<span class="summary-label">Subtotal (${cartItems.length} item${cartItems.length !== 1 ? 's' : ''})</span>
<span class="summary-value">₹${subtotalMrp}</span>
</div>
<div class="summary-row">
<span class="summary-label">Discount</span>
<span class="summary-value summary-savings">-₹${discountAmount}</span>
</div>
<div class="summary-row summary-total-row">
<span class="summary-label">Total to Pay</span>
<span class="summary-value">₹${subtotalPrice}</span>
</div>
</div>
<a href="https://yoursite.com/cart" class="cta-button">Complete Order Now</a>
<a href="https://yoursite.com/shop" class="cta-button secondary-cta">Continue Shopping</a>
</div>
<div class="trust-badge">
✅ 100% Secure Checkout | 🚚 Free Shipping on Orders Above ₹500 | 💳 Multiple Payment Options
</div>
<div class="footer">
<p><strong>RPS Stationery Store</strong></p>
<p>Your trusted stationery & art supplies partner since 2015</p>
<p style="margin-top: 8px;">Questions? Email us at <strong>support@rps.com</strong> | Call: +91-XXXX-XXXX</p>
<p style="margin-top: 12px; color: #bdbdbd;">© 2026 RPS Stationery. All rights reserved.</p>
</div>
</div>
</body>
</html>`;

  return {
    htmlContent,
    subtotalMrp,
    subtotalPrice,
    discountAmount,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid parameter" },
        { status: 400 }
      );
    }

    const userData = await getUserData(uid);
    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const cartItems = await getCartItems(uid);
    const customerName = userData.firstName + (userData.lastName ? " " + userData.lastName : "");
    const { htmlContent, subtotalMrp, subtotalPrice, discountAmount } = buildCartRecoveryEmail(customerName, cartItems);

    return NextResponse.json({
      success: true,
      uid,
      customerName,
      email: userData.email,
      cartItems,
      itemCount: cartItems.length,
      subtotalMrp,
      subtotalPrice,
      totalDiscount: discountAmount,
      totalPrice: subtotalPrice,
      htmlContent,
      preview: true,
    });
  } catch (error) {
    console.error("Error previewing email:", error);
    return NextResponse.json(
      { error: "Failed to generate preview", details: String(error) },
      { status: 500 }
    );
  }
}

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Copy, Edit, Eye, X, Mail, Send } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  originalPrice?: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  blockCount: number;
  createdAt: Date;
  isCustom: boolean;
  preview?: string;
  buttonLink?: string;
}

const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Flash Sale',
    category: 'promotional',
    description: 'Time-sensitive flash sale with countdown timer',
    thumbnail: '⏰',
    blockCount: 4,
    createdAt: new Date(),
    isCustom: false,
    preview: `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Header Banner -->
        <div style="position: relative; overflow: hidden;">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop" alt="Sale Banner" style="width: 100%; height: 300px; object-fit: cover; display: block;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 48px; margin: 0; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🔥 FLASH SALE 🔥</h1>
            <p style="font-size: 24px; margin: 10px 0 0 0; font-weight: 300; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">LIMITED TIME OFFER</p>
          </div>
        </div>

        <!-- Content Section -->
        <div style="padding: 40px 20px; text-align: center;">
          <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 30px; margin: 20px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
            <p style="font-size: 18px; margin: 0 0 20px 0; opacity: 0.95;">Get Amazing Discounts On Premium Products</p>
            <div style="font-size: 56px; font-weight: 900; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">50% OFF</div>
            <p style="font-size: 16px; margin: 20px 0; opacity: 0.95;">Offer Valid Only Today!</p>
            
            <!-- Countdown Timer -->
            <div style="display: flex; justify-content: center; gap: 15px; margin: 30px 0;">
              <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px 20px; min-width: 70px;">
                <div style="font-size: 24px; font-weight: 900;">12</div>
                <div style="font-size: 12px; opacity: 0.8;">Hours</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px 20px; min-width: 70px;">
                <div style="font-size: 24px; font-weight: 900;">34</div>
                <div style="font-size: 12px; opacity: 0.8;">Minutes</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px 20px; min-width: 70px;">
                <div style="font-size: 24px; font-weight: 900;">56</div>
                <div style="font-size: 12px; opacity: 0.8;">Seconds</div>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 50px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 18px; margin: 30px 0; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4); transition: transform 0.3s ease; transform: scale(1);">
            SHOP NOW →
          </a>

          <p style="font-size: 14px; opacity: 0.9; margin-top: 20px;">Free shipping on orders over ₹500 • No code needed</p>
        </div>

        <!-- Footer -->
        <div style="background: rgba(0,0,0,0.2); padding: 20px; text-align: center; font-size: 12px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.1);">
          <p>© 2026 RPS Stationery. All rights reserved.</p>
        </div>
      </div>
    `
  },
  {
    id: '2',
    name: 'New Product Launch',
    category: 'product',
    description: 'Announce new products with features and pricing',
    thumbnail: '🎁',
    blockCount: 5,
    createdAt: new Date(),
    isCustom: false,
    preview: `
      <div style="background: linear-gradient(to bottom, #ffffff, #f8f9fa); color: #333; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
          <p style="font-size: 14px; margin: 0 0 10px 0; opacity: 0.95; letter-spacing: 2px;">✨ INTRODUCING ✨</p>
          <h1 style="font-size: 42px; margin: 0; font-weight: 900;">Premium Writing Collection</h1>
          <p style="font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">Experience Excellence in Every Stroke</p>
        </div>

        <!-- Product Image -->
        <div style="padding: 40px 20px; text-align: center;">
          <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop" alt="Premium Pen Collection" style="width: 100%; max-width: 500px; height: auto; border-radius: 15px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2); display: block; margin: 0 auto;">
        </div>

        <!-- Features Section -->
        <div style="padding: 40px 20px; background: white;">
          <h2 style="text-align: center; font-size: 28px; margin: 0 0 30px 0; color: #667eea;">Why You'll Love It</h2>
          
          <div style="max-width: 600px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <div style="font-size: 28px; margin: 0 0 10px 0;">✍️</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px;">Premium Quality</h3>
              <p style="margin: 0; font-size: 13px; color: #666;">German engineering meets fine design</p>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <div style="font-size: 28px; margin: 0 0 10px 0;">🎨</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px;">Vibrant Colors</h3>
              <p style="margin: 0; font-size: 13px; color: #666;">15 stunning color options</p>
            </div>

            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <div style="font-size: 28px; margin: 0 0 10px 0;">⚡</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px;">Long Lasting</h3>
              <p style="margin: 0; font-size: 13px; color: #666;">Writes for 3km continuously</p>
            </div>

            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <div style="font-size: 28px; margin: 0 0 10px 0;">💼</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px;">Professional</h3>
              <p style="margin: 0; font-size: 13px; color: #666;">Perfect for office & school</p>
            </div>
          </div>
        </div>

        <!-- Pricing Section -->
        <div style="padding: 40px 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); text-align: center; color: white;">
          <p style="font-size: 14px; margin: 0 0 10px 0; opacity: 0.95;">Special Launch Price</p>
          <div style="font-size: 48px; font-weight: 900; margin: 0;">₹299</div>
          <p style="font-size: 14px; margin: 10px 0 0 0; text-decoration: line-through; opacity: 0.8;">Regular Price: ₹499</p>
          
          <a href="#" style="display: inline-block; background: white; color: #f5576c; padding: 14px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; margin: 25px 0; font-size: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            GET YOURS TODAY
          </a>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Free shipping • 30-day money back guarantee • Lifetime customer support</p>
        </div>
      </div>
    `
  },
  {
    id: '3',
    name: 'Weekly Newsletter',
    category: 'newsletter',
    description: 'Regular newsletter with deals and updates',
    thumbnail: '📰',
    blockCount: 6,
    createdAt: new Date(),
    isCustom: false,
    preview: `
      <div style="background: linear-gradient(to bottom, #f5f5f5, #ffffff); color: #333; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2d3436 0%, #636e72 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="font-size: 36px; margin: 0; font-weight: 900;">📰 This Week's Deals</h1>
          <p style="font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Your Weekly Dose of Amazing Offers</p>
        </div>

        <!-- Featured Deal -->
        <div style="padding: 30px 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden; color: white; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
              <div style="padding: 30px; display: flex; flex-direction: column; justify-content: center;">
                <p style="font-size: 12px; margin: 0 0 10px 0; opacity: 0.95; letter-spacing: 1px;">FEATURED THIS WEEK</p>
                <h2 style="font-size: 28px; margin: 0 0 15px 0; font-weight: 900;">Premium Notebook Set</h2>
                <p style="margin: 0 0 20px 0; opacity: 0.95; font-size: 14px;">Eco-friendly, 500 pages, perfect binding</p>
                <div style="font-size: 32px; font-weight: 900; margin: 0 0 15px 0;">40% OFF</div>
                <a href="#" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 900; text-align: center;">
                  Shop Now
                </a>
              </div>
              <div style="background: url('https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=400&fit=crop') center/cover; min-height: 300px;"></div>
            </div>
          </div>
        </div>

        <!-- Deals Grid -->
        <div style="padding: 30px 20px;">
          <h2 style="font-size: 24px; margin: 0 0 25px 0; color: #2d3436;">This Week's Best Deals</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="font-size: 32px; margin: 0 0 10px 0;">✒️</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 900;">Gel Pens Set</h3>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">50 colors premium quality</p>
              <p style="margin: 0; font-size: 18px; color: #f5576c; font-weight: 900;">₹149 <span style="text-decoration: line-through; color: #999; font-size: 14px;">₹299</span></p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="font-size: 32px; margin: 0 0 10px 0;">🖍️</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 900;">Sketch Pencils</h3>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">Professional art grade</p>
              <p style="margin: 0; font-size: 18px; color: #f5576c; font-weight: 900;">₹199 <span style="text-decoration: line-through; color: #999; font-size: 14px;">₹399</span></p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="font-size: 32px; margin: 0 0 10px 0;">🔆</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 900;">Highlighters</h3>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">Neon colors, smooth ink</p>
              <p style="margin: 0; font-size: 18px; color: #f5576c; font-weight: 900;">₹179 <span style="text-decoration: line-through; color: #999; font-size: 14px;">₹349</span></p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="font-size: 32px; margin: 0 0 10px 0;">📕</div>
              <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 900;">Art Canvas</h3>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">100% cotton, acid-free</p>
              <p style="margin: 0; font-size: 18px; color: #f5576c; font-weight: 900;">₹499 <span style="text-decoration: line-through; color: #999; font-size: 14px;">₹799</span></p>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div style="padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">Don't Miss Out!</h2>
          <a href="#" style="display: inline-block; background: white; color: #667eea; padding: 14px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 16px;">
            VIEW ALL DEALS
          </a>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; color: white; padding: 25px 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 RPS Stationery • Your trusted partner for quality supplies</p>
        </div>
      </div>
    `
  },
  {
    id: '4',
    name: 'Seasonal Promotion',
    category: 'seasonal',
    description: 'Holiday and seasonal campaign template',
    thumbnail: '🎉',
    blockCount: 4,
    createdAt: new Date(),
    isCustom: false,
    preview: `
      <div style="background: linear-gradient(to bottom, #ffd89b 0%, #19547b 100%); color: white; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Hero Banner -->
        <div style="position: relative; overflow: hidden; height: 400px;">
          <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=400&fit=crop" alt="Seasonal Sale" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <div style="font-size: 80px; margin: 0;">✨🎄✨</div>
            <h1 style="font-size: 56px; margin: 20px 0 0 0; font-weight: 900; text-shadow: 3px 3px 6px rgba(0,0,0,0.5);">FESTIVE EXTRAVAGANZA</h1>
            <p style="font-size: 20px; margin: 15px 0 0 0; font-weight: 300; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Celebrate the Season with Amazing Deals</p>
          </div>
        </div>

        <!-- Offer Sections -->
        <div style="padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Mega Offer -->
            <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 30px; margin-bottom: 20px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3); text-align: center;">
              <p style="font-size: 14px; margin: 0 0 15px 0; opacity: 0.95; letter-spacing: 2px;">🎁 MEGA OFFER 🎁</p>
              <div style="font-size: 64px; font-weight: 900; margin: 0 0 15px 0;">UPTO 70%</div>
              <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.95;">On Selected Categories</p>
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 50px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 16px; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4);">
                SHOP NOW
              </a>
            </div>

            <!-- Three Column Offers -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 30px 0;">
              <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size: 36px; margin: 0 0 10px 0;">📓</div>
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 900;">Notebooks</h3>
                <p style="margin: 0 0 10px 0; font-size: 12px; opacity: 0.9;">50% OFF</p>
              </div>

              <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size: 36px; margin: 0 0 10px 0;">✒️</div>
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 900;">Pens & Pencils</h3>
                <p style="margin: 0 0 10px 0; font-size: 12px; opacity: 0.9;">Buy 2 Get 1</p>
              </div>

              <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size: 36px; margin: 0 0 10px 0;">🎨</div>
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 900;">Art Supplies</h3>
                <p style="margin: 0 0 10px 0; font-size: 12px; opacity: 0.9;">Flat 60% OFF</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Holiday Message -->
        <div style="padding: 30px 20px; text-align: center; background: rgba(0,0,0,0.2);">
          <p style="font-size: 16px; margin: 0; font-style: italic;">Celebrate with joy, share happiness, create memories with RPS Stationery</p>
        </div>

        <!-- Footer -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
          <p style="margin: 0;">Free Shipping • Gift Wrapping Available • Express Delivery Options</p>
        </div>
      </div>
    `
  },
  {
    id: '5',
    name: 'Abandoned Cart Recovery',
    category: 'retention',
    description: 'Win back customers with special offers',
    thumbnail: '🛒',
    blockCount: 4,
    createdAt: new Date(),
    isCustom: false,
    preview: `
      <div style="background: linear-gradient(to bottom, #ffffff, #f5f5f5); color: #333; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="font-size: 36px; margin: 0; font-weight: 900;">🛒 Wait! Your Cart is Waiting</h1>
          <p style="font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">We've saved your items just for you</p>
        </div>

        <!-- Cart Items Section -->
        <div style="padding: 40px 20px;">
          <h2 style="font-size: 20px; margin: 0 0 25px 0;">Your Selected Items:</h2>
          
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <!-- Item 1 -->
            <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
              <div style="font-size: 48px; flex-shrink: 0;">📓</div>
              <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #333; font-weight: 900;">Premium Notebook</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">500 pages, Hardcover</p>
                <p style="margin: 0; font-size: 16px; color: #ff6b6b; font-weight: 900;">₹299</p>
              </div>
              <div style="text-align: right; font-size: 14px; color: #666;">Qty: 1</div>
            </div>

            <!-- Item 2 -->
            <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
              <div style="font-size: 48px; flex-shrink: 0;">✒️</div>
              <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #333; font-weight: 900;">Gel Pens Set</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">50 colors premium</p>
                <p style="margin: 0; font-size: 16px; color: #ff6b6b; font-weight: 900;">₹149</p>
              </div>
              <div style="text-align: right; font-size: 14px; color: #666;">Qty: 1</div>
            </div>

            <!-- Item 3 -->
            <div style="display: flex; gap: 15px; padding: 15px 0;">
              <div style="font-size: 48px; flex-shrink: 0;">🎨</div>
              <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #333; font-weight: 900;">Art Canvas</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">100% cotton, acid-free</p>
                <p style="margin: 0; font-size: 16px; color: #ff6b6b; font-weight: 900;">₹499</p>
              </div>
              <div style="text-align: right; font-size: 14px; color: #666;">Qty: 2</div>
            </div>

            <!-- Total -->
            <div style="padding-top: 20px; border-top: 2px solid #ff6b6b; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 16px; font-weight: 900; color: #333;">Cart Total:</span>
                <span style="font-size: 24px; font-weight: 900; color: #ff6b6b;">₹1,446</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Special Offer -->
        <div style="padding: 40px 20px; background: linear-gradient(135deg, #ffd89b 0%, #ff6b6b 100%); text-align: center; color: white;">
          <div style="max-width: 500px; margin: 0 auto;">
            <h2 style="font-size: 28px; margin: 0 0 15px 0; font-weight: 900;">⏰ Limited Time Offer!</h2>
            <p style="font-size: 16px; margin: 0 0 25px 0; opacity: 0.95;">Complete your purchase NOW and get an exclusive discount</p>
            
            <div style="background: rgba(255,255,255,0.2); border-radius: 15px; padding: 25px; margin-bottom: 25px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
              <p style="font-size: 14px; margin: 0 0 10px 0; opacity: 0.95;">USE COUPON CODE</p>
              <div style="background: white; color: #ff6b6b; padding: 15px; border-radius: 10px; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin-bottom: 15px;">COMEBACK15</div>
              <p style="font-size: 14px; margin: 0; opacity: 0.95;">15% OFF on your order</p>
            </div>

            <a href="#" style="display: inline-block; background: white; color: #ff6b6b; padding: 16px 50px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
              COMPLETE MY ORDER →
            </a>

            <p style="font-size: 12px; margin: 20px 0 0 0; opacity: 0.9;">Offer valid for 24 hours only</p>
          </div>
        </div>

        <!-- Trust Section -->
        <div style="padding: 30px 20px; background: white; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 32px; margin: 0 0 10px 0;">✅</div>
              <p style="margin: 0; font-size: 13px; color: #666;">Secure Checkout</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 32px; margin: 0 0 10px 0;">🚚</div>
              <p style="margin: 0; font-size: 13px; color: #666;">Free Shipping</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 32px; margin: 0 0 10px 0;">💳</div>
              <p style="margin: 0; font-size: 13px; color: #666;">Multiple Payment Options</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 32px; margin: 0 0 10px 0;">↩️</div>
              <p style="margin: 0; font-size: 13px; color: #666;">30-Day Returns</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2d3436; color: white; padding: 25px 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 RPS Stationery • Your trusted partner since 1995</p>
        </div>
      </div>
    `
  },
];


export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>(BUILT_IN_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [singleEmailRecipient, setSingleEmailRecipient] = useState('');
  const [singleEmailUserId, setSingleEmailUserId] = useState('');
  const [selectedTemplateToSend, setSelectedTemplateToSend] = useState<Template | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<{ userId: string; customerName: string; cartItems: any[]; totalPrice: number } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const categories = [
    { id: 'all', name: 'All', color: 'bg-gray-100' },
    { id: 'promotional', name: 'Promotional', color: 'bg-red-100' },
    { id: 'product', name: 'Product', color: 'bg-blue-100' },
    { id: 'newsletter', name: 'Newsletter', color: 'bg-purple-100' },
    { id: 'seasonal', name: 'Seasonal', color: 'bg-yellow-100' },
    { id: 'retention', name: 'Retention', color: 'bg-green-100' },
  ];

  // Fetch products from database
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.log('Using mock products - API not available');
        // Use mock products as fallback
        setProducts([
          {
            id: '1',
            name: 'Premium Notebook A4',
            price: 299,
            image: 'https://images.unsplash.com/photo-1507842425343-583cf155a306?w=400&h=400&fit=crop',
            category: 'stationery',
            originalPrice: 499,
          },
          {
            id: '2',
            name: 'Professional Pen Set',
            price: 149,
            image: 'https://images.unsplash.com/photo-1577720643272-265f434a4f7f?w=400&h=400&fit=crop',
            category: 'pens',
            originalPrice: 299,
          },
          {
            id: '3',
            name: 'Sketch Pencil Collection',
            price: 199,
            image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
            category: 'pencils',
            originalPrice: 399,
          },
          {
            id: '4',
            name: 'Highlighter Set Premium',
            price: 179,
            image: 'https://images.unsplash.com/photo-1516062423479-7f3a2d9c73d4?w=400&h=400&fit=crop',
            category: 'markers',
            originalPrice: 299,
          },
          {
            id: '5',
            name: 'Professional Art Canvas',
            price: 499,
            image: 'https://images.unsplash.com/photo-1561214115-6d2f1b1b6f8d?w=400&h=400&fit=crop',
            category: 'art',
            originalPrice: 899,
          },
          {
            id: '6',
            name: 'Drawing Board Studio',
            price: 599,
            image: 'https://images.unsplash.com/photo-1565193566173-7ceb7e21d703?w=400&h=400&fit=crop',
            category: 'art',
            originalPrice: 999,
          },
        ]);
      }
    };

    fetchProducts();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Preview email with user's cart
  const previewEmailWithCart = async () => {
    if (!singleEmailRecipient.trim() || !singleEmailUserId.trim()) {
      alert('Please enter both email and user ID');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(singleEmailRecipient)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsPreviewLoading(true);
    try {
      console.log('Fetching preview for uid:', singleEmailUserId);
      const url = `/api/marketing/preview-email?uid=${encodeURIComponent(singleEmailUserId)}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.htmlContent) {
        console.log('Preview HTML received, length:', data.htmlContent.length);
        console.log('First 200 chars of HTML:', data.htmlContent.substring(0, 200));
        console.log('Last 200 chars of HTML:', data.htmlContent.substring(data.htmlContent.length - 200));
        setEmailPreviewHtml(data.htmlContent);
        setPreviewEmail({
          userId: data.uid,
          customerName: data.customerName,
          cartItems: data.cartItems,
          totalPrice: data.totalPrice,
        });
        console.log('About to set showPreviewModal to true');
        setShowPreviewModal(true);
        console.log('Modal should be showing now');
      } else {
        const errorMsg = data.error || 'Failed to generate preview';
        console.error('API returned error:', errorMsg);
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert(`❌ Failed to preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Send single email
  const sendSingleEmail = async () => {
    if (!singleEmailRecipient.trim() || !singleEmailUserId.trim() || !selectedTemplateToSend) {
      alert('Please enter email, user ID, and select template');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(singleEmailRecipient)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'single',
          recipients: [singleEmailRecipient],
          userId: singleEmailUserId,
          subject: selectedTemplateToSend.name,
          htmlContent: emailPreviewHtml || selectedTemplateToSend.preview || '<p>Email from ' + selectedTemplateToSend.name + '</p>',
          templateData: { products },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`✅ Email sent successfully to ${singleEmailRecipient}!\n📦 Products included: ${data.itemsInEmail || 'N/A'}`);
        setSingleEmailRecipient('');
        setSingleEmailUserId('');
        setEmailPreviewHtml(null);
        setPreviewEmail(null);
        setShowPreviewModal(false);
        setShowSendModal(false);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const createTemplate = () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      category: 'custom',
      description: 'Custom template created from scratch',
      thumbnail: '✨',
      blockCount: 1,
      createdAt: new Date(),
      isCustom: true,
    };

    setTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setShowCreateModal(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const duplicateTemplate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
    };
    setTemplates([...templates, duplicate]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and create email templates</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                (selectedCategory === null && cat.id === 'all') || selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : `${cat.color} text-gray-700 hover:${cat.color}`
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            {/* Thumbnail */}
            <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
              <div className="text-6xl">{template.thumbnail}</div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button 
                  onClick={() => setPreviewTemplate(template)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all" 
                  title="Preview"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
                <button 
                  onClick={() => setEditingTemplate(template)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all" 
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  template.category === 'promotional'
                    ? 'bg-red-100 text-red-700'
                    : template.category === 'product'
                    ? 'bg-blue-100 text-blue-700'
                    : template.category === 'newsletter'
                    ? 'bg-purple-100 text-purple-700'
                    : template.category === 'seasonal'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                </span>
                <span className="text-xs text-gray-500">{template.blockCount} blocks</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-sm h-8">
                  <Copy className="w-3 h-3 mr-1" />
                  Use
                </Button>
                {template.isCustom && (
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded border border-gray-200 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Template</h3>
            
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name..."
              className="w-full p-2 rounded border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createTemplate()}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-3">No templates found</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{previewTemplate.name}</h2>
                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div
                className="bg-gray-50 rounded border border-gray-200 p-4"
                dangerouslySetInnerHTML={{ __html: previewTemplate.preview || '<p>Preview not available</p>' }}
              />

              <div className="mt-6 flex gap-2 flex-col">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setPreviewTemplate(null);
                      alert('✅ Template loaded into composer!');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setSelectedTemplateToSend(previewTemplate);
                    setShowSendModal(true);
                    setPreviewTemplate(null);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send This Email Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Edit Template: {editingTemplate.name}</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, category: e.target.value })
                  }
                  className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="promotional">Promotional</option>
                  <option value="product">Product</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="retention">Retention</option>
                </select>
              </div>

              {editingTemplate.isCustom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Preview (Optional)
                  </label>
                  <textarea
                    value={editingTemplate.preview || ''}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, preview: e.target.value })
                    }
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                    rows={4}
                    placeholder="Enter HTML for template preview..."
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingTemplate(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setTemplates(
                    templates.map((t) =>
                      t.id === editingTemplate.id ? editingTemplate : t
                    )
                  );
                  setEditingTemplate(null);
                  alert('✅ Template updated successfully!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Single Email Modal */}
      {showSendModal && selectedTemplateToSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-6 h-6" />
                <h2 className="text-xl font-bold">Send Email</h2>
              </div>
              <p className="text-sm opacity-90">Send "{selectedTemplateToSend.name}" to one person</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={singleEmailRecipient}
                  onChange={(e) => setSingleEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSending || isPreviewLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID (uid from Firestore)</label>
                <input
                  type="text"
                  value={singleEmailUserId}
                  onChange={(e) => setSingleEmailUserId(e.target.value)}
                  placeholder="BBHAifJN2RflsyW4zLr57rirGii1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSending || isPreviewLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Copy user uid from Firebase users collection (e.g., BBHAifJN2RflsyW4zLr57rirGii1)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Template:</strong> {selectedTemplateToSend.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">{selectedTemplateToSend.description}</p>
              </div>

              {previewEmail && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>✅ Preview Generated</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {previewEmail.cartItems.length} cart items for {previewEmail.customerName}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSendModal(false);
                    setSingleEmailRecipient('');
                    setSingleEmailUserId('');
                    setPreviewEmail(null);
                    setEmailPreviewHtml(null);
                    setSelectedTemplateToSend(null);
                  }}
                  disabled={isSending || isPreviewLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={previewEmailWithCart}
                  disabled={isSending || isPreviewLoading || !singleEmailRecipient.trim() || !singleEmailUserId.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                >
                  {isPreviewLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={sendSingleEmail}
                  disabled={isSending || !previewEmail}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  {isSending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showPreviewModal && emailPreviewHtml && previewEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Email Preview</h2>
                    <p className="text-sm opacity-90">Sending to {singleEmailRecipient} ({previewEmail.customerName})</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                  }}
                  className="p-1 hover:bg-blue-500 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Email Preview Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{previewEmail.cartItems.length}</p>
                    <p className="text-sm text-gray-600">Items in Cart</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                    <p className="text-2xl font-bold text-green-600">₹{previewEmail.totalPrice}</p>
                    <p className="text-sm text-gray-600">Subtotal</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">₹{Math.round(previewEmail.totalPrice * 0.85)}</p>
                    <p className="text-sm text-gray-600">With 15% Off</p>
                  </div>
                </div>

                {/* Actual Email HTML Preview */}
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  {emailPreviewHtml && emailPreviewHtml.length > 0 ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
                      style={{ width: '100%', minHeight: '800px', background: 'white' }}
                    />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>No preview available - emailPreviewHtml: {emailPreviewHtml ? 'exists' : 'null'}, length: {emailPreviewHtml?.length || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0 z-10">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreviewModal(false);
                  }}
                  disabled={isSending}
                  className="flex-1"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={sendSingleEmail}
                  disabled={isSending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  {isSending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send This Email Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

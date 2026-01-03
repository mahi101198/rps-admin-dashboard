'use client';

import { useState, useEffect } from 'react';
import { ProductReview } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Helper function to safely convert createdAt to a Date object
function getCreatedAtDate(createdAt: any): Date {
  // If it's already a Date object
  if (createdAt instanceof Date) {
    return createdAt;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof createdAt === 'object' && '_seconds' in createdAt) {
    return new Date(createdAt._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof createdAt === 'string') {
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof createdAt === 'number') {
    return new Date(createdAt);
  }
  
  // Fallback
  return new Date();
}

// Extended review type for display
type ReviewWithDetails = ProductReview & {
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  productInfo?: {
    name: string;
    brand: string;
    images: string[];
  } | null;
};

// Client-side function to get reviews
async function getReviewsAction(): Promise<ProductReview[]> {
  try {
    // This would typically be a server action
    // For now, we'll simulate it with a fetch call to an API endpoint
    const response = await fetch('/api/reviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    const rawData = await response.json();
    
    // Convert createdAt fields to Date objects
    return rawData.map((review: any) => ({
      ...review,
      createdAt: getCreatedAtDate(review.createdAt),
      updatedAt: review.updatedAt ? getCreatedAtDate(review.updatedAt) : new Date()
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

function getRatingBadgeVariant(rating: number) {
  if (rating >= 4) return 'default';
  if (rating >= 3) return 'secondary';
  return 'destructive';
}

function getReviewStats(reviews: ProductReview[]) {
  return {
    total: reviews.length,
    avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    fiveStars: reviews.filter(r => r.rating === 5).length,
    fourStars: reviews.filter(r => r.rating === 4).length,
    threeStars: reviews.filter(r => r.rating === 3).length,
    twoStars: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
    positiveReviews: reviews.filter(r => r.rating >= 4).length,
    negativeReviews: reviews.filter(r => r.rating <= 2).length
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewDetails, setReviewDetails] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await getReviewsAction();
        setReviews(reviewsData);
        
        // In a real implementation, we would fetch review details from the API
        // For now, we'll just use the basic review data
        setReviewDetails(reviewsData.map(review => ({
          ...review,
          userInfo: null,
          productInfo: null
        })));
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">⭐ Reviews Management</h1>
            <p className="text-muted-foreground">Monitor product reviews and customer feedback</p>
          </div>
          <Button disabled>
            📧 Request More Reviews
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">⭐ Reviews Management</h1>
            <p className="text-muted-foreground">Monitor product reviews and customer feedback</p>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getReviewStats(reviews);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⭐ Reviews Management</h1>
          <p className="text-muted-foreground">Monitor product reviews and customer feedback</p>
        </div>
        <Button>
          📧 Request More Reviews
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <span className="text-2xl">⭐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">Overall rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
            <span className="text-2xl">👍</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positiveReviews}</div>
            <p className="text-xs text-muted-foreground">4+ star reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negativeReviews}</div>
            <p className="text-xs text-muted-foreground">1-2 star reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <div className="w-12 text-right">
                  <Badge variant="outline">{stars} ★</Badge>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.total > 0 ? (reviews.filter(r => r.rating === stars).length / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm">
                  {reviews.filter(r => r.rating === stars).length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Reviews</CardTitle>
          <CardDescription>Customer feedback and product ratings</CardDescription>
        </CardHeader>
        <CardContent>
          {reviewDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground mb-4">
                No customer reviews have been submitted yet
              </p>
              <Button>📧 Request Reviews</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewDetails.map((review) => (
                <div key={review.reviewId} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {review.userInfo 
                              ? `${review.userInfo.firstName} ${review.userInfo.lastName}` 
                              : 'Anonymous User'}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {getCreatedAtDate(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant={getRatingBadgeVariant(review.rating)}>
                          {review.rating} Star{review.rating !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">
                          {review.productInfo?.name || 'Unknown Product'}
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {review.comment || 'No comment provided'}
                        </p>
                      </div>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.slice(0, 3).map((image, index) => (
                            <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden">
                              <img 
                                src={image} 
                                alt={`Review image ${index + 1}`} 
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                          {review.images.length > 3 && (
                            <div className="relative w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                              <span className="text-xs">+{review.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
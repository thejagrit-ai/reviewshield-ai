export interface ReviewAnalysis {
  id: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  isFake: boolean;
  fakeProbability: number;
  aiGeneratedProbability: number;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  trustScore: number;
  toxicityScore: number;
  extractedKeywords: string[];
  suspiciousReasoning: string;
  flaggedPatterns: string[];
  productName: string;
  createdAt: string;
}

export interface ProductInsight {
  productName: string;
  reviewsCount: number;
  averageRating: number;
  averageTrustScore: number;
  satisfactionScore: number; // 0-100
  authenticityGrade: "A" | "B" | "C" | "F";
  consensusText: string;
  keyHighlights: string[];
  mainComplaints: string[];
  actionableImprovements: string[];
  lastUpdated: string;
}

export interface SystemLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface DashboardStats {
  totalReviews: number;
  fakeReviewsCount: number;
  realReviewsCount: number;
  averageTrust: number;
  toxicCount: number;
  usersCount: number;
  productsCount: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

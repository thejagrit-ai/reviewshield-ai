import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { appendLog, storeDb, getAnalysisCacheEntry, setAnalysisCacheEntry } from '../../data-store.js';
import { ReviewAnalysis } from '../../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reviews } = req.body as any;
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ error: 'Please submit reviews schema array to run classification.' });
  }

  const authHeader = req.headers.authorization as string | undefined;
  const userEmail = authHeader ? 'authenticated@reviewshield.ai' : 'anonymous@reviewshield.ai';
  const uid = authHeader ? 'authenticated-user' : 'anonymous';
  const results: ReviewAnalysis[] = [];
  const crypto = await import('crypto');
  const missingForJob: Array<{ key: string; item: any }> = [];

  for (const item of reviews) {
    const key = crypto.createHash('md5').update((item.reviewText || '') + '||' + (item.productName || '') + '||' + (item.rating || '')).digest('hex');
    const cached = await getAnalysisCacheEntry(key);
    if (cached) {
      results.push(cached.result);
    } else {
      missingForJob.push({ key, item });
    }
  }

  if (missingForJob.length === 0) {
    await appendLog({
      id: `log-${Math.random().toString(36).substring(2, 11)}`,
      userEmail,
      action: 'EVALUATION_BATCH_CACHE_HIT',
      details: `All ${results.length} reviews served from cache`,
      timestamp: new Date().toISOString()
    });
    return res.json({ success: true, results });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    try {
      ai = new GoogleGenAI({ apiKey: geminiApiKey });
    } catch {
      ai = null;
    }
  }

  for (const entry of missingForJob) {
    const item = entry.item;
    const { reviewText, rating, reviewerName, productName } = item;
    if (!reviewText || reviewText.trim().length === 0) continue;

    const fallbackReviewer = reviewerName || 'Consumer ' + Math.floor(Math.random() * 900 + 100);
    const fallbackProduct = productName || 'Sku Item';
    const actualRating = rating || 5;
    let analysis: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Evaluate the following product review for validity indices:\n\nProduct: "${fallbackProduct}"\nStars: ${actualRating} / 5\nReview Content: "${reviewText}"`,
          config: {
            systemInstruction: 'You are an NLP linguistic forensic auditor for ReviewShield AI. Identify if this review is artificial/fake or competitor toxic smear campaign. Supply output strictly matching this schema.',
            responseMimeType: 'application/json',
            temperature: 0.1,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isFake: { type: Type.BOOLEAN },
                fakeProbability: { type: Type.INTEGER },
                aiGeneratedProbability: { type: Type.INTEGER },
                sentiment: { type: Type.STRING },
                sentimentScore: { type: Type.NUMBER },
                trustScore: { type: Type.INTEGER },
                toxicityScore: { type: Type.INTEGER },
                extractedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                suspiciousReasoning: { type: Type.STRING },
                flaggedPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['isFake', 'fakeProbability', 'aiGeneratedProbability', 'sentiment', 'sentimentScore', 'trustScore', 'toxicityScore', 'extractedKeywords', 'suspiciousReasoning', 'flaggedPatterns']
            }
          }
        });

        if (response.text) {
          try {
            analysis = JSON.parse(response.text.trim());
          } catch {
            analysis = null;
          }
        }
      } catch {
        analysis = null;
      }
    }

    if (!analysis) {
      const gptMarkers = /superb|outstanding|delighted|pleased|worth every cent|best decision ever|highly recommend|absolute trash|horrible performance/gi.test(reviewText);
      const isShort = reviewText.split(' ').length < 8;
      const polarityClash = (actualRating === 5 && /bad|worst|scam|broken|useless/gi.test(reviewText)) || (actualRating === 1 && /great|awesome|excellent|perfect/gi.test(reviewText));

      let fakeProbability = gptMarkers ? 70 : 10;
      if (isShort) fakeProbability += 10;
      if (polarityClash) fakeProbability += 25;
      fakeProbability = Math.min(Math.max(fakeProbability, 5), 95);

      let aiGeneratedProbability = gptMarkers ? 80 : 8;
      aiGeneratedProbability = Math.min(aiGeneratedProbability, 92);

      const toxicityScore = /scam|fraud|trash|disaster|refund/gi.test(reviewText) ? 70 : 4;
      const sentiment = actualRating >= 4 ? 'positive' : actualRating === 3 ? 'neutral' : 'negative';
      const sentimentScore = sentiment === 'positive' ? 0.8 : sentiment === 'neutral' ? 0.1 : -0.8;
      const trustScore = 100 - Math.round((fakeProbability + aiGeneratedProbability) / 2);
      const flagged: string[] = [];

      if (gptMarkers) flagged.push('Over-generalized positive template terms');
      if (polarityClash) flagged.push('Star score opposed to core textual language polarity');
      if (toxicityScore > 55) flagged.push('Potentially weaponized competitor terminology');

      analysis = {
        isFake: fakeProbability > 50,
        fakeProbability,
        aiGeneratedProbability,
        sentiment,
        sentimentScore,
        trustScore,
        toxicityScore,
        extractedKeywords: reviewText.split(/\s+/).slice(0, 3).map((word: string) => word.replace(/[^a-zA-Z]/g, '')),
        suspiciousReasoning: fakeProbability > 50
          ? 'Unnatural high-intensity marketing metrics or emotional polarity matches LLM bot outputs.'
          : 'Review has natural variance, realistic expectations, and regular human grammatical layout.',
        flaggedPatterns: flagged
      };
    }

    const reviewRecord: ReviewAnalysis & { userId: string } = {
      id: 'rev-' + Math.random().toString(36).substring(2, 11),
      reviewerName: fallbackReviewer,
      rating: actualRating,
      reviewText,
      isFake: analysis.isFake,
      fakeProbability: analysis.fakeProbability,
      aiGeneratedProbability: analysis.aiGeneratedProbability,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      trustScore: analysis.trustScore,
      toxicityScore: analysis.toxicityScore,
      extractedKeywords: analysis.extractedKeywords || [],
      suspiciousReasoning: analysis.suspiciousReasoning,
      flaggedPatterns: analysis.flaggedPatterns || [],
      productName: fallbackProduct,
      createdAt: new Date().toISOString(),
      userId: uid
    };

    results.push(reviewRecord);
    await setAnalysisCacheEntry(entry.key, { result: reviewRecord, provisional: true, createdAt: new Date().toISOString() });
    await storeDb.collection('reviews').doc(reviewRecord.id).set(reviewRecord, { merge: true });
  }

  await appendLog({
    id: `log-${Math.random().toString(36).substring(2, 11)}`,
    userEmail,
    action: 'EVALUATION_BATCH',
    details: `Parsed ${results.length} reviews. Served ${results.length - missingForJob.length} from cache, queued ${missingForJob.length} for AI processing.`,
    timestamp: new Date().toISOString()
  });

  const jobId = `job-${Math.random().toString(36).slice(2, 9)}`;
  await storeDb.collection('analysis_jobs').doc(jobId).set({ id: jobId, createdAt: new Date().toISOString(), status: 'pending', userEmail, items: missingForJob.map((m) => ({ key: m.key, item: m.item })) });

  return res.json({ success: true, results, jobId });
}

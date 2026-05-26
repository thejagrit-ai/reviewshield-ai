import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

async function readDb() {
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    if (!raw.trim()) {
      return { analysisJobs: [], analysisCache: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      analysisJobs: Array.isArray(parsed.analysisJobs) ? parsed.analysisJobs : [],
      analysisCache: parsed.analysisCache && typeof parsed.analysisCache === 'object' ? parsed.analysisCache : {},
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { analysisJobs: [], analysisCache: {} };
    }
    throw error;
  }
}

async function writeDb(state) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(state, null, 2));
}

async function fallbackAnalyze(review) {
  const reviewText = review.reviewText || '';
  const rating = review.rating || 5;

  const gptMarkers = /superb|outstanding|delighted|pleased|worth every cent|best decision ever|highly recommend|absolute trash|horrible performance/gi.test(reviewText);
  const isShort = reviewText.split(' ').length < 8;
  const polarityClash = (rating === 5 && /bad|worst|scam|broken|useless/gi.test(reviewText)) || (rating === 1 && /great|awesome|excellent|perfect/gi.test(reviewText));

  let fakeProbability = gptMarkers ? 70 : 10;
  if (isShort) fakeProbability += 10;
  if (polarityClash) fakeProbability += 25;
  fakeProbability = Math.min(Math.max(fakeProbability, 5), 95);

  let aiGeneratedProbability = gptMarkers ? 80 : 8;
  aiGeneratedProbability = Math.min(aiGeneratedProbability, 92);

  const toxicityScore = /scam|fraud|trash|disaster|refund/gi.test(reviewText) ? 70 : 4;
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
  const sentimentScore = sentiment === 'positive' ? 0.8 : sentiment === 'neutral' ? 0.1 : -0.8;
  const trustScore = 100 - Math.round((fakeProbability + aiGeneratedProbability) / 2);

  const flagged = [];
  if (gptMarkers) flagged.push('Over-generalized positive template terms');
  if (polarityClash) flagged.push('Star score opposed to core textual language polarity');
  if (toxicityScore > 55) flagged.push('Potentially weaponized competitor terminology');

  return {
    isFake: fakeProbability > 50,
    fakeProbability,
    aiGeneratedProbability,
    sentiment,
    sentimentScore,
    trustScore,
    toxicityScore,
    extractedKeywords: reviewText.split(/\s+/).slice(0, 3).map((word) => word.replace(/[^a-zA-Z]/g, '')),
    suspiciousReasoning: fakeProbability > 50
      ? 'Unnatural high-intensity marketing metrics or emotional polarity matches LLM bot outputs.'
      : 'Review has natural variance, realistic expectations, and regular human grammatical layout.',
    flaggedPatterns: flagged
  };
}

async function processJobs() {
  console.log('Worker: scanning for pending jobs...');
  const db = await readDb();
  const pendingJobs = db.analysisJobs.filter((job) => job.status === 'pending').slice(0, 5);

  if (pendingJobs.length === 0) {
    console.log('Worker: no pending jobs.');
    return;
  }

  for (const job of pendingJobs) {
    console.log('Worker: processing job', job.id);
    try {
      for (const entry of job.items) {
        const analysis = await fallbackAnalyze(entry.item);
        const reviewRecord = {
          id: 'rev-' + Math.random().toString(36).substring(2, 11),
          reviewerName: entry.item.reviewerName || ('Consumer ' + Math.floor(Math.random() * 900 + 100)),
          rating: entry.item.rating || 5,
          reviewText: entry.item.reviewText,
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
          productName: entry.item.productName || 'Unknown',
          createdAt: new Date().toISOString(),
          userId: job.userEmail || 'anonymous'
        };

        db.analysisCache[entry.key] = {
          result: reviewRecord,
          provisional: false,
          createdAt: new Date().toISOString()
        };
      }

      job.status = 'done';
      job.completedAt = new Date().toISOString();
      console.log('Worker: job completed', job.id);
    } catch (error) {
      console.error('Worker: job failed', job.id, error);
      job.status = 'failed';
      job.error = String(error);
      job.updatedAt = new Date().toISOString();
    }
  }

  await writeDb(db);
}

(async () => {
  try {
    await processJobs();
  } catch (error) {
    console.error('Worker error', error);
    process.exit(1);
  }
})();

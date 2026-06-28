import { db } from '../firebase';
import { ref, get, set, onValue, type Unsubscribe } from 'firebase/database';

export interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
  updatedAt: number;
  /** Knockout only: team the user expects to advance ('home' | 'away'). */
  advance?: 'home' | 'away';
  /** Knockout only: hope star placed on this match. */
  star?: boolean;
}

export interface UserPredictions {
  [gameId: string]: Prediction;
}

/**
 * Get all predictions for a user
 */
export const getUserPredictions = async (
  userId: string
): Promise<UserPredictions> => {
  const predictionsRef = ref(db, `predictions/${userId}`);
  const snapshot = await get(predictionsRef);

  if (!snapshot.exists()) {
    return {};
  }

  return snapshot.val() as UserPredictions;
};

/**
 * Get a single prediction for a user and game
 */
export const getPrediction = async (
  userId: string,
  gameId: number
): Promise<Prediction | null> => {
  const predictionRef = ref(db, `predictions/${userId}/${gameId}`);
  const snapshot = await get(predictionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as Prediction;
};

/**
 * Save or update a prediction.
 *
 * For knockout matches pass `opts.advance` (team expected to go through) and
 * `opts.star` (hope star). One star per round is enforced in the UI by
 * disabling the toggle while another match in the round is starred.
 */
export const savePrediction = async (
  userId: string,
  gameId: number,
  homePrediction: number,
  awayPrediction: number,
  opts?: { advance?: 'home' | 'away'; star?: boolean }
): Promise<void> => {
  const prediction: Prediction = {
    homePrediction,
    awayPrediction,
    points: 0, // Points calculated server-side
    updatedAt: Date.now(),
  };
  if (opts?.advance) prediction.advance = opts.advance;
  if (opts?.star) prediction.star = true;

  await set(ref(db, `predictions/${userId}/${gameId}`), prediction);
};

/**
 * Subscribe to real-time updates for a user's predictions
 */
export const subscribeToPredictions = (
  userId: string,
  callback: (predictions: UserPredictions) => void
): Unsubscribe => {
  const predictionsRef = ref(db, `predictions/${userId}`);

  return onValue(predictionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserPredictions);
    } else {
      callback({});
    }
  });
};

import { NextFunction, Request, Response, Router } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.middleware";
import { predictionRateLimiter } from "../middleware/rateLimiter.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  batchSubmitPredictionsSchema,
  submitPredictionSchema,
} from "../schemas/predictions.schema";
import predictionService from "../services/prediction.service";

const router = Router();

/**
 * @openapi
 * /api/predictions/submit:
 *   post:
 *     tags: [Predictions]
 *     summary: Submit a prediction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roundId, amount, side]
 *             properties:
 *               roundId:
 *                 type: string
 *               amount:
 *                 type: number
 *               side:
 *                 type: string
 *                 enum: [up, down]
 *               priceRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *     responses:
 *       200:
 *         description: Prediction submitted
 */
router.post(
  "/submit",
  authenticateUser,
  predictionRateLimiter,
  validate(submitPredictionSchema),
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { roundId, amount, side, priceRange } = req.body;
      const userId = req.user.userId;

      const prediction = await predictionService.submitPrediction(
        userId,
        roundId,
        amount,
        side,
        priceRange,
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * @openapi
 * /api/predictions/batch-submit:
 *   post:
 *     tags: [Predictions]
 *     summary: Submit multiple predictions at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [predictions]
 *             properties:
 *               predictions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [roundId, amount]
 *     responses:
 *       200:
 *         description: Predictions processed
 */
router.post(
  "/batch-submit",
  authenticateUser,
  predictionRateLimiter,
  validate(batchSubmitPredictionsSchema),
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { predictions } = req.body;
      const userId = req.user.userId;

      const result = await predictionService.submitBatchPredictions(
        userId,
        predictions,
      );

      res.json({
        ...result,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * @openapi
 * /api/predictions/user:
 *   get:
 *     tags: [Predictions]
 *     summary: Get user predictions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of predictions
 */
router.get(
  "/user",
  authenticateUser,
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;

      const predictions = await predictionService.getUserPredictions(userId);

      res.json({
        success: true,
        predictions,
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * @openapi
 * /api/predictions/round/{roundId}:
 *   get:
 *     tags: [Predictions]
 *     summary: Get predictions for a round
 *     parameters:
 *       - in: path
 *         name: roundId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of predictions
 */
router.get(
  "/round/:roundId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roundId } = req.params;

      const predictions = await predictionService.getRoundPredictions(roundId);

      res.json({
        success: true,
        predictions,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

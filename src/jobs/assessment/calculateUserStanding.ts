import { Job } from '@hokify/agenda';
import { SalesSession } from '../../models/SalesSession.js';
import { User } from '../../models/User.js';
import {
  calculateUserStanding,
  getStandingConfigurationByModuleAndProduct,
} from '../../utils/prudential-standing.js';
import { UserStanding } from '../../models/UserStanding.js';

interface CalculateUserStandingJobData {
  sessionId: string;
}

export async function calculateUserStandingJob(
  job: Job<CalculateUserStandingJobData>,
): Promise<void> {
  const { sessionId } = job.attrs.data;
  try {
    console.log(`[Standing] Starting calculation for session: ${sessionId}`);

    const session = await SalesSession.findById(sessionId).populate('product');
    if (!session) {
      console.log(`[Standing] Session ${sessionId} not found.`);
      throw new Error(`Session not found: ${sessionId}`);
    }

    const user = await User.findById(session.user);
    if (!user || !user.company) {
      console.log(
        `[Standing] User or user's company not found for session: ${sessionId}`,
      );
      return; // Or throw an error, depending on desired behavior for users without a company
    }

    const productFriendlyId =
      session.product?.friendlyId ?? session.product?.toString();
    console.log(
      `[Standing] Looking up config for module: ${session.callType}, product: ${productFriendlyId}`,
    );

    const config = getStandingConfigurationByModuleAndProduct(
      session.callType,
      productFriendlyId,
    );
    if (!config) {
      console.log(
        `[Standing] No standing configuration found for module ${session.callType} and product ${productFriendlyId}.`,
      );
      return;
    }

    console.log(`[Standing] Found config: ${config.base.friendlyId}`);

    const achievedStanding = calculateUserStanding(session, config);
    if (achievedStanding) {
      console.log(
        `[Standing] User ${user._id} achieved standing: ${achievedStanding.tierName} (Level ${achievedStanding.tierLevel})`,
      );
      // Create the UserStanding record.
      await UserStanding.create({
        user: user._id,
        company: user.company,
        session: session._id,
        persona: session.persona?._id,
        standingConfigurationId: config.base.friendlyId,
        tierName: achievedStanding.tierName,
        tierLevel: achievedStanding.tierLevel,
      });

      console.log(
        `[Standing] Successfully saved standing for user ${user._id} and session ${sessionId}.`,
      );
    } else {
      console.log(`[Standing] No standing achieved for session: ${sessionId}`);
    }
  } catch (error) {
    console.error(
      `[Standing] Error calculating user standing for session ${sessionId}:`,
      error,
    );
  } finally {
    // Always unset the generating flag
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.isStandingGenerating': false },
    });
    console.log(
      `[Standing] Unset isStandingGenerating flag for session: ${sessionId}`,
    );
  }
}

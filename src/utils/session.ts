import { Message } from '../models/Message.js';
import { SalesSession } from '../models/SalesSession.js';
import { User } from '../models/User.js';

export const MIN_USER_MESSAGES = 2;
export const MIN_WORD_COUNT = 30;
export const MIN_TOTAL_MESSAGES = 6;

const isUserMessage = (msg: any): boolean => msg?.role === 'user';

const countWords = (content: string): number => {
  // Unicode ranges for languages without word spacing:
  // - Mandarin/Chinese: \u4e00-\u9fff
  // - Thai: \u0E00-\u0E7F
  // - Lao: \u0E80-\u0EFF
  // - Khmer: \u1780-\u17FF
  // - Japanese (Hiragana/Katakana/Kanji): \u3040-\u309F\u30A0-\u30FF\u4e00-\u9fff
  const noSpaceLanguageRegex =
    /[\u4e00-\u9fff\u0E00-\u0E7F\u0E80-\u0EFF\u1780-\u17FF\u3040-\u309F\u30A0-\u30FF]/;
  const containsNoSpaceLanguage = noSpaceLanguageRegex.test(content);

  if (containsNoSpaceLanguage) {
    // Count characters for non-space languages
    const noSpaceChars =
      content.match(
        /[\u4e00-\u9fff\u0E00-\u0E7F\u0E80-\u0EFF\u1780-\u17FF\u3040-\u309F\u30A0-\u30FF]/g,
      ) || [];
    // Count space-separated words for other content (e.g., English mixed in)
    const otherContent = content.replace(
      /[\u4e00-\u9fff\u0E00-\u0E7F\u0E80-\u0EFF\u1780-\u17FF\u3040-\u309F\u30A0-\u30FF]/g,
      '',
    );
    const otherWords = otherContent.split(/\s+/).filter(Boolean).length;
    return noSpaceChars.length + otherWords;
  }

  // For space-separated languages (English, etc.)
  return content.split(/\s+/).filter(Boolean).length;
};

const getUserMessagesWordCount = (messages: any[]): number =>
  messages.reduce((count, msg) => {
    if (msg?.content && typeof msg.content === 'string' && isUserMessage(msg)) {
      return count + countWords(msg.content.trim());
    }
    return count;
  }, 0);

export const checkBriefRoleplay = async (messages: any[]): Promise<boolean> => {
  const userMessageCount = messages.filter(isUserMessage).length;
  const totalUserMessagesWordCount = getUserMessagesWordCount(messages);
  const totalMessageCount = messages.length;

  const hasMinimumUserMessageWordCount =
    totalUserMessagesWordCount >= MIN_WORD_COUNT;
  const hasMinimumUserMessages = userMessageCount >= MIN_USER_MESSAGES;
  const hasMinimumTotalMessages = totalMessageCount >= MIN_TOTAL_MESSAGES;

  return (
    !hasMinimumUserMessageWordCount ||
    !hasMinimumUserMessages ||
    !hasMinimumTotalMessages
  );
};

// Helper functions
export const processTranscript = async (
  transcript: any[],
): Promise<{ messageIds: string[]; messages: any[] }> => {
  const messageIds: string[] = [];
  const messages = await Promise.all(
    transcript.map(async (msg) => {
      const message = await Message.create({
        role: msg.role,
        content: msg.content,
        feedback: msg.feedback,
        sent: new Date(msg.sent),
        ...(msg.responseTimeSec != null
          ? { responseTimeSec: msg.responseTimeSec }
          : {}),
      });
      messageIds.push(message._id.toString());
      return { role: msg.role, content: msg.content, sent: new Date(msg.sent) };
    }),
  );

  return { messageIds, messages };
};

// Helper functions
export const processFakeTranscript = async (): Promise<{
  messageIds: string[];
  messages: any[];
}> => {
  const messageIds: string[] = [];
  let messages: any[] = [];

  //msig test transcript
  let tempChat = [
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Good morning, Mr. Rodriguez! Thank you so much for taking the time to meet with me today.',
      sent: new Date('2024-01-15T09:00:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'Good morning, Maria. Thank you for coming.',
      sent: new Date('2024-01-15T09:00:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'I am Maria Santos, and I am a Manulife Philippines Financial Advisor. My role as a Manulife Philippines Financial Advisor is to help individuals and families like yourself understand their financial needs and find the right protection solutions.',
      sent: new Date('2024-01-15T09:00:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'That sounds great. I have heard good things about Manulife.',
      sent: new Date('2024-01-15T09:00:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Thank you, Carlos. Let me provide you with a brief introduction of Manulife as a company. Manulife is a leading international financial services provider with over 155 years of experience. Here in the Philippines, we are committed to our Corporate Social Responsibility by supporting education, environmental sustainability, and community development programs that make a positive impact on Filipino families.',
      sent: new Date('2024-01-15T09:01:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "That's impressive. I appreciate companies that give back to the community.",
      sent: new Date('2024-01-15T09:01:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Now Carlos, let me walk you through the different life stages we all experience. We start as children, dependent on our parents, then become young adults starting our careers, then we build families, reach our peak earning years, and eventually retire. Each stage has unique financial needs and responsibilities.',
      sent: new Date('2024-01-15T09:01:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "Yes, that makes sense. I'm currently in that family-building stage with a wife and young child.",
      sent: new Date('2024-01-15T09:01:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Perfect. This brings me to what we call the Circle of Life and the concept of 28,000 days. Carlos, did you know that the average person lives approximately 28,000 days? This helps us visualize how precious and limited our time is, and why we need to make every day count in building our financial security.',
      sent: new Date('2024-01-15T09:02:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'Wow, 28,000 days? That really puts life in perspective.',
      sent: new Date('2024-01-15T09:02:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Exactly. Now, when discussing the Hierarchy of Financial Needs, I always emphasize the importance of building a strong financial foundation through protection, life, and health coverage. Just like Maslow's hierarchy, we need to secure our basic financial safety before we can focus on wealth building and investment goals.",
      sent: new Date('2024-01-15T09:02:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'That makes perfect sense. Protection first, then growth.',
      sent: new Date('2024-01-15T09:02:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Carlos, let me ask you an open-ended question about life's disruptions: How do you think an unexpected death or serious illness could impact your family's financial future?",
      sent: new Date('2024-01-15T09:03:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "That's a scary thought. My wife would struggle to maintain our lifestyle and pay for our child's education without my income.",
      sent: new Date('2024-01-15T09:03:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "You're absolutely right to be concerned. Let me share some statistics with you to create awareness of the urgency. In the Philippines, 1 in 4 families experience a significant health crisis before age 65, and the average cost of critical illness treatment can range from 500,000 to 2 million pesos. These statistics show why we cannot afford to delay our financial protection.",
      sent: new Date('2024-01-15T09:03:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        'Those numbers are alarming. I never realized the risk was so high.',
      sent: new Date('2024-01-15T09:03:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Now Carlos, let's talk about dreams in life. What are your dreams for yourself and your loved ones? What do you hope to achieve for your family's future?",
      sent: new Date('2024-01-15T09:04:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        'I want to send my daughter to a good university, maybe even abroad. I also want to retire comfortably and travel with my wife.',
      sent: new Date('2024-01-15T09:04:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Those are wonderful dreams, Carlos. Here are some statistics that will build awareness and encourage action: The cost of university education increases by 10-15% annually, and only 2 out of 10 Filipinos have adequate retirement savings. But the good news is, with proper planning starting today, we can make your dreams achievable.',
      sent: new Date('2024-01-15T09:04:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: "I see. So the earlier I start, the better prepared I'll be.",
      sent: new Date('2024-01-15T09:04:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Exactly right, Carlos. Now let's get into the financial needs analysis. First, how much household income would you want to replace when death occurs?",
      sent: new Date('2024-01-15T09:05:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "Well, I earn about 50,000 pesos monthly, and that's our main source of income.",
      sent: new Date('2024-01-15T09:05:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Good. Now, how long would you want this income replacement to continue for your family?',
      sent: new Date('2024-01-15T09:05:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        'I would want it to last until my daughter finishes college and my wife can be financially independent. Maybe 20 years?',
      sent: new Date('2024-01-15T09:05:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Perfect. Based on the projection table, with 50,000 pesos monthly income for 20 years, accounting for 3% inflation, your Income Protection need would be approximately 15 million pesos.',
      sent: new Date('2024-01-15T09:06:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: "15 million? That's a substantial amount.",
      sent: new Date('2024-01-15T09:06:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Yes, but remember this provides 20 years of financial security for your family. Now Carlos, what is your preferred hospital from this list in case of a medical emergency or serious illness? We have Makati Medical Center, St. Luke's Medical Center, Asian Hospital, or The Medical City.",
      sent: new Date('2024-01-15T09:06:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "I would prefer St. Luke's Medical Center. We've been there before and trust their quality of care.",
      sent: new Date('2024-01-15T09:06:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Excellent choice. Based on your hospital preference of St. Luke's Medical Center, I recommend a Health Emergency Fund of 800,000 pesos. This covers major procedures and treatments at their facility.",
      sent: new Date('2024-01-15T09:07:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'That sounds reasonable for quality healthcare.',
      sent: new Date('2024-01-15T09:07:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'When computing this Health Emergency Fund recommendation, I factored in 3-6 months worth of your household income which is 150,000 to 300,000 pesos, plus the hospital costs. I also considered that you mentioned you have HMO coverage through your employer, so this amount supplements your existing health coverage.',
      sent: new Date('2024-01-15T09:07:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "Yes, that's right. My company provides basic HMO but it has limitations.",
      sent: new Date('2024-01-15T09:07:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Now Carlos, tell me about your child's age and at which school would you like to send her to for her education?",
      sent: new Date('2024-01-15T09:08:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "She's currently 5 years old, and we're hoping to send her to Ateneo de Manila University for college.",
      sent: new Date('2024-01-15T09:08:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Excellent. Based on your daughter being 5 years old and your preference for Ateneo de Manila University, using the projection table, the Education Fund needed would be approximately 2.5 million pesos to cover 4 years of tuition, considering annual increases.',
      sent: new Date('2024-01-15T09:08:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: "That's quite an investment, but education is so important.",
      sent: new Date('2024-01-15T09:08:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Absolutely. Now, what is your desired retirement age and what kind of pension are you expecting?',
      sent: new Date('2024-01-15T09:09:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "I'd like to retire at 60, and I expect to receive about 15,000 pesos monthly from SSS.",
      sent: new Date('2024-01-15T09:09:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Based on your desired retirement at age 60 and current lifestyle, using the projection table, your Retirement Fund needed would be approximately 12 million pesos to maintain your standard of living for 25 years of retirement, considering your SSS pension.',
      sent: new Date('2024-01-15T09:09:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "These are big numbers, but I understand they're necessary for financial security.",
      sent: new Date('2024-01-15T09:09:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Now Carlos, what coverage do you think you need for each of these identified needs - the income protection, health emergency fund, education fund, and retirement fund?',
      sent: new Date('2024-01-15T09:10:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "Well, I think I need to prioritize based on my current budget and what's most urgent.",
      sent: new Date('2024-01-15T09:10:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "That's exactly right. So Carlos, what would you say are your financial needs priorities? Which of these four areas - income protection, health emergency, education, or retirement - matters most to you right now?",
      sent: new Date('2024-01-15T09:10:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        'I think income protection is most critical since my family depends on me, then health emergency fund, then education for my daughter, and finally retirement.',
      sent: new Date('2024-01-15T09:10:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Excellent prioritization, Carlos. Now let me ask you the questions for our Client Profile Section. What is your risk tolerance - are you conservative, moderate, or aggressive when it comes to investments?',
      sent: new Date('2024-01-15T09:11:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "I would say I'm moderate. I want some growth but not too much risk.",
      sent: new Date('2024-01-15T09:11:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Perfect. Now let me guide you through our Client Suitability Assessment. Based on your moderate risk tolerance, 50,000 monthly income, young family situation, and 25 years until retirement, the assessment results show that a balanced approach with 60% protection products and 40% investment-linked products would be most suitable for your profile.',
      sent: new Date('2024-01-15T09:11:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'That sounds like a sensible mix for someone in my situation.',
      sent: new Date('2024-01-15T09:11:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "Absolutely. Carlos, I will be sending a copy of this accomplished form to your email address so you have all the details of our discussion and the recommendations we've identified together.",
      sent: new Date('2024-01-15T09:12:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "That would be very helpful. I'd like to review everything with my wife.",
      sent: new Date('2024-01-15T09:12:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Of course! Carlos, let me schedule a second meeting with you. How does next Friday at 2 PM sound? We can finalize the product recommendations and start the application process.',
      sent: new Date('2024-01-15T09:12:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'Next Friday at 2 PM works perfectly for me.',
      sent: new Date('2024-01-15T09:12:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Wonderful. Carlos, do you know anyone else who might benefit from this kind of financial needs analysis? Perhaps colleagues, friends, or family members who are in similar life stages?',
      sent: new Date('2024-01-15T09:13:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        'Actually, my brother-in-law just got married and started a new job. He might be interested.',
      sent: new Date('2024-01-15T09:13:15Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        "That's perfect! Finally Carlos, I'd like to invite you to scan this QR code to provide feedback on today's presentation. Your input helps me improve my service and better serve families like yours.",
      sent: new Date('2024-01-15T09:13:30Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content:
        "Absolutely, I'll scan it right now. This has been very informative, Maria.",
      sent: new Date('2024-01-15T09:13:45Z'),
    },
    {
      role: 'user',
      author: 'Maria Santos (Financial Advisor)',
      content:
        'Thank you so much, Carlos! I look forward to our meeting next Friday. Have a great day!',
      sent: new Date('2024-01-15T09:14:00Z'),
    },
    {
      role: 'ai',
      author: 'Carlos Rodriguez',
      content: 'Thank you, Maria. See you next Friday!',
      sent: new Date('2024-01-15T09:14:15Z'),
    },
  ];

  await Promise.all(
    tempChat.map(async (msg) => {
      const message = await Message.create({
        role: msg.role,
        content: msg.content,
        sent: new Date(msg.sent),
      });
      messageIds.push(message._id.toString());
      messages.push({ role: msg.role, content: msg.content });
    }),
  );

  return { messageIds, messages };
};

/**
 * Helper function to validate session access for company
 */
export async function validateSessionAccess(
  sessionId: string,
  companyId: string,
) {
  const session = await SalesSession.findById(sessionId).lean();
  if (!session) {
    return { session: null, error: 'Session not found' };
  }

  // Check if session belongs to a user from the same company
  if (session.user) {
    const sessionUser = await User.findById(session.user)
      .select('company')
      .lean();
    if (!sessionUser || sessionUser.company?.toString() !== companyId) {
      return {
        session: null,
        error: 'Access denied: Session does not belong to your company',
      };
    }
  }

  return { session, error: null };
}

/**
 * Helper function to get messages for session
 */
export async function getSessionMessages(session: any) {
  return await Message.find({
    _id: { $in: session.messages },
    content: { $exists: true },
  })
    .sort({ sent: 1 })
    .select('role content');
}

/**
 * Helper function to check if session has enough messages
 */
export function isSessionTooBrief(messages: any[]): boolean {
  return messages.length < MIN_TOTAL_MESSAGES;
}

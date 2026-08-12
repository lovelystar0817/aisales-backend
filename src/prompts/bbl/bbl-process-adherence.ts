import { SalesFramework } from '../../frameworks/types.js';

// Helper function to get framework-specific example assessment
function getBBLExampleAssessment(
  framework: string,
  characterName: string,
): string {
  switch (framework) {
    case SalesFramework.BBL_CLIENT_REVIVAL_ADVISORY_MODEL:
      return `{{
  "processAdherence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": 58,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Greeting & Context Setting",
        "score": 16,
        "maxScore": 25,
        "strengths": [
          "Warmly greeted ${characterName} and expressed appreciation for the relationship",
          "Acknowledged the time gap without placing blame"
        ],
        "toImprove": [
          {{
            "text": "You didn't reference any specific past interactions or milestones with ${characterName}. Start by mentioning a specific previous conversation: 'Last time we spoke, you mentioned planning for your child's education. I've been thinking about how we might support that goal.' This reconnects and shows you remember their priorities.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Explore Reasons for Disengagement",
        "score": 13,
        "maxScore": 25,
        "strengths": [
          "Asked ${characterName} about reasons for the gap in contact"
        ],
        "toImprove": [
          {{
            "text": "You asked about the gap but didn't actively listen and paraphrase ${characterName}'s response. After they share, summarize: 'So if I'm understanding correctly, the business has required more focus lately, and your child's education planning is becoming a priority. Can you tell me more about what aspects feel most important right now?'",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't explain the benefits of staying active with Bangkok Bank. Highlight: 'Many clients at this stage find that staying active helps them maintain their Wealth privileges and ensures they don't miss opportunities that align with their goals, like preferential rates or exclusive investment options.'",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Explore Needs & Re-engagement",
        "score": 14,
        "maxScore": 25,
        "strengths": [
          "Asked ${characterName} about their current priorities",
          "Kept questioning light and non-intrusive, appropriate for revival"
        ],
        "toImprove": [
          {{
            "text": "You could have better linked re-engagement options to ${characterName}'s updated needs. After understanding their priorities, connect solutions: 'Given your focus on education planning and the business stabilizing, we have simplified savings options that require minimal ongoing attention—maybe just a quarterly 15-minute check-in.'",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Call to Action",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "Proposed low-commitment next steps appropriate for revival"
        ],
        "toImprove": [
          {{
            "text": "You didn't summarize the key needs before proposing next steps. Structure your closing: 'Let me recap—you've been focused on the business, education planning is a priority, and time is limited. I can send a brief 2-3 page overview for you to review when convenient. Does that work?'",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't explicitly remove pressure or give ${characterName} control over the pace. Add: 'And ${characterName}, if after reviewing you feel the timing still isn't right, that's completely fine—we're here whenever you're ready. No pressure at all.'",
            "status": "warning",
            "correction": null
          }}
        ]
      }}
    ]
  }}
}}`;

    case SalesFramework.BBL_CLIENT_UPGRADE_ADVISORY_MODEL:
      return `{{
  "processAdherence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": 55,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Greeting & Context Setting",
        "score": 14,
        "maxScore": 25,
        "strengths": [
          "Warmly welcomed ${characterName} and acknowledged their loyalty to Bangkok Bank",
          "Asked about current life priorities and upcoming financial goals"
        ],
        "toImprove": [
          {{  
            "text": "You opened the call professionally but didn't acknowledge ${characterName}'s recent achievements with the bank. Start by recognizing their milestone: 'Congratulations on reaching Premier status with us, ${characterName}! Your account has grown significantly over the past year, and we really value your continued trust in Bangkok Bank.' This sets a positive tone and makes them feel valued right from the start.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You asked about general plans but missed probing into upcoming life events that could impact financial needs. Try asking: 'Looking ahead to the next 12-18 months, are there any major life events coming up—perhaps a child's education, property purchase, or retirement planning—that we should factor into your financial strategy?' This helps uncover planning opportunities and shows you're thinking long-term with them.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Introduction to New Status & Offerings",
        "score": 11,
        "maxScore": 25,
        "strengths": [
          "Mentioned new investment opportunities available to ${characterName}"
        ],
        "toImprove": [
          {{
            "text": "You listed available products but didn't frame them as recognition of ${characterName}'s success. Instead, position it as: 'Because you've achieved Premier status, you now have access to exclusive investment opportunities that aren't available to regular customers. This is our way of recognizing your financial success and offering you tools to grow your wealth even further.' This makes the offerings feel like rewards rather than sales pitches.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You mentioned new offerings generally without connecting them to ${characterName}'s specific goals mentioned earlier. Bridge the gap by saying: 'Earlier you mentioned wanting to build your retirement fund and protect your family's future. These new Premier investment solutions are specifically designed to help clients like you achieve exactly those goals—let me show you how they align with what you're trying to accomplish.' This creates relevance and shows you were listening.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You jumped directly into presenting products without first understanding ${characterName}'s current needs and priorities, which violates Bangkok Bank's process flow.",
            "status": "error",
            "correction": "Always follow Bangkok Bank's consultative process: First, establish context by acknowledging their status and recent journey with the bank. Second, explore their current financial situation, goals, and any changes since your last interaction. Third, understand their priorities by asking 'What's most important to you financially right now?' Only after gathering this context should you introduce relevant offerings that directly address their stated needs. For example: 'Based on what you've shared about wanting to grow your retirement savings while protecting your family, let me show you two solutions that could help...'"
          }}
        ]
      }},
      {{
        "title": "Client Information Update",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "Asked ${characterName} to confirm their contact details and employment status",
          "Explained that updated information helps provide better service"
        ],
        "toImprove": [
          {{
            "text": "You requested information updates but didn't clearly explain the specific value to ${characterName}. Frame it as a benefit: 'Let me update a few details to ensure we're providing recommendations that fit your current situation perfectly. This also ensures you receive important account notifications and that we can reach you promptly if opportunities arise that match your investment profile.' This helps ${characterName} see it as value-added rather than administrative.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You asked questions in a checklist manner without showing genuine interest in changes. Make it conversational: 'I see your occupation was listed as Marketing Manager when we last spoke. Are you still with the same company, or have there been any career changes? Sometimes promotions or job changes impact financial priorities, so I want to make sure we're aligned with where you are now.' This turns data collection into relationship building.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Call to Action",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "Proposed a follow-up meeting to discuss investment details",
          "Summarized key points before moving to next steps"
        ],
        "toImprove": [
          {{
            "text": "Your next steps could be more specific. Be action-oriented: 'Here's what I propose: I'll prepare a detailed proposal showing how the Premier Wealth Growth Fund can help you reach your retirement goal of 10 million baht. I'll email this to you by Friday. Then let's schedule a 30-minute call next Tuesday at 2pm to review it together and address any questions. Does that work for your schedule?' This creates commitment and clear expectations.",
            "status": "warning",
            "correction": null
          }}
        ]
      }}
    ]
  }}
}}`;

    case SalesFramework.BBL_GOAL_PLANNING_ADVISORY_MODEL:
      return `{{
  "processAdherence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": 56,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Introduction & Agenda Setting",
        "score": 12,
        "maxScore": 20,
        "strengths": [
          "Welcomed ${characterName} warmly and showed appreciation for the relationship",
          "Explained the session agenda clearly"
        ],
        "toImprove": [
          {{
            "text": "You didn't recap the TWS (Total Wealth Solution) progress before setting today's agenda. Start with: '${characterName}, last time we completed your TWS assessment and identified retirement, education, and legacy as your three key goals. Today, let's review those goals, quantify exactly what you need for each, and discuss specific solutions to help you achieve them.' This provides continuity and context.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Define Goal",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Confirmed ${characterName}'s age and occupation",
          "Asked about family plans and life goals"
        ],
        "toImprove": [
          {{
            "text": "You asked about goals but didn't identify ${characterName}'s persona type early on. Understanding their life stage and priorities helps predict their likely decision path. Ask: '${characterName}, help me understand your stage in life—are you focused primarily on building wealth for the future, protecting your family, planning for retirement comfort, or preserving legacy for the next generation? This helps me understand which solutions tend to resonate with clients in similar situations.' For a 39-year-old family-focused client, anticipate they'll likely want protection; for a 35-year-old ambitious professional, expect pure investment focus; for a 60-year-old retiree, predict regular income preference.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't confirm or reprioritize the goals with ${characterName}. After identifying their goals, validate priority order: 'So I'm hearing three main goals: 1) Your child's university education in 13 years, 2) Your retirement at age 60, and 3) Building an emergency fund. Is that the right order of importance, or would you rank them differently? This helps us allocate resources appropriately.' Priority determines which goal to plan first and how to allocate available budget.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Size the Goal",
        "score": 10,
        "maxScore": 20,
        "strengths": [
          "Asked about retirement goal timeline"
        ],
        "toImprove": [
          {{
            "text": "You asked about timeline but didn't quantify each goal with specific amounts. For each goal, nail down concrete numbers: 'For your child's university education in 8 years, are you thinking local or international university? International programs currently cost about 2-3 million baht for a 4-year degree. Does that align with your expectations, or are you planning for a different amount?' This creates clear targets.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't gather key financial numbers needed for sizing. Ask systematically: 'To build an accurate plan, I need to understand: What's your current total AUM with us? Do you have any outstanding loans or debts? What's your monthly disposable income that you could allocate toward these goals? And from your current assets, how much would you like to dedicate to each goal?' This data is critical for calculating the gap.",
            "status": "error",
            "correction": "Always collect comprehensive financial data during the sizing phase: current assets, liabilities, income, existing investments, and allocation preferences. Without this information, you cannot accurately calculate the gap between current state and target goals, nor can you demonstrate how your solutions will close that gap."
          }}
        ]
      }},
      {{
        "title": "Solution Proposal",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Asked ${characterName} about risk appetite",
          "Presented investment options"
        ],
        "toImprove": [
          {{
            "text": "You didn't ask the critical BRANCHING QUESTIONS to navigate the decision tree. You must systematically ask: 1) 'Do you want insurance protection for this goal?' 2) If yes: 'Are you comfortable with market-linked insurance (cheaper premium but investment risk) or prefer guaranteed whole life (higher premium but certain)?' 3) If market-linked: 'Would you prefer one unit-linked product or separate investment + unit-linked for diversification?' These questions determine which product TYPE to recommend.",
            "status": "error",
            "correction": "Goal Planning uses a decision tree, not a linear product selection. Always ask the branching questions in sequence to determine the right product category before presenting specific solutions. Example: 'Let me understand your preferences so I can recommend the right type of solution. First, do you want life insurance protection built into this plan—so if something happens to you, the goal is still funded? [Wait for answer] Great, since you want protection, that narrows us to insurance-based options. Next, these come in guaranteed whole life or market-linked versions. Are you comfortable with your investment portion fluctuating with markets to get a lower premium, or prefer paying more for certainty? [Wait for answer] Perfect, since you're comfortable with market risk, we can explore unit-linked options which give you growth potential at lower cost.' This systematic navigation ensures you recommend the RIGHT product type based on their actual preferences."
          }},
          {{
            "text": "You presented solutions but didn't show HOW they close the gap to each goal with specific numbers. Demonstrate the math: 'For ${characterName}'s education goal of 3 million baht in 13 years, investing 15,000 monthly in this unit-linked plan with 7% expected return gives you approximately 3.2 million at maturity—200,000 above your target. Your total contributions: 2.34 million. Investment growth: 860,000. Plus, if anything happens to you, the plan pays out the full 3 million immediately.' Show the calculation visibly.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't explain WHY this product TYPE fits ${characterName}'s decision path. Connect the dots: 'I'm recommending pure unit-linked because you answered: YES to wanting coverage, YES to accepting market risk for lower cost, and YES to preferring one simple product. If you'd answered differently—say NO to coverage—we'd be looking at pure investment instead. Or if you'd said NO to market risk, it would be investment + whole life insurance. The product type flows directly from your preferences.' This builds trust in your recommendation logic.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Call to Action",
        "score": 12,
        "maxScore": 20,
        "strengths": [
          "Summarized the proposed solutions"
        ],
        "toImprove": [
          {{
            "text": "You summarized the solution but didn't explicitly map how it addresses each individual goal. Structure it clearly: 'Let me recap how this plan achieves your three goals: Goal 1 - Retirement: the BBL Balanced Fund with 30,000 baht monthly gets you to 15 million baht. Goal 2 - Education: the Unit-Linked Education Plan covers the 3 million baht needed. Goal 3 - Legacy: the Whole Life policy ensures 5 million baht for your family. Together, this addresses all your priorities. Does this alignment make sense?' This creates clarity.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't confirm ${characterName}'s commitment to proceed. Seek explicit agreement: 'Are you comfortable moving forward with this plan, ${characterName}? Shall I prepare the paperwork for the Balanced Fund and Education Plan to get started this month?' This transforms discussion into action.",
            "status": "warning",
            "correction": null
          }}
        ]
      }}
    ]
  }}
}}`;

    case SalesFramework.BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL:
      return `{{
  "processAdherence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": 54,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Greeting & Context Setting",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Warmly welcomed ${characterName} and acknowledged the relationship",
          "Asked about recent updates in ${characterName}'s life"
        ],
        "toImprove": [
          {{
            "text": "You greeted ${characterName} but didn't reference your previous interactions or reviews. Build continuity by saying: 'Good to see you again, ${characterName}. How have things been since our last portfolio review six months ago? I recall we were focused on rebalancing toward more conservative holdings as you approached retirement.' This shows you remember their journey and maintains relationship continuity.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You asked general questions but didn't probe into specific lifestyle or financial changes. Try: 'Since we last spoke, have there been any significant changes—perhaps in your work situation, family circumstances, or upcoming major expenses? These can impact how we should position your portfolio.' This uncovers factors that might require portfolio adjustments.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Event Recap",
        "score": 10,
        "maxScore": 20,
        "strengths": [
          "Mentioned recent market changes affecting the portfolio"
        ],
        "toImprove": [
          {{
            "text": "You mentioned market events but didn't clearly explain why this review is happening now. Frame the context: '${characterName}, I wanted to schedule this review because the recent interest rate changes and market volatility have created both challenges and opportunities for portfolios like yours. Let me walk you through what's changed and what it means specifically for your holdings.' This gives purpose to the meeting.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't provide a clear, digestible summary of the market event. Keep it brief and relevant: 'In the past quarter, central banks raised rates by 50 basis points, which caused bond values to decrease temporarily but created attractive entry points for new positions. For equity markets, technology sectors corrected by about 8% while defensive sectors remained stable.' This provides context without overwhelming ${characterName}.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Review Portfolio Performance",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Compared portfolio performance to benchmarks",
          "Identified asset classes that underperformed"
        ],
        "toImprove": [
          {{
            "text": "You showed performance numbers but didn't connect them to ${characterName}'s original goals. Link the review to their objectives: 'Your portfolio returned 4.2% this quarter. Your target was 5% annual growth to reach your retirement goal of 20 million baht in 10 years. While we're slightly behind this quarter due to bond market volatility, year-to-date we're still on track at 5.3%. Let's look at whether any adjustments can help us stay on course.' This contextualizes performance within their goals.",
            "status": "error",
            "correction": "Always tie portfolio performance back to the client's stated financial goals. Don't just report numbers—explain what those numbers mean for achieving their retirement, education, or other objectives. Show the gap between current trajectory and goal targets, then discuss whether adjustments are needed."
          }}
        ]
      }},
      {{
        "title": "Solution Recommendation",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Proposed rebalancing aligned with ${characterName}'s risk profile",
          "Suggested specific actions to improve portfolio positioning"
        ],
        "toImprove": [
          {{
            "text": "You made recommendations but didn't reference CIO guidance or market outlook. Strengthen credibility: 'Based on Bangkok Bank's Chief Investment Office guidance, we're recommending clients in your risk profile consider increasing exposure to quality dividend stocks and Asian bonds. The CIO sees these as well-positioned for the current rate environment. For your portfolio specifically, this could mean shifting 10% from money market funds into the BBL Asia Dividend Fund.' This shows your recommendations are backed by expert analysis.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Call to Action",
        "score": 11,
        "maxScore": 20,
        "strengths": [
          "Proposed a timeline for implementing changes"
        ],
        "toImprove": [
          {{
            "text": "You didn't summarize the proposed actions before closing. Structure your closing: 'Let me summarize: We've reviewed your portfolio's 4.2% quarterly performance, identified the impact of recent rate changes on your bond holdings, and I'm recommending a 10% shift to the BBL Asia Dividend Fund. Would you like me to proceed with this rebalancing? Once complete, let's schedule our next review in three months to assess progress.' This creates clear commitment and expectations.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You didn't explicitly confirm ${characterName}'s agreement to proceed. Always seek confirmation: 'Does this recommendation make sense to you, ${characterName}? Are you comfortable proceeding with the rebalancing, or would you like to discuss any aspects further before we move forward?' This ensures genuine buy-in rather than assumed agreement.",
            "status": "warning",
            "correction": null
          }}
        ]
      }}
    ]
  }}
}}`;

    default:
      throw new Error(
        `Unknown BBL framework for example assessment: ${framework}`,
      );
  }
}

// Helper function to get process steps based on framework
function getBBLProcessSteps(framework: string, characterName: string): string {
  switch (framework) {
    case SalesFramework.BBL_CLIENT_REVIVAL_ADVISORY_MODEL:
      return `1. **Greeting & Context Setting** (0-25 points):
   - Welcome and appreciate the relationship
   - Acknowledge any recent personal or financial updates
   - Re-establish connection gently, introducing the period of inactivity in a supportive way
   - Set a comfortable, non-pressuring tone for the conversation

2. **Explore Reasons for Disengagement** (0-25 points):
   - Use open, empathetic questions to surface reasons for ${characterName}'s inactivity
   - Listen actively and paraphrase to confirm understanding
   - Identify and align on pain points or barriers to engagement
   - Show benefits of staying active and how it supports long-term goals and maintains Wealth privileges

3. **Explore Needs & Re-engagement** (0-25 points):
   - Ask open-ended questions to uncover ${characterName}'s current needs and priorities
   - Explore any changes in goals, financial situation, or risk appetite since last discussion
   - Link re-engagement options to updated needs or goals
   - Present relevant solutions that support their current situation

4. **Call to Action** (0-25 points):
   - Summarize key needs and the proposed re-engagement path
   - Agree on next review or touchpoint
   - Reaffirm ${characterName}'s commitment to their long-term financial journey
   - Reassure ongoing partnership and support`;

    case SalesFramework.BBL_CLIENT_UPGRADE_ADVISORY_MODEL:
      return `1. **Greeting & Context Setting** (0-25 points):
   - Welcome and congratulate ${characterName} appropriately
   - Acknowledge their financial journey and current status
   - Explore upcoming priorities and life events
   - Set the tone for a consultative conversation

2. **Introduction to New Status & Offerings** (0-25 points):
   - Present any upgrade or new status as recognition of ${characterName}'s success
   - Explain key benefits clearly and compellingly
   - Connect offerings directly to ${characterName}'s stated goals
   - Position solutions as aligned with their financial aspirations

3. **Client Information Update** (0-25 points):
   - Request key updates about ${characterName}'s financial situation
   - Clarify the value and importance of maintaining current information
   - Demonstrate understanding of how updated information benefits the client
   - Handle information gathering professionally and efficiently

4. **Call to Action** (0-25 points):
   - Summarize key discussion points and confirm understanding
   - Propose clear, specific next steps
   - Reassure ${characterName} of the ongoing partnership and support
   - Secure commitment or agreement for follow-up actions`;

    case SalesFramework.BBL_GOAL_PLANNING_ADVISORY_MODEL:
      return `**CRITICAL: Goal Planning uses DECISION-TREE NAVIGATION**
This is not a linear process. Advisors must ask BRANCHING QUESTIONS to navigate to the correct product type.

1. **Introduction & Agenda Setting** (0-20 points):
   - Welcome ${characterName} warmly and show appreciation for the relationship
   - Share gratitude and any personal follow-up (e.g., family or career updates)
   - Recap TWS (Total Wealth Solution) progress and previously identified goals
   - Explain today's agenda clearly: "review goals, size targets, navigate solution options through key questions, and agree on action plan"
   - Set expectations about the decision-tree approach

2. **Define Goal** (0-20 points):
   - Understand ${characterName}'s current situation and life stage
   - Confirm/update basics (age, occupation, family situation, children)
   - Explore long-term life goals and priorities (education, retirement, legacy, property)
   - Check if any current goals have changed or new priorities emerged
   - Confirm and prioritize the goals in order of importance

3. **Size the Goal** (0-20 points):
   - For EACH goal, confirm the target year and specific amount needed
   - Gather critical financial data: current total AUM, outstanding debt, monthly disposable income
   - Clarify existing insurance coverage to avoid over-insuring
   - Determine contribution capacity: "How much could you allocate monthly toward these goals?"
   - Understand how much of current assets they want to dedicate to each goal
   - Quantify the GAP between current state and target for each goal

4. **Solution Proposal** (0-20 points) - CRITICAL BRANCHING QUESTIONS:
   **ASK THESE IN SEQUENCE to navigate the decision tree:**
   
   a) **Coverage Preference**: "Do you want life insurance protection for this goal?"
      • YES → Proceed to (b)
      • NO → Recommend Pure Investment
   
   b) **Risk Appetite for Coverage** (if YES to coverage): "Are you comfortable with market-linked insurance products to reduce premium costs, or prefer guaranteed whole life for certainty?"
      • Market-linked → Proceed to (c)
      • Guaranteed → Recommend Investment + Whole Life Insurance
   
   c) **Product Structure** (if market-linked): "Would you prefer one integrated unit-linked product, or separate investment + unit-linked for more diversification?"
      • Single integrated → Recommend Pure Unit-Linked
      • Separate for diversification → Recommend Investment + Unit-Linked
   
   d) **For Retirees/Legacy Planners**: "Do you prefer regular income payouts or lump-sum at maturity?"
      • Regular income → Recommend Investment + Savings/Retirement Insurance
      • Lump-sum → Adjust based on above branches
   
   e) **Payment Method**: "Would you prefer lump-sum investment, regular monthly contributions (DCA), or combination?"
   
   f) **Final Verification**: Show how the solution closes the gap with NUMBERS, explain why this product TYPE matches their decision path
   
   - Link recommendations EXPLICITLY to their responses to branching questions
   - Present 1-2 best-fit solutions (avoid overwhelming with too many options)
   - Explain trade-offs clearly (cost vs coverage, guaranteed vs potential growth, liquidity vs lock-in)

5. **Call to Action** (0-20 points):
   - Summarize how the solution addresses EACH goal with specific numbers
   - Verify the product type matches their stated preferences from branching questions
   - Confirm next steps clearly: execution, documentation needed, timeline
   - Ask final confirmation: "Are you comfortable with this amount and approach, or would you like to explore alternatives?"
   - Reassure ongoing support and long-term partnership`;

    case SalesFramework.BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL:
      return `1. **Greeting & Context Setting** (0-20 points):
   - Warmly welcome ${characterName}, acknowledge the relationship, and ease into the discussion
   - Introduce yourself as a licensed Investment Consultant (IC) or Investment Planner (IP)
   - Inform ${characterName} of their four fundamental consumer rights (per BOT guidelines)
   - Ask about recent work, family, or lifestyle updates
   - Recap the relationship and previous interactions
   - Reference past reviews and show continuity in the advisory relationship

2. **Event Recap** (0-20 points):
   - Introduce the reason for this review (e.g., market changes, product updates, or recent life events)
   - Share a brief market or event summary that's relevant to ${characterName}'s portfolio
   - Explain how the event impacts their portfolio specifically
   - Provide clear context for why adjustments may be needed

3. **Review Portfolio Performance** (0-20 points):
   - Compare portfolio performance and allocations versus benchmarks
   - Highlight which asset classes over- or underperformed
   - Explain the appropriate investment allocation based on Basic Asset Allocation according to ${characterName}'s Risk Profile assessment
   - Identify any gaps to original goals and explain their impact
   - Connect performance metrics to ${characterName}'s stated financial objectives
   - **CRITICAL: If portfolio verification data is provided, verify the advisor correctly cites the current portfolio figures (total value, asset amounts, weight percentages). Any factual errors should be penalized.**

4. **Solution Recommendation** (0-20 points):
   - Recommend more than one fund for ${characterName} to choose from
   - Provide information on the mutual fund's performance at the point of sale to help ${characterName} make an informed decision
   - Warn ${characterName}: "Mutual funds are not deposits and carry investment risks. Investors may not receive the full amount of their principal when redeeming (principal is not guaranteed)"
   - Do NOT guarantee investment returns or make promises about future performance
   - Propose tailored adjustments aligned with ${characterName}'s risk appetite and CIO guidance
   - Suggest specific rebalancing or top-up actions with clear rationale
   - Explain how changes align with goals and comfort level
   - Reference market outlook and expert guidance to support recommendations
   - **CRITICAL: If portfolio verification data is provided, the recommended rebalancing numbers (amounts, weights, top-up values) MUST match the adjusted portfolio data exactly. Any numerical discrepancy should be penalized.**

5. **Call to Action** (0-20 points):
   - Confirm next steps and secure agreement to proceed
   - Summarize the proposed actions clearly
   - Set a timeline for follow-up or next review
   - Reassure ongoing partnership and support`;

    default:
      throw new Error(
        `Unknown BBL framework for process adherence: ${framework}`,
      );
  }
}

// BBL Process Adherence prompt function
export function getBBLProcessAdherencePrompt({
  characterName,
  language,
  evaluationFocus,
  productName,
  productInformation,
  framework,
}: {
  characterName: string;
  language?: string;
  evaluationFocus?: string;
  productName?: string;
  productInformation?: string;
  framework: string;
}) {
  const processSteps = getBBLProcessSteps(framework, characterName);

  // Get section titles and max scores for this framework
  let sectionTitles: string[];
  let maxScorePerSection: number;
  let numSections: number;

  switch (framework) {
    case SalesFramework.BBL_CLIENT_REVIVAL_ADVISORY_MODEL:
      sectionTitles = [
        'Greeting & Context Setting',
        'Explore Reasons for Disengagement',
        'Explore Needs & Re-engagement',
        'Call to Action',
      ];
      maxScorePerSection = 25;
      numSections = 4;
      break;
    case SalesFramework.BBL_CLIENT_UPGRADE_ADVISORY_MODEL:
      sectionTitles = [
        'Greeting & Context Setting',
        'Introduction to New Status & Offerings',
        'Client Information Update',
        'Call to Action',
      ];
      maxScorePerSection = 25;
      numSections = 4;
      break;
    case SalesFramework.BBL_GOAL_PLANNING_ADVISORY_MODEL:
      sectionTitles = [
        'Introduction & Agenda Setting',
        'Define Goal',
        'Size the Goal',
        'Solution Proposal',
        'Call to Action',
      ];
      maxScorePerSection = 20;
      numSections = 5;
      break;
    case SalesFramework.BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL:
      sectionTitles = [
        'Greeting & Context Setting',
        'Event Recap',
        'Review Portfolio Performance',
        'Solution Recommendation',
        'Call to Action',
      ];
      maxScorePerSection = 20;
      numSections = 5;
      break;
    default:
      throw new Error(
        `Unknown BBL framework for process adherence: ${framework}`,
      );
  }

  let basePrompt = `You are an expert Bangkok Bank wealth management coach specializing in the Bangkok Bank Process Reference framework. Your task is to evaluate **only the user's** process adherence in following Bangkok Bank's structured approach.

IMPORTANT: 
In the transcript, the user (wealth advisor) is speaking with an AI character named ${characterName} (the client). When referring to this character in your feedback, ALWAYS use "${characterName}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the advisor's process adherence.
Ignore typos or mistakes in pronunciation or name formatting.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the wealth advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

Product: ${productName}
${evaluationFocus ? `Evaluation Focus: ${evaluationFocus}` : ''}
${productInformation ? `Product Information: ${productInformation}` : ''}

[BANGKOK BANK PROCESS REFERENCE EVALUATION]
Evaluate across ${numSections} key process areas, each scored out of ${maxScorePerSection} points (total 100):

${processSteps}

[ASSESSMENT STRUCTURE]
For each area provide:
- **Score**: Number out of ${maxScorePerSection} based on adherence to Bangkok Bank's process reference
- **Strengths**: Array of 1-2 specific strengths demonstrated (if any exist)
- **To improve**: Array of 2-4 improvement areas with actionable suggestions and concrete examples, each marked as 'warning' for process gaps or 'error' for significant process violations. Each toImprove item must include a specific example of what to say or do differently

[SCORING GUIDELINES]
- **${Math.floor(maxScorePerSection * 0.9)}-${maxScorePerSection} (90-100%)**: Exceptional - demonstrates mastery, personalization, and proactive process execution that reflects real-world nuances
- **${Math.floor(maxScorePerSection * 0.7)}-${Math.floor(maxScorePerSection * 0.9) - 1} (70-89%)**: Strong - solid adherence with all key elements covered, minor refinements needed
- **${Math.floor(maxScorePerSection * 0.5)}-${Math.floor(maxScorePerSection * 0.7) - 1} (50-69%)**: Adequate - covers basic process steps but lacks depth, personalization, or natural flow
- **${Math.floor(maxScorePerSection * 0.3)}-${Math.floor(maxScorePerSection * 0.5) - 1} (30-49%)**: Developing - significant process gaps, missing key elements
- **0-${Math.floor(maxScorePerSection * 0.3) - 1} (0-29%)**: Insufficient - critical process steps missing or fundamentally incorrect approach

IMPORTANT SCORING PHILOSOPHY:
- Reserve top scores (90-100%) ONLY for truly exceptional performance that goes beyond basic process completion
- The process steps serve as a GUIDE, not a rigid checklist - natural conversation flow matters more than strict ordering
- Evaluate whether the advisor achieved the INTENT of each process stage, even if steps were adapted or reordered to match the client's natural conversation style
- Penalize robotic, scripted adherence that ignores client cues - adaptability within the framework is valued
- Good basic execution should score in the 50-75% range, not 80%+

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when pointing out what needs improvement
- Focus on Bangkok Bank's process compliance and client experience impact
- For toImprove items: use 'warning' status for process improvement areas and 'error' status for significant process violations
- For 'error' status items: provide detailed guidance on correct Bangkok Bank's process in the "correction" field with concrete examples of what to say
- For 'warning' status items: set "correction" to null but ensure the "text" field includes actionable guidance with specific examples
- Each toImprove "text" field must be detailed (40-70 words) and include concrete examples of what advisor should have said or done
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "processAdherence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": "number", // out of 100
    "maxScore": 100,
    "sections": [
${sectionTitles
  .map(
    (title, index) => `      {{
        "title": "${title}",
        "score": "number", // out of ${maxScorePerSection}
        "maxScore": ${maxScorePerSection},
        "strengths": ["string"],
        "toImprove": [
          {{
            "text": "string",
            "status": "warning|error",
            "correction": "string|null"
          }}
        ]
      }}${index < sectionTitles.length - 1 ? ',' : ''}`,
  )
  .join('\n')}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
${getBBLExampleAssessment(framework, characterName)}

Generate a Bangkok Bank process adherence assessment based strictly on how well the wealth advisor followed the Bangkok Bank Process Reference framework. Output ONLY valid JSON using the exact format specified.`;

  let userPrompt =
    'Generate assessment based on conversation transcript and Bangkok Bank Process Reference criteria.';
  if (language) {
    userPrompt = `${basePrompt}\n\nIMPORTANT: Provide all assessment content in ${language} language.`;
  }

  return {
    format: async (params: any) => `${basePrompt}

Call Type: ${params.callType}
Scenario: ${params.scenario}
Objectives: ${params.objectives}
Framework: ${params.framework}
Product Info: ${params.productInfo}

Conversation Transcript:
${params.transcript}

${userPrompt}`,
  };
}

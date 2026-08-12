import { FrameworkConfiguration } from './types.js';

// LAPR Objection Handling Framework Configuration
export const laprObjectionHandlingConfiguration: FrameworkConfiguration = {
  base: {
    id: 'lapr-objection-handling',
    friendlyId: 'lapr',
    type: 'list',
  },

  localized: {
    // English (Original)
    en: {
      title: 'LAPR Objection Handling',
      description:
        'Listen, Acknowledge, Probe, Reframe (LAPR) Framework for handling customer objections',
      parts: [
        {
          title: 'Listen',
          description:
            'Listen with an open mind without making assumptions or judgments',
          items: [
            'Listen with an open mind',
            'Try not to make any assumptions and judgement of what customer says',
            'Be listening physically and mentally',
            "You shouldn't be thinking of how to counter customer's objections and trying to pitch your product at this point",
          ],
        },
        {
          title: 'Acknowledge',
          description:
            'Truly acknowledge what the customer has told you and think on their behalf',
          items: [
            'Truly acknowledge what customer has told you',
            'Start thinking on behalf of the customer what is the best solution in their case',
            "Customer's objection is not directed at you, don't take them personally",
            'Do not appear defensive, avoid arguments at all cost',
          ],
        },
        {
          title: 'Probe',
          description:
            'Confirm understanding and ask questions to better understand their concerns',
          items: [
            'Think through about what customer has told you, repeat the objection/concern again to ensure you have the correct understanding',
            'Ask more questions to help you understand their objection/concern better if required',
          ],
        },
        {
          title: 'Reframe',
          description:
            'Address concerns in context and remind why the solution helps the customer',
          items: [
            "Address customer's concern in a context relevant manner",
            'Remind customer why did you propose this plan in the first place, how does it help customer',
          ],
        },
      ],
    },
  },
};

export const laprObjectionHandlingEvaluationPrompt = `You are an expert sales coach specializing in the LAPR Objection Handling framework (Listen, Acknowledge, Probe, Reframe). Your task is to evaluate **only the user's** objection handling performance.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the financial advisor's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

[LAPR EVALUATION FRAMEWORK]
Evaluate against these 4 components, each scored based on their relative importance:

1. **Listen** (0-25): How effectively did they listen with an open mind without making assumptions or judgments?
2. **Acknowledge** (0-25): How genuinely did they acknowledge the customer's concerns and think on their behalf?
3. **Probe** (0-25): How well did they confirm understanding and ask clarifying questions?
4. **Reframe** (0-25): How effectively did they address concerns in context and reframe the value proposition?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 25 points based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. Including examples of correct/better responses IS REQUIRED.
- **completedItems**: Array of specific things the user did well for this component
- **toImproveItems**: Array of specific things the user needs to improve

[SCORING GUIDELINES]
- **Exceptional (21-25)**: Outstanding performance, demonstrates mastery of the technique
- **Good (14-20)**: Solid performance with minor areas for enhancement
- **Adequate (7-13)**: Basic application but needs improvement in execution
- **Poor (0-6)**: Missing or ineffective application of the technique

[LAPR COMPONENTS DETAILED]

**LISTEN (25 points)**
- Did they listen with an open mind without making assumptions?
- Did they avoid jumping to conclusions about what the customer meant?
- Did they demonstrate active listening (physically and mentally present)?
- Did they resist the urge to immediately counter objections or pitch?
- Did they give the customer space to fully express their concerns?

**ACKNOWLEDGE (25 points)**
- Did they genuinely acknowledge what the customer told them?
- Did they show they understand the customer's perspective without being defensive?
- Did they avoid taking objections personally?
- Did they refrain from arguments or defensive responses?
- Did they start thinking from the customer's point of view?

**PROBE (25 points)**
- Did they repeat or paraphrase the objection to confirm understanding?
- Did they ask clarifying questions to understand the concern better?
- Did they explore the root cause of the objection?
- Did they use open-ended questions effectively?
- Did they demonstrate genuine curiosity about the customer's situation?

**REFRAME (25 points)**
- Did they address the concern in a context-relevant manner?
- Did they remind the customer why the solution was proposed?
- Did they connect the solution to the customer's specific needs?
- Did they present the value proposition without being pushy?
- Did they help the customer see the situation from a new perspective?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on the quality of objection handling, not sales closure
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "objectionHandling": {{
    "description": "Measures the ability to apply the LAPR framework (Listen, Acknowledge, Probe, Reframe) to handle customer objections effectively.",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Listen",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string",
        "completedItems": ["string"],
        "toImproveItems": ["string"]
      }},
      {{
        "title": "Acknowledge",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string",
        "completedItems": ["string"],
        "toImproveItems": ["string"]
      }},
      {{
        "title": "Probe",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string",
        "completedItems": ["string"],
        "toImproveItems": ["string"]
      }},
      {{
        "title": "Reframe",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string",
        "completedItems": ["string"],
        "toImproveItems": ["string"]
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "objectionHandling": {{
    "description": "Measures the ability to apply the LAPR framework (Listen, Acknowledge, Probe, Reframe) to handle customer objections effectively.",
    "overallScore": 62,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Listen",
        "score": 18,
        "maxScore": 25,
        "why": "You gave {{characterName}} space to express concerns initially but showed signs of preparing counterarguments before they finished speaking.",
        "suggestion": "Practice pausing for 2-3 seconds after {{characterName}} finishes speaking before responding. This shows you're fully processing their words rather than preparing your next pitch.",
        "completedItems": ["Allowed customer to express initial concerns", "Did not interrupt during first objection"],
        "toImproveItems": ["Avoid mentally preparing counterarguments while customer is speaking", "Give more verbal acknowledgments like 'I see' or 'Go on'"]
      }},
      {{
        "title": "Acknowledge",
        "score": 15,
        "maxScore": 25,
        "why": "You acknowledged {{characterName}}'s time constraints but didn't fully validate their skepticism about insurance pitches, appearing slightly defensive.",
        "suggestion": "Try: 'I completely understand - you came here for banking and the last thing you expected was someone talking about insurance. That's a fair reaction.'",
        "completedItems": ["Recognized customer's time is valuable", "Maintained calm tone"],
        "toImproveItems": ["Avoid defensive body language cues in speech", "Show more empathy for their skepticism specifically"]
      }},
      {{
        "title": "Probe",
        "score": 14,
        "maxScore": 25,
        "why": "You asked about their current coverage but missed opportunities to explore why company insurance might not be enough for their specific situation.",
        "suggestion": "Ask: 'You mentioned you have company coverage - what aspects of that coverage give you peace of mind, and are there any gaps you've noticed?'",
        "completedItems": ["Asked about existing insurance coverage"],
        "toImproveItems": ["Dig deeper into specific coverage gaps", "Ask about their personal priorities beyond work benefits"]
      }},
      {{
        "title": "Reframe",
        "score": 15,
        "maxScore": 25,
        "why": "You presented benefits but didn't connect them specifically to {{characterName}}'s stated priorities of career growth and travel.",
        "suggestion": "Connect to their goals: 'You mentioned travel is important to you - personal coverage ensures you're protected globally, even if your career takes you somewhere new.'",
        "completedItems": ["Mentioned key product benefits", "Stayed non-pushy in tone"],
        "toImproveItems": ["Link benefits to customer's specific stated priorities", "Remind them why this conversation matters for their situation"]
      }}
    ]
  }}
}}`;

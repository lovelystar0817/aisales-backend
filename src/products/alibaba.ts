import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * Alibaba Cloud comprehensive solution - Infrastructure + AI for e-commerce
 */
export const ALIBABA_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '697075c160b6c0c470b061db',
    friendlyId: 'alibaba-cloud-comprehensive-solution',
    name: 'Alibaba Cloud Comprehensive Solution (Infrastructure + AI)',
    knowledgePrompt: `
## Alibaba Cloud

Alibaba Cloud is the global leader in cloud computing, holding the #1 position in the Asia-Pacific region and #3 globally. The platform operates on a comprehensive AI+Cloud strategy, built on the foundation of Apsara OS and powered by the Qwen LLM ecosystem. This integration allows for seamless scalability and intelligent solutions across industries.

---

## Addressing Scaling & Performance Issues

**1. ECS (Elastic Compute Service) Upgrades:**
- Vertical Scaling: Increase resources (CPU, RAM, Bandwidth) on a single instance
- Horizontal Scaling: Add multiple instances to distribute the load

**2. ECS Storage - Disk I/O Enhancement:**
- Transition from basic disks to Enhanced SSD (ESSD) for improved IOPS and faster data access

**3. OSS (Object Storage Service):**
- Store media assets (images, videos, documents) separately from ECS
- High-performance object storage reducing load on compute instances

**4. CDN (Content Delivery Network):**
- Distribute media via 3,200+ edge nodes globally across 200+ countries/regions
- Reduces origin server load by 90%+ and improves media delivery speed during traffic spikes

---

## Addressing Budgetary Issues

**1. Long-Term Commitment Discounts:**
- Annual plans: Typically offer 30% discount compared to monthly billing
- Resource packages: Bundled credits for traffic, storage, and CDN at discounted rates
- Savings plans: Flexible commitment-based pricing for predictable workloads

---

## Competitive Advantages of Alibaba

**1. Market Leadership & Infrastructure:**
- #1 cloud provider in Asia-Pacific region
- 29 global regions with 92 availability zones
- Extensive infrastructure across Asia for optimal performance

**2. Proven Scalability:**
- Powers Alibaba Group's ecosystem (Taobao, Tmall)
- Handles 500,000+ transactions per second during Singles' Day (11.11), the world's largest shopping event
- Real-world validation processing billions in GMV daily

**3. Compliance & Certifications:**
- Most comprehensive compliance certifications in the Asia-Pacific region
- Meets regional data residency and privacy requirements

**4. Support Model:**
- Dedicated Solutions Architects (SA) provide face-to-face technical consultation
- SA workshops and architecture reviews available at no extra cost (unlike AWS/Azure which charge extra)
- 7x24 ticketing system with assigned customer managers
- Proactive guidance with regular architecture reviews and optimization recommendations

---

## AI Offering of Alibaba

**Model Studio (Platform):**
Model Studio is Alibaba Cloud's unified AI platform, providing access to various AI models for content generation. It integrates the Qwen LLM ecosystem and offers enterprise-grade features such as API access and batch processing.

**Qwen-Image (Image Generation Series):**
- Multiple models optimized for different use cases
- Text-to-image generation for marketing materials
- Image editing capabilities for modifications and enhancements
- Professional-grade output with brand consistency features

**WAN (Video Generation Series):**
- WAN 2.5: Text-to-video generation creating videos from text prompts
- Image-to-video: Converts static product images into dynamic video content
- Video editing: AI-assisted scene editing and style application
- Production-ready availability with multi-format output support`,
    productType: ProductType.OWN,
    modules: ['alibaba-telesales'],
    markdown: `## Alibaba Cloud

Alibaba Cloud is the global leader in cloud computing, holding the #1 position in the Asia-Pacific region and #3 globally. The platform operates on a comprehensive AI+Cloud strategy, built on the foundation of Apsara OS and powered by the Qwen LLM ecosystem. This integration allows for seamless scalability and intelligent solutions across industries.

---

## Addressing Scaling & Performance Issues

**1. ECS (Elastic Compute Service) Upgrades:**
- Vertical Scaling: Increase resources (CPU, RAM, Bandwidth) on a single instance
- Horizontal Scaling: Add multiple instances to distribute the load

**2. ECS Storage - Disk I/O Enhancement:**
- Transition from basic disks to Enhanced SSD (ESSD) for improved IOPS and faster data access

**3. OSS (Object Storage Service):**
- Store media assets (images, videos, documents) separately from ECS
- High-performance object storage reducing load on compute instances

**4. CDN (Content Delivery Network):**
- Distribute media via 3,200+ edge nodes globally across 200+ countries/regions
- Reduces origin server load by 90%+ and improves media delivery speed during traffic spikes

---

## Addressing Budgetary Issues

**1. Long-Term Commitment Discounts:**
- Annual plans: Typically offer 30% discount compared to monthly billing
- Resource packages: Bundled credits for traffic, storage, and CDN at discounted rates
- Savings plans: Flexible commitment-based pricing for predictable workloads

---

## Competitive Advantages of Alibaba

**1. Market Leadership & Infrastructure:**
- #1 cloud provider in Asia-Pacific region
- 29 global regions with 92 availability zones
- Extensive infrastructure across Asia for optimal performance

**2. Proven Scalability:**
- Powers Alibaba Group's ecosystem (Taobao, Tmall)
- Handles 500,000+ transactions per second during Singles' Day (11.11), the world's largest shopping event
- Real-world validation processing billions in GMV daily

**3. Compliance & Certifications:**
- Most comprehensive compliance certifications in the Asia-Pacific region
- Meets regional data residency and privacy requirements

**4. Support Model:**
- Dedicated Solutions Architects (SA) provide face-to-face technical consultation
- SA workshops and architecture reviews available at no extra cost (unlike AWS/Azure which charge extra)
- 7x24 ticketing system with assigned customer managers
- Proactive guidance with regular architecture reviews and optimization recommendations

---

## AI Offering of Alibaba

**Model Studio (Platform):**
Model Studio is Alibaba Cloud's unified AI platform, providing access to various AI models for content generation. It integrates the Qwen LLM ecosystem and offers enterprise-grade features such as API access and batch processing.

**Qwen-Image (Image Generation Series):**
- Multiple models optimized for different use cases
- Text-to-image generation for marketing materials
- Image editing capabilities for modifications and enhancements
- Professional-grade output with brand consistency features

**WAN (Video Generation Series):**
- WAN 2.5: Text-to-video generation creating videos from text prompts
- Image-to-video: Converts static product images into dynamic video content
- Video editing: AI-assisted scene editing and style application
- Production-ready availability with multi-format output support`,
    evaluationFocus: [
      '**Infrastructure: Traffic Spike Understanding**: Knowledge of Auto Scaling, SLB, and capacity management',
      '**Infrastructure: Media Optimization**: Understanding OSS + CDN architecture for static content',
      '**Infrastructure: Cost Optimization**: Ability to explain annual subscriptions (30% discount) and resource packages',
      '**Infrastructure: Competitive Positioning**: Knowledge of Alibaba advantages over AWS/Azure/GCP (market leadership, pricing, support)',
      '**Platform Understanding**: Knowledge of Apsara OS foundation and Qwen LLM ecosystem',
      '**AI: Model Studio Platform**: Understanding unified platform access (DashScope/Bailian) and workflow integration',
      '**AI: Content Generation Capabilities**: Understanding Qwen-Image series and WAN 2.5 series features',
      '**AI: ROI Demonstration**: Ability to quantify cost/time savings vs traditional design services',
      '**AI: Use Case Mapping**: Skills in matching AI capabilities to customer content needs',
      '**AI: Competitive Comparison**: Knowledge of advantages over Sora (production-ready), Midjourney, agencies',
      '**Support Model**: Understanding SA workshops, architecture reviews, and dedicated support advantages',
      '**Combined Solution Selling**: Ability to position both infrastructure and AI as integrated solution',
      '**Discovery: Needs Assessment**: Skills in uncovering both technical and content creation pain points',
      '**Business Impact**: Ability to connect technical features to business outcomes (revenue protection, cost savings)',
      '**Implementation Roadmap**: Skills in prioritizing infrastructure first, then AI pilot program',
    ],
    salesTarget: 'corporate',
  },
];

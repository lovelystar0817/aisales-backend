import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

export const LALAMOVE_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '69a5510000000000000000b1',
    friendlyId: 'lalamove-driver-registration',
    name: 'Lalamove Driver Registration',
    productType: ProductType.OWN,
    modules: [
      'lalamove-driver-registration-new',
      'lalamove-driver-registration-docs',
    ],
    salesTarget: 'individual',
    knowledgePrompt: `You are a prospective driver who signed up through Lalamove advertisements but have not yet completed the full registration process. You showed initial interest by filling out a sign-up form through ads on Facebook or other channels, but you still have questions and concerns before fully committing.

You are receiving a call from a Lalamove recruitment agent who wants to help you complete the registration. You should respond naturally based on your persona's concerns, pain points, and personality traits. Do NOT be overly cooperative — raise your genuine concerns about the platform, costs, commitment, and how it fits your lifestyle.

Key context about Lalamove:
- Lalamove is a delivery platform where you use your own vehicle
- You need to complete a registration process that includes uploading documents and paying a deposit
- You can choose when to work and which jobs to accept
- There is no minimum job quota or obligation
- Earnings are per-job and can be withdrawn daily
- Driver benefits include fuel discounts and performance bonuses`,
    keyFeatures: [
      'Flexible working hours — choose when to work',
      'No minimum job quota or obligation',
      'Daily earnings withdrawal',
      'Use your own vehicle',
      'Performance bonuses and seasonal challenges',
      'Partner benefits including fuel discounts',
    ],
    featureHighlight: {
      title: 'Lalamove Driver Partner Program',
      description:
        'Join Lalamove as a driver partner and earn flexible income using your own vehicle. Choose your own hours, accept or reject jobs freely, and enjoy partner benefits.',
    },
    evaluationFocus: ['Soft Skills', 'Knowledge Skills', 'Product Knowledge'],
    callCriteria: {
      en: {
        title: 'Driver Registration Call Assessment',
        description:
          "Evaluate the recruiter's ability to guide prospective drivers through the registration process, handle objections, and secure commitment.",
        criteria: [
          'Communication Skills — Clear, respectful, non-technical language',
          'Relationship Building — Rapport, genuine interest, personalization',
          'Adaptability — Persistence, probing questions, flexible approach',
          'Problem-Solving — Identify barriers, answer questions, offer solutions',
          'Sales & Negotiation — Guide to completion, handle objections, close with clear outcome',
          'Product Knowledge — Understand Lalamove platform, promotions, compliance',
        ],
        markdown: `## Lalamove Driver Registration — Product Knowledge

### About Lalamove
Lalamove is a leading on-demand delivery platform connecting businesses and individuals with delivery drivers. Drivers use their own vehicles to complete delivery jobs posted through the Lalamove app.

### Driver Registration Process

**Scenario 1A — New Applicant (5 Steps):**
1. **Create Account** — Fill in: City, Vehicle type
2. **Basic Info** — Fill in: Name, Referral code (if any)
3. **Personal Info** — Fill in: ID Number, Date of Birth
4. **Vehicle Info** — Fill in: License plate number
5. **Training & Documents** — Pass training, then upload: Portrait photo, Vehicle registration, ID card, Vehicle plate photo

**Scenario 1B — Documents Uploaded (3 Steps):**
1. **Document Verification** — Confirm uploaded documents are complete and correct
2. **Pay Deposit** — Complete the required deposit payment
3. **Next Steps** — Receive confirmation and understand onboarding timeline

### Earning Model
- Earnings are calculated per job based on distance and vehicle type
- No minimum job quota — drivers choose when and how much to work
- Daily withdrawal available
- Performance bonuses for consistent drivers
- Seasonal challenges with extra rewards

### Driver Benefits
- Fuel discounts through partner programs
- Insurance coverage during active deliveries
- 24/7 driver support
- In-app navigation and job management tools

### Common Objections & Handling
- **Deposit too high**: Explain the deposit is refundable and protects both parties
- **Already on competitor platform**: Highlight Lalamove's unique advantages (flexibility, no quota, partner benefits)
- **Too busy**: Emphasize flexibility — can start anytime, no obligation
- **Missing documents**: Guide on how to obtain them, offer to schedule follow-up
- **Red plates / temporary registration**: Explain requirements clearly
- **Sticker concerns (pickup trucks)**: Address the sticker policy and its benefits
- **Out of operating area**: Explain service coverage and any expansion plans
- **Low pay concerns**: Share realistic earning examples and bonus opportunities
- **Poor connectivity area**: Explain offline capabilities and coverage`,
      },
      th: {
        title: 'การประเมินการโทรลงทะเบียนคนขับ',
        description:
          'ประเมินความสามารถของผู้สรรหาในการแนะนำคนขับที่มีแนวโน้มจะสมัครผ่านกระบวนการลงทะเบียน จัดการกับข้อโต้แย้ง และรักษาความมุ่งมั่น',
        criteria: [
          'ทักษะการสื่อสาร ภาษาที่ชัดเจน สุภาพ ไม่ใช้ศัพท์เทคนิค',
          'การสร้างความสัมพันธ์ ความสัมพันธ์ที่ดี ความสนใจจริงใจ การปรับให้เหมาะกับบุคคล',
          'ความสามารถในการปรับตัว ความพยายาม การถามเชิงลึก แนวทางที่ยืดหยุ่น',
          'การแก้ปัญหา ระบุอุปสรรค ตอบคำถาม เสนอทางออก',
          'ทักษะการขายและเจรจา นำไปสู่การสมัครสำเร็จ จัดการข้อโต้แย้ง ปิดด้วยผลลัพธ์ที่ชัดเจน',
          'ความรู้ผลิตภัณฑ์ เข้าใจแพลตฟอร์ม Lalamove โปรโมชั่น และนโยบาย',
        ],
        markdown: `## โปรแกรมพาร์ทเนอร์คนขับ Lalamove

Lalamove เป็นแพลตฟอร์มจัดส่งแบบออนดีมานด์ชั้นนำที่เชื่อมต่อธุรกิจและบุคคลกับพาร์ทเนอร์คนขับ ในฐานะพาร์ทเนอร์คนขับ Lalamove คุณใช้รถของตัวเองในการทำงานส่งของผ่านแอป Lalamove

---

## กระบวนการลงทะเบียน

### สำหรับผู้สมัครใหม่ (5 ขั้นตอน):
1. **สร้างบัญชี**: เลือกเมืองและประเภทรถ
2. **ข้อมูลพื้นฐาน**: กรอกชื่อและรหัสแนะนำ (ถ้ามี)
3. **ข้อมูลส่วนตัว**: กรอกเลขบัตรประชาชนและวันเกิด
4. **ข้อมูลรถ**: กรอกหมายเลขทะเบียนรถ
5. **อบรมและอัพโหลดเอกสาร**: ผ่านการอบรมออนไลน์และอัพโหลดเอกสารที่จำเป็น:
   - รูปถ่ายใบหน้า
   - ทะเบียนรถ
   - บัตรประชาชน (หน้า-หลัง)
   - รูปป้ายทะเบียนรถ

### สำหรับผู้สมัครที่อัพโหลดเอกสารแล้ว (3 ขั้นตอน):
1. **ตรวจสอบเอกสาร**: ทีมงานตรวจสอบเอกสารที่อัพโหลด
2. **ชำระเงินมัดจำ**: ชำระเงินมัดจำเพื่อเปิดใช้งานบัญชี
3. **เริ่มขับ**: รับชุดต้อนรับและเริ่มรับงาน

---

## รูปแบบรายได้

- **รายได้ต่องาน**: คำนวณตามระยะทาง ประเภทรถ และข้อกำหนดการจัดส่ง
- **ไม่มีโควต้าขั้นต่ำ**: รับงานมากหรือน้อยตามต้องการ
- **ถอนเงินรายวัน**: เข้าถึงรายได้ทุกวัน
- **โบนัสผลงาน**: รับเพิ่มจากการส่งงานสม่ำเสมอและมีคุณภาพ
- **ชาเลนจ์ตามฤดูกาล**: โอกาสรับรายได้พิเศษในช่วงพีค
- **โบนัสแนะนำ**: รับเงินเมื่อชวนคนขับคนอื่นมาร่วมทีม

---

## สิทธิประโยชน์พาร์ทเนอร์คนขับ

- **ส่วนลดน้ำมัน**: อัตราพิเศษที่ปั๊มน้ำมันที่ร่วมรายการ
- **ประกันภัย**: คุ้มครองระหว่างการส่งของ
- **ซัพพอร์ต 24/7**: ทีมช่วยเหลือคนขับตลอด 24 ชั่วโมง
- **ตารางเวลายืดหยุ่น**: ทำงานเมื่อไหร่ก็ได้ มากเท่าไหร่ก็ได้
- **ไม่บังคับรับงาน**: รับหรือปฏิเสธงานได้อย่างอิสระ
- **เครื่องมือในแอป**: GPS นำทาง จัดการงาน และติดตามรายได้

---

## ข้อกำหนดรถ

- รถกระบะ 4 ประตู รถตู้ หรือมอเตอร์ไซค์ (แตกต่างตามเมือง)
- ทะเบียนรถที่ถูกต้อง
- รถในสภาพดีพร้อมใช้งาน
- อาจต้องติดสติกเกอร์ Lalamove สำหรับรถบางประเภท

---

## ข้อมูลเงินมัดจำ

- ต้องชำระเงินมัดจำคืนได้เพื่อเปิดใช้งานบัญชีคนขับ
- จำนวนเงินมัดจำแตกต่างตามประเภทรถและเมือง
- เงินมัดจำคืนได้เต็มจำนวนเมื่อคนขับตัดสินใจออกจากแพลตฟอร์ม
- ชำระเงินได้หลายช่องทางรวมถึงโอนเงินผ่านธนาคาร

---

## คำถามที่พบบ่อย

**ถ: ต้องทำงานทุกวันไหม?**
ตอบ: ไม่ คุณเลือกเองว่าจะทำงานเมื่อไหร่และรับกี่งาน ไม่มีข้อกำหนดขั้นต่ำ

**ถ: รายได้เท่าไหร่?**
ตอบ: รายได้ขึ้นอยู่กับจำนวนงานที่ทำ ระยะทาง และประเภทรถ คนขับหลายคนมีรายได้ต่อวันที่น่าพอใจ

**ถ: ถ้าอยู่นอกพื้นที่ให้บริการหลักล่ะ?**
ตอบ: พื้นที่ให้บริการแตกต่างตามเมือง ติดต่อเราเพื่อตรวจสอบว่าพื้นที่ของคุณครอบคลุมหรือไม่

**ถ: ใช้รถทำอย่างอื่นได้ไหมระหว่างที่ลงทะเบียนอยู่?**
ตอบ: ได้ เมื่อคุณไม่ได้รับงาน Lalamove รถเป็นของคุณใช้ได้ตามปกติ`,
      },
    },
    markdown: `## Lalamove Driver Partner Program

Lalamove is a leading on-demand delivery platform that connects businesses and individuals with driver partners. As a Lalamove driver partner, you use your own vehicle to complete delivery jobs posted through the Lalamove app.

---

## Registration Process

### For New Applicants (5 Steps):
1. **Create Account**: Select your city and vehicle type
2. **Basic Information**: Enter your name and referral code (if applicable)
3. **Personal Information**: Provide your ID number and date of birth
4. **Vehicle Information**: Enter your license plate number
5. **Training & Document Upload**: Complete the virtual training and upload required documents:
   - Portrait photo
   - Vehicle registration document
   - ID card (front and back)
   - Vehicle plate photo

### For Applicants Who Have Uploaded Documents (3 Steps):
1. **Document Verification**: Our team reviews your uploaded documents
2. **Deposit Payment**: Pay the required deposit to activate your account
3. **Start Driving**: Receive your welcome package and begin accepting jobs

---

## Earning Model

- **Per-job earnings**: Based on distance, vehicle type, and delivery requirements
- **No minimum quota**: Accept as many or as few jobs as you want
- **Daily withdrawal**: Access your earnings every day
- **Performance bonuses**: Earn extra for consistent, high-quality deliveries
- **Seasonal challenges**: Special earning opportunities during peak periods
- **Referral bonuses**: Earn when you invite other drivers to join

---

## Driver Partner Benefits

- **Fuel discounts**: Exclusive partner rates at participating fuel stations
- **Insurance coverage**: Protection during active deliveries
- **24/7 support**: Dedicated driver support team available around the clock
- **Flexible schedule**: Work when you want, as much as you want
- **No job obligation**: Accept or reject any job freely
- **In-app tools**: GPS navigation, job management, and earnings tracking

---

## Vehicle Requirements

- 4-door pickup truck, van, or motorcycle (varies by city)
- Valid vehicle registration
- Vehicle in good working condition
- Lalamove sticker may be required for certain vehicle types

---

## Document Requirements

- Valid national ID card
- Valid driver's license (public transport license for commercial vehicles)
- Vehicle registration certificate
- Criminal background check (where required)
- Portrait photo meeting platform standards

---

## Deposit Information

- A refundable deposit is required to activate the driver account
- The deposit amount varies by vehicle type and city
- The deposit is fully refundable when a driver decides to leave the platform
- Payment can be made through various methods including bank transfer

---

## Frequently Asked Questions

**Q: Do I need to work every day?**
A: No. You choose when to work and how many jobs to accept. There is no minimum requirement.

**Q: How much can I earn?**
A: Earnings depend on how many jobs you complete, the distance, and your vehicle type. Many drivers earn competitive daily income.

**Q: What if I live outside the main operating area?**
A: Service coverage varies by city. Contact us to check if your area is covered.

**Q: Can I use my vehicle for other purposes while registered?**
A: Yes, when you're not accepting Lalamove jobs, your vehicle is completely yours to use.

**Q: What about the sticker on my truck?**
A: Some vehicle types require a Lalamove identification sticker. This helps customers identify you and builds trust.`,
  },
];

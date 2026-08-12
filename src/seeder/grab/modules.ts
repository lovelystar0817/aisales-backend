import { connect, disconnect, Types } from 'mongoose';
import { IModule, Module, ModuleLocalizations } from '../../models/Module.js';
import { GRAB_SALES_MODULES } from '../../constants/modules.js';
import * as dotenv from 'dotenv';
import { getModuleByFriendlyId } from '../../utils/module.js';
import {
  DEFAULT_LANGUAGE,
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  SUPPORTED_LANGUAGES,
} from '../../utils/constants.js';
import { envExtension } from '../../env.js';
import { join } from 'node:path';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Parse company argument
const VALID_COMPANIES = ['grab', 'grab-test'] as const;
type CompanyArg = (typeof VALID_COMPANIES)[number];

function parseCompanyArg(): CompanyArg {
  const companyArg = process.argv.find((arg) => arg.startsWith('--company='));

  if (!companyArg) {
    console.error('Error: --company argument is required');
    console.error('Usage: npx tsx script.ts --company=grab|grab-test');
    process.exit(1);
  }

  const value = companyArg.split('=')[1] as CompanyArg;

  if (!VALID_COMPANIES.includes(value)) {
    console.error(
      `Error: Invalid company "${value}". Must be one of: ${VALID_COMPANIES.join(', ')}`,
    );
    process.exit(1);
  }

  return value;
}

const companyArg = parseCompanyArg();
const TARGET_COMPANY_ID =
  companyArg === 'grab' ? GRAB_COMPANY_ID : GRAB_TEST_COMPANY_ID;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Pre-defined scenario setups for modules that don't have objectives defined
 * Structure: { [friendlyId]: { [languageCode]: scenarioSetup } }
 */
const MODULE_SCENARIO_SETUPS: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  'discovery-call-meddpicc': {
    en: 'You are conducting a structured discovery call using the MEDDPICC methodology. The prospect has agreed to discuss their business challenges, and you need to systematically uncover their Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, and Competition.',
    id: 'Anda sedang melakukan panggilan penemuan terstruktur menggunakan metodologi MEDDPICC. Prospek telah setuju untuk mendiskusikan tantangan bisnis mereka, dan Anda perlu secara sistematis mengungkap Metrik, Pembeli Ekonomi, Kriteria Keputusan, Proses Keputusan, Mengidentifikasi Rasa Sakit, Juara, dan Persaingan.',
    ms: 'Anda sedang menjalankan panggilan penemuan berstruktur menggunakan metodologi MEDDPICC. Prospek telah bersetuju untuk membincangkan cabaran perniagaan mereka, dan anda perlu mendedahkan secara sistematik Metrik, Pembeli Ekonomi, Kriteria Keputusan, Proses Keputusan, Mengenal Pasti Kesakitan, Juara, dan Persaingan.',
    tl: 'Ikaw ay nagsasagawa ng structured discovery call gamit ang MEDDPICC methodology. Ang prospect ay sumang-ayon na talakayin ang kanilang mga business challenges, at kailangan mong sistematikong tuklasin ang kanilang Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, at Competition.',
    vi: 'Bạn đang thực hiện cuộc gọi khám phá có cấu trúc sử dụng phương pháp MEDDPICC. Khách hàng tiềm năng đã đồng ý thảo luận về các thách thức kinh doanh của họ, và bạn cần khám phá một cách có hệ thống các Chỉ số, Người mua Kinh tế, Tiêu chí Quyết định, Quy trình Quyết định, Xác định Nỗi đau, Nhà vô địch và Cạnh tranh.',
    th: 'คุณกำลังดำเนินการโทรสำรวจแบบมีโครงสร้างโดยใช้วิธีการ MEDDPICC ผู้มีแนวโน้มเป็นลูกค้าได้ตกลงที่จะพูดคุยเกี่ยวกับความท้าทายทางธุรกิจของพวกเขา และคุณต้องค้นหาอย่างเป็นระบบเกี่ยวกับ Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion และ Competition',
    ceb: 'Naghimo ka og structured discovery call gamit ang MEDDPICC methodology. Ang prospect miuyon sa paghisgot sa ilang mga business challenges, ug kinahanglan nimong sistematikong mahibal-an ang ilang Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, ug Competition.',
    ko: 'MEDDPICC 방법론을 사용하여 구조화된 디스커버리 콜을 진행하고 있습니다. 잠재 고객이 비즈니스 과제에 대해 논의하기로 동의했으며, 체계적으로 지표(Metrics), 경제적 구매자(Economic Buyer), 의사결정 기준(Decision Criteria), 의사결정 프로세스(Decision Process), 페인 포인트 파악(Identify Pain), 챔피언(Champion), 경쟁(Competition)을 파악해야 합니다.',
  },
  'deal-closure': {
    en: 'You are in the final stages of a complex B2B deal. All stakeholders have been engaged, and you need to align on commercial terms, address any remaining concerns, and secure the signed agreement.',
    id: 'Anda berada di tahap akhir kesepakatan B2B yang kompleks. Semua pemangku kepentingan telah terlibat, dan Anda perlu menyelaraskan persyaratan komersial, mengatasi kekhawatiran yang tersisa, dan mendapatkan perjanjian yang ditandatangani.',
    ms: 'Anda berada di peringkat akhir perjanjian B2B yang kompleks. Semua pihak berkepentingan telah dilibatkan, dan anda perlu menyelaraskan terma komersial, menangani sebarang kebimbangan yang tinggal, dan mendapatkan perjanjian yang ditandatangani.',
    tl: 'Ikaw ay nasa huling yugto ng isang kumplikadong B2B deal. Lahat ng stakeholders ay na-engage na, at kailangan mong i-align ang commercial terms, tugunan ang anumang natitirang mga alalahanin, at makuha ang nilagdaang kasunduan.',
    vi: 'Bạn đang ở giai đoạn cuối của một thỏa thuận B2B phức tạp. Tất cả các bên liên quan đã được tham gia, và bạn cần căn chỉnh các điều khoản thương mại, giải quyết mọi lo ngại còn lại và đảm bảo thỏa thuận đã ký.',
    th: 'คุณอยู่ในขั้นตอนสุดท้ายของข้อตกลง B2B ที่ซับซ้อน ผู้มีส่วนได้ส่วนเสียทั้งหมดได้มีส่วนร่วมแล้ว และคุณต้องจัดแนวข้อตกลงทางการค้า แก้ไขข้อกังวลที่เหลืออยู่ และรับประกันข้อตกลงที่ลงนามแล้ว',
    ceb: 'Naa ka sa katapusang yugto sa usa ka komplikadong B2B deal. Ang tanan nga stakeholders na-engage na, ug kinahanglan nimong i-align ang commercial terms, tubagon ang bisan unsang nahabilin nga mga kabalaka, ug sigurohon ang gipirmahan nga kasabutan.',
    ko: '복잡한 B2B 딜의 최종 단계에 있습니다. 모든 이해관계자가 참여했으며, 상업적 조건을 조율하고, 남은 우려 사항을 해결하고, 서명된 계약을 확보해야 합니다.',
  },
  'grab-mex': {
    en: 'You are speaking with a merchant partner who has budget constraints affecting their participation in promotional campaigns. You need to understand their P&L concerns and find creative solutions that work within their financial limitations.',
    id: 'Anda sedang berbicara dengan mitra pedagang yang memiliki kendala anggaran yang mempengaruhi partisipasi mereka dalam kampanye promosi. Anda perlu memahami kekhawatiran P&L mereka dan menemukan solusi kreatif yang sesuai dengan keterbatasan keuangan mereka.',
    ms: 'Anda sedang bercakap dengan rakan niaga yang mempunyai kekangan bajet yang mempengaruhi penyertaan mereka dalam kempen promosi. Anda perlu memahami kebimbangan P&L mereka dan mencari penyelesaian kreatif yang sesuai dengan batasan kewangan mereka.',
    tl: 'Nakikipag-usap ka sa isang merchant partner na may budget constraints na nakakaapekto sa kanilang partisipasyon sa mga promotional campaigns. Kailangan mong maintindihan ang kanilang P&L concerns at maghanap ng mga creative solutions na gagana sa loob ng kanilang financial limitations.',
    vi: 'Bạn đang nói chuyện với một đối tác thương nhân có hạn chế ngân sách ảnh hưởng đến sự tham gia của họ trong các chiến dịch khuyến mãi. Bạn cần hiểu các mối quan ngại P&L của họ và tìm các giải pháp sáng tạo phù hợp với hạn chế tài chính của họ.',
    th: 'คุณกำลังพูดคุยกับพันธมิตรร้านค้าที่มีข้อจำกัดด้านงบประมาณที่ส่งผลกระทบต่อการเข้าร่วมแคมเปญส่งเสริมการขาย คุณต้องเข้าใจความกังวลด้าน P&L ของพวกเขาและหาทางออกที่สร้างสรรค์ที่ทำงานได้ภายในข้อจำกัดทางการเงินของพวกเขา',
    ceb: 'Nakig-istorya ka sa usa ka merchant partner nga adunay budget constraints nga nakaapekto sa ilang partisipasyon sa mga promotional campaigns. Kinahanglan nimong masabtan ang ilang P&L concerns ug mangita og mga creative solutions nga molihok sulod sa ilang financial limitations.',
    ko: '프로모션 캠페인 참여에 영향을 미치는 예산 제약이 있는 가맹점 파트너와 대화하고 있습니다. P&L 우려 사항을 이해하고 재정적 제한 내에서 작동하는 창의적인 솔루션을 찾아야 합니다.',
  },
};

const mapStaticModuleToDoc = (mod: IModule) => {
  const shownFields: string[] = [...(mod.fields?.shown ?? [])];

  // Get scenarioSetup for default language - prefer from module definition, fall back to pre-defined, then generate default
  const moduleScenarioSetups = MODULE_SCENARIO_SETUPS[mod.friendlyId];
  const defaultScenarioSetup =
    mod.scenarioSetup ??
    moduleScenarioSetups?.[DEFAULT_LANGUAGE] ??
    `You are engaging in a ${mod.title.toLowerCase()} scenario. ${mod.description}`;

  // Get existing localizations
  const defaultLocalization = getModuleByFriendlyId(
    mod.friendlyId,
    DEFAULT_LANGUAGE,
  );

  const localizations: ModuleLocalizations = {
    [DEFAULT_LANGUAGE]: {
      title: defaultLocalization?.title ?? mod.title,
      description: defaultLocalization?.description ?? mod.description,
      objectives: defaultLocalization?.objectives,
      scenarioSetup:
        moduleScenarioSetups?.[DEFAULT_LANGUAGE] ?? defaultScenarioSetup,
    },
  };

  // Add other language localizations
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === DEFAULT_LANGUAGE) continue;
    const langLocalization = getModuleByFriendlyId(mod.friendlyId, lang);
    localizations[lang] = {
      title: langLocalization?.title,
      description: langLocalization?.description,
      scenarioSetup: moduleScenarioSetups?.[lang],
      objectives: langLocalization?.objectives,
    };
  }

  return {
    title: mod.title,
    description: mod.description,
    friendlyId: mod.friendlyId,
    icon: mod.icon,
    iconBgColor: mod.iconBgColor,
    group: mod.group,
    fields: {
      shown: shownFields,
      hidden: [],
    },
    scenarioSetup:
      moduleScenarioSetups?.[DEFAULT_LANGUAGE] ?? defaultScenarioSetup,
    objectives: defaultLocalization?.objectives,
    localizations,
  };
};

export async function seedGrabModules() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations = GRAB_SALES_MODULES.map((mod) => {
      const moduleDoc = mapStaticModuleToDoc(mod);

      return {
        updateOne: {
          filter: {
            friendlyId: moduleDoc.friendlyId,
            company: new Types.ObjectId(TARGET_COMPANY_ID),
          },
          update: {
            $setOnInsert: { _id: new Types.ObjectId() },
            $set: {
              ...moduleDoc,
              company: new Types.ObjectId(TARGET_COMPANY_ID),
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      const result = await Module.bulkWrite(operations, { ordered: false });
      console.log('Grab modules seeding completed:', {
        company: companyArg,
        companyId: TARGET_COMPANY_ID,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No Grab module operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding Grab modules:', error);
  } finally {
    await disconnect();
  }
}

void seedGrabModules();

/**
 * Module disclaimers for Prudential
 */

export interface ModuleDisclaimer {
  moduleId: string;
  localized: {
    [languageCode: string]: {
      title: string;
      subtitle?: string;
      disclaimer: string;
    };
  };
}

export const PRUDENTIAL_MODULE_DISCLAIMERS: ModuleDisclaimer[] = [
  {
    moduleId: 'cold-call',
    localized: {
      en: {
        title: 'Cold Call Practice Module',
        subtitle: 'Important guidelines for practice sessions',
        disclaimer:
          'Please remember to conduct the full sales advisory process with your customer in real life. This includes performing a thorough fact find and needs analysis before making any product recommendations. This AI simulation is for training and demonstration purposes only and does not replace real-life customer engagement.',
      },
      id: {
        title: 'Modul Latihan Cold Call',
        subtitle: 'Panduan penting untuk sesi latihan',
        disclaimer:
          'Harap diingat untuk melakukan proses nasihat penjualan penuh dengan pelanggan Anda dalam kehidupan nyata. Ini termasuk melakukan pencarian fakta menyeluruh dan analisis kebutuhan sebelum membuat rekomendasi produk apa pun. Simulasi AI ini hanya untuk tujuan pelatihan dan demonstrasi dan tidak menggantikan keterlibatan pelanggan dalam kehidupan nyata.',
      },
      vi: {
        title: 'Mô-đun Thực hành Gọi Nguội',
        subtitle: 'Hướng dẫn quan trọng cho các phiên thực hành',
        disclaimer:
          'Xin hãy nhớ thực hiện quy trình tư vấn bán hàng đầy đủ với khách hàng trong đời thực. Điều này bao gồm việc thực hiện tìm hiểu thông tin kỹ lưỡng và phân tích nhu cầu trước khi đưa ra bất kỳ khuyến nghị sản phẩm nào. Mô phỏng AI này chỉ dành cho mục đích đào tạo và trình diễn và không thay thế sự tương tác khách hàng trong đời thực.',
      },
      tl: {
        title: 'Cold Call Practice Module',
        subtitle: 'Mga mahalagang gabay para sa mga session ng practice',
        disclaimer:
          'Pakitandaan na isagawa ang buong sales advisory process sa inyong customer sa tunay na buhay. Kasama dito ang pagsasagawa ng masusing fact find at needs analysis bago magbigay ng anumang product recommendations. Ang AI simulation na ito ay para sa training at demonstration purposes lamang at hindi pumapalit sa tunay na customer engagement.',
      },
      th: {
        title: 'โมดูลฝึกสอน Cold Call',
        subtitle: 'แนวทางสำคัญสำหรับเซสชั่นการฝึกฝน',
        disclaimer:
          'โปรดจำไว้ว่าต้องดำเนินกระบวนการให้คำปรึกษาการขายอย่างครบถ้วนกับลูกค้าของคุณในชีวิตจริง ซึ่งรวมถึงการค้นหาข้อเท็จจริงอย่างละเอียดและการวิเคราะห์ความต้องการก่อนที่จะให้คำแนะนำผลิตภัณฑ์ใดๆ การจำลอง AI นี้มีไว้สำหรับการฝึกอบรมและการสาธิตเท่านั้น และไม่ได้แทนที่การมีส่วนร่วมของลูกค้าในชีวิตจริง',
      },
    },
  },
  {
    moduleId: 'product-positioning',
    localized: {
      en: {
        title: 'Product Positioning Practice Module',
        subtitle: 'Important guidelines for practice sessions',
        disclaimer:
          'This is powered by artificial intelligence and continuously learns and improves over time. While it strives to provide accurate and up-to-date information, updates to information may not be reflected in real time. Its responses are intended for informational purposes only and should not be relied upon as definitive. You are strongly advised to verify any information by consulting official documents, such as the Product Information Pack.',
      },
      id: {
        title: 'Modul Latihan Product Positioning',
        subtitle: 'Panduan penting untuk sesi latihan',
        disclaimer:
          'Ini didukung oleh kecerdasan buatan dan terus belajar serta meningkat seiring waktu. Meskipun berusaha memberikan informasi yang akurat dan terkini, pembaruan informasi mungkin tidak tercermin secara real time. Responsnya dimaksudkan hanya untuk tujuan informasi dan tidak boleh diandalkan sebagai definitif. Anda sangat disarankan untuk memverifikasi informasi apa pun dengan berkonsultasi dengan dokumen resmi, seperti Paket Informasi Produk.',
      },
      vi: {
        title: 'Mô-đun Thực hành Định vị Sản phẩm',
        subtitle: 'Hướng dẫn quan trọng cho các phiên thực hành',
        disclaimer:
          'Điều này được hỗ trợ bởi trí tuệ nhân tạo và liên tục học hỏi và cải thiện theo thời gian. Mặc dù nó cố gắng cung cấp thông tin chính xác và cập nhật, các cập nhật thông tin có thể không được phản ánh theo thời gian thực. Các phản hồi của nó chỉ dành cho mục đích thông tin và không nên được dựa vào như là chính thức. Bạn được khuyên mạnh mẽ để xác minh bất kỳ thông tin nào bằng cách tham khảo các tài liệu chính thức, chẳng hạn như Gói Thông tin Sản phẩm.',
      },
      tl: {
        title: 'Product Positioning Practice Module',
        subtitle: 'Mga mahalagang gabay para sa mga session ng practice',
        disclaimer:
          'Ito ay pinapagana ng artificial intelligence at patuloy na natututo at bumubuti sa paglipas ng panahon. Habang nagsusumikap itong magbigay ng tumpak at pinakabagong impormasyon, ang mga update sa impormasyon ay maaaring hindi maipakita sa real time. Ang mga tugon nito ay inilaan lamang para sa mga layuning pang-impormasyon at hindi dapat umasa bilang tiyak. Lubos kang inuutusan na i-verify ang anumang impormasyon sa pamamagitan ng pagkonsulta sa mga opisyal na dokumento, tulad ng Product Information Pack.',
      },
      th: {
        title: 'โมดูลฝึกสอนการวางตำแหน่งผลิตภัณฑ์',
        subtitle: 'แนวทางสำคัญสำหรับเซสชั่นการฝึกฝน',
        disclaimer:
          'สิ่งนี้ขับเคลื่อนโดยปัญญาประดิษฐ์และเรียนรู้และปรับปรุงอย่างต่อเนื่องตามเวลา แม้ว่าจะพยายามให้ข้อมูลที่ถูกต้องและล่าสุด การอัปเดตข้อมูลอาจไม่สะท้อนแบบเรียลไทม์ การตอบสนองนั้นมีไว้เพื่อวัตถุประสงค์ในการให้ข้อมูลเท่านั้น และไม่ควรพึ่งพาเป็นสิ่งที่แน่นอน ขอแนะนำอย่างยิ่งให้คุณตรวจสอบข้อมูลใดๆ โดยปรึกษาเอกสารทางการ เช่น แพ็คข้อมูลผลิตภัณฑ์',
      },
    },
  },
];

export function getModuleDisclaimer(
  moduleId: string,
  languageCode: string = 'en',
): ModuleDisclaimer['localized'][string] | null {
  const disclaimer = PRUDENTIAL_MODULE_DISCLAIMERS.find(
    (d) => d.moduleId === moduleId,
  );
  if (!disclaimer) return null;

  return (
    disclaimer.localized[languageCode] || disclaimer.localized['en'] || null
  );
}

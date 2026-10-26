// Quyển 1, transcribed from photos of the class slides. Photos start at Buổi 4, so Buổi 1–3 are not here yet.
import type { Lesson } from "./lessons";

export const BOOK_1: Lesson[] = [
  {
    book: 1,
    session: 4,
    slug: "quyen-1-buoi-4",
    title: "Hỏi họ tên và làm quen",
    words: [
      { hanzi: "请问", pinyin: "qǐngwèn", meaning: "xin hỏi", hanViet: "THỈNH VẤN", pos: "动", parts: [{ hanzi: "问", pinyin: "wèn", meaning: "hỏi" }] },
      {
        hanzi: "贵姓",
        pinyin: "guìxìng",
        meaning: "họ, quý danh",
        hanViet: "QUÝ TÍNH",
        pos: "名",
        parts: [
          { hanzi: "贵", pinyin: "guì", meaning: "quý" },
          { hanzi: "姓", pinyin: "xìng", meaning: "họ" },
        ],
      },
      { hanzi: "这", pinyin: "zhè", meaning: "đây", hanViet: "GIÁ", pos: "代" },
      {
        hanzi: "吗",
        pinyin: "ma",
        meaning: "dùng cuối câu hỏi thông thường",
        hanViet: "MA",
        pos: "助",
        sentences: [
          { zh: "你高兴吗？", pinyin: "Nǐ gāoxìng ma?", vi: "Bạn có vui không?" },
          { zh: "你是高老师吗？", pinyin: "Nǐ shì Gāo lǎoshī ma?", vi: "Bạn là thầy/cô Cao phải không?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "这是王老师吗？", pinyin: "Zhè shì Wáng lǎoshī ma?", vi: "Đây là thầy/cô Vương phải không?" },
            { who: "B", zh: "是/不是。", pinyin: "Shì/búshì", vi: "Phải./Không phải." },
          ],
        ],
      },
      {
        hanzi: "不",
        pinyin: "bù",
        meaning: "không",
        hanViet: "BẤT",
        pos: "副",
        phrases: [
          { hanzi: "不是", pinyin: "bú shì", meaning: "không phải" },
          { hanzi: "是不是", pinyin: "shì bú shì", meaning: "có phải không" },
        ],
        dialogues: [
          [
            { who: "A", zh: "他好吗？", pinyin: "Tā hǎo ma?", vi: "Anh ấy có khỏe không?" },
            { who: "B", zh: "他不好。", pinyin: "Tā bù hǎo.", vi: "Anh ấy không khỏe." },
          ],
          [
            { who: "A", zh: "他是王老师吗？", pinyin: "Tā shì Wáng lǎoshī ma?", vi: "Ông ấy là thầy Vương phải không?" },
            { who: "B", zh: "他不是王老师。", pinyin: "Tā bú shì Wáng lǎoshī.", vi: "Ông ấy không phải thầy Vương." },
          ],
        ],
      },
      {
        hanzi: "对不起",
        pinyin: "duìbuqǐ",
        meaning: "xin lỗi",
        hanViet: "ĐỐI BẤT KHỞI",
        pos: "动",
        dialogues: [
          [
            { who: "A", zh: "对不起", pinyin: "duìbuqǐ", vi: "Xin lỗi." },
            { who: "B", zh: "没关系", pinyin: "méi guānxi", vi: "Không sao đâu." },
          ],
        ],
      },
      {
        hanzi: "有",
        pinyin: "yǒu",
        meaning: "có",
        hanViet: "HỮU",
        pos: "动",
        dialogues: [
          [
            { who: "A", zh: "你有书吗？", pinyin: "Nǐ yǒu shū ma?", vi: "Bạn có sách không?" },
            { who: "B", zh: "我有书。", pinyin: "Wǒ yǒu shū.", vi: "Tôi có sách." },
          ],
          [
            { who: "A", zh: "你有汉语老师吗？", pinyin: "Nǐ yǒu Hànyǔ lǎoshī ma?", vi: "Bạn có giáo viên tiếng Trung không?" },
            { who: "B", zh: "我有汉语老师。", pinyin: "Wǒ yǒu Hànyǔ lǎoshī.", vi: "Tôi có giáo viên tiếng Trung." },
          ],
        ],
      },
      {
        hanzi: "没有",
        pinyin: "méiyǒu",
        meaning: "không có",
        hanViet: "MỘT HỮU",
        pos: "动",
        dialogues: [
          [
            { who: "A", zh: "你有书吗？", pinyin: "Nǐ yǒu shū ma?", vi: "Bạn có sách không?" },
            { who: "B", zh: "我没有书。", pinyin: "Wǒ méiyǒu shū.", vi: "Tôi không có sách." },
          ],
          [
            { who: "A", zh: "你有汉语老师吗？", pinyin: "Nǐ yǒu Hànyǔ lǎoshī ma?", vi: "Bạn có giáo viên tiếng Trung không?" },
            { who: "B", zh: "我没有汉语老师。", pinyin: "Wǒ méiyǒu Hànyǔ lǎoshī.", vi: "Tôi không có giáo viên tiếng Trung." },
          ],
        ],
      },
      {
        hanzi: "的",
        pinyin: "de",
        meaning: "dùng để biểu thị sự sở hữu",
        hanViet: "ĐÍCH",
        pos: "助",
        sentences: [{ zh: "这是我的名字。", pinyin: "Zhè shì wǒ de míngzi.", vi: "Đây là tên của tôi." }],
        dialogues: [
          [
            { who: "A", zh: "这是你的老师吗？", pinyin: "Zhè shì nǐ de lǎoshi ma?", vi: "Đây là giáo viên của bạn phải không?" },
            { who: "B", zh: "这是我的老师。", pinyin: "Zhè shì wǒ de lǎoshī.", vi: "Đây là giáo viên của tôi." },
          ],
        ],
      },
      {
        hanzi: "名片",
        pinyin: "míngpiàn",
        meaning: "danh thiếp",
        hanViet: "DANH PHIẾN",
        pos: "名",
        phrases: [
          { hanzi: "我的名片", pinyin: "Wǒ de míngpiàn.", meaning: "danh thiếp của tôi" },
          { hanzi: "他的名片", pinyin: "Tā de míngpiàn.", meaning: "danh thiếp của anh ấy" },
          { hanzi: "马小姐的名片", pinyin: "Mǎ xiǎojiě de míngpiàn.", meaning: "danh thiếp của cô Mã" },
        ],
        dialogues: [
          [
            { who: "A", zh: "这是谁的名片？", pinyin: "Zhè shì shéi de míngpiàn?", vi: "Đây là danh thiếp của ai?" },
            { who: "B", zh: "这是我的名片。", pinyin: "Zhè shì wǒ de míngpiàn.", vi: "Đây là danh thiếp của tôi." },
          ],
        ],
      },
      {
        hanzi: "很",
        pinyin: "hěn",
        meaning: "rất",
        hanViet: "NGẬN",
        pos: "副",
        phrases: [{ hanzi: "很好", pinyin: "Hěn hǎo.", meaning: "rất tốt, rất khỏe" }],
        dialogues: [
          [
            { who: "A", zh: "你好吗？", pinyin: "Nǐ hǎo ma?", vi: "Bạn có khỏe không?" },
            { who: "B", zh: "我很好。你呢？", pinyin: "Wǒ hěn hǎo. Nǐ ne?", vi: "Tôi rất khỏe. Còn bạn?" },
            { who: "A", zh: "我也很好。", pinyin: "Wǒ yě hěn hǎo.", vi: "Tôi cũng rất khỏe." },
          ],
        ],
      },
      {
        hanzi: "高兴",
        pinyin: "gāoxìng",
        meaning: "vui mừng",
        hanViet: "CAO HỨNG",
        pos: "形",
        sentences: [
          { zh: "我也很高兴。", pinyin: "Wǒ yě hěn gāoxìng.", vi: "Tôi cũng rất vui." },
          { zh: "我也不高兴。", pinyin: "Wǒ yě bù gāoxìng.", vi: "Tôi cũng không vui." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你高兴吗？", pinyin: "Nǐ gāoxìng ma?", vi: "Bạn có vui không?" },
            { who: "B", zh: "我很高兴。", pinyin: "Wǒ hěn gāoxìng.", vi: "Tôi rất vui." },
          ],
          [
            { who: "A", zh: "你高兴吗？", pinyin: "Nǐ gāoxìng ma?", vi: "Bạn có vui không?" },
            { who: "B", zh: "我不高兴。", pinyin: "Wǒ bù gāoxìng.", vi: "Tôi không vui." },
          ],
        ],
      },
      {
        hanzi: "先生",
        pinyin: "xiānsheng",
        meaning: "ngài, ông",
        hanViet: "TIÊN SINH",
        pos: "名",
        parts: [
          { hanzi: "马", pinyin: "Mǎ", meaning: "họ Mã" },
          { hanzi: "高", pinyin: "Gāo", meaning: "họ Cao" },
        ],
        phrases: [
          { hanzi: "马先生", pinyin: "Mǎ xiānsheng", meaning: "ông Mã" },
          { hanzi: "高先生", pinyin: "Gāo xiānsheng", meaning: "ông Cao" },
          { hanzi: "王先生", pinyin: "Wáng xiānsheng", meaning: "ông Vương" },
        ],
        dialogues: [
          [
            { who: "A", zh: "高先生，认识你我很高兴。", pinyin: "Gāo xiānsheng, rènshi nǐ wǒ hěn gāoxìng.", vi: "Ông Cao, rất vui được làm quen với ông." },
            {
              who: "B",
              zh: "马先生，我也很高兴认识你。",
              pinyin: "Mǎ xiānsheng, wǒ yě hěn gāoxìng rènshi nǐ.",
              vi: "Ông Mã, tôi cũng rất vui được làm quen với ông.",
            },
          ],
        ],
      },
      {
        hanzi: "英国",
        pinyin: "Yīngguó",
        meaning: "nước Anh",
        hanViet: "ANH QUỐC",
        pos: "名",
        sentences: [
          { zh: "我是英国人。", pinyin: "Wǒ shì Yīngguórén.", vi: "Tôi là người Anh." },
          { zh: "我不是英国人。", pinyin: "Wǒ bú shì Yīngguórén.", vi: "Tôi không phải người Anh." },
        ],
        dialogues: [
          [
            { who: "A", zh: "马先生是英国人吗？", pinyin: "Mǎ xiānsheng shì Yīngguórén ma?", vi: "Ông Mã là người Anh phải không?" },
            { who: "B", zh: "他不是英国人。", pinyin: "Tā bú shì Yīngguórén.", vi: "Ông ấy không phải người Anh." },
          ],
        ],
      },
    ],
    grammar: [
      {
        id: "dinh-ngu-de",
        title: "定语结构",
        name: "Kết cấu định ngữ (Từ sở hữu “的”)",
        summary:
          "Trợ từ “的” tạo nên kết cấu định ngữ, trong đó phần đứng trước 的 là thành phần định ngữ, phần sau 的 là thành phần trung tâm ngữ. Trong một số trường hợp chữ 的 có thể được lược bỏ, hoặc không cần thêm 的.",
        structures: ["Định ngữ +(的)+ trung tâm ngữ"],
        note: "Với quan hệ thân thuộc (như 我妈妈) có thể lược bỏ 的.",
        focus: ["的"],
        examples: [
          { zh: "我的名片", pinyin: "Wǒ de míngpiàn", vi: "danh thiếp của tôi" },
          { zh: "马小姐的名片", pinyin: "Mǎ xiǎojiě de míngpiàn", vi: "danh thiếp của cô Mã" },
          { zh: "老师的名字", pinyin: "Lǎoshī de míngzi", vi: "tên của thầy/cô giáo" },
          { zh: "你的名片", pinyin: "Nǐ de míngpiàn", vi: "danh thiếp của bạn" },
          { zh: "美丽的华", pinyin: "Měi lì de huā", vi: "bông hoa đẹp" },
          { zh: "我（的）妈妈", pinyin: "Wǒ (de) mā ma", vi: "mẹ (của) tôi" },
          { zh: "他是我们的老师。", pinyin: "Tā shì wǒmen de lǎoshī.", vi: "Thầy ấy là giáo viên của chúng tôi." },
          { zh: "你的名字是什么？", pinyin: "Nǐ de míngzi shì shénme?", vi: "Tên của bạn là gì?" },
        ],
      },
      {
        id: "cau-vi-ngu-tinh-tu",
        title: "形容词谓语句",
        name: "Câu vị ngữ tính từ / Tính từ làm vị ngữ trong câu",
        summary:
          "Tính từ có thể trực tiếp làm vị ngữ, không dùng 是. Trong câu khẳng định thường thêm phó từ 很 trước tính từ; câu phủ định dùng 不 trước tính từ.",
        structures: ["主语 + 很 + 形容词", "主语 + 不 + 形容词"],
        note: "Không nói 我是很高兴, mà nói 我很高兴.",
        focus: ["很", "不"],
        examples: [
          { zh: "我很高兴。", pinyin: "Wǒ hěn gāoxìng.", vi: "Tôi rất vui." },
          { zh: "我们的老师很好。", pinyin: "Wǒmen de lǎoshī hěn hǎo.", vi: "Giáo viên của chúng tôi rất tốt." },
        ],
      },
      {
        id: "pho-tu-ye",
        title: "副词“也”",
        name: "Phó từ “也”",
        summary:
          "“也” nghĩa là “cũng”. Trong tiếng Hán, phó từ dùng để hạn định, tu sức cho động từ, tính từ, biểu thị mức độ, thời gian, phạm vi, quan hệ,…; thường đứng trước động từ, tính từ.",
        structures: ["也 + 动词/形容词"],
        note: "“cũng”",
        focus: ["也"],
        examples: [
          {
            zh: "马小姐是中国人，高先生也是中国人。",
            pinyin: "Mǎ xiǎojiě shì zhōngguórén, Gāo xiānsheng yě shì zhōngguórén.",
            vi: "Cô Mã là người Trung Quốc, ông Cao cũng là người Trung Quốc.",
          },
          { zh: "认识你我也很高兴。", pinyin: "Rènshi nǐ wǒ yě hěn gāoxìng.", vi: "Tôi cũng rất vui được làm quen với bạn." },
        ],
      },
    ],
    texts: [
      {
        title: "Bài khóa 1",
        lines: [
          { who: "A", zh: "请问，您贵姓？", pinyin: "Qǐngwèn, nín guìxìng?", vi: "Xin hỏi, ngài họ gì ạ?" },
          { who: "B", zh: "我姓马。您呢？", pinyin: "Wǒ xìng Mǎ. Nín ne?", vi: "Tôi họ Mã. Còn ngài?" },
          { who: "A", zh: "我姓高。这是我的名片。", pinyin: "Wǒ xìng Gāo. Zhè shì wǒ de míngpiàn.", vi: "Tôi họ Cao. Đây là danh thiếp của tôi." },
          { who: "B", zh: "对不起，我没有名片。", pinyin: "Duìbuqǐ, wǒ méiyǒu míngpiàn.", vi: "Xin lỗi, tôi không có danh thiếp." },
          { who: "A", zh: "没关系。很高兴认识你！", pinyin: "Méi guānxi. Hěn gāoxìng rènshi nǐ!", vi: "Không sao. Rất vui được làm quen với ông!" },
          {
            who: "B",
            zh: "高先生，认识你我也很高兴！",
            pinyin: "Gāo xiānsheng, rènshi nǐ wǒ yě hěn gāoxìng!",
            vi: "Ông Cao, tôi cũng rất vui được làm quen với ông!",
          },
        ],
      },
      {
        title: "Bài khóa 2",
        lines: [
          { who: "A", zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Chào bạn!" },
          { who: "B", zh: "你好！", pinyin: "Nǐ hǎo", vi: "Chào bạn!" },
          { who: "A", zh: "请问，你叫什么名字？", pinyin: "Qǐngwèn, nǐ jiào shénme míngzi?", vi: "Xin hỏi, bạn tên là gì?" },
          { who: "B", zh: "我叫黄文丽。你呢？", pinyin: "Wǒ jiào Huáng Wénlì. Nǐ ne?", vi: "Tôi tên là Hoàng Văn Lệ. Còn bạn?" },
          {
            who: "A",
            zh: "我叫欧文。你是中国人吗？",
            pinyin: "Wǒ jiào Ōuwén. Nǐ shì Zhōngguórén ma?",
            vi: "Tôi tên là Âu Văn. Bạn là người Trung Quốc phải không?",
          },
          { who: "B", zh: "是，你是英国人吗？", pinyin: "Shì, nǐ shì Yīngguórén ma?", vi: "Phải. Bạn là người Anh à?" },
          {
            who: "A",
            zh: "不，我不是英国人，我是美国人。",
            pinyin: "Bù, wǒ bú shì Yīngguórén, wǒ shì Měiguórén.",
            vi: "Không, tôi không phải người Anh, tôi là người Mỹ.",
          },
          { who: "B", zh: "认识你很高兴！", pinyin: "Rènshi nǐ hěn gāoxìng!", vi: "Rất vui được làm quen với bạn!" },
          { who: "A", zh: "认识你我也很高兴！", pinyin: "Rènshi nǐ wǒ yě hěn gāoxìng!", vi: "Tôi cũng rất vui được làm quen với bạn!" },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 5,
    slug: "quyen-1-buoi-5",
    title: "Đi taxi: hỏi đường và trả tiền",
    words: [
      {
        hanzi: "小姐",
        pinyin: "xiǎojiě",
        meaning: "tiểu thư, cô",
        hanViet: "TIỂU THƯ",
        pos: "名",
        phrases: [
          { hanzi: "高小姐", pinyin: "Gāo xiǎojiě", meaning: "cô Cao" },
          { hanzi: "马小姐", pinyin: "Mǎ xiǎojiě", meaning: "cô Mã" },
        ],
        dialogues: [
          [
            { who: "A", zh: "小姐，请问您贵姓？", pinyin: "Xiǎojiě, qǐngwèn nín guìxìng?", vi: "Thưa cô, xin hỏi cô họ gì?" },
            { who: "B", zh: "我姓张。", pinyin: "Wǒ xìng Zhāng", vi: "Tôi họ Trương." },
          ],
        ],
      },
      { hanzi: "师傅", pinyin: "shīfu", meaning: "sư phụ, thầy (cách gọi thường thấy đối với tài xế lái xe)", hanViet: "SƯ PHÓ", pos: "名" },
      {
        hanzi: "人民",
        pinyin: "rénmín",
        meaning: "nhân dân",
        hanViet: "NHÂN DÂN",
        pos: "名",
        phrases: [
          { hanzi: "中华人民", pinyin: "Zhōnghuá rénmín", meaning: "nhân dân Trung Hoa" },
          { hanzi: "越南人民", pinyin: "Yuènán rénmín", meaning: "nhân dân Việt Nam" },
        ],
        dialogues: [
          [
            { who: "A", zh: "我是中华人民，你呢？", pinyin: "Wǒ shì Zhōnghuá rénmín, nǐ ne?", vi: "Tôi là người dân Trung Hoa, còn bạn?" },
            { who: "B", zh: "我是越南人民。", pinyin: "Wǒ shì Yuènán rénmín.", vi: "Tôi là người dân Việt Nam." },
          ],
        ],
      },
      {
        hanzi: "广场",
        pinyin: "guǎngchǎng",
        meaning: "quảng trường",
        hanViet: "QUẢNG TRƯỜNG",
        pos: "名",
        phrases: [{ hanzi: "人民广场", pinyin: "Rénmín Guǎngchǎng.", meaning: "Quảng trường Nhân dân" }],
        dialogues: [
          [
            { who: "A", zh: "小姐，你去哪儿？", pinyin: "Xiǎojiě nǐ qù nǎr?", vi: "Cô ơi, cô đi đâu?" },
            { who: "B", zh: "我去人民广场。", pinyin: "Wǒ qù Rénmín Guǎngchǎng .", vi: "Tôi đi Quảng trường Nhân dân." },
          ],
        ],
      },
      {
        hanzi: "远",
        pinyin: "yuǎn",
        meaning: "xa",
        hanViet: "VIỄN",
        pos: "形",
        phrases: [
          { hanzi: "很远", pinyin: "hěn yuǎn", meaning: "rất xa" },
          { hanzi: "不远", pinyin: "bù yuan", meaning: "không xa" },
        ],
        sentences: [{ zh: "人民广场很远。", pinyin: "Rénmín Guǎngchǎng hěn yuǎn.", vi: "Quảng trường Nhân dân rất xa." }],
        dialogues: [
          [
            { who: "A", zh: "马师傅，人民广场远吗？", pinyin: "Mǎ shīfu , Rénmín Guǎngchǎng yuǎn ma?", vi: "Bác tài Mã, Quảng trường Nhân dân có xa không?" },
            { who: "B", zh: "不远。", pinyin: "Bù yuǎn.", vi: "Không xa." },
          ],
        ],
      },
      {
        hanzi: "近",
        pinyin: "jìn",
        meaning: "gần",
        hanViet: "CẬN",
        pos: "形",
        phrases: [
          { hanzi: "很近", pinyin: "hěn jìn", meaning: "rất gần" },
          { hanzi: "不近", pinyin: "bú jìn", meaning: "không gần" },
        ],
        sentences: [{ zh: "我的学校很近。", pinyin: "Wǒ de xuéxiào hěn jìn", vi: "Trường của tôi rất gần." }],
        dialogues: [
          [
            { who: "A", zh: "师傅，人民广场远吗？", pinyin: "Shīfu , Rénmín Guǎngchǎng yuǎn ma?", vi: "Bác tài ơi, Quảng trường Nhân dân có xa không?" },
            { who: "B", zh: "人民广场不远，很近。", pinyin: "Rénmín Guǎngchǎng bù yuǎn, hěn jìn.", vi: "Quảng trường Nhân dân không xa, rất gần." },
          ],
        ],
      },
      {
        hanzi: "去",
        pinyin: "qù",
        meaning: "đi",
        hanViet: "KHỨ",
        pos: "动",
        phrases: [{ hanzi: "去学校", pinyin: "qù xuéxiào", meaning: "đi đến trường" }],
        sentences: [
          { zh: "你去不去？", pinyin: "Nǐ qù bú qù?", vi: "Bạn có đi không?" },
          { zh: "他去中国。", pinyin: "Tā qù Zhōngguó.", vi: "Anh ấy đi Trung Quốc." },
        ],
        dialogues: [
          [
            { who: "A", zh: "小姐，你去人民广场吗？", pinyin: "Xiǎojiě, nǐ qù Rénmín Guǎngchǎng ma ?", vi: "Cô ơi, cô đi Quảng trường Nhân dân phải không?" },
            { who: "B", zh: "是，我去人民广场。", pinyin: "Shì, wǒ qù Rénmín Guǎngchǎng .", vi: "Vâng, tôi đi Quảng trường Nhân dân." },
          ],
        ],
      },
      {
        hanzi: "哪儿/哪里",
        pinyin: "nǎr/nǎli",
        meaning: "đâu",
        hanViet: "NA NHI / NA LÝ",
        pos: "代",
        key: { hanzi: "哪儿", pinyin: "nǎr" },
        sentences: [
          { zh: "你去哪儿？", pinyin: "Nǐ qù nǎr?", vi: "Bạn đi đâu?" },
          { zh: "他去哪里？", pinyin: "Nǐ qù nǎli?", vi: "Anh ấy đi đâu?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你去哪儿？", pinyin: "Nǐ qù nǎr?", vi: "Bạn đi đâu?" },
            { who: "B", zh: "我去人民广场。", pinyin: "Wǒ qù Rénmín Guǎngchǎng.", vi: "Tôi đi Quảng trường Nhân dân." },
          ],
        ],
      },
      {
        hanzi: "知道",
        pinyin: "zhīdào",
        meaning: "biết",
        hanViet: "TRI ĐẠO",
        pos: "动",
        phrases: [{ hanzi: "不知道", pinyin: "bù zhīdào", meaning: "không biết" }],
        sentences: [
          { zh: "我知道他的名字。", pinyin: "Wǒ zhīdào tā de míngzi .", vi: "Tôi biết tên của anh ấy." },
          { zh: "我不知道高师傅去哪儿。", pinyin: "Wǒ bù zhīdào Gāo shīfu qù nǎr.", vi: "Tôi không biết bác tài Cao đi đâu." },
        ],
        dialogues: [
          [
            { who: "A", zh: "师傅我去人民广场？", pinyin: "Shīfu wǒ qù Rénmín Guǎngchǎng?", vi: "Bác tài ơi, tôi đi Quảng trường Nhân dân." },
            { who: "B", zh: "好，知道了。", pinyin: "Hǎo, zhīdào le .", vi: "Được, biết rồi." },
          ],
        ],
      },
      {
        hanzi: "了",
        pinyin: "le",
        meaning: "rồi (biểu thị sự thay đổi)",
        hanViet: "LIỄU",
        pos: "助",
        sentences: [
          { zh: "我知道了。", pinyin: "Wǒ zhīdao le.", vi: "Tôi biết rồi." },
          {
            zh: "他不去学校，他去人民广场了。",
            pinyin: "Tā bú qù xuéxiào, tā qù Rénmín Guǎngchǎng le.",
            vi: "Anh ấy không đến trường, anh ấy đi Quảng trường Nhân dân rồi.",
          },
        ],
        dialogues: [
          [
            { who: "A", zh: "师傅，我去学校。", pinyin: "Shīfu, wǒ qù xuéxiào.", vi: "Bác tài ơi, tôi đến trường." },
            { who: "B", zh: "好，知道了。", pinyin: "Hǎo, zhīdào le.", vi: "Được, biết rồi." },
          ],
        ],
      },
      {
        hanzi: "到",
        pinyin: "dào",
        meaning: "đến, tới",
        hanViet: "ĐÁO",
        pos: "动",
        phrases: [
          { hanzi: "到学校", pinyin: "dào xuéxiào", meaning: "đến trường" },
          { hanzi: "到广场", pinyin: "dào guǎngchǎng", meaning: "đến quảng trường" },
        ],
        sentences: [{ zh: "高小姐，到了。", pinyin: "Gāo xiǎojiě, dào le.", vi: "Cô Cao, đến nơi rồi." }],
        dialogues: [
          [
            { who: "A", zh: "小姐到人民广场了。", pinyin: "Xiǎojiě, dào Rénmín Guǎngchǎng le.", vi: "Cô ơi, đến Quảng trường Nhân dân rồi." },
            { who: "B", zh: "好，知道了。", pinyin: "Hǎo, zhīdào le .", vi: "Vâng, biết rồi." },
          ],
        ],
      },
      {
        hanzi: "钱",
        pinyin: "qián",
        meaning: "tiền",
        hanViet: "TIỀN",
        pos: "名",
        phrases: [
          { hanzi: "我的钱", pinyin: "wǒ de qián", meaning: "tiền của tôi" },
          { hanzi: "高小姐的钱", pinyin: "Gāo xiǎojiě de qián", meaning: "tiền của cô Cao" },
        ],
        dialogues: [
          [
            { who: "A", zh: "这是你的钱吗？", pinyin: "Zhè shì nǐ de qián ma?", vi: "Đây là tiền của bạn phải không?" },
            { who: "B", zh: "是我的钱。", pinyin: "Shì wǒ de qián.", vi: "Là tiền của tôi." },
          ],
        ],
      },
      {
        hanzi: "块",
        pinyin: "kuài",
        meaning: "đồng (lượng từ)",
        hanViet: "KHỐI",
        pos: "量",
        phrases: [
          { hanzi: "一块钱", pinyin: "yì kuài qián", meaning: "một đồng" },
          { hanzi: "三块钱", pinyin: "sān kuài qián", meaning: "ba đồng" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你有钱吗？", pinyin: "Nǐ yǒu qián ma ?", vi: "Bạn có tiền không?" },
            { who: "B", zh: "我有二十五块钱。", pinyin: "Wǒ yǒu èrshíwǔ kuài qián.", vi: "Tôi có hai mươi lăm đồng." },
          ],
        ],
      },
      {
        hanzi: "多少",
        pinyin: "duōshao",
        meaning: "bao nhiêu",
        hanViet: "ĐA THIỂU",
        pos: "代",
        parts: [
          { hanzi: "多", pinyin: "duō", meaning: "nhiều" },
          { hanzi: "少", pinyin: "shǎo", meaning: "ít" },
        ],
        phrases: [
          { hanzi: "很多", pinyin: "hěn duō", meaning: "rất nhiều" },
          { hanzi: "不少", pinyin: "bù shǎo", meaning: "không ít" },
          { hanzi: "很多钱", pinyin: "hěn duō qián", meaning: "rất nhiều tiền" },
          { hanzi: "多少人", pinyin: "duōshao rén", meaning: "bao nhiêu người" },
        ],
        sentences: [
          { zh: "请问，去人民广场多少钱？", pinyin: "Qǐngwèn, qù Rénmín Guǎngchǎng duōshǎo qián?", vi: "Xin hỏi, đi Quảng trường Nhân dân bao nhiêu tiền?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你有多少钱？", pinyin: "Nǐ yǒu duōshǎo qián?", vi: "Bạn có bao nhiêu tiền?" },
            { who: "B", zh: "我有十九块。", pinyin: "Wǒ yǒu shíjiǔ kuài.", vi: "Tôi có mười chín đồng." },
          ],
        ],
      },
      {
        hanzi: "谢谢",
        pinyin: "xièxie",
        meaning: "cảm ơn",
        hanViet: "TẠ TẠ",
        pos: "动",
        sentences: [
          { zh: "谢谢你！", pinyin: "Xièxie nǐ", vi: "Cảm ơn bạn!" },
          { zh: "谢谢师傅！", pinyin: "Xièxie shīfu", vi: "Cảm ơn bác tài!" },
        ],
        dialogues: [
          [
            { who: "A", zh: "小姐，到人民广场了。", pinyin: "Xiǎojiě, dào Rénmín Guǎngchǎng le.", vi: "(Bác tài:) Cô ơi, đến Quảng trường Nhân dân rồi." },
            { who: "B", zh: "谢谢！", pinyin: "Xièxie", vi: "(Cô Cao:) Cảm ơn!" },
          ],
        ],
      },
      {
        hanzi: "不客气",
        pinyin: "bú kèqi",
        meaning: "không có gì, đừng khách sáo",
        hanViet: "BẤT KHÁCH KHÍ",
        parts: [{ hanzi: "客气", pinyin: "kèqi", meaning: "khách sáo", pos: "形" }],
        sentences: [
          { zh: "太客气了", pinyin: "Tài kèqi le", vi: "Khách sáo quá rồi." },
          { zh: "你客气了。", pinyin: "Nǐ kèqi le", vi: "Bạn khách sáo rồi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "谢谢你.", pinyin: "Xièxie nǐ", vi: "Cảm ơn bạn." },
            { who: "B", zh: "不客气。", pinyin: "Bú kèqi .", vi: "Không có gì." },
          ],
        ],
      },
      {
        hanzi: "再见",
        pinyin: "zàijiàn",
        meaning: "tạm biệt, hẹn gặp lại",
        hanViet: "TÁI KIẾN",
        pos: "动",
        sentences: [
          { zh: "马小姐再见！", pinyin: "Mǎ xiǎojiě zàijiàn", vi: "Tạm biệt cô Mã!" },
          { zh: "师傅再见！", pinyin: "Shīfu zàijiàn!", vi: "Tạm biệt bác tài!" },
        ],
      },
    ],
    grammar: [
      {
        id: "cau-hoi-chinh-phan",
        title: "正反疑问句",
        name: "Câu hỏi chính phản",
        summary:
          "Cấu trúc của câu hỏi chính phản là lặp lại động từ hoặc tính từ, đồng thời ở giữa thêm chữ “不”; “有没有” là trường hợp ngoại lệ. Câu hỏi chính phản không dùng thêm “吗” ở cuối câu.",
        structures: ["S + x不x + ……?"],
        note: "正反疑问句的格式是重复动词或形容词，并在中间加上“不”，但“有没有”是例外。(Với động từ 有 thì dùng 有没有, không nói 有不有.)",
        focus: ["是不是", "远不远", "有没有", "去不去", "不"],
        examples: [
          { zh: "你是不是老师？", pinyin: "Nǐ shì bú shì lǎoshī?", vi: "Bạn có phải là giáo viên không?" },
          { zh: "人民广场远不远？", pinyin: "Rénmín Guǎngchǎng yuǎn bù yuǎn?", vi: "Quảng trường Nhân dân có xa không?" },
          { zh: "他有没有中国名字？", pinyin: "Tā yǒu méiyǒu Zhōngguó míngzi?", vi: "Anh ấy có tên tiếng Trung không?" },
          { zh: "你是不是中国人？", pinyin: "Nǐ shì bú shì  Zhōngguórén ?", vi: "Bạn có phải người Trung Quốc không?" },
          { zh: "你有没有名片？", pinyin: "Nǐ yǒu méiyǒu míngpiàn?", vi: "Bạn có danh thiếp không?" },
        ],
      },
      {
        id: "bien-dieu-yi",
        title: "“一”的变调",
        name: "Biến điệu của “一”",
        summary:
          "“一” đứng một mình hoặc biểu thị số thứ tự thì đọc thanh 1 (yī). Khi đi kèm âm tiết phía sau: trước thanh 1, 2, 3 đọc thanh 4 (yì); trước thanh 4 đọc thanh 2 (yí).",
        structures: ["一 + 1，2，3: 一 được đọc với thanh 4", "一 + 4: 一 được đọc với thanh 2"],
        note: "表示非序数意义，后接四声音节时，读二声yí (Nếu không biểu thị số thứ tự và đằng sau là âm tiết chứa thanh bốn thì đọc thành thanh hai.) TH1: 一 đứng một mình hoặc biểu thị số thứ tự: yi đọc với thanh 1.",
        focus: ["一"],
        examples: [
          { zh: "一个", pinyin: "yí gè", vi: "một cái" },
          { zh: "一下", pinyin: "yí xià", vi: "một chút, một lát" },
          { zh: "一对", pinyin: "yí duì", vi: "một đôi" },
        ],
      },
      {
        id: "so-dem-1-100",
        title: "汉语的数字1-100",
        name: "Các số từ 1 – 100 trong tiếng Hán",
        summary: "Số từ 11 đến 19 là 十 + số hàng đơn vị (十一, 十九); số chục là số + 十 (二十); các số khác ghép theo thứ tự chục rồi đơn vị (二十五).",
        structures: ["十 + 一……九 (11–19)", "二……九 + 十 (20, 30 … 90)", "二……九 + 十 + 一……九 (21–99)"],
        note: "Slide chỉ có bảng số 1–20; các cấu trúc trên được tóm tắt thêm, không có trên slide.",
        focus: ["十"],
        examples: [
          { zh: "十", pinyin: "shí", vi: "mười (10)" },
          { zh: "十一", pinyin: "shíyī", vi: "mười một (11)" },
          { zh: "十五", pinyin: "shíwǔ", vi: "mười lăm (15)" },
          { zh: "十九", pinyin: "shíjiǔ", vi: "mười chín (19)" },
          { zh: "二十", pinyin: "èrshí", vi: "hai mươi (20)" },
          { zh: "二十五", pinyin: "èrshíwǔ", vi: "hai mươi lăm (25)" },
        ],
      },
    ],
    texts: [
      {
        title: "Bài khóa 1",
        lines: [
          { who: "A", zh: "小姐，你好！", pinyin: "Xiǎojiě, nǐ hǎo!", vi: "Chào cô!" },
          { who: "B", zh: "你好，师傅！", pinyin: "Nǐ hǎo, shīfu!", vi: "Chào bác tài!" },
          { who: "A", zh: "你去哪儿？", pinyin: "Nǐ qù nǎr ?", vi: "Cô đi đâu?" },
          { who: "B", zh: "我去人民广场。", pinyin: "Wǒ qù Rénmín Guǎngchǎng.", vi: "Tôi đi Quảng trường Nhân dân." },
          { who: "A", zh: "什么？", pinyin: "Shénme?", vi: "Gì cơ?" },
          { who: "B", zh: "我去人民广场。", pinyin: "Wǒ qù Rénmín Guǎngchǎng.", vi: "Tôi đi Quảng trường Nhân dân." },
          { who: "A", zh: "好，知道了。", pinyin: "Hǎo, zhīdào le.", vi: "Được, biết rồi." },
          { who: "B", zh: "人民广场远不远？", pinyin: "Rén mín Guǎngchǎng yuǎn bù yuǎn?", vi: "Quảng trường Nhân dân có xa không?" },
          { who: "A", zh: "不远，很近。", pinyin: "Bù yuǎn, hěn jìn.", vi: "Không xa, rất gần." },
        ],
      },
      {
        title: "Luyện tập: hội thoại mẫu",
        lines: [
          { who: "A", zh: "你好！你去哪儿？", pinyin: "Nǐ hǎo! Nǐ qù nǎr?", vi: "Xin chào! Bạn đi đâu?" },
          { who: "B", zh: "我去人民广场。", pinyin: "Wǒ qù Rénmín Guǎngchǎng.", vi: "Tôi đi Quảng trường Nhân dân." },
          { who: "A", zh: "好，知道了。", pinyin: "Hǎo, zhīdào le.", vi: "Được, biết rồi." },
          { who: "B", zh: "人民广场远不远？", pinyin: "Rénmín Guǎngchǎng yuǎn bù yuǎn?", vi: "Quảng trường Nhân dân có xa không?" },
          { who: "A", zh: "不远。很近。……到了。", pinyin: "Bù yuǎn. Hěn jìn. ...... Dào le.", vi: "Không xa. Rất gần. …… Đến rồi." },
          { who: "B", zh: "多少钱？", pinyin: "Duōshao qián?", vi: "Bao nhiêu tiền?" },
          { who: "A", zh: "15块。", pinyin: "15 kuài.", vi: "15 đồng." },
        ],
      },
      {
        title: "阅读练习 (Luyện đọc)",
        lines: [
          { zh: "塞翁失马，焉知非福。", pinyin: "Sài wēng shī mǎ, yān zhī fēi fú.", vi: "Tái ông mất ngựa, chưa biết là phúc hay họa." },
          { zh: "亡羊补牢，为时未晚。", pinyin: "Wáng yáng bǔ láo, wéi shí wèi wǎn.", vi: "Mất bò mới lo làm chuồng." },
          { zh: "宰相肚里能撑船。", pinyin: "Zǎixiàng dù li néng chēng chuán.", vi: "Tấm lòng khoan dung độ lượng." },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 6,
    slug: "quyen-1-buoi-6",
    title: "Gọi món ăn và đồ uống",
    words: [
      {
        hanzi: "快",
        pinyin: "kuài",
        meaning: "nhanh",
        hanViet: "KHOÁI",
        pos: "形",
        phrases: [
          { hanzi: "很快", pinyin: "hěn kuài", meaning: "rất nhanh" },
          { hanzi: "不快", pinyin: "bú kuài", meaning: "không nhanh" },
        ],
        sentences: [
          { zh: "小王走路很快。", pinyin: "Xiǎo Wáng zǒu lù hěn kuài.", vi: "Tiểu Vương đi bộ rất nhanh." },
          { zh: "你快走吧。", pinyin: "Nǐ kuài zǒu ba.", vi: "Bạn đi nhanh lên đi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你学汉语快不快？", pinyin: "Nǐ xué Hànyǔ kuài bú kuài?", vi: "Bạn học tiếng Trung có nhanh không?" },
            { who: "B", zh: "我学汉语很快。", pinyin: "Wǒ xué Hànyǔ hěn kuài.", vi: "Tôi học tiếng Trung rất nhanh." },
          ],
        ],
      },
      {
        hanzi: "要",
        pinyin: "yào",
        meaning: "muốn, cần, phải",
        hanViet: "YẾU",
        pos: "动",
        dialogues: [
          [
            { who: "A", zh: "小姐，你要什么", pinyin: "Xiǎojiě, nǐ yào shénme?", vi: "Chị ơi, chị muốn gì?" },
            { who: "B", zh: "我要一本书。", pinyin: "Wǒ yào yì běn shū.", vi: "Tôi muốn một quyển sách." },
          ],
          [
            { who: "A", zh: "你要什么？", pinyin: "Nǐ yào shénme?", vi: "Bạn muốn gì?" },
            { who: "B", zh: "我要一支笔。", pinyin: "Wǒ yào yì zhī bǐ.", vi: "Tôi muốn một cây bút." },
          ],
        ],
      },
      {
        hanzi: "还",
        pinyin: "hái",
        meaning: "còn",
        hanViet: "HOÀN",
        pos: "副",
        phrases: [
          { hanzi: "还学", pinyin: "hái xué", meaning: "còn học" },
          { hanzi: "还叫", pinyin: "hái jiào", meaning: "còn gọi là" },
          { hanzi: "还要", pinyin: "hái yào", meaning: "còn muốn" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要什么？", pinyin: "Nǐ yào shénme?", vi: "Bạn muốn gì?" },
            { who: "B", zh: "我要一本书。", pinyin: "Wǒ yào yì běn shū.", vi: "Tôi muốn một quyển sách." },
            { who: "A", zh: "还要什么吗？", pinyin: "Hái yào shénme ma?", vi: "Còn muốn gì nữa không?" },
            { who: "B", zh: "还要一支笔。", pinyin: "Hái yào yì zhī bǐ.", vi: "Còn muốn một cây bút." },
          ],
        ],
      },
      {
        hanzi: "还是",
        pinyin: "háishì",
        meaning: "hay là",
        hanViet: "HOÀN THỊ",
        pos: "连",
        pattern: "A 还是 B",
        dialogues: [
          [
            { who: "A", zh: "你要一本书还是一支笔？", pinyin: "Nǐ yào yì běn shū háishì yì zhī bǐ?", vi: "Bạn muốn một quyển sách hay một cây bút?" },
            { who: "B", zh: "我要一本书.", pinyin: "Wǒ yào yì běn shū.", vi: "Tôi muốn một quyển sách." },
          ],
          [
            { who: "A", zh: "你要学汉语还是英语？", pinyin: "Nǐ yào xué Hànyǔ háishì Yīngyǔ?", vi: "Bạn muốn học tiếng Trung hay tiếng Anh?" },
            { who: "B", zh: "汉语。", pinyin: "Hànyǔ.", vi: "Tiếng Trung." },
          ],
        ],
      },
      {
        hanzi: "吃",
        pinyin: "chī",
        meaning: "ăn",
        hanViet: "NGẬT",
        pos: "动",
        parts: [
          { hanzi: "米饭", pinyin: "mǐfàn", meaning: "cơm", pos: "名" },
          { hanzi: "青菜", pinyin: "qīngcài", meaning: "rau xanh", pos: "名" },
          { hanzi: "牛肉", pinyin: "niúròu", meaning: "thịt bò", pos: "名" },
        ],
        phrases: [
          { hanzi: "吃牛肉", pinyin: "chī niúròu", meaning: "ăn thịt bò" },
          { hanzi: "吃青菜", pinyin: "chī qīngcài", meaning: "ăn rau xanh" },
          { hanzi: "吃米饭", pinyin: "chī mǐfàn", meaning: "ăn cơm" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你吃什么？", pinyin: "Nǐ chī shénme?", vi: "Bạn ăn gì?" },
            { who: "B", zh: "我吃牛肉。", pinyin: "Wǒ chī niúròu.", vi: "Tôi ăn thịt bò." },
          ],
        ],
      },
      {
        hanzi: "饿",
        pinyin: "è",
        meaning: "đói",
        hanViet: "NGẠ",
        pos: "形",
        phrases: [
          { hanzi: "很饿", pinyin: "hěn è", meaning: "rất đói" },
          { hanzi: "不饿", pinyin: "bú è", meaning: "không đói" },
        ],
        sentences: [{ zh: "我很饿。", pinyin: "Wǒ hěn è.", vi: "Tôi rất đói." }],
        dialogues: [
          [
            { who: "A", zh: "你饿吗？", pinyin: "Nǐ è ma?", vi: "Bạn có đói không?" },
            { who: "B", zh: "我很饿，我还没有吃米饭。", pinyin: "Wǒ hěn è, wǒ hái méiyǒu chī mǐfàn.", vi: "Tôi rất đói, tôi vẫn chưa ăn cơm." },
          ],
        ],
      },
      {
        hanzi: "个",
        pinyin: "gè",
        meaning: "cái",
        hanViet: "CÁ",
        pos: "量",
        pattern: "Số từ + 个 + danh từ",
        phrases: [
          { hanzi: "一个苹果", pinyin: "yí gè píngguǒ", meaning: "một quả táo" },
          { hanzi: "三个苹果", pinyin: "sān gè píngguǒ.", meaning: "ba quả táo" },
        ],
        sentences: [
          { zh: "我有一个苹果。", pinyin: "Wǒ yǒu yí gè píngguǒ.", vi: "Tôi có một quả táo." },
          { zh: "我要吃一个苹果。", pinyin: "Wǒ yào chī yí gè píngguǒ.", vi: "Tôi muốn ăn một quả táo." },
        ],
      },
      {
        hanzi: "两",
        pinyin: "liǎng",
        meaning: "hai",
        hanViet: "LƯỠNG",
        pos: "数",
        phrases: [
          { hanzi: "两个人", pinyin: "liǎng gè rén", meaning: "hai người" },
          { hanzi: "两个青菜", pinyin: "liǎng gè qīngcài", meaning: "hai món rau xanh" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要吃一个菜还是两个菜？", pinyin: "Nǐ yào chī yí gè cài háishì liǎng gè cài?", vi: "Bạn muốn ăn một món hay hai món?" },
            { who: "B", zh: "一个菜", pinyin: "Yí gè cài.", vi: "Một món." },
          ],
        ],
      },
      {
        hanzi: "碗",
        pinyin: "wǎn",
        meaning: "bát",
        hanViet: "OẢN",
        pos: "名",
        pattern: "碗（量）：số lượng + 碗 + danh từ",
        sentences: [
          { zh: "我吃了一碗饭。", pinyin: "Wǒ chīle yì wǎn fàn.", vi: "Tôi đã ăn một bát cơm." },
          { zh: "我吃了两碗饭。", pinyin: "Wǒ chīle liǎng wǎn fàn.", vi: "Tôi đã ăn hai bát cơm." },
          { zh: "我要吃一碗牛肉。", pinyin: "Wǒ yào chī yì wǎn niúròu.", vi: "Tôi muốn ăn một bát thịt bò." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你有几个碗？", pinyin: "Nǐ yǒu jǐ gè wǎn?", vi: "Bạn có mấy cái bát?" },
            { who: "B", zh: "我有三个碗。", pinyin: "Wǒ yǒu sān gè wǎn.", vi: "Tôi có ba cái bát." },
          ],
        ],
      },
      {
        hanzi: "喝",
        pinyin: "hē",
        meaning: "uống",
        hanViet: "HÁT",
        pos: "动",
        phrases: [
          { hanzi: "好喝", pinyin: "hǎohē", meaning: "ngon (đồ uống)" },
          { hanzi: "不好喝", pinyin: "bù hǎohē", meaning: "không ngon (đồ uống)" },
          { hanzi: "不喝", pinyin: "bù hē", meaning: "không uống" },
        ],
        sentences: [
          { zh: "他不要喝水。", pinyin: "Tā bú yào hē shuǐ.", vi: "Anh ấy không muốn uống nước." },
          { zh: "他要喝水。", pinyin: "Tā yào hē shuǐ.", vi: "Anh ấy muốn uống nước." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要喝什么？", pinyin: "Nǐ yào hē shénme?", vi: "Bạn muốn uống gì?" },
            { who: "B", zh: "我要喝水。", pinyin: "Wǒ yào hē shuǐ.", vi: "Tôi muốn uống nước." },
          ],
        ],
      },
      {
        hanzi: "茶",
        pinyin: "chá",
        meaning: "trà",
        hanViet: "TRÀ",
        pos: "名",
        parts: [
          { hanzi: "奶", pinyin: "nǎi", meaning: "sữa" },
          { hanzi: "奶茶", pinyin: "nǎichá", meaning: "trà sữa" },
        ],
        sentences: [
          { zh: "茶很好喝。", pinyin: "Chá hěn hǎo hē.", vi: "Trà rất ngon." },
          { zh: "你要喝奶茶吗？", pinyin: "Nǐ yào hē nǎichá ma?", vi: "Bạn có muốn uống trà sữa không?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要喝茶还是奶茶？", pinyin: "Nǐ yào hē chá háishì nǎichá?", vi: "Bạn muốn uống trà hay trà sữa?" },
            { who: "B", zh: "我要喝茶。", pinyin: "Wǒ yào hē chá.", vi: "Tôi muốn uống trà." },
          ],
        ],
      },
      {
        hanzi: "咖啡",
        pinyin: "kāfēi",
        meaning: "cà phê",
        hanViet: "CA PHI",
        pos: "名",
        phrases: [{ hanzi: "喝咖啡", pinyin: "hē kāfēi", meaning: "uống cà phê" }],
        sentences: [{ zh: "我要喝咖啡。", pinyin: "Wǒ yào hē kāfēi.", vi: "Tôi muốn uống cà phê." }],
        dialogues: [
          [
            { who: "A", zh: "我要喝奶茶，你呢？", pinyin: "Wǒ yào hē nǎichá, nǐ ne?", vi: "Tôi muốn uống trà sữa, còn bạn?" },
            { who: "B", zh: "我要喝咖啡，咖啡很好喝。", pinyin: "Wǒ yào hē kāfēi, kāfēi hěn hǎohē.", vi: "Tôi muốn uống cà phê, cà phê rất ngon." },
          ],
        ],
      },
      {
        hanzi: "杯",
        pinyin: "bēi",
        meaning: "cốc, ly",
        hanViet: "BÔI",
        pos: "名",
        pattern: "杯（量）：số lượng + 杯 + danh từ",
        phrases: [{ hanzi: "杯子", pinyin: "bēizi", meaning: "cái cốc" }],
        sentences: [
          { zh: "这是杯子。", pinyin: "Zhè shì bēizi.", vi: "Đây là cái cốc." },
          { zh: "我要一杯茶。", pinyin: "Wǒ yào yì bēi chá.", vi: "Tôi muốn một cốc trà." },
          { zh: "他要一杯咖啡。", pinyin: "Tā yào yì bēi kāfēi.", vi: "Anh ấy muốn một cốc cà phê." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要喝几杯奶茶？", pinyin: "Nǐ yào hē jǐ bēi nǎichá?", vi: "Bạn muốn uống mấy cốc trà sữa?" },
            { who: "B", zh: "我要喝一杯奶茶。", pinyin: "Wǒ yào hē yì bēi nǎi chá.", vi: "Tôi muốn uống một cốc trà sữa." },
          ],
        ],
      },
      {
        hanzi: "小",
        pinyin: "xiǎo",
        meaning: "nhỏ, bé",
        hanViet: "TIỂU",
        pos: "形",
        phrases: [
          { hanzi: "很小", pinyin: "hěn xiǎo", meaning: "rất nhỏ" },
          { hanzi: "不小", pinyin: "bù xiǎo", meaning: "không nhỏ" },
        ],
        sentences: [{ zh: "这个碗很小。", pinyin: "Zhè gè wǎn hěn xiǎo.", vi: "Cái bát này rất nhỏ." }],
        dialogues: [
          [
            { who: "A", zh: "奶茶你要小杯吗？", pinyin: "Nǎichá nǐ yào xiǎo bēi ma?", vi: "Trà sữa bạn lấy cốc nhỏ không?" },
            { who: "B", zh: "对，我要小杯。", pinyin: "Duì, wǒ yào xiǎo bēi.", vi: "Đúng, tôi lấy cốc nhỏ." },
          ],
        ],
      },
      {
        hanzi: "一共",
        pinyin: "yígòng",
        meaning: "tổng cộng tất cả",
        hanViet: "NHẤT CỘNG",
        pos: "副",
        sentences: [
          { zh: "一共多少钱？", pinyin: "Yígòng duōshao qián?", vi: "Tổng cộng bao nhiêu tiền?" },
          { zh: "一共有几杯？", pinyin: "Yígòng yǒu jǐ bēi?", vi: "Tổng cộng có mấy cốc?" },
        ],
        dialogues: [
          [
            {
              who: "A",
              zh: "一碗饭，一杯奶茶一共多少钱？",
              pinyin: "Yī wǎn fàn, yī bēi nǎichá yígòng duōshao qián?",
              vi: "Một bát cơm, một cốc trà sữa tổng cộng bao nhiêu tiền?",
            },
            { who: "B", zh: "两百块。", pinyin: "Liǎng bǎi kuài.", vi: "Hai trăm tệ." },
          ],
        ],
      },
      {
        hanzi: "（一）点儿",
        pinyin: "(yì) diǎnr",
        meaning: "một chút",
        hanViet: "(NHẤT) ĐIỂM NHI",
        pos: "量",
        key: { hanzi: "点儿", pinyin: "diǎnr" },
        sentences: [
          { zh: "我要一点儿牛肉和青菜。", pinyin: "Wǒ yào yì diǎnr niúròu hé qīngcài", vi: "Tôi muốn một chút thịt bò và rau xanh." },
          {
            zh: "我不要牛肉，我要一点儿青菜。",
            pinyin: "Wǒ bú yào niúròu, wǒ yào yì diǎnr qīngcài.",
            vi: "Tôi không muốn thịt bò, tôi muốn một chút rau xanh.",
          },
        ],
        dialogues: [
          [
            { who: "A", zh: "你要米饭吗？", pinyin: "Nǐ yào mǐfàn ma?", vi: "Bạn có muốn cơm không?" },
            { who: "B", zh: "我要一点儿。", pinyin: "Wǒ yào yì diǎnr.", vi: "Tôi muốn một chút." },
          ],
        ],
      },
      {
        hanzi: "再见",
        pinyin: "zàijiàn",
        meaning: "tạm biệt, hẹn gặp lại",
        hanViet: "TÁI KIẾN",
        pos: "动",
        phrases: [
          { hanzi: "马小姐再见", pinyin: "Mǎ xiǎojiě zàijiàn", meaning: "Tạm biệt chị Mã" },
          { hanzi: "师傅再见", pinyin: "Shīfu zàijiàn", meaning: "Tạm biệt bác tài" },
        ],
        dialogues: [
          [
            { who: "A", zh: "再见！", pinyin: "Zàijiàn", vi: "Tạm biệt!" },
            { who: "B", zh: "再见！", pinyin: "Zàijiàn", vi: "Tạm biệt!" },
          ],
        ],
      },
    ],
    grammar: [
      {
        id: "bien-dieu-bu",
        title: "“不”的变调",
        name: "Biến điệu của “不” (Ngữ âm trọng tâm)",
        summary: "“不” đứng một mình hoặc đứng trước âm tiết thanh 1, 2, 3 thì đọc thanh 4 — bù. “不” đứng trước âm tiết thanh 4 thì đọc thành thanh 2 — bú.",
        structures: ['"不" 单独使用或后接一声、二声、三声音节时，读四声 "bù"。', '"不" 后接四声的音节时变为二声 "bú"。'],
        focus: ["不"],
        examples: [
          { zh: "不高", pinyin: "bù gāo", vi: "không cao" },
          { zh: "不忙", pinyin: "bù máng", vi: "không bận" },
          { zh: "不好", pinyin: "bù hǎo", vi: "không tốt" },
          { zh: "不饿", pinyin: "bú è", vi: "không đói" },
          { zh: "不是", pinyin: "bú shì", vi: "không phải" },
          { zh: "不对", pinyin: "bú duì", vi: "không đúng" },
        ],
      },
      {
        id: "luong-tu",
        title: "量词的用法",
        name: "Cách sử dụng lượng từ",
        summary:
          "Trong tiếng Trung, giữa số từ và danh từ thường cần có lượng từ, các danh từ khác nhau thì sẽ có những lượng từ kết hợp khác nhau. Lượng từ hay được sử dụng nhất là “个”.",
        structures: ["Số từ + lượng từ + danh từ"],
        note: "Slide ngữ pháp không ghi dòng cấu trúc; cấu trúc lấy theo các ô ở slide từ mới (Số từ + 个 + danh từ; số lượng + 碗/杯 + danh từ).",
        focus: ["个", "块", "杯", "碗"],
        examples: [
          { zh: "三个人", pinyin: "sān gè rén", vi: "ba người" },
          { zh: "两个老师", pinyin: "liǎng gè lǎoshī", vi: "hai thầy cô giáo" },
          { zh: "八块钱", pinyin: "bā kuài qián", vi: "tám tệ" },
          { zh: "二十块钱", pinyin: "èrshí kuài qián", vi: "hai mươi tệ" },
          { zh: "两杯茶", pinyin: "liǎng bēi chá", vi: "hai cốc trà" },
          { zh: "三杯水", pinyin: "sān bēi shuǐ", vi: "ba cốc nước" },
          { zh: "两碗米饭", pinyin: "liǎng wǎn mǐfàn", vi: "hai bát cơm" },
        ],
      },
      {
        id: "cau-hoi-lua-chon",
        title: "选择疑问句",
        name: "Câu hỏi lựa chọn",
        summary: "Câu hỏi lựa chọn dùng từ “还是” để nối hai từ, hai vế câu trước và sau, cần phải trả lời lựa chọn một cái trong đó.",
        structures: ["A 还是 B"],
        focus: ["还是"],
        examples: [
          { zh: "你喝奶茶还是咖啡？", pinyin: "Nǐ hē nǎichá háishi kāfēi?", vi: "Bạn uống trà sữa hay cà phê?" },
          { zh: "你要大杯还是小杯？", pinyin: "Nǐ yào dà bēi háishi xiǎo bēi?", vi: "Bạn muốn cốc lớn hay cốc nhỏ?" },
        ],
      },
    ],
    texts: [
      {
        title: "Bài khóa 1",
        lines: [
          { who: "A", zh: "先生，您要吃点儿什么？", pinyin: "Xiānsheng , nín yào chī diǎnr shénme?", vi: "Thưa anh, anh muốn ăn gì ạ?" },
          { who: "B", zh: "我要一个牛肉，一个青菜。", pinyin: "Wǒ yào yí gè niúròu, yí gè qīngcài.", vi: "Tôi muốn một món thịt bò, một món rau xanh." },
          { who: "A", zh: "还要什么？", pinyin: "Hái yào shénme?", vi: "Còn muốn gì nữa không ạ?" },
          { who: "B", zh: "两碗米饭。", pinyin: "Liǎng wǎn mǐfàn.", vi: "Hai bát cơm." },
          { who: "A", zh: "好，还要什么？", pinyin: "Hǎo, hái yào shénme?", vi: "Vâng, còn muốn gì nữa không ạ?" },
          { who: "B", zh: "不要了，多少钱？", pinyin: "Bú yào le, duōshao qián ?", vi: "Không cần nữa, bao nhiêu tiền?" },
          { who: "A", zh: "五十块。", pinyin: "Wǔshí kuài.", vi: "Năm mươi tệ." },
          { who: "B", zh: "好。请快一点儿，我很饿。", pinyin: "Hǎo. Qǐng kuài yìdiǎnr, wǒ hěn è.", vi: "Được. Làm nhanh một chút nhé, tôi đói lắm." },
          { who: "A", zh: "好。", pinyin: "Hǎo.", vi: "Vâng." },
          { who: "B", zh: "谢谢！", pinyin: "Xièxie!", vi: "Cảm ơn!" },
        ],
      },
      {
        title: "Bài khóa 2",
        lines: [
          { who: "A", zh: "请问，您要喝点儿什么？", pinyin: "Qǐngwèn, nín yào hē diǎnr shénme?", vi: "Xin hỏi, anh/chị muốn uống gì ạ?" },
          { who: "B", zh: "我要一杯奶茶。", pinyin: "Wǒ yào yì bēi nǎichá.", vi: "Tôi muốn một cốc trà sữa." },
          { who: "A", zh: "大杯还是小杯？", pinyin: "Dà bēi háishi xiǎo bēi ?", vi: "Cốc lớn hay cốc nhỏ ạ?" },
          { who: "B", zh: "小杯。", pinyin: "Xiǎo bēi.", vi: "Cốc nhỏ." },
          { who: "A", zh: "好，还要什么？", pinyin: "Hǎo, hái yào shénme?", vi: "Vâng, còn muốn gì nữa không ạ?" },
          { who: "B", zh: "还要一杯咖啡。", pinyin: "Hái yào yì bēi kāfēi.", vi: "Thêm một cốc cà phê nữa." },
          { who: "A", zh: "大杯还是小杯？", pinyin: "Dà bēi háishi xiǎo bēi?", vi: "Cốc lớn hay cốc nhỏ ạ?" },
          { who: "B", zh: "大杯。", pinyin: "Dà bēi.", vi: "Cốc lớn." },
          { who: "A", zh: "好。一共二十八块。", pinyin: "Hǎo. Yígòng èrshíbā kuài.", vi: "Vâng. Tổng cộng hai mươi tám tệ." },
          { who: "B", zh: "谢谢！", pinyin: "Xièxie!", vi: "Cảm ơn!" },
          { who: "A", zh: "不客气！", pinyin: "Bú kèqi!", vi: "Không có gì!" },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 7,
    slug: "quyen-1-buoi-7",
    title: "Làm việc và học tập ở đâu",
    words: [
      {
        hanzi: "在",
        pinyin: "zài",
        meaning: "ở, tại",
        hanViet: "TẠI",
        pos: "介/动",
        phrases: [
          { hanzi: "在美国", pinyin: "zài Měiguó", meaning: "ở Mỹ" },
          { hanzi: "在中国", pinyin: "zài Zhōngguó", meaning: "ở Trung Quốc" },
          { hanzi: "在北京", pinyin: "zài Běijīng", meaning: "ở Bắc Kinh" },
          { hanzi: "在上海", pinyin: "zài Shànghǎi", meaning: "ở Thượng Hải" },
          { hanzi: "他在公园", pinyin: "tā zài gōngyuán", meaning: "anh ấy ở công viên" },
          { hanzi: "他在公园走路", pinyin: "tā zài gōngyuán zǒu lù", meaning: "anh ấy đi bộ ở công viên" },
        ],
      },
      {
        hanzi: "这儿",
        pinyin: "zhèr",
        meaning: "ở đây",
        hanViet: "GIÁ NHI",
        pos: "代",
        parts: [
          { hanzi: "这里", pinyin: "zhèli", meaning: "ở đây" },
          { hanzi: "那儿", pinyin: "nàr", meaning: "ở kia" },
        ],
        sentences: [
          { zh: "我在这儿。", pinyin: "Wǒ zài zhèr.", vi: "Tôi ở đây." },
          { zh: "他在这里。", pinyin: "Tā zài zhèli.", vi: "Anh ấy ở đây." },
        ],
        dialogues: [
          [
            { who: "A", zh: "他在这里吗？", pinyin: "Tā zài zhèlǐ ma?", vi: "Anh ấy có ở đây không?" },
            { who: "B", zh: "没有，他在那儿。", pinyin: "Méiyǒu, tā zài nàr.", vi: "Không, anh ấy ở đằng kia." },
          ],
        ],
      },
      {
        hanzi: "工作",
        pinyin: "gōngzuò",
        meaning: "làm việc, công tác / công việc",
        hanViet: "CÔNG TÁC",
        pos: "动/名",
        phrases: [
          { hanzi: "有工作", pinyin: "yǒu gōngzuò", meaning: "có việc làm" },
          { hanzi: "没有工作", pinyin: "méiyǒu gōngzuò", meaning: "không có việc làm" },
          { hanzi: "不工作", pinyin: "bù gōngzuò", meaning: "không làm việc" },
          { hanzi: "在中国工作", pinyin: "zài Zhōngguó gōngzuò", meaning: "làm việc ở Trung Quốc" },
          { hanzi: "什么工作", pinyin: "shénme gōngzuò", meaning: "công việc gì" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你在哪儿工作？", pinyin: "Nǐ zài nǎr gōngzuò?", vi: "Bạn làm việc ở đâu?" },
            { who: "B", zh: "我在北京工作。", pinyin: "Wǒ zài Běijīng gōngzuò.", vi: "Tôi làm việc ở Bắc Kinh." },
          ],
        ],
      },
      {
        hanzi: "公司",
        pinyin: "gōngsī",
        meaning: "công ty",
        hanViet: "CÔNG TI",
        pos: "名",
        parts: [{ hanzi: "家", pinyin: "jiā", meaning: "nhà; lượng từ cho công ty, cửa hàng", pos: "名/量" }],
        phrases: [
          { hanzi: "一家公司", pinyin: "yì jiā gōngsī", meaning: "một công ty" },
          { hanzi: "我在公司", pinyin: "Wǒ zài gōngsī", meaning: "tôi ở công ty" },
          { hanzi: "我不在公司", pinyin: "Wǒ bú zài gōngsī.", meaning: "tôi không ở công ty" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你在哪儿工作？", pinyin: "Nǐ zài nǎr gōngzuò?", vi: "Bạn làm việc ở đâu?" },
            { who: "B", zh: "我在中国公司工作。", pinyin: "Wǒ zài Zhōngguó gōngsī gōngzuò.", vi: "Tôi làm việc ở công ty Trung Quốc." },
          ],
        ],
      },
      {
        hanzi: "做",
        pinyin: "zuò",
        meaning: "làm",
        hanViet: "TỐ",
        pos: "动",
        parts: [
          { hanzi: "职员", pinyin: "zhíyuán", meaning: "nhân viên" },
          { hanzi: "翻译", pinyin: "fānyì", meaning: "phiên dịch" },
        ],
        sentences: [{ zh: "做什么工作？", pinyin: "zuò shénme gōngzuò", vi: "Làm công việc gì?" }],
        dialogues: [
          [
            { who: "A", zh: "你做什么工作？", pinyin: "Nǐ zuò shénme gōngzuò?", vi: "Bạn làm công việc gì?" },
            { who: "B", zh: "我是翻译。", pinyin: "Wǒ shì fānyì.", vi: "Tôi là phiên dịch." },
          ],
        ],
      },
      {
        hanzi: "学习",
        pinyin: "xuéxí",
        meaning: "học tập",
        hanViet: "HỌC TẬP",
        pos: "动",
        parts: [{ hanzi: "学", pinyin: "xué", meaning: "học" }],
        phrases: [{ hanzi: "学习汉语", pinyin: "xuéxí Hànyǔ", meaning: "học tiếng Trung" }],
        sentences: [
          { zh: "他在中国学习。", pinyin: "Tā zài zhōngguó xuéxí.", vi: "Anh ấy học ở Trung Quốc." },
          { zh: "你学习汉语", pinyin: "Tā xuéxí Hànyǔ", vi: "Bạn học tiếng Trung." },
          { zh: "他学习很好。", pinyin: "Tā xuéxí hěn hǎo.", vi: "Anh ấy học rất giỏi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "他做什么？", pinyin: "Tā zuò shénme?", vi: "Anh ấy làm gì?" },
            { who: "B", zh: "他学习汉语。", pinyin: "Tā xuéxí Hànyǔ", vi: "Anh ấy học tiếng Trung." },
          ],
        ],
      },
      {
        hanzi: "学生",
        pinyin: "xuéshēng",
        meaning: "học sinh, học trò",
        hanViet: "HỌC SINH",
        pos: "名",
        sentences: [
          { zh: "他是学生。", pinyin: "Tā shì xuéshēng.", vi: "Anh ấy là học sinh." },
          { zh: "学生学习汉语。", pinyin: "Xuéshēng  xuéxí Hànyǔ.", vi: "Học sinh học tiếng Trung." },
          { zh: "学生学习英语。", pinyin: "Xuéshēng xuéxí  Yīngyǔ .", vi: "Học sinh học tiếng Anh." },
          { zh: "他有很多学生。", pinyin: "Tā yǒu hěnduō xuéshēng.", vi: "Thầy ấy có rất nhiều học sinh." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你做什么工作？", pinyin: "Nǐ zuò shénme gōngzuò?", vi: "Bạn làm công việc gì?" },
            { who: "B", zh: "我是学生。", pinyin: "Wǒ shì xuéshēng.", vi: "Tôi là học sinh." },
          ],
        ],
      },
      {
        hanzi: "大学",
        pinyin: "dàxué",
        meaning: "đại học",
        hanViet: "ĐẠI HỌC",
        pos: "名",
        parts: [
          { hanzi: "中学", pinyin: "zhōngxué", meaning: "cấp 2（初中）3（高中）", pos: "名" },
          { hanzi: "小学", pinyin: "xiǎoxué", meaning: "cấp 1", pos: "名" },
          { hanzi: "大学生", pinyin: "dàxuéshēng", meaning: "học sinh đại học (sinh viên)" },
          { hanzi: "高中生", pinyin: "gāozhōngshēng", meaning: "học sinh cấp 3" },
          { hanzi: "初学生", pinyin: "chūxuéshēng", meaning: "học sinh cấp 2" },
          { hanzi: "小学生", pinyin: "xiǎoxuéshēng", meaning: "học sinh cấp 1" },
        ],
        sentences: [
          { zh: "我在中国大学工作。", pinyin: "Wǒ zài Zhōngguó dàxué gōngzuò.", vi: "Tôi làm việc ở trường đại học Trung Quốc." },
          { zh: "欧文在英国大学学习。", pinyin: "Ōuwén zài Yīngguó dàxué xuéxí.", vi: "Âu Văn học ở trường đại học Anh." },
        ],
        dialogues: [
          [
            { who: "A", zh: "海伦是中学生吗？", pinyin: "Hǎilún shì zhōngxuéshēng ma?", vi: "Helen là học sinh trung học à?" },
            { who: "B", zh: "不是，海伦是大学生。", pinyin: "Bú shì, Hǎilún shì dàxuéshēng.", vi: "Không phải, Helen là sinh viên đại học." },
          ],
        ],
      },
      {
        hanzi: "留学生",
        pinyin: "liúxuéshēng",
        meaning: "du học sinh",
        hanViet: "LƯU HỌC SINH",
        pos: "名",
        parts: [{ hanzi: "留学", pinyin: "liúxué", meaning: "du học", pos: "动" }],
        phrases: [{ hanzi: "英国留学生", pinyin: "Yīngguó liúxuéshēng", meaning: "du học sinh Anh" }],
        sentences: [
          { zh: "他去留学了。", pinyin: "Tā qù liúxué le.", vi: "Anh ấy đi du học rồi." },
          { zh: "哪国留学生？", pinyin: "Nǎ guó liúxuéshēng?", vi: "Du học sinh nước nào?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "他是哪国留学生？", pinyin: "Tā shì nǎr guó liúxuéshēng?", vi: "Anh ấy là du học sinh nước nào?" },
            { who: "B", zh: "他是中国留学生。", pinyin: "Tā shì Zhōngguó liúxuéshēng.", vi: "Anh ấy là du học sinh Trung Quốc." },
          ],
        ],
      },
      {
        hanzi: "汉语",
        pinyin: "Hànyǔ",
        meaning: "Tiếng Trung",
        hanViet: "HÁN NGỮ",
        pos: "名",
        sentences: [
          { zh: "我学习汉语。", pinyin: "Wǒ xuéxí Hànyǔ.", vi: "Tôi học tiếng Trung." },
          { zh: "我在中国学习汉语。", pinyin: "Wǒ zài Zhōngguó xuéxí Hànyǔ.", vi: "Tôi học tiếng Trung ở Trung Quốc." },
        ],
        dialogues: [
          [
            { who: "A", zh: "他在中国学汉语吗？", pinyin: "Tā zài Zhōngguó xué Hànyǔ ma?", vi: "Anh ấy học tiếng Trung ở Trung Quốc à?" },
            { who: "B", zh: "不，他在中国工作。", pinyin: "Bù, tā zài Zhōngguó gōngzuò.", vi: "Không, anh ấy làm việc ở Trung Quốc." },
          ],
        ],
      },
      {
        hanzi: "英语",
        pinyin: "Yīngyǔ",
        meaning: "Tiếng Anh",
        hanViet: "ANH NGỮ",
        pos: "名",
        sentences: [
          { zh: "我学习英语。", pinyin: "Wǒ xuéxí Yīngyǔ.", vi: "Tôi học tiếng Anh." },
          { zh: "我在英国学习英语。", pinyin: "Wǒ zài Yīngguó xuéxí Yīngyǔ.", vi: "Tôi học tiếng Anh ở nước Anh." },
        ],
        dialogues: [
          [
            { who: "A", zh: "他在英国学英语吗？", pinyin: "Tā zài Yīngguó xuéxí Yīngyǔ ma?", vi: "Anh ấy học tiếng Anh ở nước Anh à?" },
            { who: "B", zh: "不，他在英国工作。", pinyin: "Bù, tā zài Yīngguó gōngzuò.", vi: "Không, anh ấy làm việc ở nước Anh." },
          ],
        ],
      },
      {
        hanzi: "朋友",
        pinyin: "péngyou",
        meaning: "bạn, bạn bè",
        hanViet: "BẰNG HỮU",
        pos: "名",
        phrases: [
          { hanzi: "中国朋友", pinyin: "Zhōngguó péngyou", meaning: "bạn Trung Quốc" },
          { hanzi: "朋友们", pinyin: "péngyoumen", meaning: "các bạn" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你有很多美国朋友，对吗？", pinyin: "Nǐ yǒu hěnduō Měiguó péngyou, dùi ma?", vi: "Bạn có nhiều bạn người Mỹ, đúng không?" },
            { who: "B", zh: "不对，我有三个中国朋友。", pinyin: "Bú duì, wǒ yǒu sān gè Zhōngguó péngyou.", vi: "Không đúng, tôi có ba người bạn Trung Quốc." },
          ],
        ],
      },
      {
        hanzi: "男",
        pinyin: "nán",
        meaning: "nam, bạn nam",
        hanViet: "NAM",
        pos: "形/名",
        parts: [
          { hanzi: "男朋友", pinyin: "nánpéngyou", meaning: "bạn trai" },
          { hanzi: "男学生", pinyin: "nán xuéshēng", meaning: "học sinh nam" },
        ],
        sentences: [
          { zh: "王老师有50个男学生。", pinyin: "Wáng lǎoshī yǒu 50 gè nán xuéshēng.", vi: "Thầy Vương có 50 học sinh nam." },
          { zh: "我有男朋友。", pinyin: "Wǒ yǒu nán péngyou.", vi: "Tôi có bạn trai." },
          { zh: "我没有男朋友。", pinyin: "Wǒ méiyǒu nán péngyou.", vi: "Tôi không có bạn trai." },
        ],
        dialogues: [
          [
            { who: "A", zh: "这是你的男朋友吗？", pinyin: "Zhè shì nǐ de nán péngyou ma?", vi: "Đây là bạn trai của bạn à?" },
            { who: "B", zh: "这不是我的男朋友。", pinyin: "Zhè bú shì wǒ de nán péngyou.", vi: "Đây không phải bạn trai của tôi." },
          ],
        ],
      },
      {
        hanzi: "女",
        pinyin: "nǚ",
        meaning: "Nữ, bạn gái",
        hanViet: "NỮ",
        pos: "形/名",
        parts: [
          { hanzi: "女朋友", pinyin: "nǚ péngyou", meaning: "bạn gái" },
          { hanzi: "女学生", pinyin: "nǚ xuéshēng", meaning: "học sinh nữ" },
        ],
        sentences: [
          { zh: "高老师有30个女学生。", pinyin: "Gāo lǎoshī yǒu 30 gè nǚ xuéshēng.", vi: "Cô Cao có 30 học sinh nữ." },
          { zh: "我有女朋友。", pinyin: "Wǒ  yǒu nǚ péngyou.", vi: "Tôi có bạn gái." },
          { zh: "我没有女朋友。", pinyin: "Wǒ méiyǒu nǚ péngyou.", vi: "Tôi không có bạn gái." },
        ],
        dialogues: [
          [
            { who: "A", zh: "这是你的女朋友吗？", pinyin: "Zhè shì nǐ de nǚ péngyou ma?", vi: "Đây là bạn gái của bạn à?" },
            { who: "B", zh: "对。这是我的女朋友。", pinyin: "Duì. Zhè shì wǒ de nǚ péngyou.", vi: "Đúng. Đây là bạn gái của tôi." },
          ],
        ],
      },
      {
        hanzi: "他",
        pinyin: "tā",
        meaning: "bạn/anh/chú/ông ấy",
        hanViet: "THA",
        pos: "代",
        sentences: [
          { zh: "他是大学生。", pinyin: "Tā shì dàxuéshēng.", vi: "Anh ấy là sinh viên đại học." },
          { zh: "他在美国学习英语。", pinyin: "Tā zài Měiguó xuéxí Yīngyǔ.", vi: "Anh ấy học tiếng Anh ở Mỹ." },
          { zh: "他在吃米饭。", pinyin: "Tā zài chī mǐfàn.", vi: "Anh ấy đang ăn cơm." },
        ],
        dialogues: [
          [
            { who: "A", zh: "他是你的男朋友吗？", pinyin: "Tā shì nǐ de nán péngyou ma?", vi: "Anh ấy là bạn trai của bạn à?" },
            { who: "B", zh: "对，他是我的男朋友。", pinyin: "Duì, tā shì wǒ de nán péngyou.", vi: "Đúng, anh ấy là bạn trai của tôi." },
          ],
        ],
      },
      {
        hanzi: "她",
        pinyin: "tā",
        meaning: "bạn/chị/cô/bà ấy",
        hanViet: "THA",
        pos: "代",
        sentences: [
          { zh: "她是大学生。", pinyin: "Tā shì dàxuéshēng.", vi: "Cô ấy là sinh viên đại học." },
          { zh: "她在美国学习英语。", pinyin: "Tā zài Měiguó xuéxí Yīngyǔ.", vi: "Cô ấy học tiếng Anh ở Mỹ." },
          { zh: "她在吃米饭。", pinyin: "Tā zài chī mǐfàn.", vi: "Cô ấy đang ăn cơm." },
        ],
        dialogues: [
          [
            { who: "A", zh: "这儿是你的女朋友吗？", pinyin: "Zhèr shì nǐ de nǚ péngyou ma?", vi: "Đây là bạn gái của bạn à?" },
            { who: "B", zh: "对。她是我的女朋友。", pinyin: "Duì. Tā shì wǒ de nǚ péngyou.", vi: "Đúng. Cô ấy là bạn gái của tôi." },
          ],
        ],
      },
      {
        hanzi: "苹果",
        pinyin: "píngguǒ",
        meaning: "quả táo",
        hanViet: "BÌNH QUẢ",
        pos: "名",
        parts: [{ hanzi: "水果", pinyin: "Shuǐguǒ", meaning: "Hoa quả" }],
        phrases: [
          { hanzi: "一个苹果", pinyin: "yí gè píngguǒ", meaning: "một quả táo" },
          { hanzi: "吃苹果", pinyin: "chī píngguǒ", meaning: "ăn táo" },
        ],
        sentences: [{ zh: "我要吃两个苹果。", pinyin: "Wǒ yào chī liǎng gè píngguǒ.", vi: "Tôi muốn ăn hai quả táo." }],
        dialogues: [
          [
            { who: "A", zh: "你要吃什么？", pinyin: "Nǐ yào chī shénme?", vi: "Bạn muốn ăn gì?" },
            { who: "B", zh: "我要吃一点儿水果。", pinyin: "Wǒ yào chī yì diǎnr shuǐguǒ.", vi: "Tôi muốn ăn một chút hoa quả." },
          ],
        ],
      },
    ],
    grammar: [
      {
        id: "ket-cau-gioi-tu-zai",
        title: "动词“在”",
        name: "Kết cấu giới từ “在”",
        summary:
          "Kết cấu giới từ “在 + từ chỉ nơi chốn/ phương vị từ” làm trạng ngữ, đứng trước động từ để nói hành động diễn ra ở đâu. Câu phủ định đặt từ phủ định (不) trước “在”.",
        structures: [
          "在 + từ chỉ nơi chốn/ phương vị từ",
          "(+) S + “在” + từ chỉ nơi chốn + V",
          "(-) S + từ phủ định + “在” + từ chỉ nơi chốn + V",
          "S + “在” + 地方 / 方位词 + V + O",
        ],
        note: "Kết cấu giới từ “在 + từ chỉ nơi chốn/ phương vị từ” làm trạng ngữ. Chú ý vị trí của “在”: luôn đứng trước nơi chốn và trước động từ chính.",
        focus: ["在", "不在"],
        examples: [
          { zh: "我在中国学习汉语。", pinyin: "Wǒ zài Zhōngguó xuéxí Hànyǔ.", vi: "Tôi học tiếng Trung ở Trung Quốc." },
          { zh: "他在美国学习英语。", pinyin: "Tā zài Měiguó xuéxí Yīngyǔ.", vi: "Anh ấy học tiếng Anh ở Mỹ." },
          { zh: "你在哪儿工作？", pinyin: "Nǐ zài nǎr gōngzuò?", vi: "Bạn làm việc ở đâu?", who: "A" },
          { zh: "我在美国公司工作。", pinyin: "Wǒ zài Měiguó gōngsī gōngzuò.", vi: "Tôi làm việc ở công ty Mỹ.", who: "B" },
          { zh: "你在中国工作吗？", pinyin: "Nǐ zài Zhōngguó gōngzuò ma?", vi: "Bạn làm việc ở Trung Quốc à?", who: "A" },
          {
            zh: "我不在中国工作，我在美国工作。",
            pinyin: "Wǒ bú zài Zhōngguó gōngzuò, wǒ zài Měiguó gōngzuò.",
            vi: "Tôi không làm việc ở Trung Quốc, tôi làm việc ở Mỹ.",
            who: "B",
          },
          { zh: "我在中国学习。", pinyin: "Wǒ zài Zhōngguó xuéxí.", vi: "Tôi học ở Trung Quốc." },
          { zh: "我在苹果公司工作。", pinyin: "Wǒ zài Píngguǒ Gōngsī gōngzuò.", vi: "Tôi làm việc ở công ty Apple." },
          { zh: "我不在大学教汉语。", pinyin: "Wǒ bú zài dàxué jiāo Hànyǔ.", vi: "Tôi không dạy tiếng Trung ở trường đại học." },
          { zh: "她不在英国学习。", pinyin: "Tā bú zài Yīngguó xuéxí.", vi: "Cô ấy không học ở nước Anh." },
          { zh: "你在中国做什么？", pinyin: "Nǐ zài Zhōngguó zuò shénme?", vi: "Bạn làm gì ở Trung Quốc?", who: "A" },
          { zh: "我在中国学习汉语。", pinyin: "Wǒ zài Zhōngguó xuéxí Hànyǔ.", vi: "Tôi học tiếng Trung ở Trung Quốc.", who: "B" },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 8,
    slug: "quyen-1-buoi-8",
    title: "Hỏi đường và vị trí",
    words: [
      {
        hanzi: "银行",
        pinyin: "yínháng",
        meaning: "ngân hàng",
        hanViet: "NGÂN HÀNG",
        pos: "名",
        parts: [{ hanzi: "家", pinyin: "jiā", meaning: "lượng từ (dùng cho công ty, hộ gia đình)", pos: "量" }],
        phrases: [
          { hanzi: "去银行", pinyin: "qù yínháng", meaning: "đi ngân hàng" },
          { hanzi: "一家银行", pinyin: "yì jiā yínháng", meaning: "một ngân hàng" },
          { hanzi: "一家公司", pinyin: "yì jiā gōngsī", meaning: "một công ty" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你在哪儿工作？", pinyin: "Nǐ zài nǎr gōngzuò?", vi: "Bạn làm việc ở đâu?" },
            { who: "B", zh: "我在一家银行工作。", pinyin: "Wǒ zài yì jiā yínháng gōngzuò.", vi: "Tôi làm việc ở một ngân hàng." },
          ],
        ],
      },
      {
        hanzi: "饭店",
        pinyin: "fàndiàn",
        meaning: "quán ăn, nhà hàng",
        hanViet: "PHẠN ĐIẾM",
        pos: "名",
        phrases: [
          { hanzi: "一家饭店", pinyin: "yì jiā fàndiàn", meaning: "một nhà hàng" },
          { hanzi: "去饭店", pinyin: "qù fàndiàn", meaning: "đi nhà hàng" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你去哪儿？", pinyin: "Nǐ qù nǎr ?", vi: "Bạn đi đâu?" },
            { who: "B", zh: "我去饭店吃饭。", pinyin: "Wǒ qù fàndiàn chīfàn.", vi: "Tôi đi nhà hàng ăn cơm." },
          ],
        ],
      },
      {
        hanzi: "超市",
        pinyin: "chāoshì",
        meaning: "siêu thị",
        hanViet: "SIÊU THỊ",
        pos: "名",
        phrases: [
          { hanzi: "一家超市", pinyin: "yì jiā chāoshì", meaning: "một siêu thị" },
          { hanzi: "去超市", pinyin: "qù chāoshì", meaning: "đi siêu thị" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你去哪？", pinyin: "Nǐ qù nǎr?", vi: "Bạn đi đâu?" },
            { who: "B", zh: "我去超市买东西。", pinyin: "Wǒ qù chāoshì mǎi dōngxi.", vi: "Tôi đi siêu thị mua đồ." },
          ],
        ],
      },
      {
        hanzi: "书店",
        pinyin: "shūdiàn",
        meaning: "nhà sách",
        hanViet: "THƯ ĐIẾM",
        pos: "名",
        parts: [{ hanzi: "书", pinyin: "shū", meaning: "sách" }],
        phrases: [
          { hanzi: "一家书店", pinyin: "yì jiā shūdiàn", meaning: "một nhà sách" },
          { hanzi: "去书店", pinyin: "qù shūdiàn", meaning: "đi nhà sách" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你去哪？", pinyin: "Nǐ qù nǎr?", vi: "Bạn đi đâu?" },
            { who: "B", zh: "我去书店买书。", pinyin: "Wǒ qù shūdiàn mǎi shū.", vi: "Tôi đi nhà sách mua sách." },
          ],
        ],
      },
      {
        hanzi: "附近",
        pinyin: "fùjìn",
        meaning: "gần đây, lân cận",
        hanViet: "PHỤ CẬN",
        pos: "名",
        phrases: [
          { hanzi: "饭店附近", pinyin: "fàndiàn fùjìn", meaning: "gần nhà hàng" },
          { hanzi: "银行附近", pinyin: "yínháng fùjìn", meaning: "gần ngân hàng" },
          { hanzi: "在附近", pinyin: "zài fùjìn", meaning: "ở gần đây" },
        ],
        dialogues: [
          [
            { who: "A", zh: "这附近有书店吗？", pinyin: "Zhè fùjìn yǒu shūdiàn ma?", vi: "Gần đây có nhà sách không?" },
            { who: "B", zh: "有一家书店。", pinyin: "Yǒu yì jiā shūdiàn.", vi: "Có một nhà sách." },
          ],
        ],
      },
      {
        hanzi: "从",
        pinyin: "cóng",
        meaning: "từ",
        hanViet: "TÒNG",
        pos: "介",
        pattern: "从 A 到 B : từ A đến B",
        phrases: [
          { hanzi: "从北京到上海", pinyin: "cóng Běijīng dào Shànghǎi", meaning: "từ Bắc Kinh đến Thượng Hải" },
          { hanzi: "从家到学校", pinyin: "cóng jiā dào xuéxiào", meaning: "từ nhà đến trường" },
          { hanzi: "从小到大", pinyin: "cóng xiǎo dào dà", meaning: "từ nhỏ đến lớn" },
          { hanzi: "从饭店到银行", pinyin: "cóng fàndiàn dào yínháng", meaning: "từ nhà hàng đến ngân hàng" },
        ],
      },
      {
        hanzi: "对面",
        pinyin: "duìmiàn",
        meaning: "đối diện, đối mặt, trước mặt",
        hanViet: "ĐỐI DIỆN",
        pos: "名",
        parts: [{ hanzi: "面", pinyin: "miàn", meaning: "phía, bên", pos: "后缀" }],
        sentences: [
          { zh: "饭店在我对面。", pinyin: "Fàndiàn zài wǒ duìmiàn.", vi: "Nhà hàng ở đối diện tôi." },
          { zh: "银行就在对面。", pinyin: "Yínháng jiù zài duìmiàn.", vi: "Ngân hàng ở ngay đối diện." },
        ],
        dialogues: [
          [
            { who: "A", zh: "银行在哪儿？", pinyin: "Yínháng zài nǎr ?", vi: "Ngân hàng ở đâu?" },
            { who: "B", zh: "银行在书店对面。", pinyin: "Yínháng zài shūdiàn duìmiàn.", vi: "Ngân hàng ở đối diện nhà sách." },
          ],
        ],
      },
      {
        hanzi: "后",
        pinyin: "hòu",
        meaning: "phía sau, sau",
        hanViet: "HẬU",
        pos: "名",
        phrases: [
          { hanzi: "后面", pinyin: "hòumiàn", meaning: "phía sau" },
          { hanzi: "后边", pinyin: "hòubian", meaning: "phía sau, đằng sau" },
        ],
        sentences: [
          { zh: "他在我后边。", pinyin: "Tā zài wǒ hòubian.", vi: "Anh ấy ở phía sau tôi." },
          { zh: "他不在我后边。", pinyin: "Tā bú zài wǒ hòubian.", vi: "Anh ấy không ở phía sau tôi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "这附近有书店吗？", pinyin: "Zhè fùjìn yǒu shūdiàn ma?", vi: "Gần đây có nhà sách không?" },
            { who: "B", zh: "有，书店在学校后面。", pinyin: "Yǒu, shūdiàn zài xuéxiào hòumiàn.", vi: "Có, nhà sách ở phía sau trường học." },
          ],
        ],
      },
      {
        hanzi: "前",
        pinyin: "qián",
        meaning: "phía trước,trước",
        hanViet: "TIỀN",
        pos: "名",
        phrases: [
          { hanzi: "前面", pinyin: "qiánmiàn", meaning: "phía trước" },
          { hanzi: "前边", pinyin: "qiánbian", meaning: "phía trước, đằng trước" },
        ],
        sentences: [
          { zh: "他在我前面。", pinyin: "Tā zài wǒ qiánmiàn.", vi: "Anh ấy ở phía trước tôi." },
          { zh: "他不在我前面。", pinyin: "Tā bú zài wǒ qiánmiàn.", vi: "Anh ấy không ở phía trước tôi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "中国银行在哪儿？", pinyin: "Zhōngguó Yínháng zài nǎr?", vi: "Ngân hàng Trung Quốc ở đâu?" },
            { who: "B", zh: "中国银行在学校前面。", pinyin: "Zhōngguó Yínháng zài xuéxiào qiánmiàn.", vi: "Ngân hàng Trung Quốc ở phía trước trường học." },
          ],
        ],
      },
      {
        hanzi: "右",
        pinyin: "yòu",
        meaning: "bên phải",
        hanViet: "HỮU",
        pos: "名",
        phrases: [
          { hanzi: "右面", pinyin: "yòumiàn", meaning: "bên phải" },
          { hanzi: "右边", pinyin: "yòubian", meaning: "bên phải" },
        ],
        sentences: [
          { zh: "右边是我的家。", pinyin: "Yòubian shì wǒ de jiā.", vi: "Bên phải là nhà của tôi." },
          { zh: "我在他右边。", pinyin: "Wǒ zài tā yòubian.", vi: "Tôi ở bên phải anh ấy." },
        ],
        dialogues: [
          [
            { who: "A", zh: "书店在哪儿？", pinyin: "Shūdiàn zài nǎr ?", vi: "Nhà sách ở đâu?" },
            { who: "B", zh: "书店在银行右边。", pinyin: "Shūdiàn zài yínháng yòubian.", vi: "Nhà sách ở bên phải ngân hàng." },
          ],
        ],
      },
      {
        hanzi: "走",
        pinyin: "zǒu",
        meaning: "đi",
        hanViet: "TẨU",
        pos: "动",
        phrases: [{ hanzi: "往前走", pinyin: "wǎng qián zǒu", meaning: "đi về phía trước, đi thẳng" }],
        sentences: [{ zh: "从这儿往前走", pinyin: "Cóng zhèr wǎng qián zǒu", vi: "Từ đây đi thẳng về phía trước." }],
        dialogues: [
          [
            { who: "A", zh: "请问，全家超市在哪儿？", pinyin: "Qǐngwèn, Quánjiā Chāoshì zài nǎr?", vi: "Xin hỏi, siêu thị Toàn Gia ở đâu?" },
            { who: "B", zh: "你从这儿往前走。", pinyin: "Nǐ cóng zhèr wǎng qián zǒu.", vi: "Bạn từ đây đi thẳng về phía trước." },
          ],
        ],
      },
      {
        hanzi: "往",
        pinyin: "wǎng",
        meaning: "tới, hướng tới, đi",
        hanViet: "VÃNG",
        pos: "介",
        pattern: "往 + phương hướng + V",
        phrases: [
          { hanzi: "往北京", pinyin: "wǎng Běijīng", meaning: "hướng tới Bắc Kinh" },
          { hanzi: "往上海", pinyin: "wǎng Shànghǎi", meaning: "hướng tới Thượng Hải" },
          { hanzi: "往前走", pinyin: "wǎng qián zǒu", meaning: "đi về phía trước" },
          { hanzi: "往北去", pinyin: "wǎng běi qù", meaning: "đi về phía bắc" },
        ],
        dialogues: [
          [
            { who: "A", zh: "请问中国银行在哪儿？", pinyin: "Qǐng wèn Zhōngguó Yínháng zài nǎr?", vi: "Xin hỏi Ngân hàng Trung Quốc ở đâu?" },
            {
              who: "B",
              zh: "从这儿往前走然后再往北走。",
              pinyin: "Cóng zhèr wǎng qián zǒu ránhòu zài wǎng běi zǒu.",
              vi: "Từ đây đi thẳng về phía trước, sau đó đi tiếp về phía bắc.",
            },
          ],
        ],
      },
      {
        hanzi: "拐",
        pinyin: "guǎi",
        meaning: "rẽ,quẹo",
        hanViet: "QUẢI",
        pos: "动",
        phrases: [
          { hanzi: "往左拐", pinyin: "wǎng zuǒ guǎi", meaning: "rẽ trái" },
          { hanzi: "往右拐", pinyin: "wǎng yòu guǎi", meaning: "rẽ phải" },
        ],
        sentences: [
          { zh: "往左拐是一家银行。", pinyin: "Wǎng zuǒ guǎi shì yì jiā yínháng.", vi: "Rẽ trái là một ngân hàng." },
          { zh: "往右拐是一家饭店。", pinyin: "Wǎng yòu guǎi shì yì jiā fàndiàn.", vi: "Rẽ phải là một nhà hàng." },
        ],
      },
      {
        hanzi: "然后",
        pinyin: "ránhòu",
        meaning: "sau đó, tiếp đó",
        hanViet: "NHIÊN HẬU",
        pos: "连",
        pattern: "A然后B",
        sentences: [
          { zh: "先吃早饭然后刷牙", pinyin: "Xiān chī zǎofàn ránhòu shuā yá", vi: "Ăn sáng trước, sau đó đánh răng." },
          { zh: "我在中国学习汉语，然后工作。", pinyin: "Wǒ zài Zhōngguó xuéxí Hànyǔ，ránhòu gōngzuò.", vi: "Tôi học tiếng Hán ở Trung Quốc, sau đó đi làm." },
          { zh: "我去书店，然后去银行。", pinyin: "Wǒ qù shūdiàn, ránhòu qù yínháng.", vi: "Tôi đi nhà sách, sau đó đi ngân hàng." },
        ],
      },
      {
        hanzi: "就",
        pinyin: "jiù",
        meaning: "chính là, ngay, liền",
        hanViet: "TỰU",
        pos: "副",
        parts: [
          { hanzi: "就是", pinyin: "jiùshì", meaning: "chính là" },
          { hanzi: "就在", pinyin: "jiù zài", meaning: "ở ngay, ngay tại" },
        ],
        sentences: [
          { zh: "饭店就在附近。", pinyin: "Fàndiàn jiù zài fùjìn", vi: "Nhà hàng ở ngay gần đây." },
          { zh: "银行就在对面。", pinyin: "Yínháng jiù zài duìmiàn.", vi: "Ngân hàng ở ngay đối diện." },
          { zh: "他就是我男朋友。", pinyin: "Tā jiù shì wǒ nánpéngyou.", vi: "Anh ấy chính là bạn trai tôi." },
        ],
      },
    ],
    grammar: [
      {
        id: "cau-chu-you-ton-tai",
        title: "表示存在的“有”字句",
        name: "Câu chữ “有” biểu thị sự tồn tại",
        summary:
          "Khi muốn nói về sự tồn tại của người hoặc vật ở một nơi nào đó, tiếng Hán thường dùng các phương vị từ hoặc từ chỉ nơi chốn đặt ở đầu câu, sau đó là động từ “有” và sau “有” là từ chỉ người hoặc vật, dạng phủ định của “有” là “没有”.",
        structures: [
          "Thể khẳng định: Từ Phương vị/nơi chốn + “有” + Ai đó/vật gì đó",
          "Thể phủ định: Từ Phương vị/nơi chốn +“没有”+ Ai đó/vật gì đó",
          "Từ phương vị/từ chỉ nơi chốn + “有” + Ai đó/Vật nào đó +“吗”?",
          "Từ phương vị/từ chỉ nơi chốn + “有没有” + Ai đó/Vật nào đó?",
        ],
        note: "Chú ý: (1) Thể nghi vấn của câu chữ “有” gồm 2 loại: thêm “吗” ở cuối câu, hoặc dùng “有没有”. Slide tiếng Trung: 汉语中描述某人/某物在于某处时，讲方位词或处所词置于句首，按动词“有”，后跟存在的人或某物。“有”的否定形式是“没有”。",
        focus: ["有", "没有", "有没有", "吗"],
        examples: [
          { zh: "附近有一家超市。", pinyin: "Fùjìn yǒu yì jiā chāoshì.", vi: "Gần đây có một siêu thị." },
          { zh: "大学对面有银行。", pinyin: "Dàxué duìmiàn yǒu yínháng.", vi: "Đối diện trường đại học có ngân hàng." },
          { zh: "公园左边没有书店。", pinyin: "Gōngyuán zuǒbian méiyǒu shūdiàn.", vi: "Bên trái công viên không có nhà sách." },
          { zh: "附近有超市吗？", pinyin: "Fùjìn yǒu chāoshì ma?", vi: "Gần đây có siêu thị không?" },
          { zh: "附近有没有超市？", pinyin: "Fùjìn yǒu méiyǒu chāoshì?", vi: "Gần đây có siêu thị hay không?" },
        ],
      },
      {
        id: "dong-tu-zai",
        title: "动词“在”",
        name: "Động từ “在”",
        summary: "“在” đứng sau chủ ngữ, sau “在” là cụm từ chỉ địa điểm, phương hướng. Phủ định dùng “不在”.",
        structures: ["在/不在 + từ chỉ vị trí,phương hướng"],
        focus: ["在", "不在"],
        examples: [
          { who: "A", zh: "中国银行在哪儿？", pinyin: "Zhōngguó Yínháng zài nǎr?", vi: "Ngân hàng Trung Quốc ở đâu?" },
          {
            who: "B",
            zh: "中国银行在四川饭店对面。",
            pinyin: "Zhōngguó Yínháng zài Sìchuān Fàndiàn duìmiàn.",
            vi: "Ngân hàng Trung Quốc ở đối diện nhà hàng Tứ Xuyên.",
          },
          { who: "A", zh: "北京书店在哪儿？", pinyin: "Běijīng Shūdiàn zài nǎr?", vi: "Nhà sách Bắc Kinh ở đâu?" },
          {
            who: "B",
            zh: "北京书店在人民广场附近。",
            pinyin: "Běijīng Shūdiàn zài Rénmín Guǎngchǎng fùjìn.",
            vi: "Nhà sách Bắc Kinh ở gần Quảng trường Nhân Dân.",
          },
          { who: "A", zh: "全家超市在哪儿？", pinyin: "Quánjiā Chāoshì zài nǎr?", vi: "Siêu thị Toàn Gia ở đâu?" },
          { who: "B", zh: "全家超市在书店对面。", pinyin: "Quánjiā Chāoshì zài shūdiàn duìmiàn.", vi: "Siêu thị Toàn Gia ở đối diện nhà sách." },
          { who: "A", zh: "超市在对面吗？", pinyin: "Chāoshì zài duìmiàn ma?", vi: "Siêu thị ở đối diện phải không?" },
          { who: "B", zh: "超市不在对面。", pinyin: "Chāoshì bú zài duìmiàn.", vi: "Siêu thị không ở đối diện." },
        ],
      },
    ],
    texts: [
      {
        title: "Bài khóa 1",
        lines: [
          {
            who: "高小明",
            zh: "从这儿往前走，然后再往左拐，有一家饭店，银行就在饭店对面。",
            pinyin: "Cóng zhèr wǎng qián zǒu, ránhòu zài wǎng zuǒ guǎi, yǒu yì jiā fàndiàn, yínháng jiù zài fàndiàn duìmiàn.",
            vi: "Từ đây đi thẳng về phía trước, sau đó rẽ trái, có một nhà hàng, ngân hàng ở ngay đối diện nhà hàng.",
          },
          { who: "海伦", zh: "是四川饭店吗？", pinyin: "Shì Sìchuān Fàndiàn ma?", vi: "Là nhà hàng Tứ Xuyên phải không?" },
          { who: "高小明", zh: "是。", pinyin: "Shì.", vi: "Đúng vậy." },
          { who: "海伦", zh: "知道了，谢谢！", pinyin: "Zhīdao le, xièxie!", vi: "Biết rồi, cảm ơn!" },
          { who: "高小明", zh: "不客气！", pinyin: "Bú kèqi!", vi: "Không có gì!" },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 9,
    slug: "quyen-1-buoi-9",
    title: "Ngày tháng, thời gian và lời mời",
    words: [
      {
        hanzi: "天",
        pinyin: "tiān",
        meaning: "ngày",
        hanViet: "THIÊN",
        pos: "名",
        parts: [
          { hanzi: "今天", pinyin: "jīntiān", meaning: "hôm nay", pos: "名" },
          { hanzi: "昨天", pinyin: "zuótiān", meaning: "hôm qua", pos: "名" },
          { hanzi: "明天", pinyin: "míngtiān", meaning: "ngày mai", pos: "名" },
        ],
        dialogues: [
          [
            { who: "A", zh: "明天你去不去？", pinyin: "Míngtiān nǐ qù bù qù?", vi: "Ngày mai bạn có đi không?" },
            { who: "B", zh: "去。", pinyin: "Qù.", vi: "Đi." },
          ],
        ],
      },
      {
        hanzi: "早上",
        pinyin: "zǎoshang",
        meaning: "sáng sớm (6:00-8:00)",
        hanViet: "TẢO THƯỢNG",
        pos: "名",
        parts: [{ hanzi: "上午", pinyin: "shàngwǔ", meaning: "buổi sáng (8:00-11:00)", pos: "名" }],
        phrases: [{ hanzi: "今天上午", pinyin: "Jīntiān shàngwǔ", meaning: "sáng nay" }],
        sentences: [{ zh: "早上好！", pinyin: "Zǎoshang hǎo!", vi: "Chào buổi sáng!" }],
        dialogues: [
          [
            { who: "A", zh: "今天上午你去哪儿吃饭？", pinyin: "Jīntiān shàngwǔ nǐ qù nǎr chīfàn?", vi: "Sáng nay bạn đi đâu ăn cơm?" },
            { who: "B", zh: "我在家吃饭。", pinyin: "Wǒ zài jiā chīfàn.", vi: "Tôi ăn cơm ở nhà." },
          ],
        ],
      },
      {
        hanzi: "晚上",
        pinyin: "wǎnshang",
        meaning: "buổi tối (>18:00)",
        hanViet: "VÃN THƯỢNG",
        pos: "名",
        parts: [
          { hanzi: "中午", pinyin: "zhōngwǔ", meaning: "buổi trưa (11:30-14:00)", pos: "名" },
          { hanzi: "下午", pinyin: "xiàwǔ", meaning: "buổi chiều (14:00-18:00)", pos: "名" },
        ],
        phrases: [
          { hanzi: "今天中午", pinyin: "Jīntiān zhōngwǔ", meaning: "trưa nay" },
          { hanzi: "今天下午", pinyin: "Jīntiān xiàwǔ", meaning: "chiều nay" },
          { hanzi: "今天晚上", pinyin: "Jīntiān wǎnshang", meaning: "tối nay" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你昨天下午去哪儿？", pinyin: "Nǐ zuótiān xiàwǔ qù nǎr?", vi: "Chiều hôm qua bạn đi đâu?" },
            { who: "B", zh: "我去书店。", pinyin: "Wǒ qù shūdiàn.", vi: "Tôi đi hiệu sách." },
          ],
        ],
      },
      {
        hanzi: "星期",
        pinyin: "xīngqī",
        meaning: "tuần",
        hanViet: "TINH KỲ",
        pos: "名",
        parts: [
          { hanzi: "星期一", pinyin: "xīngqīyī", meaning: "thứ Hai" },
          { hanzi: "星期二", pinyin: "xīngqī'èr", meaning: "thứ Ba" },
          { hanzi: "星期三", pinyin: "xīngqīsān", meaning: "thứ Tư" },
          { hanzi: "星期四", pinyin: "xīngqīsì", meaning: "thứ Năm" },
          { hanzi: "星期五", pinyin: "xīngqīwǔ", meaning: "thứ Sáu" },
          { hanzi: "星期六", pinyin: "xīngqīliù", meaning: "thứ Bảy" },
          { hanzi: "星期天（星期日）", pinyin: "xīngqītiān (xīngqīrì )", meaning: "Chủ nhật" },
        ],
        dialogues: [
          [
            { who: "A", zh: "今天星期几？", pinyin: "Jīntiān xīngqī jǐ?", vi: "Hôm nay thứ mấy?" },
            { who: "B", zh: "今天是星期二。", pinyin: "Jīntiān shì xīngqī'èr.", vi: "Hôm nay là thứ Ba." },
          ],
        ],
      },
      {
        hanzi: "几",
        pinyin: "jǐ",
        meaning: "mấy",
        hanViet: "KỶ",
        pos: "代",
        pattern: "……月……号",
        parts: [
          { hanzi: "月", pinyin: "yuè", meaning: "tháng", pos: "名" },
          { hanzi: "号", pinyin: "hào", meaning: "ngày", pos: "量" },
        ],
        sentences: [
          { zh: "几个人？", pinyin: "Jǐ ge rén", vi: "Mấy người?" },
          { zh: "几岁？", pinyin: "jǐ suì", vi: "Mấy tuổi? (dùng hỏi trẻ dưới 10 tuổi)" },
          { zh: "几月几号？", pinyin: "Jǐ yuè jǐ hào", vi: "Ngày mấy tháng mấy?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "今天是几月几号？", pinyin: "Jīntiān shì jǐ yuè jǐ hào?", vi: "Hôm nay là ngày mấy tháng mấy?" },
            { who: "B", zh: "今天是三月八号。", pinyin: "Jīntiān shì sānyuè bā hào.", vi: "Hôm nay là ngày 8 tháng 3." },
          ],
        ],
      },
      {
        hanzi: "生日",
        pinyin: "shēngrì",
        meaning: "sinh nhật",
        hanViet: "SINH NHẬT",
        pos: "名",
        dialogues: [
          [
            { who: "A", zh: "今天是你的生日吗？", pinyin: "Jīntiān shì nǐ de shēngrì ma?", vi: "Hôm nay là sinh nhật bạn à?" },
            { who: "B", zh: "对，今天是我的生日。", pinyin: "Duì , jīntiān shì wǒ de shēngrì.", vi: "Đúng, hôm nay là sinh nhật tôi." },
          ],
        ],
      },
      {
        hanzi: "快乐",
        pinyin: "kuàilè",
        meaning: "vui vẻ, hạnh phúc",
        hanViet: "KHOÁI LẠC",
        pos: "形",
        sentences: [
          { zh: "生日快乐", pinyin: "Shēngrì kuàilè", vi: "Sinh nhật vui vẻ" },
          { zh: "祝你生日快乐！", pinyin: "Zhù nǐ shēngrì kuàilè!", vi: "Chúc bạn sinh nhật vui vẻ!" },
          {
            zh: "今天是你的生日，我祝你生日快乐！",
            pinyin: "Jīntiān shì nǐ de shēngrì, wǒ zhù nǐ shēngrì kuàilè!",
            vi: "Hôm nay là sinh nhật bạn, tôi chúc bạn sinh nhật vui vẻ!",
          },
        ],
      },
      {
        hanzi: "真",
        pinyin: "zhēn",
        meaning: "thật, thật là",
        hanViet: "CHÂN",
        pos: "副",
        phrases: [
          { hanzi: "真好", pinyin: "zhēn hǎo", meaning: "thật tốt" },
          { hanzi: "真难", pinyin: "zhēn nán", meaning: "thật khó" },
        ],
        sentences: [
          { zh: "你真好！", pinyin: "Nǐ zhēn hǎo!", vi: "Bạn thật tốt!" },
          { zh: "我真高兴！", pinyin: "Wǒ zhēn gāoxìng!", vi: "Tôi thật vui!" },
        ],
      },
      {
        hanzi: "太……了",
        pinyin: "tài …..le",
        meaning: "….. quá",
        hanViet: "THÁI……LIỄU",
        key: { hanzi: "太了", pinyin: "tài le" },
        phrases: [
          { hanzi: "太好了", pinyin: "tài hǎo le", meaning: "tốt quá, tuyệt quá" },
          { hanzi: "太难了", pinyin: "tài nán le", meaning: "khó quá" },
          { hanzi: "太小了", pinyin: "tài xiǎo le", meaning: "nhỏ quá" },
        ],
        sentences: [
          { zh: "饭太少了，我还要一个面包。", pinyin: "Fàn tài shǎo le, wǒ hái yào yí gè miànbāo.", vi: "Cơm ít quá, tôi muốn thêm một cái bánh mì." },
        ],
      },
      {
        hanzi: "漂亮",
        pinyin: "piàoliang",
        meaning: "đẹp, xinh đẹp",
        hanViet: "PHIÊU LƯỢNG",
        pos: "形",
        phrases: [
          { hanzi: "很漂亮", pinyin: "hěn piàoliang", meaning: "rất đẹp" },
          { hanzi: "真漂亮", pinyin: "zhēn piàoliang", meaning: "thật đẹp" },
          { hanzi: "太漂亮了", pinyin: "tài piàoliang le", meaning: "đẹp quá" },
        ],
        sentences: [
          { zh: "今天你真漂亮！", pinyin: "Jīntiān nǐ zhēn piàoliang!", vi: "Hôm nay bạn thật đẹp!" },
          { zh: "今天你太漂亮了！", pinyin: "Jīntiān nǐ tài piàoliang le!", vi: "Hôm nay bạn đẹp quá!" },
          { zh: "你很漂亮，我喜欢你。", pinyin: "Nǐ hěn piàoliang, wǒ xǐhuān nǐ.", vi: "Bạn rất xinh, tôi thích bạn." },
        ],
      },
      {
        hanzi: "为什么",
        pinyin: "wèishénme",
        meaning: "tại sao",
        hanViet: "VỊ THẬP MA",
        dialogues: [
          [
            { who: "A", zh: "今天为什么文丽很漂亮？", pinyin: "Jīntiān wèishénme Wénlì  hěn piàoliang?", vi: "Tại sao hôm nay Văn Lệ đẹp thế?" },
            { who: "B", zh: "今天是她的生日。", pinyin: "Jīntiān shì tā de shēngrì.", vi: "Hôm nay là sinh nhật cô ấy." },
          ],
        ],
      },
      {
        hanzi: "事",
        pinyin: "shì",
        meaning: "việc, vấn đề",
        hanViet: "SỰ",
        pos: "名",
        phrases: [
          { hanzi: "有事（儿）", pinyin: "yǒu shìr", meaning: "có việc" },
          { hanzi: "没事（儿）", pinyin: "méi shìr", meaning: "không có việc; không sao" },
        ],
        dialogues: [
          [
            { who: "A", zh: "有什么事儿吗？", pinyin: "Yǒu shénme shì ma ?", vi: "Có việc gì không?" },
            { who: "B", zh: "没事儿。", pinyin: "Méi shìr.", vi: "Không có gì." },
          ],
          [
            { who: "A", zh: "你今天有事吗？", pinyin: "Nǐ jīntiān yǒu shì ma?", vi: "Hôm nay bạn có việc gì không?" },
            { who: "B", zh: "没什么。", pinyin: "Méi shénme.", vi: "Không có gì." },
          ],
        ],
      },
      {
        hanzi: "空儿",
        pinyin: "kòngr",
        meaning: "thời gian rảnh",
        hanViet: "KHÔNG NHI",
        pos: "名",
        phrases: [
          { hanzi: "没空儿", pinyin: "méikòngr", meaning: "không rảnh" },
          { hanzi: "有空儿", pinyin: "yǒukòngr", meaning: "có thời gian rảnh" },
        ],
        dialogues: [
          [
            { who: "A", zh: "今天你有空儿吗？", pinyin: "Jīntiān nǐ yǒukòngr ma?", vi: "Hôm nay bạn có rảnh không?" },
            { who: "B", zh: "我今天没空儿。", pinyin: "Wǒ jīntiān méi kòngr.", vi: "Hôm nay tôi không rảnh." },
          ],
        ],
      },
      {
        hanzi: "想",
        pinyin: "xiǎng",
        meaning: "muốn",
        hanViet: "TƯỞNG",
        pos: "动",
        phrases: [
          { hanzi: "想你", pinyin: "xiǎng nǐ", meaning: "nhớ bạn" },
          { hanzi: "不想你", pinyin: "bù xiǎng nǐ", meaning: "không nhớ bạn" },
          { hanzi: "想一下", pinyin: "xiǎng yíxià", meaning: "nghĩ một chút" },
        ],
        sentences: [
          { zh: "我想你。", pinyin: "Wǒ xiǎng nǐ", vi: "Anh nhớ em." },
          { zh: "我不想你。", pinyin: "Wǒ bù xiǎng nǐ.", vi: "Anh không nhớ em." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你想去哪儿？", pinyin: "Nǐ xiǎng qù nǎr?", vi: "Bạn muốn đi đâu?" },
            { who: "B", zh: "我想一下", pinyin: "Wǒ xiǎng yíxià", vi: "Để tôi nghĩ một chút." },
          ],
        ],
      },
      {
        hanzi: "请",
        pinyin: "qǐng",
        meaning: "mời",
        hanViet: "THỈNH",
        pos: "动",
        sentences: [
          { zh: "请朋友喝茶", pinyin: "Qǐng péngyou hē chá", vi: "Mời bạn bè uống trà" },
          { zh: "请朋友吃饭。", pinyin: "Qǐng péngyou chīfàn.", vi: "Mời bạn bè ăn cơm." },
        ],
        dialogues: [
          [
            {
              who: "A",
              zh: "今天我想请你喝咖啡，好吗？",
              pinyin: "Jīntiān wǒ xiǎng qǐng nǐ hē kāfēi, hǎo ma?",
              vi: "Hôm nay tôi muốn mời bạn uống cà phê, được không?",
            },
            { who: "B", zh: "好，谢谢！", pinyin: "Hǎo, xièxie !", vi: "Được, cảm ơn!" },
          ],
        ],
      },
      {
        hanzi: "看",
        pinyin: "kàn",
        meaning: "xem, nhìn, thăm",
        hanViet: "KHÁN",
        pos: "动",
        phrases: [
          { hanzi: "看书", pinyin: "kànshū", meaning: "đọc sách" },
          { hanzi: "看朋友", pinyin: "kàn péngyou", meaning: "thăm bạn bè" },
          { hanzi: "看一下", pinyin: "kàn yíxià", meaning: "xem một chút" },
        ],
        dialogues: [
          [
            { who: "A", zh: "我想看书，你呢？", pinyin: "Wǒ xiǎng kànshū, nǐ ne?", vi: "Tôi muốn đọc sách, còn bạn?" },
            { who: "B", zh: "我不想，谢谢。", pinyin: "Wǒ bù xiǎng, xièxie.", vi: "Tôi không muốn, cảm ơn." },
          ],
        ],
      },
      {
        hanzi: "电影",
        pinyin: "diànyǐng",
        meaning: "phim",
        hanViet: "ĐIỆN ẢNH",
        pos: "名",
        phrases: [
          { hanzi: "看电影", pinyin: "kàn diànyǐng", meaning: "xem phim" },
          { hanzi: "电影院", pinyin: "diànyǐngyuàn", meaning: "rạp chiếu phim" },
        ],
        sentences: [
          {
            zh: "今天你有空儿吗？我想请你看电影。",
            pinyin: "Jīntiān nǐ yǒu kòngr ma? Wǒ xiǎng qǐng nǐ kàn diànyǐng.",
            vi: "Hôm nay bạn có rảnh không? Tôi muốn mời bạn đi xem phim.",
          },
        ],
      },
      {
        hanzi: "学校",
        pinyin: "xuéxiào",
        meaning: "trường học",
        hanViet: "HỌC HIỆU",
        pos: "名",
        phrases: [
          { hanzi: "我们的学校", pinyin: "wǒ de xuéxiào", meaning: "trường của chúng tôi" },
          { hanzi: "学校附近", pinyin: "xuéxiào fùjìn", meaning: "gần trường" },
        ],
        dialogues: [
          [
            { who: "A", zh: "学校附近有电影院吗？", pinyin: "Xuéxiào fùjìn yǒu diànyǐngyuàn.", vi: "Gần trường có rạp chiếu phim không?" },
            { who: "B", zh: "有。", pinyin: "Yǒu", vi: "Có." },
          ],
        ],
      },
      {
        hanzi: "见",
        pinyin: "jiàn",
        meaning: "gặp",
        hanViet: "KIẾN",
        pos: "动",
        phrases: [
          { hanzi: "见面", pinyin: "jiànmiàn", meaning: "gặp mặt" },
          { hanzi: "见个朋友", pinyin: "jiàn gè péngyou", meaning: "gặp một người bạn" },
          { hanzi: "晚上见", pinyin: "wǎnshang jiàn", meaning: "tối gặp nhé" },
        ],
        sentences: [
          { zh: "我想见你了。", pinyin: "Wǒ xiǎng jiàn nǐ le.", vi: "Tôi muốn gặp bạn rồi." },
          { zh: "我晚上要见一个朋友。", pinyin: "Wǒ wǎnshang yào jiàn yí gè péngyou.", vi: "Tối nay tôi phải gặp một người bạn." },
        ],
        dialogues: [
          [
            { who: "A", zh: "我们在哪儿见面？", pinyin: "Wǒmen zài nǎr jiànmiàn?", vi: "Chúng ta gặp nhau ở đâu?" },
            { who: "B", zh: "在电影院。", pinyin: "Zài diànyǐngyuàn.", vi: "Ở rạp chiếu phim." },
          ],
        ],
      },
    ],
    grammar: [
      {
        id: "cau-vi-ngu-danh-tu",
        title: "名词谓语句",
        name: "Câu vị ngữ danh từ",
        summary:
          "Câu vị ngữ danh từ là câu có danh từ hoặc cụm danh từ trực tiếp làm vị ngữ trong câu (không cần động từ 是). Thường dùng để diễn đạt ngày tháng, giá cả, quê quán/quốc tịch, số lượng và thời gian.",
        structures: ["主语 + 名词 / 名词性短语"],
        note: "名词谓语句指由名词或名词性短语直接做谓语的句子。",
        focus: ["七月二十号", "两块", "北京人", "五个", "星期三"],
        examples: [
          { zh: "今天七月二十号。", pinyin: "Jīntiān qī yuè èrshí hào.", vi: "Hôm nay ngày 20 tháng 7. (Diễn đạt ngày tháng)" },
          { zh: "一碗米饭两块。", pinyin: "Yì wǎn mǐfàn liǎng kuài.", vi: "Một bát cơm hai đồng. (Diễn đạt giá cả)" },
          {
            zh: "我是中国人。他北京人。",
            pinyin: "Wǒ shì Zhōngguó rén. Tā Běijīng rén.",
            vi: "Tôi là người Trung Quốc. Anh ấy người Bắc Kinh. (Diễn đạt quốc tịch)",
          },
          { zh: "十块钱五个。", pinyin: "Shí kuài qián wǔ gè.", vi: "Mười đồng năm cái. (Diễn đạt số lượng)" },
          { zh: "今天星期三。", pinyin: "Jīntiān xīngqīsān.", vi: "Hôm nay thứ Tư. (Diễn đạt thời gian)" },
        ],
      },
      {
        id: "cach-noi-ngay-thang",
        title: "日期及星期表示法",
        name: "Cách nói về ngày tháng",
        summary:
          "Tiếng Trung nói ngày tháng theo thứ tự từ lớn đến nhỏ: năm – tháng – ngày (ngược với tiếng Việt). Trong văn viết dùng 日, trong khẩu ngữ thường dùng 号; năm đọc từng chữ số.",
        structures: ["- 年 - 月 - 日（号）"],
        note: "Bạn hãy đọc rõ các ví dụ dưới đây và xem từng cụm từ ứng với thành phần nào nhé!",
        focus: ["年", "月", "日", "号"],
        examples: [
          { zh: "今天是2020年3月8日（号）。", pinyin: "Jīntiān shì èr líng èr líng nián sān yuè bā rì (hào).", vi: "Hôm nay là ngày 8 tháng 3 năm 2020." },
          { zh: "今天是2018年7月20日（号）。", pinyin: "Jīntiān shì èr líng yī bā nián qī yuè èrshí rì (hào).", vi: "Hôm nay là ngày 20 tháng 7 năm 2018." },
        ],
      },
    ],
  },
  {
    book: 1,
    session: 10,
    slug: "quyen-1-buoi-10",
    title: "Sở thích, món ăn và phương tiện đi lại",
    words: [
      {
        hanzi: "非常",
        pinyin: "fēicháng",
        meaning: "rất, cực kì",
        hanViet: "PHI THƯỜNG",
        pos: "副",
        phrases: [
          { hanzi: "非常大", pinyin: "fēicháng dà", meaning: "rất to, rất lớn" },
          { hanzi: "非常漂亮", pinyin: "fēicháng piàoliang", meaning: "rất đẹp" },
        ],
        sentences: [{ zh: "他的妹妹非常好。", pinyin: "Tā de mèimei fēicháng hǎo.", vi: "Em gái của anh ấy rất tốt." }],
        dialogues: [
          [
            { who: "A", zh: "茶怎么样？", pinyin: "Chá zěnmeyàng?", vi: "Trà thế nào?" },
            { who: "B", zh: "茶非常好喝。", pinyin: "Chá fēicháng hǎohē.", vi: "Trà rất ngon." },
          ],
        ],
      },
      {
        hanzi: "喜欢",
        pinyin: "xǐhuan",
        meaning: "thích",
        hanViet: "HỈ HOAN",
        pos: "动",
        phrases: [
          { hanzi: "很喜欢", pinyin: "hěn xǐhuan", meaning: "rất thích" },
          { hanzi: "非常喜欢", pinyin: "fēicháng xǐhuan", meaning: "cực kì thích" },
          { hanzi: "喜欢牛肉", pinyin: "xǐhuan niúròu", meaning: "thích thịt bò" },
        ],
        sentences: [{ zh: "我喜欢喝咖啡。", pinyin: "Wǒ xǐhuan hē kāfēi.", vi: "Tôi thích uống cà phê." }],
        dialogues: [
          [
            { who: "A", zh: "你喜欢看电影吗？", pinyin: "Nǐ xǐhuan kàn diànyǐng ma?", vi: "Bạn có thích xem phim không?" },
            { who: "B", zh: "我非常喜欢。", pinyin: "Wǒ fēicháng xǐhuan.", vi: "Tôi rất thích." },
          ],
        ],
      },
      {
        hanzi: "都",
        pinyin: "dōu",
        meaning: "đều",
        hanViet: "ĐÔ",
        pos: "副",
        phrases: [{ hanzi: "都喜欢", pinyin: "dōu xǐhuan", meaning: "đều thích" }],
        sentences: [
          { zh: "我们都非常喜欢喝茶。", pinyin: "Wǒmen dōu fēicháng xǐhuan hē chá.", vi: "Chúng tôi đều rất thích uống trà." },
          { zh: "我和他的生日都是五月一号。", pinyin: "Wǒ hé tā de shēngrì dōu shì wǔ yuè yī hào.", vi: "Sinh nhật của tôi và anh ấy đều là ngày 1 tháng 5." },
          { zh: "他的姐姐和妹妹都非常漂亮。", pinyin: "Tā de jiějie hé mèimei dōu fēicháng piàoliang.", vi: "Chị gái và em gái của anh ấy đều rất xinh đẹp." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你喜欢喝咖啡还是喝茶？", pinyin: "Nǐ xǐhuan hē kāfēi háishì hē chá?", vi: "Bạn thích uống cà phê hay uống trà?" },
            { who: "B", zh: "咖啡和茶我都喜欢", pinyin: "Kāfēi hé chá wǒ dōu xǐhuan", vi: "Cà phê và trà tôi đều thích." },
          ],
        ],
      },
      {
        hanzi: "电影院",
        pinyin: "diànyǐngyuàn",
        meaning: "rạp chiếu phim",
        hanViet: "ĐIỆN ẢNH VIỆN",
        pos: "名",
        sentences: [
          { zh: "我去电影院看电影。", pinyin: "Wǒ qù diànyǐngyuàn kàn diànyǐng.", vi: "Tôi đến rạp chiếu phim xem phim." },
          { zh: "电影院非常大。", pinyin: "Diànyǐngyuàn fēicháng dà.", vi: "Rạp chiếu phim rất lớn." },
        ],
        dialogues: [
          [
            { who: "A", zh: "明天在哪儿见？", pinyin: "Míngtiān zài nǎr jiàn?", vi: "Ngày mai gặp nhau ở đâu?" },
            { who: "B", zh: "在电影院见。", pinyin: "Zài diànyǐngyuàn jiàn.", vi: "Gặp nhau ở rạp chiếu phim." },
          ],
        ],
      },
      {
        hanzi: "怎么",
        pinyin: "zěnme",
        meaning: "thế nào",
        hanViet: "CHẨM MA",
        pos: "代",
        phrases: [
          { hanzi: "怎么说", pinyin: "zěnme shuō", meaning: "nói thế nào" },
          { hanzi: "怎么走", pinyin: "zěnme zǒu", meaning: "đi thế nào (đi đường nào)" },
          { hanzi: "怎么去", pinyin: "zěnme qù", meaning: "đi (đến đó) bằng cách nào" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我坐车去。", pinyin: "Wǒ zuò chē qù.", vi: "Tôi đi xe đến." },
          ],
        ],
      },
      {
        hanzi: "怎么样",
        pinyin: "zěnmeyàng",
        meaning: "như thế nào",
        hanViet: "CHẨM MA DẠNG",
        pos: "代",
        sentences: [
          { zh: "我们一起吃晚饭，怎么样？", pinyin: "Wǒmen yì qǐ chī wǎnfàn，zěnmeyàng", vi: "Chúng ta cùng ăn tối nhé, thế nào?" },
          { zh: "我们坐车去，怎么样？", pinyin: "Wǒmen zuò chē qù，zěnmeyàng", vi: "Chúng ta đi xe đến đó, thế nào?" },
        ],
        dialogues: [
          [
            { who: "A", zh: "电影院怎么样？", pinyin: "Diànyǐngyuàn zěnmeyàng?", vi: "Rạp chiếu phim thế nào?" },
            { who: "B", zh: "电影院非常大。", pinyin: "Diànyǐngyuàn fēicháng dà.", vi: "Rạp chiếu phim rất lớn." },
          ],
        ],
      },
      {
        hanzi: "又……又……",
        pinyin: "yòu…yòu…",
        meaning: "vừa…vừa…",
        hanViet: "HỰU……HỰU……",
        pos: "副",
        key: { hanzi: "又", pinyin: "yòu" },
        parts: [{ hanzi: "又", pinyin: "yòu", meaning: "vừa, lại" }],
        phrases: [
          { hanzi: "又好又快", pinyin: "yòu hǎo yòu kuài", meaning: "vừa tốt vừa nhanh" },
          { hanzi: "又去电影院", pinyin: "yòu qù diànyǐngyuàn", meaning: "lại đi rạp chiếu phim" },
          { hanzi: "又喝咖啡", pinyin: "yòu hē kāfēi", meaning: "lại uống cà phê" },
          { hanzi: "又看书", pinyin: "yòu kànshū", meaning: "lại đọc sách" },
        ],
        dialogues: [
          [
            { who: "A", zh: "电影院怎么样？", pinyin: "Diànyǐngyuàn zěnmeyàng?", vi: "Rạp chiếu phim thế nào?" },
            { who: "B", zh: "又大又漂亮", pinyin: "Yòu dà yòu piàoliang", vi: "Vừa lớn vừa đẹp." },
          ],
        ],
      },
      {
        hanzi: "那儿/那里",
        pinyin: "nàr/nàli",
        meaning: "đó, ở đó",
        hanViet: "NA NHI / NA LÝ",
        pos: "代",
        key: { hanzi: "那儿", pinyin: "nàr" },
        phrases: [
          { hanzi: "那里的人", pinyin: "nàli de rén", meaning: "người ở đó" },
          { hanzi: "那个人", pinyin: "nà gè rén", meaning: "người đó" },
        ],
        sentences: [{ zh: "那个碗非常漂亮", pinyin: "Nà gè wǎn fēicháng piàoliang", vi: "Cái bát đó rất đẹp." }],
        dialogues: [
          [
            { who: "A", zh: "那里的电影院怎么样？", pinyin: "Nàli de diànyǐngyuàn zěnmeyàng?", vi: "Rạp chiếu phim ở đó thế nào?" },
            { who: "B", zh: "非常大。", pinyin: "Fēicháng dà.", vi: "Rất lớn." },
          ],
        ],
      },
      {
        hanzi: "吧",
        pinyin: "ba",
        meaning: "trợ từ ngữ khí, chỉ sự gợi ý hoặc phỏng đoán",
        hanViet: "BA",
        pos: "助",
        phrases: [
          { hanzi: "走吧", pinyin: "zǒu ba", meaning: "đi thôi" },
          { hanzi: "去吧", pinyin: "qù ba", meaning: "đi đi" },
        ],
        sentences: [{ zh: "你是美国人吧？", pinyin: "Nǐ shì Měiguórén ba?", vi: "Bạn là người Mỹ phải không?" }],
        dialogues: [
          [
            { who: "A", zh: "我们去吃饭吧！", pinyin: "Wǒmen qù chī fàn ba !", vi: "Chúng ta đi ăn cơm thôi!" },
            { who: "B", zh: "好", pinyin: "Hǎo", vi: "Được." },
          ],
        ],
      },
      {
        hanzi: "坐",
        pinyin: "zuò",
        meaning: "ngồi",
        hanViet: "TỌA",
        pos: "动",
        sentences: [
          { zh: "请坐", pinyin: "Qǐng zuò", vi: "Mời ngồi." },
          { zh: "你坐吧", pinyin: "Nǐ zuò ba", vi: "Bạn ngồi đi." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我坐车去。", pinyin: "Wǒ zuò chē qù.", vi: "Tôi đi xe đến." },
          ],
        ],
      },
      {
        hanzi: "地铁",
        pinyin: "dìtiě",
        meaning: "tàu điện ngầm",
        hanViet: "ĐỊA THIẾT",
        pos: "名",
        phrases: [{ hanzi: "坐地铁", pinyin: "zuò dìtiě", meaning: "đi tàu điện ngầm" }],
        sentences: [
          { zh: "明天我们坐地铁去看电影。", pinyin: "Míngtiān wǒmen zuò dìtiě qù kàn diànyǐng.", vi: "Ngày mai chúng ta đi tàu điện ngầm đi xem phim." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我坐地铁去。", pinyin: "Wǒ zuò dìtiě qù.", vi: "Tôi đi tàu điện ngầm đến." },
          ],
        ],
      },
      {
        hanzi: "出租车",
        pinyin: "chūzūchē",
        meaning: "xe taxi",
        hanViet: "XUẤT TÔ XA",
        pos: "名",
        phrases: [
          { hanzi: "坐出租车", pinyin: "zuò chūzūchē", meaning: "đi taxi" },
          { hanzi: "坐出租车去学校", pinyin: "zuò chūzūchē qù xuéxiào", meaning: "đi taxi đến trường" },
        ],
        sentences: [{ zh: "明天我们坐出租车去银行。", pinyin: "Míngtiān wǒmen zuò chūzūchē qù yínháng.", vi: "Ngày mai chúng ta đi taxi đến ngân hàng." }],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我坐出租车去。", pinyin: "Wǒ zuò chūzūchē qù.", vi: "Tôi đi taxi đến." },
          ],
        ],
      },
      {
        hanzi: "公交车",
        pinyin: "gōngjiāochē",
        meaning: "xe bus",
        hanViet: "CÔNG GIAO XA",
        pos: "名",
        sentences: [
          { zh: "那个公交车很大。", pinyin: "Nà gè gōngjiāochē hěn dà.", vi: "Chiếc xe buýt đó rất to." },
          { zh: "我（不）喜欢坐公交车。", pinyin: "Wǒ (bù) xǐhuan zuò gōngjiāochē.", vi: "Tôi (không) thích đi xe buýt." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我坐公交车去。", pinyin: "Wǒ zuò gōngjiāochē qù.", vi: "Tôi đi xe buýt đến." },
          ],
        ],
      },
      {
        hanzi: "走路",
        pinyin: "zǒu lù",
        meaning: "đi bộ",
        hanViet: "TẨU LỘ",
        pos: "动",
        parts: [{ hanzi: "走", pinyin: "zǒu", meaning: "đi", pos: "动" }],
        phrases: [{ hanzi: "走路去银行", pinyin: "zǒu lù qù yínháng", meaning: "đi bộ đến ngân hàng" }],
        sentences: [
          { zh: "电影院很近，我们走路去吧。", pinyin: "Diànyǐngyuàn hěn jìn, wǒmen zǒu lù qù ba.", vi: "Rạp chiếu phim rất gần, chúng ta đi bộ đến đó nhé." },
        ],
        dialogues: [
          [
            { who: "A", zh: "你怎么去学校？", pinyin: "Nǐ zěnme qù xuéxiào?", vi: "Bạn đến trường bằng cách nào?" },
            { who: "B", zh: "我走路去。", pinyin: "Wǒ zǒu lù qù.", vi: "Tôi đi bộ đến." },
          ],
        ],
      },
      {
        hanzi: "菜",
        pinyin: "cài",
        meaning: "đồ ăn, món ăn",
        hanViet: "THÁI",
        pos: "名",
        phrases: [
          { hanzi: "中国菜", pinyin: "Zhōngguócài", meaning: "món ăn Trung Quốc" },
          { hanzi: "四川菜", pinyin: "Sìchuāncài", meaning: "món ăn Tứ Xuyên" },
          { hanzi: "韩国菜", pinyin: "Hánguócài", meaning: "món ăn Hàn Quốc" },
          { hanzi: "越南菜", pinyin: "Yuènáncài", meaning: "món ăn Việt Nam" },
        ],
        dialogues: [
          [
            { who: "A", zh: "你喜欢吃什么菜？", pinyin: "Nǐ xǐhuan chī shénme cài?", vi: "Bạn thích ăn món gì?" },
            { who: "B", zh: "我喜欢吃中国菜。", pinyin: "Wǒ xǐhuan chī Zhōngguócài.", vi: "Tôi thích ăn món Trung Quốc." },
          ],
        ],
      },
      {
        hanzi: "有名",
        pinyin: "yǒumíng",
        meaning: "nổi tiếng, có tiếng",
        hanViet: "HỮU DANH",
        pos: "形",
        phrases: [
          { hanzi: "很有名", pinyin: "hěn yǒumíng", meaning: "rất nổi tiếng" },
          { hanzi: "非常有名", pinyin: "fēicháng yǒumíng", meaning: "cực kì nổi tiếng" },
          { hanzi: "都有名", pinyin: "dōu yǒumíng", meaning: "đều nổi tiếng" },
        ],
        sentences: [
          { zh: "我的学校很有名。", pinyin: "Wǒ de xuéxiào hěn yǒumíng.", vi: "Trường của tôi rất nổi tiếng." },
          { zh: "这部电影非常有名。", pinyin: "Zhè bù diànyǐng fēicháng yǒumíng.", vi: "Bộ phim này cực kì nổi tiếng." },
        ],
        dialogues: [
          [
            { who: "A", zh: "那个菜有名吗？", pinyin: "Nà gè cài yǒumíng ma?", vi: "Món đó có nổi tiếng không?" },
            { who: "B", zh: "那个菜很有名。", pinyin: "Nà gè cài hěn yǒumíng.", vi: "Món đó rất nổi tiếng." },
          ],
        ],
      },
      {
        hanzi: "好吃",
        pinyin: "hǎochī",
        meaning: "ngon",
        hanViet: "HẢO NGẬT",
        pos: "形",
        phrases: [
          { hanzi: "一点儿也不好吃", pinyin: "yì diǎnr yě bù hǎochī", meaning: "chẳng ngon chút nào" },
          { hanzi: "很好吃", pinyin: "hěn hǎochī", meaning: "rất ngon" },
          { hanzi: "非常好吃", pinyin: "fēicháng hǎochī", meaning: "cực kì ngon" },
        ],
        sentences: [
          { zh: "越南菜和中国菜都非常好吃。", pinyin: "Yuènáncài hé Zhōngguócài dōu fēicháng hǎochī.", vi: "Món Việt Nam và món Trung Quốc đều rất ngon." },
        ],
        dialogues: [
          [
            { who: "A", zh: "那个菜怎么样？", pinyin: "Nà gè cài zěnme yàng?", vi: "Món đó thế nào?" },
            { who: "B", zh: "那个菜很好吃。", pinyin: "Nà gè cài hěn hǎochī.", vi: "Món đó rất ngon." },
          ],
        ],
      },
      {
        hanzi: "便宜",
        pinyin: "piányi",
        meaning: "rẻ",
        hanViet: "TIỆN NGHI",
        pos: "形",
        phrases: [
          { hanzi: "便宜点儿", pinyin: "piányi diǎnr", meaning: "rẻ một chút" },
          { hanzi: "很便宜", pinyin: "hěn piányi", meaning: "rất rẻ" },
          { hanzi: "不便宜", pinyin: "bù piányi", meaning: "không rẻ" },
        ],
        sentences: [
          { zh: "便宜点儿吧。", pinyin: "Piányi diǎnr ba.", vi: "Rẻ chút đi mà." },
          { zh: "坐地铁又快又便宜", pinyin: "Zuò dìtiě yòu kuài yòu piányi", vi: "Đi tàu điện ngầm vừa nhanh vừa rẻ." },
        ],
        dialogues: [
          [
            { who: "A", zh: "那个菜怎么样？", pinyin: "Nà gè cài zěnmeyàng?", vi: "Món đó thế nào?" },
            { who: "B", zh: "又好吃又便宜", pinyin: "Yòu hǎochī yòu piányi", vi: "Vừa ngon vừa rẻ." },
          ],
        ],
      },
    ],
    grammar: [
      {
        id: "tro-tu-ba",
        title: "语气助词“吧”",
        name: "Trợ từ ngữ khí “吧”",
        summary: "Trợ từ ngữ khí “吧” thường đứng cuối câu biểu thị sự đề nghị, cũng có thể chỉ sự nghi vấn với ngữ khí suy đoán.",
        structures: ["……… + 吧"],
        note: "语气词“吧”用于句末可表示建议或请求，也可以表示疑问，带有推测的语气。",
        focus: ["吧"],
        examples: [
          { zh: "我们今天吃中国菜吧。", pinyin: "Wǒmen jīntiān chī Zhōngguócài ba.", vi: "Hôm nay chúng ta ăn món Trung Quốc nhé." },
          { zh: "我们坐地铁去吧。", pinyin: "Wǒmen zuò dìtiě qù ba.", vi: "Chúng ta đi tàu điện ngầm nhé." },
          { zh: "我们去看电影吧。", pinyin: "Wǒmen qù kàn diànyǐng ba.", vi: "Chúng ta đi xem phim nhé." },
          { zh: "你是留学生吧？", pinyin: "Nǐ shì liúxuéshēng ba?", vi: "Bạn là du học sinh phải không?" },
        ],
      },
    ],
  },
];

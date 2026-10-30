import { BOOK_1 } from "./lessons-quyen-1";

// Class lessons ("buổi"), grouped by textbook ("quyển"): new words and grammar exactly as taught in the slides, with
// Vietnamese added to the example sentences. Add a lesson by appending to LESSONS; its slug becomes the page URL.

/** One sentence; dialogue lines carry the speaker: A/B, or a character's name in a passage. */
export type LessonLine = { zh: string; pinyin: string; vi: string; who?: string };

/** A smaller item shown with a word: a character it is made of, a related word, or a phrase. */
export type LessonTerm = { hanzi: string; pinyin: string; meaning: string; pos?: string };

export type LessonWord = {
  /** As taught, may include filler: "一边……，一边……". */
  hanzi: string;
  pinyin: string;
  meaning: string;
  hanViet: string;
  /** Part of speech as tagged on the slide (名, 动, 副…). */
  pos?: string;
  /** What to write and play when `hanzi` has filler. */
  key?: { hanzi: string; pinyin: string };
  /** Sentence frame the word is used in: "跟……一起……". */
  pattern?: string;
  parts?: LessonTerm[];
  phrases?: LessonTerm[];
  sentences?: LessonLine[];
  dialogues?: LessonLine[][];
};

export type GrammarPoint = {
  id: string;
  /** Chinese title from the slide. */
  title: string;
  name: string;
  summary: string;
  /** Frames, written with Chinese grammar terms as on the slides. */
  structures: string[];
  note?: string;
  /** Words highlighted in the structures and examples. */
  focus: string[];
  examples: LessonLine[];
};

/** A reading or conversation passage (课文). */
export type LessonText = { title: string; lines: LessonLine[] };

export type Lesson = { book: number; session: number; slug: string; title: string; words: LessonWord[]; grammar: GrammarPoint[]; texts?: LessonText[] };

const book2Session1: Lesson = {
  book: 2,
  session: 1,
  slug: "quyen-2-buoi-1",
  title: "Sở thích và hoạt động thường ngày",
  words: [
    {
      hanzi: "正在",
      pinyin: "zhèngzài",
      pos: "副",
      meaning: "đang",
      hanViet: "CHÍNH TẠI",
      parts: [
        { hanzi: "正", pinyin: "zhèng", pos: "副", meaning: "đang" },
        { hanzi: "在", pinyin: "zài", pos: "副", meaning: "đang" },
      ],
      phrases: [
        { hanzi: "正吃饭", pinyin: "zhèng chī fàn", meaning: "đang ăn cơm" },
        { hanzi: "正看书", pinyin: "zhèng kàn shū", meaning: "đang đọc sách" },
        { hanzi: "在工作", pinyin: "zài gōngzuò", meaning: "đang làm việc" },
        { hanzi: "在上课", pinyin: "zài shàngkè", meaning: "đang học trên lớp" },
        { hanzi: "正在工作", pinyin: "zhèngzài gōngzuò", meaning: "đang làm việc" },
        { hanzi: "正在学习汉语", pinyin: "zhèngzài xuéxí Hànyǔ", meaning: "đang học tiếng Trung" },
      ],
      dialogues: [
        [
          { who: "A", zh: "他正在做什么？", pinyin: "Tā zhèngzài zuò shénme?", vi: "Anh ấy đang làm gì?" },
          { who: "B", zh: "他正在看书。", pinyin: "Tā zhèngzài kànshū.", vi: "Anh ấy đang đọc sách." },
        ],
      ],
    },
    {
      hanzi: "音乐",
      pinyin: "yīnyuè",
      pos: "名",
      meaning: "âm nhạc, nhạc",
      hanViet: "ÂM NHẠC",
      phrases: [
        { hanzi: "中国音乐", pinyin: "Zhōngguó yīnyuè", meaning: "nhạc Trung Quốc" },
        { hanzi: "越南音乐", pinyin: "Yuènán yīnyuè", meaning: "nhạc Việt Nam" },
      ],
      sentences: [
        { zh: "我喜欢音乐。", pinyin: "Wǒ xǐhuan yīnyuè.", vi: "Tôi thích âm nhạc." },
        { zh: "我很喜欢中国音乐。", pinyin: "Wǒ hěn xǐhuan Zhōngguó yīnyuè.", vi: "Tôi rất thích nhạc Trung Quốc." },
      ],
      dialogues: [
        [
          { who: "A", zh: "你喜欢听音乐吗？", pinyin: "Nǐ xǐhuan tīng yīnyuè ma?", vi: "Bạn có thích nghe nhạc không?" },
          { who: "B", zh: "我不喜欢。", pinyin: "Wǒ bù xǐhuan.", vi: "Tôi không thích." },
        ],
      ],
    },
    {
      hanzi: "听",
      pinyin: "tīng",
      pos: "动",
      meaning: "nghe",
      hanViet: "THÍNH",
      parts: [{ hanzi: "好听", pinyin: "hǎotīng", pos: "形", meaning: "êm tai, nghe hay" }],
      sentences: [{ zh: "中国音乐很好听。", pinyin: "Zhōngguó yīnyuè hěn hǎotīng.", vi: "Nhạc Trung Quốc rất hay." }],
      dialogues: [
        [
          { who: "A", zh: "你听中国音乐了吗？", pinyin: "Nǐ tīng Zhōngguó yīnyuè le ma?", vi: "Bạn đã nghe nhạc Trung Quốc chưa?" },
          {
            who: "B",
            zh: "我不喜欢听中国音乐，我喜欢听美国音乐。",
            pinyin: "Wǒ bù xǐhuan tīng Zhōngguó yīnyuè, wǒ xǐhuan tīng Měiguó yīnyuè.",
            vi: "Tôi không thích nghe nhạc Trung Quốc, tôi thích nghe nhạc Mỹ.",
          },
        ],
      ],
    },
    {
      hanzi: "唱歌",
      pinyin: "chànggē",
      pos: "动",
      meaning: "hát (bài hát)",
      hanViet: "XƯỚNG CA",
      parts: [
        { hanzi: "唱", pinyin: "chàng", pos: "动", meaning: "hát" },
        { hanzi: "歌", pinyin: "gē", pos: "名", meaning: "bài hát" },
      ],
      phrases: [
        { hanzi: "唱中文歌", pinyin: "chàng Zhōngwén gē", meaning: "hát bài hát tiếng Trung" },
        { hanzi: "唱越南歌", pinyin: "chàng Yuènán gē", meaning: "hát bài hát tiếng Việt" },
        { hanzi: "听中文歌", pinyin: "tīng Zhōngwén gē", meaning: "nghe bài hát tiếng Trung" },
        { hanzi: "听他唱歌", pinyin: "tīng tā chànggē", meaning: "nghe anh ấy hát" },
      ],
      sentences: [{ zh: "他唱歌很好听。", pinyin: "Tā chàng gē hěn hǎotīng.", vi: "Anh ấy hát rất hay." }],
      dialogues: [
        [
          { who: "A", zh: "你喜欢他吗？", pinyin: "Nǐ xǐhuan tā ma?", vi: "Bạn có thích anh ấy không?" },
          {
            who: "B",
            zh: "他唱歌很好听，我很喜欢他，你呢？",
            pinyin: "Tā chàng gē hěn hǎotīng, wǒ hěn xǐhuan tā, nǐ ne?",
            vi: "Anh ấy hát rất hay, tôi rất thích anh ấy, còn bạn?",
          },
          { who: "A", zh: "我也是。", pinyin: "Wǒ yě shì.", vi: "Tôi cũng vậy." },
        ],
      ],
    },
    {
      hanzi: "打球",
      pinyin: "dǎ qiú",
      pos: "动",
      meaning: "đánh bóng, chơi bóng",
      hanViet: "ĐẢ CẦU",
      parts: [
        { hanzi: "打", pinyin: "dǎ", pos: "动", meaning: "đánh" },
        { hanzi: "球", pinyin: "qiú", pos: "名", meaning: "bóng" },
      ],
      phrases: [
        { hanzi: "打篮球", pinyin: "dǎ lánqiú", meaning: "chơi bóng rổ" },
        { hanzi: "打网球", pinyin: "dǎ wǎngqiú", meaning: "chơi quần vợt" },
        { hanzi: "打乒乓球", pinyin: "dǎ pīngpāngqiú", meaning: "chơi bóng bàn" },
      ],
      sentences: [{ zh: "打什么球？", pinyin: "Dǎ shénme qiú?", vi: "Chơi bóng gì?" }],
      dialogues: [
        [
          { who: "A", zh: "你喜欢打什么球？", pinyin: "Nǐ xǐhuan dǎ shénme qiú?", vi: "Bạn thích chơi bóng gì?" },
          { who: "B", zh: "我喜欢打篮球。", pinyin: "Wǒ xǐhuan dǎ lánqiú.", vi: "Tôi thích chơi bóng rổ." },
        ],
      ],
    },
    {
      hanzi: "电视",
      pinyin: "diànshì",
      pos: "名",
      meaning: "tivi",
      hanViet: "ĐIỆN THỊ",
      phrases: [{ hanzi: "看电视", pinyin: "kàn diànshì", meaning: "xem tivi" }],
      sentences: [{ zh: "我喜欢看电视。", pinyin: "Wǒ xǐhuan kàn diànshì.", vi: "Tôi thích xem tivi." }],
      dialogues: [
        [
          { who: "A", zh: "你喜欢看电视吗？", pinyin: "Nǐ xǐhuan kàn diànshì ma?", vi: "Bạn có thích xem tivi không?" },
          { who: "B", zh: "我不喜欢。", pinyin: "Wǒ bù xǐhuan.", vi: "Tôi không thích." },
        ],
      ],
    },
    {
      hanzi: "跳舞",
      pinyin: "tiàowǔ",
      pos: "动",
      meaning: "nhảy",
      hanViet: "KHIÊU VŨ",
      parts: [
        { hanzi: "跳", pinyin: "tiào", pos: "动", meaning: "nhảy" },
        { hanzi: "舞", pinyin: "wǔ", pos: "名", meaning: "điệu múa, điệu nhảy" },
        { hanzi: "街舞", pinyin: "jiēwǔ", pos: "名", meaning: "hip-hop" },
      ],
      phrases: [{ hanzi: "跳街舞", pinyin: "tiào jiēwǔ", meaning: "nhảy hip-hop" }],
      sentences: [{ zh: "他正在跳舞。", pinyin: "Tā zhèngzài tiàowǔ.", vi: "Anh ấy đang nhảy." }],
      dialogues: [
        [
          { who: "A", zh: "你喜欢跳街舞吗？", pinyin: "Nǐ xǐhuan tiào jiēwǔ ma?", vi: "Bạn có thích nhảy hip-hop không?" },
          { who: "B", zh: "我很喜欢。", pinyin: "Wǒ hěn xǐhuan.", vi: "Tôi rất thích." },
        ],
      ],
    },
    {
      hanzi: "别人",
      pinyin: "biérén",
      pos: "代",
      meaning: "người khác",
      hanViet: "BIỆT NHÂN",
      phrases: [
        { hanzi: "看别人跳舞", pinyin: "kàn biérén tiàowǔ", meaning: "xem người khác nhảy" },
        { hanzi: "看别人打球", pinyin: "kàn biérén dǎ qiú", meaning: "xem người khác chơi bóng" },
      ],
      sentences: [{ zh: "这是别人的书。", pinyin: "Zhè shì biérén de shū.", vi: "Đây là sách của người khác." }],
      dialogues: [
        [
          { who: "A", zh: "你认识他们吗？", pinyin: "Nǐ rènshi tāmen ma?", vi: "Bạn có quen họ không?" },
          {
            who: "B",
            zh: "我只认识黄丽文，别人我不认识。",
            pinyin: "Wǒ zhǐ rènshi Huáng Lìwén, biérén wǒ bú rènshi.",
            vi: "Tôi chỉ quen Hoàng Lệ Văn, người khác thì tôi không quen.",
          },
        ],
      ],
    },
    {
      hanzi: "一起",
      pinyin: "yìqǐ",
      pos: "副",
      meaning: "cùng nhau",
      hanViet: "NHẤT KHỞI",
      pattern: "跟……一起……",
      phrases: [
        { hanzi: "跟她一起打球", pinyin: "gēn tā yìqǐ dǎ qiú", meaning: "chơi bóng cùng cô ấy" },
        { hanzi: "跟朋友一起去", pinyin: "gēn péngyou yìqǐ qù", meaning: "đi cùng bạn bè" },
        { hanzi: "一起吃饭", pinyin: "yìqǐ chī fàn", meaning: "cùng ăn cơm" },
        { hanzi: "一起看电视", pinyin: "yìqǐ kàn diànshì", meaning: "cùng xem tivi" },
        { hanzi: "一起跳舞", pinyin: "yìqǐ tiàowǔ", meaning: "cùng nhảy" },
      ],
      sentences: [{ zh: "我们一起去吧。", pinyin: "Wǒmen yìqǐ qù ba.", vi: "Chúng ta cùng đi nhé." }],
      dialogues: [
        [
          {
            who: "A",
            zh: "明天你跟我们一起去打球吗？",
            pinyin: "Míngtiān nǐ gēn wǒmen yìqǐ qù dǎ qiú ma?",
            vi: "Ngày mai bạn có đi chơi bóng cùng chúng tôi không?",
          },
          {
            who: "B",
            zh: "明天我有事了，不能跟你们一起去。",
            pinyin: "Míngtiān wǒ yǒu shì le, bù néng gēn nǐmen yìqǐ qù.",
            vi: "Ngày mai tôi có việc rồi, không đi cùng các bạn được.",
          },
        ],
      ],
    },
    {
      hanzi: "一边……，一边……",
      pinyin: "yìbiān… yìbiān…",
      pos: "副",
      meaning: "vừa… vừa…",
      hanViet: "NHẤT BIÊN",
      key: { hanzi: "一边", pinyin: "yìbiān" },
      phrases: [
        { hanzi: "一边听音乐一边看书", pinyin: "yìbiān tīng yīnyuè yìbiān kànshū", meaning: "vừa nghe nhạc vừa đọc sách" },
        { hanzi: "一边打球一边听音乐", pinyin: "yìbiān dǎqiú yìbiān tīng yīnyuè", meaning: "vừa chơi bóng vừa nghe nhạc" },
      ],
      sentences: [
        { zh: "她一边吃饭一边看电视。", pinyin: "Tā yìbiān chī fàn yìbiān kàn diànshì.", vi: "Cô ấy vừa ăn cơm vừa xem tivi." },
        { zh: "我一边跳舞，一边听音乐。", pinyin: "Wǒ yìbiān tiàowǔ, yìbiān tīng yīnyuè.", vi: "Tôi vừa nhảy vừa nghe nhạc." },
      ],
    },
    {
      hanzi: "平时",
      pinyin: "píngshí",
      pos: "名",
      meaning: "thường ngày",
      hanViet: "BÌNH THỜI",
      sentences: [
        { zh: "你平时喜欢做什么？", pinyin: "Nǐ píngshí xǐhuan zuò shénme?", vi: "Ngày thường bạn thích làm gì?" },
        { zh: "我平时喜欢看书。", pinyin: "Wǒ píngshí xǐhuan kàn shū.", vi: "Ngày thường tôi thích đọc sách." },
        { zh: "我平时喜欢打网球。", pinyin: "Wǒ píngshí xǐhuan dǎ wǎngqiú.", vi: "Ngày thường tôi thích chơi quần vợt." },
      ],
    },
    {
      hanzi: "常",
      pinyin: "cháng",
      pos: "副",
      meaning: "thường",
      hanViet: "THƯỜNG",
      phrases: [
        { hanzi: "常常", pinyin: "chángcháng", meaning: "thường thường, thường xuyên" },
        { hanzi: "常跳舞", pinyin: "cháng tiàowǔ", meaning: "thường nhảy" },
        { hanzi: "常听音乐", pinyin: "cháng tīng yīnyuè", meaning: "thường nghe nhạc" },
      ],
      sentences: [
        { zh: "她常常看书。", pinyin: "Tā chángcháng kàn shū.", vi: "Cô ấy thường đọc sách." },
        { zh: "他常常跟朋友一起打球。", pinyin: "Tā chángcháng gēn péngyou yìqǐ dǎqiú.", vi: "Anh ấy thường chơi bóng cùng bạn bè." },
        { zh: "我常说汉语。", pinyin: "Wǒ cháng shuō Hànyǔ.", vi: "Tôi thường nói tiếng Trung." },
      ],
      dialogues: [
        [
          { who: "A", zh: "她常在家看电视吗？", pinyin: "Tā cháng zài jiā kàn diànshì ma?", vi: "Cô ấy có hay ở nhà xem tivi không?" },
          { who: "B", zh: "她常常在家看电视。", pinyin: "Tā chángcháng zài jiā kàn diànshì.", vi: "Cô ấy thường ở nhà xem tivi." },
        ],
      ],
    },
    {
      hanzi: "只",
      pinyin: "zhǐ",
      pos: "副",
      meaning: "chỉ",
      hanViet: "CHỈ",
      sentences: [
        { zh: "他只学习汉语。", pinyin: "Tā zhǐ xuéxí Hànyǔ.", vi: "Anh ấy chỉ học tiếng Trung." },
        { zh: "我只喜欢看书。", pinyin: "Wǒ zhǐ xǐhuan kànshū.", vi: "Tôi chỉ thích đọc sách." },
        { zh: "我只喜欢唱歌。", pinyin: "Wǒ zhǐ xǐhuan chàng gē.", vi: "Tôi chỉ thích hát." },
      ],
      dialogues: [
        [
          { who: "A", zh: "你喜欢看电视吗？", pinyin: "Nǐ xǐhuan kàn diànshì ma?", vi: "Bạn có thích xem tivi không?" },
          { who: "B", zh: "不喜欢，我只喜欢跳舞。", pinyin: "Bù xǐhuan, wǒ zhǐ xǐhuan tiàowǔ.", vi: "Không thích, tôi chỉ thích nhảy." },
        ],
      ],
    },
    {
      hanzi: "行",
      pinyin: "xíng",
      pos: "动",
      meaning: "được, đồng ý",
      hanViet: "HÀNH",
      dialogues: [
        [
          { who: "A", zh: "我们去打球吧。", pinyin: "Wǒmen qù dǎ qiú ba.", vi: "Chúng ta đi chơi bóng đi." },
          { who: "B", zh: "行/不行。", pinyin: "Xíng / bù xíng.", vi: "Được / Không được." },
        ],
        [
          { who: "A", zh: "明天我们去银行，行吗？", pinyin: "Míngtiān wǒmen qù yínháng, xíng ma?", vi: "Ngày mai chúng ta đi ngân hàng, được không?" },
          { who: "B", zh: "行/不行。", pinyin: "Xíng / bù xíng.", vi: "Được / Không được." },
        ],
        [
          {
            who: "A",
            zh: "我们去超市买东西，行不行？",
            pinyin: "Wǒmen qù chāoshì mǎi dōngxi, xíng bù xíng?",
            vi: "Chúng ta đi siêu thị mua đồ, được không?",
          },
          { who: "B", zh: "行。", pinyin: "Xíng.", vi: "Được." },
        ],
      ],
    },
    {
      hanzi: "次",
      pinyin: "cì",
      pos: "量",
      meaning: "lần",
      hanViet: "THỨ",
      pattern: "数量 + 次",
      phrases: [
        { hanzi: "一次", pinyin: "yí cì", meaning: "một lần" },
        { hanzi: "两次", pinyin: "liǎng cì", meaning: "hai lần" },
        { hanzi: "三次", pinyin: "sān cì", meaning: "ba lần" },
        { hanzi: "这次", pinyin: "zhè cì", meaning: "lần này" },
        { hanzi: "下次", pinyin: "xiàcì", meaning: "lần sau" },
      ],
      sentences: [{ zh: "我们下次去超市，行吗？", pinyin: "Wǒmen xiàcì qù chāoshì, xíng ma?", vi: "Lần sau chúng ta đi siêu thị, được không?" }],
      dialogues: [
        [
          { who: "A", zh: "你唱一个中文歌，好吗？", pinyin: "Nǐ chàng yí gè Zhōngwén gē, hǎo ma?", vi: "Bạn hát một bài tiếng Trung nhé?" },
          { who: "B", zh: "不行，下次吧。", pinyin: "Bù xíng, xià cì ba.", vi: "Không được, để lần sau nhé." },
        ],
      ],
    },
    {
      hanzi: "周末",
      pinyin: "zhōumò",
      pos: "名",
      meaning: "cuối tuần",
      hanViet: "CHU MẠT",
      sentences: [{ zh: "明天是周末。", pinyin: "Míngtiān shì zhōumò.", vi: "Ngày mai là cuối tuần." }],
      dialogues: [
        [
          { who: "A", zh: "你周末喜欢做什么？", pinyin: "Nǐ zhōumò xǐhuan zuò shénme?", vi: "Cuối tuần bạn thích làm gì?" },
          {
            who: "B",
            zh: "我喜欢在家一边看书一边听音乐。",
            pinyin: "Wǒ xǐhuan zài jiā yìbiān kànshū yìbiān tīng yīnyuè.",
            vi: "Tôi thích ở nhà vừa đọc sách vừa nghe nhạc.",
          },
        ],
      ],
    },
    {
      hanzi: "下个",
      pinyin: "xiàgè",
      meaning: "… sau",
      hanViet: "HẠ CÁ",
      phrases: [
        { hanzi: "下个星期", pinyin: "xiàgè xīngqī", meaning: "tuần sau" },
        { hanzi: "下个周末", pinyin: "xiàgè zhōumò", meaning: "cuối tuần sau" },
      ],
      dialogues: [
        [
          { who: "A", zh: "下个周末你有空吗？", pinyin: "Xiàgè zhōumò nǐ yǒu kòng ma?", vi: "Cuối tuần sau bạn có rảnh không?" },
          { who: "B", zh: "有，你有什么事吗？", pinyin: "Yǒu, nǐ yǒu shénme shì ma?", vi: "Có, bạn có việc gì không?" },
          { who: "A", zh: "我想请你去看电影。", pinyin: "Wǒ xiǎng qǐng nǐ qù kàn diànyǐng.", vi: "Tôi muốn mời bạn đi xem phim." },
          { who: "B", zh: "行。", pinyin: "Xíng.", vi: "Được." },
          { who: "A", zh: "那下个周末我们一起去吧。", pinyin: "Nà xiàgè zhōumò wǒmen yìqǐ qù ba.", vi: "Vậy cuối tuần sau chúng ta cùng đi nhé." },
          { who: "B", zh: "好。", pinyin: "Hǎo.", vi: "Được." },
        ],
      ],
    },
  ],
  grammar: [
    {
      id: "yibian-yibian",
      title: "一边……，一边……",
      name: "Vừa… vừa…",
      summary: "Diễn tả hai hành động diễn ra cùng một lúc. Đặt 一边 trước mỗi động từ.",
      structures: ["主语 + 一边 + 动词1，一边 + 动词2"],
      note: "主语 là chủ ngữ, 动词 là động từ. Dấu phẩy giữa hai vế có thể bỏ.",
      focus: ["一边"],
      examples: [
        { zh: "她一边唱歌，一边跳舞。", pinyin: "Tā yìbiān chàng gē, yìbiān tiào wǔ.", vi: "Cô ấy vừa hát vừa nhảy." },
        { zh: "我喜欢一边吃饭，一边看书。", pinyin: "Wǒ xǐhuan yìbiān chī fàn, yìbiān kàn shū.", vi: "Tôi thích vừa ăn cơm vừa đọc sách." },
        { zh: "他常常一边走路，一边听音乐。", pinyin: "Tā chángcháng yìbiān zǒu lù, yìbiān tīng yīnyuè.", vi: "Anh ấy thường vừa đi bộ vừa nghe nhạc." },
      ],
    },
    {
      id: "dang-lam-gi",
      title: "动作正在进行",
      name: "Hành động tiếp diễn (đang thực hiện)",
      summary: "Dùng 在, 正 hoặc 正在 (đều nghĩa là “đang”) đặt ngay trước động từ để nói một việc đang diễn ra. Có thể thêm 呢 ở cuối câu.",
      structures: ["主语 + 在/正/正在 + 做什么？", "主语 + 在 + …… (呢)", "主语 + 正 + …… (呢)", "主语 + 正在 + …… (呢)"],
      note: "Chú ý vị trí: 在, 正, 正在 luôn đứng sau chủ ngữ và trước động từ.",
      focus: ["正在", "正", "在"],
      examples: [
        { zh: "你在做什么？", pinyin: "Nǐ zài zuò shénme?", vi: "Bạn đang làm gì?" },
        { zh: "我在听音乐(呢)。", pinyin: "Wǒ zài tīng yīnyuè (ne).", vi: "Tôi đang nghe nhạc." },
        { zh: "他正在喝咖啡。", pinyin: "Tā zhèngzài hē kāfēi.", vi: "Anh ấy đang uống cà phê." },
        { zh: "老师在教我们汉语。", pinyin: "Lǎoshī zài jiāo wǒmen Hànyǔ.", vi: "Thầy giáo đang dạy chúng tôi tiếng Trung." },
        { zh: "妈妈正在做晚饭。", pinyin: "Māma zhèngzài zuò wǎnfàn.", vi: "Mẹ đang nấu cơm tối." },
        { zh: "老师正看着我呢。", pinyin: "Lǎoshī zhèng kànzhe wǒ ne.", vi: "Cô giáo đang nhìn tôi." },
      ],
    },
  ],
};

const book2Session2: Lesson = {
  book: 2,
  session: 2,
  slug: "quyen-2-buoi-2",
  title: "Giờ giấc và sinh hoạt hằng ngày",
  words: [
    {
      hanzi: "半",
      pinyin: "bàn",
      pos: "数",
      meaning: "rưỡi, nửa",
      hanViet: "BÁN",
      phrases: [{ hanzi: "八点半", pinyin: "bā diǎn bàn", meaning: "tám giờ rưỡi" }],
    },
    {
      hanzi: "刻",
      pinyin: "kè",
      pos: "量",
      meaning: "15 phút",
      hanViet: "KHẮC",
      phrases: [{ hanzi: "九点一刻", pinyin: "jiǔ diǎn yí kè", meaning: "chín giờ mười lăm" }],
    },
    {
      hanzi: "分",
      pinyin: "fēn",
      pos: "量",
      meaning: "phút",
      hanViet: "PHÂN",
      phrases: [{ hanzi: "五点四十三分", pinyin: "wǔ diǎn sìshísān fēn", meaning: "năm giờ bốn mươi ba phút" }],
    },
    {
      hanzi: "上课",
      pinyin: "shàngkè",
      pos: "动宾",
      meaning: "lên lớp",
      hanViet: "THƯỢNG KHÓA",
      parts: [{ hanzi: "课", pinyin: "kè", pos: "名", meaning: "tiết học" }],
      phrases: [
        { hanzi: "每天上课", pinyin: "měitiān shàngkè", meaning: "ngày nào cũng lên lớp" },
        { hanzi: "有课", pinyin: "yǒu kè", meaning: "có tiết học" },
      ],
    },
    {
      hanzi: "下课",
      pinyin: "xiàkè",
      pos: "动宾",
      meaning: "tan học",
      hanViet: "HẠ KHÓA",
      sentences: [{ zh: "我们十点下课。", pinyin: "Wǒmen shí diǎn xiàkè.", vi: "Chúng tôi tan học lúc mười giờ." }],
    },
    {
      hanzi: "中午",
      pinyin: "zhōngwǔ",
      pos: "名",
      meaning: "buổi trưa",
      hanViet: "TRUNG NGỌ",
      phrases: [{ hanzi: "今天中午", pinyin: "jīntiān zhōngwǔ", meaning: "trưa nay" }],
    },
    {
      hanzi: "或者",
      pinyin: "huòzhě",
      pos: "连",
      meaning: "hoặc là",
      hanViet: "HOẶC GIẢ",
      phrases: [{ hanzi: "今天或者明天", pinyin: "jīntiān huòzhě míngtiān", meaning: "hôm nay hoặc ngày mai" }],
    },
    {
      hanzi: "学校",
      pinyin: "xuéxiào",
      pos: "名",
      meaning: "trường học",
      hanViet: "HỌC HIỆU",
      phrases: [{ hanzi: "去学校", pinyin: "qù xuéxiào", meaning: "đến trường" }],
    },
    {
      hanzi: "门口",
      pinyin: "ménkǒu",
      pos: "名",
      meaning: "cổng, cửa",
      hanViet: "MÔN KHẨU",
      phrases: [{ hanzi: "家门口", pinyin: "jiā ménkǒu", meaning: "cổng nhà" }],
    },
    {
      hanzi: "起床",
      pinyin: "qǐchuáng",
      pos: "动宾",
      meaning: "thức dậy",
      hanViet: "KHỞI SÀNG",
      phrases: [{ hanzi: "八点起床", pinyin: "bā diǎn qǐchuáng", meaning: "tám giờ thức dậy" }],
    },
    {
      hanzi: "有时候",
      pinyin: "yǒu shíhou",
      pos: "副",
      meaning: "có lúc, thỉnh thoảng",
      hanViet: "HỮU THỜI HẬU",
      parts: [{ hanzi: "有时", pinyin: "yǒushí", pos: "副", meaning: "có lúc" }],
      phrases: [
        { hanzi: "有时候看书", pinyin: "yǒu shíhou kàn shū", meaning: "thỉnh thoảng đọc sách" },
        { hanzi: "有时看电影", pinyin: "yǒushí kàn diànyǐng", meaning: "có lúc đi xem phim" },
      ],
    },
    {
      hanzi: "左右",
      pinyin: "zuǒyòu",
      pos: "名",
      meaning: "khoảng",
      hanViet: "TẢ HỮU",
      phrases: [{ hanzi: "九点左右", pinyin: "jiǔ diǎn zuǒyòu", meaning: "khoảng chín giờ" }],
    },
    {
      hanzi: "每天",
      pinyin: "měitiān",
      meaning: "hàng ngày",
      hanViet: "MỖI THIÊN",
      phrases: [{ hanzi: "每天学习汉语", pinyin: "měitiān xuéxí Hànyǔ", meaning: "học tiếng Trung mỗi ngày" }],
    },
    {
      hanzi: "这么",
      pinyin: "zhème",
      pos: "代",
      meaning: "thế, thế này",
      hanViet: "GIÁ MA",
      phrases: [{ hanzi: "这么早", pinyin: "zhème zǎo", meaning: "sớm thế" }],
    },
    {
      hanzi: "早",
      pinyin: "zǎo",
      pos: "形",
      meaning: "sớm",
      hanViet: "TẢO",
      phrases: [{ hanzi: "很早", pinyin: "hěn zǎo", meaning: "rất sớm" }],
    },
    {
      hanzi: "睡觉",
      pinyin: "shuìjiào",
      pos: "动宾",
      meaning: "ngủ",
      hanViet: "THỤY GIÁC",
      parts: [{ hanzi: "睡", pinyin: "shuì", pos: "动", meaning: "ngủ" }],
      phrases: [
        { hanzi: "去睡觉", pinyin: "qù shuìjiào", meaning: "đi ngủ" },
        { hanzi: "睡一觉", pinyin: "shuì yí jiào", meaning: "ngủ một giấc" },
      ],
    },
    {
      hanzi: "因为",
      pinyin: "yīnwèi",
      pos: "连",
      meaning: "bởi vì",
      hanViet: "NHÂN VỊ",
      sentences: [
        {
          zh: "因为我喜欢中国，所以来北京学汉语。",
          pinyin: "Yīnwèi wǒ xǐhuan Zhōngguó, suǒyǐ lái Běijīng xué Hànyǔ.",
          vi: "Vì tôi thích Trung Quốc nên đến Bắc Kinh học tiếng Trung.",
        },
      ],
    },
    {
      hanzi: "晚",
      pinyin: "wǎn",
      pos: "形",
      meaning: "muộn",
      hanViet: "VÃN",
      phrases: [{ hanzi: "很晚", pinyin: "hěn wǎn", meaning: "rất muộn" }],
    },
  ],
  grammar: [
    {
      id: "thu-tu-thoi-gian",
      title: "时间表达顺序",
      name: "Thứ tự nói về thời gian",
      summary: "Khi 早上, 中午, 下午, 晚上 đi cùng giờ cụ thể, tiếng Trung nói buổi trước rồi mới đến giờ, phút: 早上八点一刻. Tiếng Anh thì ngược lại (8:15 a.m.).",
      structures: ["早上/上午/中午/下午/晚上 + 具体时间"],
      note: "具体时间 là thời gian cụ thể (giờ, phút).",
      focus: ["早上", "上午", "中午", "下午", "晚上"],
      examples: [
        { zh: "早上八点一刻", pinyin: "zǎoshang bā diǎn yí kè", vi: "8 giờ 15 sáng (8:15 a.m.)" },
        { zh: "中午十一点半", pinyin: "zhōngwǔ shíyī diǎn bàn", vi: "11 giờ 30 trưa (11:30 a.m.)" },
        { zh: "下午三点二十", pinyin: "xiàwǔ sān diǎn èrshí", vi: "3 giờ 20 chiều (3:20 p.m.)" },
        { zh: "晚上六点三刻", pinyin: "wǎnshang liù diǎn sān kè", vi: "6 giờ 45 tối (6:45 p.m.)" },
      ],
    },
    {
      id: "thoi-gian-cu-the",
      title: "具体时间表达",
      name: "Nói về thời gian cụ thể",
      summary: "Những từ nói về thời gian cụ thể chủ yếu gồm có 点（钟）、半、刻、分; thứ tự cơ bản giống tiếng Anh, từ giờ đến phút.",
      structures: ["……点（钟）", "……点 + 半", "……点 + ……刻", "……点 + ……分"],
      note: "一刻 = 15 phút, 三刻 = 45 phút. 2 giờ nói 两点 (liǎng diǎn), không nói 二点.",
      focus: ["点", "半", "刻", "分"],
      examples: [
        { zh: "八点（钟）", pinyin: "bā diǎn (zhōng)", vi: "8 giờ" },
        { zh: "八点半", pinyin: "bā diǎn bàn", vi: "8 giờ rưỡi" },
        { zh: "九点一刻", pinyin: "jiǔ diǎn yí kè", vi: "9 giờ 15" },
        { zh: "六点三刻", pinyin: "liù diǎn sān kè", vi: "6 giờ 45" },
        { zh: "五点四十三分", pinyin: "wǔ diǎn sìshísān fēn", vi: "5 giờ 43 phút" },
      ],
    },
  ],
};

const book2Session3: Lesson = {
  book: 2,
  session: 3,
  slug: "quyen-2-buoi-3",
  title: "Có thể mượn điện thoại bạn một lát được khum?",
  words: [
    {
      hanzi: "手机",
      pinyin: "shǒujī",
      pos: "名",
      meaning: "điện thoại di động",
      hanViet: "THỦ CƠ",
      phrases: [
        { hanzi: "田中的手机", pinyin: "Tiánzhōng de shǒujī", meaning: "điện thoại của Tanaka" },
        { hanzi: "美京的手机", pinyin: "Měijīng de shǒujī", meaning: "điện thoại của Mỹ Kinh" },
        { hanzi: "他的手机很好。", pinyin: "Tā de shǒujī hěn hǎo.", meaning: "Điện thoại của anh ấy rất tốt." },
      ],
      dialogues: [
        [
          { who: "A", zh: "这是你的手机吗？", pinyin: "Zhè shì nǐ de shǒujī ma?", vi: "Đây có phải là điện thoại của bạn không?" },
          { who: "B", zh: "这是 / 不是我的手机。", pinyin: "Zhè shì / bú shì wǒ de shǒujī.", vi: "Đây là / không phải là điện thoại của tôi." },
        ],
      ],
    },
    {
      hanzi: "电话",
      pinyin: "diànhuà",
      pos: "名",
      meaning: "điện thoại",
      hanViet: "ĐIỆN THOẠI",
      parts: [
        { hanzi: "打电话", pinyin: "dǎ diànhuà", pos: "动", meaning: "gọi điện thoại" },
      ],
      phrases: [
        { hanzi: "一个电话", pinyin: "yí gè diànhuà", meaning: "một cuộc điện thoại" },
        { hanzi: "跟朋友打电话", pinyin: "gēn péngyou dǎ diànhuà", meaning: "gọi điện thoại với bạn bè" },
      ],
      dialogues: [
        [
          { who: "A", zh: "他正在做什么？", pinyin: "Tā zhèngzài zuò shénme?", vi: "Anh ấy đang làm gì?" },
          { who: "B", zh: "他正在打电话。", pinyin: "Tā zhèngzài dǎ diànhuà.", vi: "Anh ấy đang gọi điện thoại." },
        ],
        [
          { who: "A", zh: "你今天跟谁打电话？", pinyin: "Nǐ jīntiān gēn shéi dǎ diànhuà?", vi: "Hôm nay bạn gọi điện thoại với ai?" },
          { who: "B", zh: "我跟朋友打电话。", pinyin: "Wǒ gēn péngyou dǎ diànhuà.", vi: "Tôi gọi điện thoại với bạn." },
        ],
      ],
    },
    {
      hanzi: "号码",
      pinyin: "hàomǎ",
      pos: "名",
      meaning: "số",
      hanViet: "HẢO MÃ",
      parts: [
        { hanzi: "号", pinyin: "hào", pos: "名", meaning: "số" },
      ],
      phrases: [
        { hanzi: "电话号码", pinyin: "diànhuà hàomǎ", meaning: "số điện thoại" },
        { hanzi: "手机号码", pinyin: "shǒujī hàomǎ", meaning: "số điện thoại di động" },
        { hanzi: "手机号", pinyin: "shǒujī hào", meaning: "số điện thoại di động" },
      ],
      dialogues: [
        [
          { who: "A", zh: "你的电话号码是多少？", pinyin: "Nǐ de diànhuà hàomǎ shì duōshao?", vi: "Số điện thoại của bạn là bao nhiêu?" },
          { who: "B", zh: "我的手机号码是013-225-468。", pinyin: "Wǒ de shǒujī hàomǎ shì 013-225-468.", vi: "Số điện thoại của tôi là 013-225-468." },
        ],
        [
          { who: "A", zh: "这是你的手机号码吗？", pinyin: "Zhè shì nǐ de shǒujī hàomǎ ma?", vi: "Đây có phải số điện thoại di động của bạn không?" },
          { who: "B", zh: "是 / 不是。", pinyin: "Shì / Bú shì.", vi: "Phải / Không phải." },
        ],
      ],
    },
    {
      hanzi: "给",
      pinyin: "gěi",
      pos: "动-介",
      meaning: "cho, cho ai (làm gì)",
      hanViet: "CẤP",
      phrases: [
        { hanzi: "给你一些水果", pinyin: "gěi nǐ yìxiē shuǐguǒ", meaning: "cho bạn một ít hoa quả" },
        { hanzi: "给妈妈打电话", pinyin: "gěi māma dǎ diànhuà", meaning: "gọi điện thoại cho mẹ" },
      ],
      dialogues: [
        [
          { who: "A", zh: "今天你给妈妈打电话了吗？", pinyin: "Jīntiān nǐ gěi māma dǎ diànhuà le ma?", vi: "Hôm nay bạn đã gọi điện cho mẹ chưa?" },
          { who: "B", zh: "我给她打了 / 还没呢。", pinyin: "Wǒ gěi tā dǎ le / hái méi ne.", vi: "Tôi gọi cho bà ấy rồi / Vẫn chưa." },
        ],
        [
          { who: "A", zh: "我想给他打电话，你给我的他的电话号码吧。", pinyin: "Wǒ xiǎng gěi tā dǎ diànhuà, nǐ gěi wǒ tā de diànhuà hàomǎ ba.", vi: "Tôi muốn gọi điện cho anh ấy, bạn cho tôi số điện thoại của anh ấy đi." },
          { who: "B", zh: "好的。", pinyin: "Hǎo de.", vi: "Được thôi." },
        ],
      ],
    },
    {
      hanzi: "可以",
      pinyin: "kěyǐ",
      pos: "动",
      meaning: "có thể",
      hanViet: "KHẢ DĨ",
      phrases: [
        { hanzi: "可以吃", pinyin: "kěyǐ chī", meaning: "có thể ăn" },
        { hanzi: "可以喝", pinyin: "kěyǐ hē", meaning: "có thể uống" },
        { hanzi: "可以给你", pinyin: "kěyǐ gěi nǐ", meaning: "có thể cho bạn" },
        { hanzi: "可以去", pinyin: "kěyǐ qù", meaning: "có thể đi" },
      ],
      dialogues: [
        [
          { who: "A", zh: "你可以跟我们一起去吗？", pinyin: "Nǐ kěyǐ gēn wǒmen yìqǐ qù ma?", vi: "Bạn có thể đi cùng chúng tôi không?" },
          { who: "B", zh: "可以 / 不可以。", pinyin: "Kěyǐ / Bù kěyǐ.", vi: "Có thể / Không thể." },
        ],
        [
          { who: "A", zh: "你可以给我他的手机号码吗？", pinyin: "Nǐ kěyǐ gěi wǒ tā de shǒujī hàomǎ ma?", vi: "Bạn có thể cho tôi số điện thoại di động của anh ấy không?" },
          { who: "B", zh: "可以。", pinyin: "Kěyǐ.", vi: "Được chứ." },
        ],
      ],
    },
    {
      hanzi: "可是",
      pinyin: "kěshì",
      pos: "连",
      meaning: "tuy nhiên, nhưng",
      hanViet: "KHẢ THỊ",
      phrases: [
        { hanzi: "我想去中国，可是我的汉语不好。", pinyin: "Wǒ xiǎng qù Zhōngguó, kěshì wǒ de Hànyǔ bù hǎo.", meaning: "Tôi muốn đi Trung Quốc, nhưng tiếng Trung của tôi không tốt." },
        { hanzi: "我想跟中国朋友说话，可是我的汉语不好。", pinyin: "Wǒ xiǎng gēn Zhōngguó péngyou shuō huà, kěshì wǒ de Hànyǔ bù hǎo.", meaning: "Tôi muốn nói chuyện với bạn Trung Quốc, nhưng tiếng Trung của tôi không tốt." },
      ],
      dialogues: [
        [
          { who: "A", zh: "明天我可以给你打电话吗？", pinyin: "Míngtiān wǒ kěyǐ gěi nǐ dǎ diànhuà ma?", vi: "Ngày mai tôi có thể gọi điện cho bạn không?" },
          { who: "B", zh: "可以。", pinyin: "Kěyǐ.", vi: "Được chứ." },
          { who: "A", zh: "可是我没有你的电话号码。", pinyin: "Kěshì wǒ méiyǒu nǐ de diànhuà hàomǎ.", vi: "Nhưng tôi không có số điện thoại của bạn." },
        ],
      ],
    },
    {
      hanzi: "电脑",
      pinyin: "diànnǎo",
      pos: "名",
      meaning: "máy tính",
      hanViet: "ĐIỆN NÃO",
      parts: [
        { hanzi: "电", pinyin: "diàn", pos: "名", meaning: "điện" },
      ],
      phrases: [
        { hanzi: "我的电脑", pinyin: "wǒ de diànnǎo", meaning: "máy tính của tôi" },
        { hanzi: "你的电脑真好。", pinyin: "Nǐ de diànnǎo zhēn hǎo.", meaning: "Máy tính của bạn thật tốt." },
        { hanzi: "没 / 有电了！", pinyin: "Méi / yǒu diàn le!", meaning: "Hết / Có điện rồi!" },
      ],
      dialogues: [
        [
          { who: "A", zh: "我的电脑没电了，你可以给我你的电脑吗？", pinyin: "Wǒ de diànnǎo méi diàn le, nǐ kěyǐ gěi wǒ nǐ de diànnǎo ma?", vi: "Máy tính của tôi hết điện rồi, bạn có thể cho tôi mượn máy tính của bạn không?" },
          { who: "B", zh: "可以 / 不可以。", pinyin: "Kěyǐ / Bù kěyǐ.", vi: "Được / Không được." },
        ],
      ],
    },
    {
      hanzi: "用",
      pinyin: "yòng",
      pos: "动",
      meaning: "dùng, sử dụng",
      hanViet: "DỤNG",
      phrases: [
        { hanzi: "用手机", pinyin: "yòng shǒujī", meaning: "dùng điện thoại" },
        { hanzi: "用电脑", pinyin: "yòng diànnǎo", meaning: "dùng máy tính" },
        { hanzi: "用电话", pinyin: "yòng diànhuà", meaning: "dùng điện thoại" },
        { hanzi: "用汉语说话", pinyin: "yòng Hànyǔ shuō huà", meaning: "nói chuyện bằng tiếng Trung" },
        { hanzi: "请你用汉语说话。", pinyin: "Qǐng nǐ yòng Hànyǔ shuō huà.", meaning: "Xin bạn hãy nói chuyện bằng tiếng Trung." },
        { hanzi: "你用我的手机吧。", pinyin: "Nǐ yòng wǒ de shǒujī ba.", meaning: "Bạn dùng điện thoại của tôi đi." },
      ],
      dialogues: [
        [
          { who: "A", zh: "我的电脑没电了，我可以用你的电脑吗？", pinyin: "Wǒ de diànnǎo méi diàn le, wǒ kěyǐ yòng nǐ de diànnǎo ma?", vi: "Máy tính của tôi hết điện rồi, tôi có thể dùng máy tính của bạn được không?" },
          { who: "B", zh: "对不起，我现在要用了。", pinyin: "Duìbuqǐ, wǒ xiànzài yào yòng le.", vi: "Xin lỗi, bây giờ tôi đang cần dùng rồi." },
        ],
      ],
    },
    {
      hanzi: "等",
      pinyin: "děng",
      pos: "动",
      meaning: "đợi, chờ",
      hanViet: "ĐẲNG",
      phrases: [
        { hanzi: "等朋友", pinyin: "děng péngyou", meaning: "đợi bạn bè" },
        { hanzi: "等他", pinyin: "děng tā", meaning: "đợi anh ấy" },
        { hanzi: "我在这儿等你。", pinyin: "Wǒ zài zhèr děng nǐ.", meaning: "Tôi ở đây đợi bạn." },
        { hanzi: "你在学校门口等他吧。", pinyin: "Nǐ zài xuéxiào ménkǒu děng tā ba.", meaning: "Bạn ở cổng trường đợi anh ấy đi." },
      ],
      dialogues: [
        [
          { who: "A", zh: "你现在在哪里？", pinyin: "Nǐ xiànzài zài nǎr?", vi: "Bây giờ bạn đang ở đâu?" },
          { who: "B", zh: "我在学校门口，我在等车呢。", pinyin: "Wǒ zài xuéxiào ménkǒu, wǒ zài děng chē ne.", vi: "Tôi đang ở cổng trường, tôi đang đợi xe." },
        ],
      ],
    },
    {
      hanzi: "一下",
      pinyin: "yíxià",
      pos: "数",
      meaning: "một lát, một lúc",
      hanViet: "NHẤT HẠ",
      phrases: [
        { hanzi: "等一下", pinyin: "děng yíxià", meaning: "đợi một chút" },
        { hanzi: "用一下", pinyin: "yòng yíxià", meaning: "dùng một chút" },
        { hanzi: "看一下", pinyin: "kàn yíxià", meaning: "xem một chút" },
        { hanzi: "你等一下我给你他的电话号码", pinyin: "Nǐ děng yíxià wǒ gěi nǐ tā de diànhuà hàomǎ", meaning: "Bạn đợi một chút tôi cho bạn số điện thoại của anh ấy" },
      ],
      dialogues: [
        [
          { who: "A", zh: "我可以用一下你的手机吗？", pinyin: "Wǒ kěyǐ yòng yíxià nǐ de shǒujī ma?", vi: "Tôi có thể dùng điện thoại của bạn một chút được không?" },
          { who: "B", zh: "可以，给你。", pinyin: "Kěyǐ, gěi nǐ.", vi: "Được chứ, cho bạn này." },
        ],
      ],
    },
    {
      hanzi: "笔",
      pinyin: "bǐ",
      pos: "名",
      meaning: "bút",
      hanViet: "BÚT",
      parts: [
        { hanzi: "支", pinyin: "zhī", pos: "量", meaning: "lượng từ (dùng cho bút, thuốc lá,...)" },
      ],
      phrases: [
        { hanzi: "他的笔", pinyin: "tā de bǐ", meaning: "bút của anh ấy" },
        { hanzi: "用笔", pinyin: "yòng bǐ", meaning: "dùng bút" },
        { hanzi: "一支笔", pinyin: "yì zhī bǐ", meaning: "một cây bút" },
        { hanzi: "两支笔", pinyin: "liǎng zhī bǐ", meaning: "hai cây bút" },
        { hanzi: "我用他的笔。", pinyin: "Wǒ yòng tā de bǐ.", meaning: "Tôi dùng bút của anh ấy." },
        { hanzi: "欧文给我一支笔。", pinyin: "Ōuwén gěi wǒ yì zhī bǐ.", meaning: "Owen cho tôi một cây bút." },
      ],
      dialogues: [
        [
          { who: "A", zh: "你有几支笔？", pinyin: "Nǐ yǒu jǐ zhī bǐ?", vi: "Bạn có mấy cây bút?" },
          { who: "B", zh: "三支笔。", pinyin: "Sān zhī bǐ.", vi: "Ba cây bút." },
        ],
      ],
    },
    {
      hanzi: "写",
      pinyin: "xiě",
      pos: "动",
      meaning: "viết",
      hanViet: "TẢ",
      phrases: [
        { hanzi: "写一下", pinyin: "xiě yíxià", meaning: "viết một chút" },
        { hanzi: "写名字", pinyin: "xiě míngzi", meaning: "viết tên" },
        { hanzi: "写汉字", pinyin: "xiě Hànzì", meaning: "viết chữ Hán" },
        { hanzi: "用笔写汉字", pinyin: "yòng bǐ xiě Hànzì", meaning: "dùng bút viết chữ Hán" },
      ],
      dialogues: [
        [
          { who: "A", zh: "我可以借你的笔吗？", pinyin: "Wǒ kěyǐ jiè nǐ de bǐ ma?", vi: "Tôi có thể mượn bút của bạn được không?" },
          { who: "B", zh: "你想做什么？", pinyin: "Nǐ xiǎng zuò shénme?", vi: "Bạn muốn làm gì?" },
          { who: "A", zh: "我要写汉字。", pinyin: "Wǒ yào xiě Hànzì.", vi: "Tôi muốn viết chữ Hán." },
          { who: "B", zh: "可以，给你。", pinyin: "Kěyǐ, gěi nǐ.", vi: "Được chứ, cho bạn này." },
        ],
      ],
    },
    {
      hanzi: "借",
      pinyin: "jiè",
      pos: "动",
      meaning: "mượn",
      hanViet: "TÁ",
      phrases: [
        { hanzi: "借书", pinyin: "jiè shū", meaning: "mượn sách" },
        { hanzi: "借钱", pinyin: "jiè qián", meaning: "mượn tiền" },
        { hanzi: "借电脑", pinyin: "jiè diànnǎo", meaning: "mượn máy tính" },
        { hanzi: "借手机", pinyin: "jiè shǒujī", meaning: "mượn điện thoại" },
        { hanzi: "借笔", pinyin: "jiè bǐ", meaning: "mượn bút" },
        { hanzi: "这本书是我借他的。", pinyin: "Zhè běn shū shì wǒ jiè tā de.", meaning: "Cuốn sách này là tôi mượn của anh ấy." },
        { hanzi: "今天我去图书馆借书。", pinyin: "Jīntiān wǒ qù túshūguǎn jiè shū.", meaning: "Hôm nay tôi đi thư viện mượn sách." },
      ],
      dialogues: [
        [
          { who: "A", zh: "我可以借你的钱吗？", pinyin: "Wǒ kěyǐ jiè nǐ de qián ma?", vi: "Tôi có thể mượn tiền của bạn không?" },
          { who: "B", zh: "可以，等我一下……给你。", pinyin: "Kěyǐ, děng wǒ yíxià... gěi nǐ.", vi: "Được chứ, đợi tôi một chút... cho bạn này." },
          { who: "A", zh: "谢谢。", pinyin: "Xièxie.", vi: "Cảm ơn." },
        ],
      ],
    },
    {
      hanzi: "找",
      pinyin: "zhǎo",
      pos: "动",
      meaning: "tìm",
      hanViet: "TÌM",
      phrases: [
        { hanzi: "找朋友", pinyin: "zhǎo péngyou", meaning: "tìm bạn bè" },
        { hanzi: "找手机", pinyin: "zhǎo shǒujī", meaning: "tìm điện thoại" },
        { hanzi: "找他的电话号码", pinyin: "zhǎo tā de diànhuà hàomǎ", meaning: "tìm số điện thoại của anh ấy" },
        { hanzi: "找一下", pinyin: "zhǎo yíxià", meaning: "tìm một chút" },
      ],
      dialogues: [
        [
          { who: "A", zh: "你有王老师的电话号码吗？", pinyin: "Nǐ yǒu Wáng lǎoshī de diànhuà hàomǎ ma?", vi: "Bạn có số điện thoại của thầy Vương không?" },
          { who: "B", zh: "有，你等我，我找一下。", pinyin: "Yǒu, nǐ děng wǒ, wǒ zhǎo yíxià.", vi: "Có, bạn đợi tôi, tôi tìm một chút." },
          { who: "A", zh: "好。", pinyin: "Hǎo.", vi: "Được." },
          { who: "B", zh: "这是他的电话号码，给你。", pinyin: "Zhè shì tā de diànhuà hàomǎ, gěi nǐ.", vi: "Đây là số điện thoại của thầy ấy, cho bạn này." },
          { who: "A", zh: "谢谢。", pinyin: "Xièxie.", vi: "Cảm ơn." },
        ],
      ],
    },
    {
      hanzi: "说",
      pinyin: "shuō",
      pos: "动",
      meaning: "nói",
      hanViet: "THUYẾT",
      phrases: [
        { hanzi: "说汉语", pinyin: "shuō Hànyǔ", meaning: "nói tiếng Trung" },
        { hanzi: "跟朋友说话", pinyin: "gēn péngyou shuō huà", meaning: "nói chuyện với bạn bè" },
        { hanzi: "说一下", pinyin: "shuō yíxià", meaning: "nói một chút / nói qua" },
        { hanzi: "他星期天常跟朋友说汉语。", pinyin: "Tā xīngqītiān cháng gēn péngyou shuō Hànyǔ.", meaning: "Chủ nhật anh ấy thường nói tiếng Trung với bạn bè." },
      ],
      dialogues: [
        [
          { who: "A", zh: "你常跟妈妈说话吗？", pinyin: "Nǐ cháng gēn māma shuō huà ma?", vi: "Bạn có thường nói chuyện với mẹ không?" },
          { who: "B", zh: "常，每天我都跟妈妈说话。", pinyin: "Cháng, měitiān wǒ dōu gēn māma shuō huà.", vi: "Thường xuyên, mỗi ngày tôi đều nói chuyện với mẹ." },
        ],
      ],
    },
    {
      hanzi: "慢",
      pinyin: "màn",
      pos: "形",
      meaning: "chậm",
      hanViet: "MẠN",
      parts: [
        { hanzi: "快", pinyin: "kuài", pos: "形", meaning: "nhanh" },
      ],
      phrases: [
        { hanzi: "很慢", pinyin: "hěn màn", meaning: "rất chậm" },
        { hanzi: "不慢", pinyin: "bú màn", meaning: "không chậm" },
        { hanzi: "慢一点儿", pinyin: "màn yìdiǎnr", meaning: "chậm một chút" },
        { hanzi: "你可以说慢一点吗？", pinyin: "Nǐ kěyǐ shuō màn yìdiǎnr ma?", meaning: "Bạn có thể nói chậm một chút không?" },
        { hanzi: "你慢走！", pinyin: "Nǐ màn zǒu!", meaning: "Bạn đi thong thả!" },
      ],
      dialogues: [
        [
          { who: "A", zh: "你的手机号码是多少？", pinyin: "Nǐ de shǒujī hàomǎ shì duōshao?", vi: "Số điện thoại của bạn là bao nhiêu?" },
          { who: "B", zh: "我的手机号码是12345678。", pinyin: "Wǒ de shǒujī hàomǎ shì 12345678.", vi: "Số điện thoại của tôi là 12345678." },
          { who: "A", zh: "你慢一点儿。", pinyin: "Nǐ màn yìdiǎnr.", vi: "Bạn chậm một chút." },
          { who: "B", zh: "12345678。", pinyin: "12345678.", vi: "12345678." },
        ],
      ],
    },
    {
      hanzi: "遍",
      pinyin: "biàn",
      pos: "量",
      meaning: "lần, lượt (lượt-lượng từ của hành động)",
      hanViet: "BIẾN",
      phrases: [
        { hanzi: "说两遍", pinyin: "shuō liǎng biàn", meaning: "nói hai lần" },
        { hanzi: "写两遍", pinyin: "xiě liǎng biàn", meaning: "viết hai lần" },
        { hanzi: "看一遍", pinyin: "kàn yí biàn", meaning: "xem/đọc một lần" },
      ],
      dialogues: [
        [
          { who: "A", zh: "你说太快了，请你再说一遍。", pinyin: "Nǐ shuō tài kuài le, qǐng nǐ zài shuō yí biàn.", vi: "Bạn nói nhanh quá, xin bạn nói lại một lần nữa." },
          { who: "B", zh: "好的。", pinyin: "Hǎo de.", vi: "Được rồi." },
        ],
      ],
    },
    {
      hanzi: "对了",
      pinyin: "duìle",
      pos: "叹",
      meaning: "nhân tiện, đúng rồi",
      hanViet: "ĐỐI LIỄU",
      phrases: [
        { hanzi: "说对了", pinyin: "shuō duì le", meaning: "nói đúng rồi" },
        { hanzi: "写对了", pinyin: "xiě duì le", meaning: "viết đúng rồi" },
        { hanzi: "对了！", pinyin: "Duìle!", meaning: "Đúng rồi! / Nhân tiện!" },
      ],
      dialogues: [
        [
          { who: "A", zh: "对了，你的电话号码是多少？", pinyin: "Duìle, nǐ de diànhuà hàomǎ shì duōshao?", vi: "Nhân tiện, số điện thoại của bạn là bao nhiêu?" },
          { who: "B", zh: "我的电话号码是12345678。", pinyin: "Wǒ de diànhuà hàomǎ shì 12345678.", vi: "Số điện thoại của tôi là 12345678." },
        ],
        [
          { who: "A", zh: "你的手机号码，我写对了吗？", pinyin: "Nǐ de shǒujī hàomǎ, wǒ xiě duì le ma?", vi: "Số điện thoại của bạn, tôi viết đúng chưa?" },
          { who: "B", zh: "对了 / 不对。", pinyin: "Duìle / Bú duì.", vi: "Đúng rồi / Không đúng." },
        ],
      ],
    },
    {
      hanzi: "没问题",
      pinyin: "méi wèntí",
      pos: "套",
      meaning: "không vấn đề",
      hanViet: "MỘT VẤN ĐỀ",
      parts: [
        { hanzi: "问题", pinyin: "wèntí", pos: "名", meaning: "vấn đề, câu hỏi" },
      ],
      phrases: [
        { hanzi: "你有什么问题可以跟我说。", pinyin: "Nǐ yǒu shénme wèntí kěyǐ gēn wǒ shuō.", meaning: "Bạn có vấn đề gì có thể nói với tôi." },
        { hanzi: "这个问题很难。", pinyin: "Zhè ge wèntí hěn nán.", meaning: "Vấn đề này rất khó." },
      ],
      dialogues: [
        [
          { who: "A", zh: "我想给朋友打电话，可是手机在家呢，你可以用一下你的手机吗？", pinyin: "Wǒ xiǎng gěi péngyou dǎ diànhuà, kěshì shǒujī zài jiā ne, wǒ kěyǐ yòng yíxià nǐ de shǒujī ma?", vi: "Tôi muốn gọi điện cho bạn, nhưng điện thoại ở nhà rồi, tôi có thể dùng nhờ điện thoại của bạn một chút không?" },
          { who: "B", zh: "可以，我的手机在那儿。", pinyin: "Kěyǐ, wǒ de shǒujī zài nàr.", vi: "Được chứ, điện thoại của tôi ở đằng kia." },
          { who: "A", zh: "谢谢你。", pinyin: "Xièxie nǐ.", vi: "Cảm ơn bạn." },
          { who: "B", zh: "没问题。", pinyin: "Méi wèntí.", vi: "Không có vấn đề gì." },
        ],
      ],
    },
  ],
  grammar: [
    {
      id: "dong-tu-nang-nguyen",
      title: "“能愿动词”: 可以、想",
      name: "Động từ năng nguyện: 可以, 想",
      summary: "Những từ đứng trước động từ biểu thị khả năng, nhu cầu, nguyện vọng hoặc sự cho phép thì được gọi là động từ năng nguyện, ví dụ “可以、想”. “可以” biểu thị mong muốn nhận được sự chấp thuận để làm việc gì đó. “想” biểu thị nguyện vọng chủ quan hoặc mong muốn của ai đó để làm việc gì đó. Khi phủ định thêm “不” vào phía trước động từ năng nguyện.",
      structures: [
        "Khẳng định: 能愿动词 + 动词 + ……",
        "Phủ định: 不 + 能愿动词 + 动词 + ……",
      ],
      note: "Bạn hãy chú ý tới vị trí của các động từ năng nguyện trong ví dụ nhé.",
      focus: ["可以", "想"],
      examples: [
        { zh: "我可以借你的手机吗？", pinyin: "Wǒ kěyǐ jiè nǐ de shǒujī ma?", vi: "Tôi có thể mượn điện thoại của bạn không?" },
        { zh: "我可以用你的电脑吗？", pinyin: "Wǒ kěyǐ yòng nǐ de diànnǎo ma?", vi: "Tôi có thể dùng máy tính của bạn không?" },
        { zh: "我想看一下你的书。", pinyin: "Wǒ xiǎng kàn yíxià nǐ de shū.", vi: "Tôi muốn xem qua sách của bạn một chút." },
        { zh: " me不想用你的笔。", pinyin: "Wǒ bù xiǎng yòng nǐ de bǐ.", vi: "Tôi không muốn dùng bút của bạn." },
        { zh: " me不想看你的书。", pinyin: "Wǒ bù xiǎng kàn nǐ de shū.", vi: "Tôi không muốn xem sách của bạn." },
      ],
    },
    {
      id: "so-luong-tu-yixia",
      title: "数量词 “一下”",
      name: "Số lượng từ: 一下",
      summary: "“一下” 置于动词后，表示动作持续时间短暂，常在问句中或祈使句钟出现，使问题或请求的语气更柔和轻松，更礼貌。“一下” đứng sau động từ. Biểu thị động tác diễn ra trong một khoảng thời gian ngắn, thường được dùng trong câu nghi vấn hoặc cầu khiến, làm cho ngữ khí cầu khiến hoặc nghi vấn trở nên nhẹ nhàng và lịch sự hơn.",
      structures: ["动词 + 一下 + ……"],
      note: "Bạn hãy chú ý tới vị trí của “一下” trong ví dụ, sau đó đoán xem chúng có tác dụng gì trong câu nhé!",
      focus: ["一下"],
      examples: [
        { zh: "我可以看一下你的书吗？", pinyin: "Wǒ kěyǐ kàn yíxià nǐ de shū ma?", vi: "Tôi có thể xem qua sách của bạn một chút không?" },
        { zh: "请等一下。", pinyin: "Qǐng děng yíxià.", vi: "Xin đợi một chút." },
        { zh: "我想用一下你的电脑。", pinyin: "Wǒ xiǎng yòng yíxià nǐ de diànnǎo.", vi: "Tôi muốn dùng máy tính của bạn một chút." },
        { zh: "我可以用一下你的手机吗？", pinyin: "Wǒ kěyǐ yòng yíxià nǐ de shǒujī ma?", vi: "Tôi có thể dùng điện thoại của bạn một chút không?" },
        { zh: "你等一下吧。", pinyin: "Nǐ děng yíxià ba.", vi: "Bạn đợi một chút đi." },
        { zh: "我可以借一下你的笔吗？", pinyin: "Wǒ kěyǐ jiè yíxià nǐ de bǐ ma?", vi: "Tôi có thể mượn bút của bạn một chút không?" },
      ],
    },
  ],
};

export const LESSONS: Lesson[] = [...BOOK_1, book2Session1, book2Session2, book2Session3];

import type { Client } from "@libsql/client";

// 演示数据：全部采用「公版（版权已过期）」古典名著节选，合法、安全。
// 真实采集数据请走采集脚本写入，勿用盗版内容。
type SeedChapter = { title: string; content: string };
type SeedBook = {
  title: string;
  author: string;
  category: string;
  status: string;
  intro: string;
  views: number; // 初始人气，用于排行榜排序
  daysAgo: number; // 更新时间偏移（天），用于「最新更新」排序
  chapters: SeedChapter[];
};

const P = (...ps: string[]) => ps.join("\n\n");

const seedBooks: SeedBook[] = [
  {
    title: "西游记",
    author: "吴承恩",
    category: "xuanhuan",
    status: "已完结",
    views: 98200,
    daysAgo: 0,
    intro:
      "东胜神洲傲来国花果山，一块仙石孕育出石猴。石猴拜师学艺，得名孙悟空，护送唐僧西天取经，历经九九八十一难。公版古典名著，仅作演示。",
    chapters: [
      {
        title: "第一回 灵根育孕源流出 心性修持大道生",
        content: P(
          "诗曰：混沌未分天地乱，茫茫渺渺无人见。自从盘古破鸿蒙，开辟从兹清浊辨。",
          "盖闻天地之数，有十二万九千六百岁为一元。感盘古开辟，三皇治世，五帝定伦，世界之间，遂分为四大部洲。这部书单表东胜神洲。海外有一国土，名曰傲来国。国近大海，海中有一座名山，唤为花果山。"
        ),
      },
      {
        title: "第二回 悟彻菩提真妙理 断魔归本合元神",
        content: P(
          "话表美猴王得了姓名，怡然踊跃，对菩提前作礼启谢。",
          "那祖师即命大众引孙悟空出二门外，教他洒扫应对，进退周旋之节。众仙奉行而出。悟空到门外，又拜了大众师兄，就于廊庑之间，安排寝处。"
        ),
      },
    ],
  },
  {
    title: "封神演义",
    author: "许仲琳",
    category: "xuanhuan",
    status: "已完结",
    views: 71500,
    daysAgo: 0,
    intro:
      "商纣无道，女娲降罚，姜子牙下山辅周伐纣，阐截两教仙人各显神通，封三百六十五位正神。公版神魔小说，仅作演示。",
    chapters: [
      {
        title: "第一回 纣王女娲宫进香",
        content: P(
          "混沌初分盘古先，太极两仪四象悬。子天丑地人寅出，避除兽患有巢贤。",
          "话说成汤乃黄帝之后也。商纣王者，帝乙之三子也。帝乙在位之时，有一日游于御园，领众文武玩赏牡丹。"
        ),
      },
    ],
  },
  {
    title: "聊斋志异",
    author: "蒲松龄",
    category: "xuanhuan",
    status: "已完结",
    views: 64300,
    daysAgo: 1,
    intro:
      "写鬼写妖高人一等，刺贪刺虐入木三分。花妖狐魅，多具人情，和易可亲，忘为异类。公版志怪名著，仅作演示。",
    chapters: [
      {
        title: "考城隍",
        content: P(
          "予姊丈之祖宋公，讳焘，邑廪生。一日病卧，见吏人持牒，牵白颠马来，云：「请赴试。」",
          "至一城郭，如王者都。移时入府廨，宫室壮丽。上坐十余官，都不知何人，惟关壮缪可识。"
        ),
      },
    ],
  },
  {
    title: "三国演义",
    author: "罗贯中",
    category: "lishi",
    status: "已完结",
    views: 95800,
    daysAgo: 0,
    intro:
      "话说天下大势，分久必合，合久必分。东汉末年，群雄并起，魏蜀吴三分天下。一部荡气回肠的英雄史诗。公版古典名著，仅作演示。",
    chapters: [
      {
        title: "第一回 宴桃园豪杰三结义 斩黄巾英雄首立功",
        content: P(
          "滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。青山依旧在，几度夕阳红。",
          "话说天下大势，分久必合，合久必分。汉朝自高祖斩白蛇而起义，一统天下，后来光武中兴，传至献帝，遂分为三国。"
        ),
      },
      {
        title: "第二回 张翼德怒鞭督邮 何国舅谋诛宦竖",
        content: P(
          "且说董卓字仲颖，陇西临洮人也，官拜河东太守，自来骄傲。",
          "当日怠慢了玄德，张飞性发，便欲杀之。玄德与关公急止之曰：「他是朝廷命官，岂可擅杀？」"
        ),
      },
    ],
  },
  {
    title: "水浒传",
    author: "施耐庵",
    category: "lishi",
    status: "已完结",
    views: 88100,
    daysAgo: 0,
    intro:
      "官逼民反，逼上梁山。一百单八将聚义水泊梁山，替天行道，演绎一段忠义悲歌。公版古典名著，仅作演示。",
    chapters: [
      {
        title: "第一回 张天师祈禳瘟疫 洪太尉误走妖魔",
        content: P(
          "话说大宋仁宗天子在位，嘉祐三年三月三日五更三点，天子驾坐紫宸殿，受百官朝贺。",
          "当下文武百官，分班齐列。但见祥云迷凤阁，瑞气罩龙楼。只因这场瘟疫，引出一段惊天动地的缘由来。"
        ),
      },
    ],
  },
  {
    title: "东周列国志",
    author: "冯梦龙",
    category: "lishi",
    status: "已完结",
    views: 41200,
    daysAgo: 2,
    intro:
      "上起西周末年，下至秦灭六国。春秋五霸、战国七雄，五百年风云尽在其中。公版历史演义，仅作演示。",
    chapters: [
      {
        title: "第一回 周宣王闻谣轻杀 杜大夫化厉鸣冤",
        content: P(
          "道德三皇五帝，功名夏后商周。英雄五霸闹春秋，顷刻兴亡过手。",
          "话说周朝，自后稷传至古公亶父，徙居岐山之下。文王、武王相继而兴，奄有天下。"
        ),
      },
    ],
  },
  {
    title: "红楼梦",
    author: "曹雪芹",
    category: "yanqing",
    status: "已完结",
    views: 99100,
    daysAgo: 0,
    intro:
      "贾史王薛四大家族盛极而衰，宝黛钗木石前盟与金玉良缘交织，一曲红楼万艳同悲。公版古典名著，仅作演示。",
    chapters: [
      {
        title: "第一回 甄士隐梦幻识通灵 贾雨村风尘怀闺秀",
        content: P(
          "此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借通灵之说，撰此《石头记》一书也。",
          "看官：你道此书从何而起？说来虽近荒唐，细玩颇有趣味。原来女娲氏炼石补天之时，于大荒山无稽崖练成高经十二丈、方经二十四丈顽石三万六千五百零一块。"
        ),
      },
    ],
  },
  {
    title: "镜花缘",
    author: "李汝珍",
    category: "kehuan",
    status: "已完结",
    views: 33600,
    daysAgo: 3,
    intro:
      "百花仙子谪入凡尘，唐敖泛海远游，历经君子国、女儿国、大人国等海外奇邦，想象瑰丽。公版幻想小说，仅作演示。",
    chapters: [
      {
        title: "第一回 女魁星北斗垂景象 老王母西池赐芳筵",
        content: P(
          "诗曰：泣红亭畔晓风寒，又见花神降世间。",
          "话说天下名山，惟有海外三十六洞最为灵异。内中有一座蓬莱山，乃神仙聚会之所。"
        ),
      },
    ],
  },
  {
    title: "三侠五义",
    author: "石玉昆",
    category: "wuxia",
    status: "已完结",
    views: 57400,
    daysAgo: 1,
    intro:
      "包龙图断案如神，南侠展昭、御猫与五鼠各显侠义身手，断奇案、惩贪官。公版侠义公案小说，仅作演示。",
    chapters: [
      {
        title: "第一回 设阴谋临产换太子 奋侠义替死救皇娘",
        content: P(
          "话说宋朝自陈桥兵变，黄袍加身，太祖即位，传至真宗皇帝。",
          "且说真宗皇帝，正宫刘后、西宫李妃皆有娠孕。这一段「狸猫换太子」的公案，便由此而起。"
        ),
      },
    ],
  },
  {
    title: "儿女英雄传",
    author: "文康",
    category: "wuxia",
    status: "已完结",
    views: 29800,
    daysAgo: 4,
    intro:
      "侠女十三妹仗义除恶，安公子历经磨难，儿女情长与英雄气概并重。公版侠情小说，仅作演示。",
    chapters: [
      {
        title: "第一回 隐西山闭门课骥子 捷南宫垂老占龙头",
        content: P(
          "这部评话，原是不登大雅之堂的一种小说，初名《金玉缘》。",
          "话说前明永乐年间，有一位老先生，是汉军旗人，姓安，名学海，字水心。"
        ),
      },
    ],
  },
  {
    title: "老残游记",
    author: "刘鹗",
    category: "dushi",
    status: "已完结",
    views: 24500,
    daysAgo: 5,
    intro:
      "摇串铃的江湖郎中老残游历山东，所见所闻，针砭时弊，写尽晚清世态。公版社会小说，仅作演示。",
    chapters: [
      {
        title: "第一回 土不制水历年成患 风能鼓浪到处可危",
        content: P(
          "话说山东登州府东门外有一座大山，名叫蓬莱山。山上有个阁子，名叫蓬莱阁。",
          "这阁造得画栋飞云，珠帘卷雨，十分壮丽。老残一路看山玩水，不觉到了此处。"
        ),
      },
    ],
  },
  {
    title: "儒林外史",
    author: "吴敬梓",
    category: "dushi",
    status: "已完结",
    views: 38900,
    daysAgo: 2,
    intro:
      "科举功名众生相，范进中举、严监生临终，讽刺入骨，笑中带泪。公版讽刺小说，仅作演示。",
    chapters: [
      {
        title: "第一回 说楔子敷陈大义 借名流隐括全文",
        content: P(
          "人生南北多歧路，将相神仙，也要凡人做。百代兴亡朝复暮，江风吹倒前朝树。",
          "话说元朝末年，也曾出了一个嶔崎磊落的人。这人姓王名冕，在诸暨县乡村里住。七岁上死了父亲，他母亲做些针指，供给他到村学堂里去读书。"
        ),
      },
    ],
  },
];

export async function seedIfEmpty(client: Client) {
  const cnt = await client.execute("SELECT COUNT(*) AS n FROM books");
  if (Number(cnt.rows[0].n) > 0) return;

  for (const b of seedBooks) {
    const words = b.chapters.reduce((s, c) => s + c.content.length, 0);
    const r = await client.execute({
      sql: `INSERT INTO books (title, author, category, intro, status, words, views, source, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, '演示·公版', datetime('now', ?))`,
      args: [b.title, b.author, b.category, b.intro, b.status, words, b.views, `-${b.daysAgo} days`],
    });
    const bookId = Number(r.lastInsertRowid);
    await client.batch(
      b.chapters.map((c, i) => ({
        sql: `INSERT INTO chapters (book_id, idx, title, content) VALUES (?, ?, ?, ?)`,
        args: [bookId, i + 1, c.title, c.content],
      })),
      "write"
    );
  }
}

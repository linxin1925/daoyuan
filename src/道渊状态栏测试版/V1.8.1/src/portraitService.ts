/**
 * 立绘服务 — 内置立绘库 + 自定义立绘存储。
 *
 * 内置库从原版 MVU 状态栏提取（charPortraits 167 条 + charPortraitsFemale 33 条）。
 * 自定义立绘存 localStorage 'daoyuan_custom_portraits'，优先于内置。
 */

// 内置立绘库（按角色名 → 立绘 URL）
const charPortraits: Record<string, string> = {
  瑶汐: 'https://free-img.400040.xyz/4/2026/04/25/69ebbf6726ea3.png',
  林雪: 'https://free-img.400040.xyz/4/2026/04/25/69ebbf6728614.png',
  苏沐雪: 'https://free-img.400040.xyz/4/2026/04/25/69ebbf6ae4ed0.png',
  白薇: 'https://free-img.400040.xyz/4/2026/06/18/6a33cca635334.png',
  苏清雪: 'https://free-img.400040.xyz/4/2026/04/25/69ec1fc67ce4e.png',
  叶冰: 'https://free-img.400040.xyz/4/2026/04/25/69ec2002f175a.png',
  玄虚: 'https://free-img.400040.xyz/4/2026/04/25/69ec203083844.png',
  云舒窈: 'https://free-img.400040.xyz/4/2026/04/25/69ec2056498fc.png',
  慧空: 'https://free-img.400040.xyz/4/2026/04/25/69ec207590e70.png',
  般若: 'https://free-img.400040.xyz/4/2026/04/25/69ec209e775a1.png',
  广慧: 'https://free-img.400040.xyz/4/2026/04/25/69ec20c0e5e4f.png',
  紫薇: 'https://free-img.400040.xyz/4/2026/04/25/69ec20dbb6bcc.png',
  大衍: 'https://free-img.400040.xyz/4/2026/04/25/69ec2109303d4.png',
  炎帝: 'https://free-img.400040.xyz/4/2026/04/25/69ec2122ae66d.png',
  曦和: 'https://free-img.400040.xyz/4/2026/04/25/69ec213d38411.png',
  烈阳: 'https://free-img.400040.xyz/4/2026/04/25/69ec2158f146d.png',
  许千寻: 'https://free-img.400040.xyz/4/2026/06/10/6a28ceb9ac6ff.png',
  嫣雨烟: 'https://free-img.400040.xyz/4/2026/04/25/69ec219feb2e8.png',
  唐弎: 'https://free-img.400040.xyz/4/2026/04/25/69ec21d896bf6.png',
  玄清: 'https://free-img.400040.xyz/4/2026/04/25/69ec21f19bd37.png',
  绯月: 'https://free-img.400040.xyz/4/2026/04/25/69ec221297e22.png',
  秦心: 'https://free-img.400040.xyz/4/2026/04/25/69ec22365e9b3.png',
  构军: 'https://free-img.400040.xyz/4/2026/04/25/69ec22549a190.png',
  秦浅月: 'https://free-img.400040.xyz/4/2026/05/13/6a04143e92cce.png',
  幽梦: 'https://i.postimg.cc/L5tjpm6Y/1-10.png',
  噬魂: 'https://free-img.400040.xyz/4/2026/05/13/6a0414e30c529.png',
  天妤: 'https://free-img.400040.xyz/4/2026/05/13/6a041c2621ad0.png',
  红绡: 'https://free-img.400040.xyz/4/2026/06/07/6a2496e980506.png',
  林欣: 'https://free-img.400040.xyz/4/2026/05/13/6a0416f8adcb1.png',
  幽悦: 'https://free-img.400040.xyz/4/2026/06/07/6a249f94a8b9b.png',
  凌月: 'https://i.postimg.cc/63j6DntQ/4-4.png',
  阴罗: 'https://free-img.400040.xyz/4/2026/05/13/6a0417967825c.png',
  晚絮: 'https://free-img.400040.xyz/4/2026/05/13/6a0417c0228a3.png',
  冰凤: 'https://free-img.400040.xyz/4/2026/05/13/6a041803c7b88.png',
  姬紫月: 'https://free-img.400040.xyz/4/2026/05/13/6a04183dd9a71.png',
  李牧: 'https://free-img.400040.xyz/4/2026/05/13/6a0418688ab5e.png',
  萧衍: 'https://free-img.400040.xyz/4/2026/05/13/6a041892ce17f.png',
  萧婉儿: 'https://free-img.400040.xyz/4/2026/05/13/6a0418c3c73ec.png',
  石昊: 'https://free-img.400040.xyz/4/2026/05/13/6a041947ae6db.png',
  苏琉璃: 'https://free-img.400040.xyz/4/2026/05/13/6a04197b477e8.png',
  袁琪: 'https://free-img.400040.xyz/4/2026/05/13/6a0419a1613fb.png',
  孔灵月: 'https://free-img.400040.xyz/4/2026/05/13/6a0419cb62c7c.png',
  蛛心儿: 'https://free-img.400040.xyz/4/2026/05/13/6a0419ecd93d2.png',
  敖凌霜: 'https://free-img.400040.xyz/4/2026/05/13/6a041a09944ab.png',
  银黎: 'https://free-img.400040.xyz/4/2026/05/13/6a041a258d8b3.png',
  宋文: 'https://free-img.400040.xyz/4/2026/05/13/6a041a625e783.png',
  灵玥: 'https://free-img.400040.xyz/4/2026/04/25/69ebba752d5d1.png',
  苏灿灿: 'https://free-img.400040.xyz/4/2026/04/25/69ebbcb198c9f.png',
  温小暖: 'https://free-img.400040.xyz/4/2026/04/25/69ebbc209c0f5.jpg',
  古月方源: 'https://free-img.400040.xyz/4/2026/05/13/6a041b399091c.png',
  侯小妹: 'https://free-img.400040.xyz/4/2026/05/13/6a041c4d36194.png',
  白小纯: 'https://free-img.400040.xyz/4/2026/05/13/6a041c8a97bd4.png',
  龙傲飞: 'https://free-img.400040.xyz/4/2026/05/13/6a041cb836926.png',
  温月清: 'https://free-img.400040.xyz/4/2026/05/13/6a041d1bda8a7.png',
  红蝶: 'https://free-img.400040.xyz/4/2026/05/13/6a041d3d29124.png',
  王林: 'https://free-img.400040.xyz/4/2026/05/13/6a041d60bb106.png',
  苏辰: 'https://free-img.400040.xyz/4/2026/05/13/6a041d91e96dd.png',
  南宫婉: 'https://free-img.400040.xyz/4/2026/05/13/6a041db20d918.png',
  银月: 'https://free-img.400040.xyz/4/2026/05/13/6a041de4d467b.png',
  韩立: 'https://free-img.400040.xyz/4/2026/05/13/6a041e25dbd91.png',
  慕清弦: 'https://free-img.400040.xyz/4/2026/05/05/69f9fb318af62.png',
  林妙音: 'https://free-img.400040.xyz/4/2026/05/13/6a041e637a440.png',
  韩月灵: 'https://free-img.400040.xyz/4/2026/05/13/6a041e8981a37.png',
  叶清: 'https://free-img.400040.xyz/4/2026/05/13/6a041e9f065ad.png',
  江楚楚: 'https://free-img.400040.xyz/4/2026/05/13/6a041eb69bd6e.png',
  舞弦琴: 'https://free-img.400040.xyz/4/2026/05/20/6a0d344824fe3.png',
  秦无夜: 'https://free-img.400040.xyz/4/2026/05/13/6a041f0be4844.png',
  陆雪琪: 'https://free-img.400040.xyz/4/2026/05/13/6a041f395a25d.png',
  苏千媚: 'https://free-img.400040.xyz/4/2026/05/13/6a041f643ef4e.png',
  苏媚: 'https://free-img.400040.xyz/4/2026/05/13/6a041f8d009c1.png',
  商心慈: 'https://free-img.400040.xyz/4/2026/05/13/6a041fa9eb250.png',
  玖柒: 'https://free-img.400040.xyz/4/2026/05/13/6a041fca5427f.png',
  宫银叶: 'https://free-img.400040.xyz/4/2026/06/07/6a2497102d445.png',
  红莲: 'https://free-img.400040.xyz/4/2026/04/30/69f3047ced213.png',
  星宿: 'https://free-img.400040.xyz/4/2026/06/04/6a210f67bc6da.png',
  公孙清: 'https://free-img.400040.xyz/4/2026/06/07/6a2500200a15f.png',
  凤灵儿: 'https://free-img.400040.xyz/4/2026/05/13/6a04202dbc59f.png',
  南可熙: 'https://free-img.400040.xyz/4/2026/05/13/6a04204c9a7b3.png',
  乔梦玉: 'https://free-img.400040.xyz/4/2026/06/07/6a249a7335036.png',
  阳宇: 'https://free-img.400040.xyz/4/2026/06/07/6a249a8b59da6.png',
  玄璃: 'https://free-img.400040.xyz/4/2026/06/07/6a249ba3e3222.png',
  林寒绾: 'https://free-img.400040.xyz/4/2026/06/07/6a249b8b4c166.png',
  元容: 'https://free-img.400040.xyz/4/2026/06/07/6a249c050921f.png',
  慕欣心: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd4d517e95.png',
  楚星绾: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd70442357.png',
  上官玥: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd943bc5e2.png',
  柳依依: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd50bdf761.png',
  顾长枫: 'https://free-img.400040.xyz/4/2026/06/07/6a249db19cfbb.png',
  林若悠: 'https://free-img.400040.xyz/4/2026/06/07/6a249fca25c0a.png',
  萧玉寒: 'https://free-img.400040.xyz/4/2026/05/19/6a0bda27c720f.png',
  苏清禾: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd752758ba.png',
  云糯糯: 'https://free-img.400040.xyz/4/2026/06/07/6a249c4671c78.png',
  苏绾影: 'https://free-img.400040.xyz/4/2026/05/19/6a0bdc8167192.png',
  凌阮阮: 'https://free-img.400040.xyz/4/2026/05/20/6a0d372502ecc.png',
  叶倾心: 'https://free-img.400040.xyz/4/2026/05/20/6a0d32498cf66.png',
  汐怡: 'https://free-img.400040.xyz/4/2026/05/19/6a0bdfa916b95.png',
  桃夭夭: 'https://free-img.400040.xyz/4/2026/05/20/6a0d3758b8f24.png',
  顾幽梵: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd5a27d8a2.png',
  苏珞刹: 'https://free-img.400040.xyz/4/2026/06/07/6a24a036e015a.png',
  霖仙怡: 'https://free-img.400040.xyz/4/2026/05/19/6a0be066d7ff0.png',
  冥霜儿: 'https://free-img.400040.xyz/4/2026/06/07/6a24a010b9e66.png',
  楚玉璃: 'https://free-img.400040.xyz/4/2026/05/20/6a0d38a34b4ee.png',
  白玖璃: 'https://free-img.400040.xyz/4/2026/05/20/6a0d320411d0f.png',
  青木璇: 'https://free-img.400040.xyz/4/2026/06/07/6a249efcee3e9.png',
  璃杏: 'https://free-img.400040.xyz/4/2026/06/07/6a249ea3ddeda.png',
  杜月菲: 'https://free-img.400040.xyz/4/2026/05/20/6a0d383aed23b.png',
  慕容无尘: 'https://free-img.400040.xyz/4/2026/05/20/6a0d3a8ca682c.png',
  慕容初袖: 'https://free-img.400040.xyz/4/2026/06/07/6a249d4d6d571.png',
  慕容落羽: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd5da36eac.png',
  萌梦: 'https://free-img.400040.xyz/4/2026/05/20/6a0d7aa83d0ed.png',
  钰仙儿: 'https://free-img.400040.xyz/4/2026/05/19/6a0be2cf0602e.png',
  青渝: 'https://free-img.400040.xyz/4/2026/05/19/6a0c06419fa4b.png',
  齐天麟: 'https://free-img.400040.xyz/4/2026/05/19/6a0c0ec43c08d.png',
  风梧音: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd6468bf2e.png',
  秦汐雅: 'https://free-img.400040.xyz/4/2026/05/19/6a0bd6228b29a.png',
  凌天辰: 'https://free-img.400040.xyz/4/2026/05/19/6a0c1431ab96d.png',
  凌紫嫣: 'https://free-img.400040.xyz/4/2026/05/19/6a0c1fb9923cd.png',
  叶婷: 'https://free-img.400040.xyz/4/2026/05/19/6a0c1fdb3b5d1.png',
  朱离: 'https://free-img.400040.xyz/4/2026/05/19/6a0c23c8e522d.png',
  侯景: 'https://free-img.400040.xyz/4/2026/05/19/6a0c239da5acf.png',
  长孙镜华: 'https://free-img.400040.xyz/4/2026/05/20/6a0d392aafe65.png',
  柳青螭: 'https://free-img.400040.xyz/4/2026/06/07/6a249785b7cbe.webp',
  希夷: 'https://free-img.400040.xyz/4/2026/05/19/6a0c066a7ba7a.png',
  辟易川: 'https://free-img.400040.xyz/4/2026/05/19/6a0c226a12d15.png',
  欧阳灵: 'https://free-img.400040.xyz/4/2026/05/20/6a0d34eed1224.png',
  黑姬结灯: 'https://free-img.400040.xyz/4/2026/05/20/6a0d3ac968bf1.png',
  李未晞: 'https://free-img.400040.xyz/4/2026/05/19/6a0c22bcd892b.png',
  九歌: 'https://free-img.400040.xyz/4/2026/05/19/6a0c22ed5fa30.png',
  小D: 'https://free-img.400040.xyz/4/2026/05/20/6a0d32271c875.png',
  阴丽华: 'https://free-img.400040.xyz/4/2026/05/19/6a0c229554114.png',
  晏青: 'https://free-img.400040.xyz/4/2026/05/20/6a0d37e2a17e2.png',
  白祈昼: 'https://free-img.400040.xyz/4/2026/05/20/6a0d3e1729a28.png',
  绛鳞王: 'https://free-img.400040.xyz/4/2026/05/20/6a0d9079a270b.png',
  青练: 'https://free-img.400040.xyz/4/2026/05/20/6a0d906620b53.png',
  青衣: 'https://free-img.400040.xyz/4/2026/05/20/6a0d9079a270b.png',
  柳舞蝶: 'https://free-img.400040.xyz/4/2026/06/07/6a2497ffe2232.webp',
  海伊: 'https://free-img.400040.xyz/4/2026/06/07/6a24fcfd43387.png',
  小显示: 'https://free-img.400040.xyz/4/2026/06/07/6a24973ddee21.png',
  显宝: 'https://free-img.400040.xyz/4/2026/06/07/6a24973ddee21.png',
  叶焚渊: 'https://free-img.400040.xyz/4/2026/06/07/6a24987e731ee.png',
  万璇玑: 'https://free-img.400040.xyz/4/2026/06/01/6a1cf19bbae5e.png',
  万金柝: 'https://free-img.400040.xyz/4/2026/06/07/6a249687d9f15.png',
  小翠: 'https://free-img.400040.xyz/4/2026/06/01/6a1c5de8a2615.png',
  金玉满: 'https://free-img.400040.xyz/4/2026/06/04/6a21118a598c8.png',
  紫澪: 'https://free-img.400040.xyz/4/2026/06/07/6a24983c2cfae.png',
  璃宫火花: 'https://free-img.400040.xyz/4/2026/05/25/6a1457853b3c2.png',
  白疏影: 'https://i.postimg.cc/2SrQjNnb/IMG-4083.png',
  白倾颜: 'https://i.postimg.cc/BZNs7xNk/1782741214-03a5f0675dfde9d311cb3eab35e410f0-1.png',
  云初未来: 'https://i.postimg.cc/nz285JKj/6800FF80-0202-4E0F-B4CE-34BFEE818FA2.png',
  姜梦: 'https://i.postimg.cc/nV1cb8cp/e545aea65f57427b.png',
  魏喑: 'https://i.postimg.cc/5yDzWZb8/2e8770d4-224b-4ff5-8803-01e55ef680d8-0.png',
  李铭: 'https://i.postimg.cc/Xqts1HPG/mmexport1782276180132.jpg',
  林素铃: 'https://i.postimg.cc/4NV3LK7Y/21-1.png',
  燕重微: 'https://i.postimg.cc/kgTfkgL8/file-000000005fac71fba349f383259a100a.png',
  姬觅弥: 'https://i.postimg.cc/8cLZ3BVG/file-000000004cb0723089c308297182fe86.png',
  苏慕渊: 'https://i.postimg.cc/Jhycvcbd/1782467601-02b30792fbeb573622cd885b790c9cf6-1.png',
  桃夭诺: 'https://i.postimg.cc/8cKPWWjn/3-4.png',
  颜小落: 'https://i.postimg.cc/hP27bzH5/9-1.png',
  桃幽: 'https://i.postimg.cc/YqCv92hm/3-3.png',
  代安池: 'https://i.postimg.cc/mknY2PNG/a44c6c6b-463e-4ae7-bb38-407fdaa1a201.png',
  君姝: 'https://i.postimg.cc/4dXWHhCN/file-00000000cf74720692aabe3b2f52f203.png',
  卡斯蒂利亚哈布斯堡: 'https://i.postimg.cc/Pqymc3cp/c8741b7d7056417ea5707ea529c55461-2.png',
  樊月汐: 'https://i.postimg.cc/nLg4Kj95/1-1.png',
  百铃: 'https://i.postimg.cc/3Npn0jLz/430335e7-176c-4552-ad31-341d214038e0.png',
  李溯: 'https://i.postimg.cc/7hmM2B3T/file-000000007cc07206960e238cefbe92f7.png',
  苏清漪: 'https://i.postimg.cc/bJxbf6dQ/file-00000000de8071fb9f70479c21e42f1f.png',
  顾清清: 'https://i.postimg.cc/Z5Rvf83K/4-5.png',
};

// 女性专用立绘库（同名女性角色优先用此库）
const charPortraitsFemale: Record<string, string> = {
  晏青: 'https://i.postimg.cc/sXDFk4Pn/2bc928d7-82ed-4158-80bd-f37d0884771f.png',
  辟易川: 'https://i.postimg.cc/sxkNgYWS/e8079d39-152b-4a10-8f10-d5c85652d5d4.png',
  侯景: 'https://i.postimg.cc/3JPTkp75/d5011d43-a4eb-4a31-b5d2-8d9dd189453b.png',
  凌天辰: 'https://i.postimg.cc/gjh1bS7B/a874b439-4ac2-4214-80f6-b9ca435d64b4.png',
  齐天麟: 'https://i.postimg.cc/kgQYctry/17.png',
  慕容无尘: 'https://i.postimg.cc/kgqzLyv1/355e3c51-546d-44df-adad-3088d7aaf27a.png',
  顾幽梵: 'https://i.postimg.cc/Vv0DbJBM/3-3.png',
  顾长枫: 'https://i.postimg.cc/8zGgNGN4/1-18.png',
  元容: 'https://i.postimg.cc/SNqM9XGw/bd25cca4-d52a-4a99-a8ee-c751c35b2771.png',
  阳宇: 'https://i.postimg.cc/d1p9vqPM/98a7a387-0a32-471f-bf07-b9117621a453.png',
  秦无夜: 'https://i.postimg.cc/PNGdn85P/9-1.png',
  韩立: 'https://i.postimg.cc/KY9FvW8D/20127407-c254-4c54-849d-90a4c80baa99.png',
  苏辰: 'https://i.postimg.cc/pXP0qLZh/90f5f6d8-e93a-4546-a370-d0e0fcea96c8.png',
  王林: 'https://i.postimg.cc/sfLFLSMZ/3f4a26ce-7bdf-466d-aac0-eac533ba7d44.png',
  龙傲飞: 'https://i.postimg.cc/LXNqSDry/48e1362c-2ce5-46b2-9052-24da8f5520b7.png',
  白小纯: 'https://i.postimg.cc/PrFmYXVV/76470027-f091-4130-ab6a-e111f81abb59.png',
  古月方源: 'https://i.postimg.cc/BQGWs3Cb/3831756b-03c4-4b64-8a47-b687de45ff64.png',
  宋文: 'https://i.postimg.cc/JzHx6Dfw/file-000000005e5472078e3d1c621b29398d.png',
  石昊: 'https://i.postimg.cc/W3jrThtw/175b2a95-f5d4-4a33-8c86-c4205f5be4e6.png',
  萧衍: 'https://i.postimg.cc/7Zwy14Cs/4045dd78-0c7c-4c67-a374-4adcf6845a5d.png',
  李牧: 'https://i.postimg.cc/4NncfC4p/4207dac4-1ccb-46b0-8961-5cdbab6733ed.png',
  姬昊天: 'https://i.postimg.cc/YCqsqCGZ/08ad214f-c685-4dd9-b7ec-aaec20167ec1.png',
  阴罗: 'https://i.postimg.cc/MKb130Tv/content-13.png',
  噬魂: 'https://i.postimg.cc/ryHm9Dc7/2-9.png',
  构军: 'https://i.postimg.cc/j5ZT2Fdr/1d3975d0-dcd9-49f8-8463-0f7d12286555.png',
  玄清: 'https://i.postimg.cc/RV33rcXx/1-25.png',
  唐弎: 'https://i.postimg.cc/bNYT1Fyg/2aa49696-4bda-4597-8210-05beb8d23eae.png',
  烈阳: 'https://i.postimg.cc/Hndfw4nD/2-10.png',
  炎帝: 'https://i.postimg.cc/Y913z5Lh/9029c056-d311-4ffb-8e56-512ec5050cdc.png',
  广慧: 'https://i.postimg.cc/V6nJr1rZ/96dc295b-fc7e-4209-a0e0-8535d26d008e.png',
  慧空: 'https://i.postimg.cc/BQyq2kTg/1e139b23-3e03-422f-9d92-522c73b0031a.png',
  玄虚: 'https://i.postimg.cc/hvCch3sq/cf50bab3-8c4c-40a3-bfe6-9f62666bfdca.png',
  万金柝: 'https://i.postimg.cc/9Qk0Lzyk/ef78d864-8717-4829-808c-da52dbc7f6b9.png',
};

const K_CUSTOM = 'daoyuan_custom_portraits';
const K_FEMALE_PREF = 'daoyuan_female_portraits';

function loadCustom(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(K_CUSTOM) || '{}');
  } catch {
    return {};
  }
}

/** 读取"女版偏好"集合：用户显式选择过女版的角色名 */
function loadFemalePref(): Record<string, true> {
  try {
    const v = JSON.parse(localStorage.getItem(K_FEMALE_PREF) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

/** 该角色是否被用户显式标记为"显示女版" */
export function isFemalePreferred(name: string): boolean {
  return name in loadFemalePref();
}

/**
 * 设置/取消某角色的女版偏好。
 * 仅当 on 且该角色存在女版立绘时才会记录；否则视为取消。
 */
export function setFemalePortrait(name: string, on: boolean): void {
  const all = loadFemalePref();
  const hasFemale = hasFemalePortrait(name);
  if (on && hasFemale) all[name] = true;
  else delete all[name];
  localStorage.setItem(K_FEMALE_PREF, JSON.stringify(all));
}

/**
 * 名字归一化：去掉间隔号（·、・），用于兼容 AI 生成的"卡斯蒂利亚·哈布斯堡"等变体。
 * 例如 "卡斯蒂利亚·哈布斯堡" -> "卡斯蒂利亚哈布斯堡"，使其命中库里的无间隔号条目。
 */
function normName(name: string): string {
  return name.replace(/[·・]/g, '');
}

/** 按名查表，先试原名再试归一化名（去间隔号） */
function lookup(map: Record<string, string>, name: string): string | undefined {
  return map[name] ?? map[normName(name)];
}

/**
 * 获取角色立绘 URL。
 * 优先级：自定义立绘 > 女版偏好 > 性别自动女版（gender 以"女"开头）> 通用立绘库
 */
export function getPortraitUrl(name: string, gender?: string): string {
  const custom = loadCustom();
  if (lookup(custom, name)) return lookup(custom, name)!;
  if (isFemalePreferred(name) && lookup(charPortraitsFemale, name)) return lookup(charPortraitsFemale, name)!;
  if (gender && /^女/.test(gender) && lookup(charPortraitsFemale, name)) return lookup(charPortraitsFemale, name)!;
  return lookup(charPortraits, name) || '';
}

/** 是否有立绘（内置或自定义） */
export function hasPortrait(name: string, gender?: string): boolean {
  return !!getPortraitUrl(name, gender);
}

/** 该角色是否存在女版立绘 */
export function hasFemalePortrait(name: string): boolean {
  return name in charPortraitsFemale || normName(name) in charPortraitsFemale;
}

/** 获取女版立绘 URL（不受自定义立绘影响，仅用于查看界面的切换预览） */
export function getFemalePortraitUrl(name: string): string {
  return charPortraitsFemale[name] || charPortraitsFemale[normName(name)] || '';
}

/** 获取默认（男版/通用）立绘 URL（不受自定义与性别自动逻辑影响） */
export function getDefaultPortraitUrl(name: string): string {
  return charPortraits[name] || charPortraits[normName(name)] || '';
}

/** 是否为自定义立绘 */
export function isCustomPortrait(name: string): boolean {
  const all = loadCustom();
  return name in all || normName(name) in all;
}

/** 设置自定义立绘（URL 或 base64） */
export function setCustomPortrait(name: string, url: string): void {
  const all = loadCustom();
  if (url) {
    all[name] = url;
  } else {
    // 删除时同时清掉原名与归一化名，避免间隔号变体残留
    delete all[name];
    delete all[normName(name)];
  }
  localStorage.setItem(K_CUSTOM, JSON.stringify(all));
}

/** 删除自定义立绘 */
export function removeCustomPortrait(name: string): void {
  setCustomPortrait(name, '');
}

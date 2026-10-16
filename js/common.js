/* ================= 状态（localStorage） ================= */
var SAVE_KEY='huinantian_save_v1';
var DEFAULT_STATE={
  found:false, sawNeg:false, devIndex:0, devStage:0,
  collected:[], recognized:false, endings:[], pickupTries:0,
  gates:{trap:false,member:false,loop:false,stare:false,double:false},
  emptySeen:false, nameTries:0,
  chem:[], chemDone:false,
  keyOpen:false, keyTries:0,
  tokens:{code:false,work:false,seal:false}
};
function clone(o){ return JSON.parse(JSON.stringify(o)); }
var State={
  data:null,
  load:function(){
    try{ this.data=JSON.parse(localStorage.getItem(SAVE_KEY))||clone(DEFAULT_STATE); }
    catch(e){ this.data=clone(DEFAULT_STATE); }
    // 兼容字段补齐
    for(var k in DEFAULT_STATE){ if(this.data[k]===undefined) this.data[k]=clone(DEFAULT_STATE[k]); }
  },
  save:function(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(this.data)); }catch(e){} },
  reset:function(){ this.data=clone(DEFAULT_STATE); this.save(); }
};

/* ================= 常量数据 ================= */
/* 暗房钥匙：老陈工号 = 照相馆开张年份（1966）。防 F12 剧透，只存拆开的两段。 */
var KEYP1='19', KEYP2='66';
var WORDS=['周','梦','回','放','手','吧'];
/* 六字寻访：每个字藏在店里一个角落，玩家需全站探索。暗房只提示位置。 */
var CHAR_HINTS=[
  {ch:'周', where:'样片墙 · 全家福（那张合影右下角）'},
  {ch:'梦', where:'顾客留言 · 最后那条，问我"看到我没有"'},
  {ch:'回', where:'摄影器材 · 海鸥4A 编号旁（被油污盖住的地方）'},
  {ch:'放', where:'价目表 · 收据样张（"未取"二字旁边）'},
  {ch:'手', where:'站内搜索 · 搜“它”或“它们”，守则最后一句'},
  {ch:'吧', where:'取件之后 · 照片背面（反色才看得见）'}
];
function collectChar(ch){
  var s=State.data;
  if(s.collected.indexOf(ch)>=0){ toast('这枚针尖字，你早已收下。'); return false; }
  s.collected.push(ch); State.save();
  var w='某处';
  for(var i=0;i<WORDS.length;i++){ if(WORDS[i]===ch) w=CHAR_HINTS[i].where; }
  toast('针尖刻着一枚字：『'+ch+'』——来自'+w);
  return true;
}
var NEG_BGS=[
  'linear-gradient(180deg,#d8cba8,#a89878)',
  'linear-gradient(180deg,#e8dcc4,#b8a888)',
  'linear-gradient(180deg,#f0e8d6,#c8bc9e)',
  'linear-gradient(180deg,#d0c4a6,#a89876)',
  'linear-gradient(180deg,#e0d4bc,#b0a080)',
  'linear-gradient(180deg,#e8dcc4,#c0b090)'
];
function item(type,title,body){ return {type:type,title:title,body:body}; }
var SEARCH={
  '梁思粤':[
    item('顾客档案','梁思粤 · 婚纱合影（未取）','1996年3月登记。顾客梁思粤，与未婚夫一同拍摄婚纱合影，照片袋编号的四位，要从店里两处线索拼出来。<b>状态：多年未取</b>。'),
    item('暗房记录','思粤的显影记录','该顾客在老暗房进出多次，似乎一直在找什么人。她对老陈师傅说："我要找的人，其实没走。"')
  ],
  '思粤':[ item('顾客档案','梁思粤（简称"思粤"）','老顾客，常与未婚夫同来。详见"梁思粤"。') ],
  '周梦回':[ item('旧记录','周梦回','该名字仅在一张未取合影的照片袋上出现，身份为梁思粤的未婚夫。<b>顾客名册中，查无此人。</b>') ],
  '永光照相馆':[ item('照相馆介绍','永光照相馆','创办于1966年，城里最老的照相馆，掌柜老陈师傅。地址：骑楼老街33号。') ],
  '合影':[ item('样片','合影样片','合影是最容易"出问题"的照片——人多，偶尔会多出一个不该在的人。') ],
  '订婚照':[ item('服务','订婚照','含在婚纱摄影套餐内，另赠一张合影。梁思粤的订婚照与合影，在同一张照片袋里。') ],
  '未取':[ item('柜台记录','未取照片','店内有多卷长期未取的照片。最旧的一卷是1996年梁思粤的婚纱合影——她始终没来取走。') ],
  '样片墙':[ item('店内','样片墙','进门左手边的照片墙，挂满顾客同意展示的样片。若看到角落多了人，可到留言板告知。') ],
  '底片':[ item('摄影知识','底片','胶卷冲洗后得到的负片，明暗与色彩均与实物相反。底片翻到背面，有时会被人用针尖刻字。') ],
  '照片袋':[ item('柜台','照片袋','每卷照片装在一个牛皮纸袋里，袋上印着四位编号，凭编号取件。') ],
  '钥匙':[ item('暗房','暗房钥匙','老陈那把进暗房的钥匙，从不借人。钥匙柄上刻着四个数字——老陈只说，那是照相馆开张那年。') ],
  '0933':[ item('取件线索','编号0933','柜台登记簿上有这条编号的记录，可那编号是你从两处拼出来的——前两位在器材保养记录，后两位在价目表收据。') ],
  '暗房':[ item('内部','老暗房','冲洗、显影照片的房间，常年亮着红色安全灯。<b>它的门不在明处</b>——老陈说，那门藏在样片墙某张合影背后，取到照片的人，才看得见门缝里的红光。') ],
  '红灯':[ item('暗房','安全灯','暗房里只点红色安全灯，因为相纸对红光不敏感。红光下，照片慢慢浮现。') ],
  '放大机':[ item('器材','放大机','把底片的影像投射到相纸上的设备。用它放大时，要格外小心底片摆放。') ],
  '显影':[ item('暗房流程','显影','相纸在显影液里，影像会从无到有慢慢浮现，急不得。') ],
  '定影':[ item('暗房流程','定影','显影后把影像固定下来的工序。一旦定影，照片便再也无法改变。') ],
  '显影液':[ item('暗房','显影液','D-76显影液，让底片上的潜影变成看得见的影像。<b>暗房里的第一道工序。</b>回南天要格外注意药液配比，否则会显影失败。') ],
  '停显':[ item('暗房流程','停显液','酸性停显液，让显影立刻停住——影像一到浓淡正好，就马上捞出来过停显，不然会一直显下去、显过头。') ],
  '定影液':[ item('暗房流程','定影液','硫代硫酸钠（老师傅叫它"海波"）。把没感光的银盐溶掉，影像才固定下来、不会见光就褪。<b>在停显之后，水洗之前。</b>') ],
  '水洗':[ item('暗房流程','水洗','把定影后残留在相纸里的药液冲干净。不水洗，照片放几年就发黄发霉——回南天的潮气最吃这一套。') ],
  '乳剂面':[ item('摄影知识','乳剂面','底片上有感光乳剂的那一面，成像面。显影时乳剂面朝上放，放反了，照片怎么显都是空的。') ],
  'D-76':[ item('摄影知识','D-76显影液','柯达的标准微粒显影液，一包药粉兑水，暗房里最常用的配方。') ],
  '硫代硫酸钠':[ item('摄影知识','硫代硫酸钠','俗称"海波"，定影液的主要成分，见"定影液"。') ],
  '相纸':[ item('材料','相纸','用来洗照片的纸，对红光不敏感，对白光极为敏感。') ],
  '过曝':[ item('摄影知识','过曝','曝光过度，画面过亮直至一片白。有时，过曝是一种温柔的放手。') ],
  '欠曝':[ item('摄影知识','欠曝','曝光不足，画面暗淡、影像模糊，最终什么也看不清。') ],
  '胶卷':[ item('器材','胶卷','记录影像的卷片，有135、120等规格。') ],
  '135胶卷':[ item('器材','135胶卷','最常见的胶卷规格，配合DF-1单反使用。') ],
  '120相机':[ item('器材','海鸥4A · 120双反','老伙计。编号被油污盖住了大半，只认得出开头是09。保养记录里或许能看清。') ],
  '快门':[ item('摄影知识','快门','控制光线进入时间的装置，与光圈一同决定曝光。') ],
  '光圈':[ item('摄影知识','光圈','控制进光量的装置，开得越大，照片越亮、景深越浅。') ],
  '曝光':[ item('摄影知识','曝光','光线落在相纸上的过程。过曝、欠曝，都是曝光的不同结果。') ],
  '温度计':[ item('器材','暗房温度计','回南天药液温度浮动大，老陈只认一个数：显影液要<b>20℃</b>，低了显不出影像，高了照片发灰、显过头。') ],
  '显影时间':[ item('摄影知识','显影时间','操作规程上写着：显影液里<b>3分钟</b>，到浓淡正好就立刻捞出来过停显。久了显过头，短了显不出来。') ],
  '回南天':[ item('天气','回南天','南方春天的潮湿天气，墙上出水，底片易发霉，也是那年火灾发生的季节。') ],
  '发霉':[ item('保存','底片发霉','潮湿会让底片发霉、粘连。所以店里总提醒顾客尽早取件。') ],
  '骑楼':[ item('地址','骑楼老街','照相馆所在的老街，沿街是带骑楼的老建筑，门牌号33。') ],
  '火':[ item('档案','1996年的火','那年回南天，老楼电线老化，深夜起火，烧毁了老暗房。一位年轻顾客在那夜之后再没出现。') ],
  '火灾':[ item('档案','火灾详情','火并不大，却带走了一位冲进暗房救人的年轻人。他叫周梦回。活下来的人，是梁思粤。') ],
  '老陈师傅':[ item('人物','掌柜老陈','照相馆掌柜，拍过三代人的脸。他守着一位顾客未取的照片，也守着那个没说出口的真相。') ],
  '掌柜':[ item('人物','掌柜','即老陈师傅。') ],
  /* 摄影术语 / 器材 */
  '重曝':[ item('摄影知识','重曝','同一张相纸曝光两次，两个影像叠在一起。在永光照相馆，重曝是禁忌——叠出来的，往往是两个人都不想看到的样子。') ],
  '安全灯':[ item('暗房','安全灯','即红色安全灯，见"红灯"。它偶尔会自己闪，老陈说那是线路老化。') ],
  '底片册':[ item('器材','底片册','暗房里存放底片的册子，一页页插着负片。有些底片上，被人用针尖刻了字。') ],
  '三脚架':[ item('器材','三脚架','架相机的三只脚。拍合影时，掌柜按下自拍快门，再快步走进队伍。') ],
  '镜头':[ item('器材','镜头','相机的眼睛。老师傅擦镜头时总对着光看，说镜头里会留下拍过的人。') ],
  '对焦':[ item('摄影知识','对焦','让影像清晰的过程。有些照片怎么也对不准焦——因为那个人，已经不在了。') ],
  '景深':[ item('摄影知识','景深','照片里清晰的范围。景深越浅，背景越虚，看不清的地方越多。') ],
  '胶片':[ item('器材','胶片','胶卷的统称，见"胶卷"。') ],
  '相簿':[ item('店内','相簿','供顾客翻看的相册，收着历年样片。') ],
  '快门线':[ item('器材','快门线','一根连着快门的线，拍合影时站在相机旁捏一下，避免碰歪相机。') ],
  /* 顾客 / 人物 */
  '陈守业':[ item('人物','陈守业','老陈师傅的本名。他爹说，守业守业，守住这间铺子。他守了一辈子，也守着一卷没取的照片。') ],
  '张婶':[ item('顾客','张婶','老街坊。火后那几年，张婶总说夜里路过照相馆，暗房的红灯还亮着——可那栋楼，早就断了电。') ],
  '李伯':[ item('顾客','李伯','三代人都在永光照相馆拍的合影。他说，老陈的相机记得每个人年轻时的样子。') ],
  '阿珍':[ item('顾客','阿珍','拍过婚纱照。取件那天她对着照片哭了很久，说照片里，多了一个人。') ],
  '林晓':[ item('顾客','林晓','学生，毕业合影里有她。') ],
  '苏婉':[ item('顾客','苏婉','补拍过一次写真——第一次洗出来，她觉得照片里的表情不像自己。') ],
  '王阿姨':[ item('顾客','王阿姨','全家福，三代同堂。') ],
  /* 地点 / 物件 */
  '后巷':[ item('地址','后巷','照相馆后门的小巷，堆着旧相框和过期药水。') ],
  '空相框':[ item('物件','空相框','拆迁后，废墟里散落着许多空相框。照片里的人，都不知去了哪里。') ],
  '婚纱':[ item('服务','婚纱','婚纱摄影用的礼服，橱窗里也挂着一件。') ],
  '老照片':[ item('物件','老照片','店里收着从1966年起的老照片。') ],
  /* 恐怖词条（暗房守则 / 旧记录） */
  '多出来的人':[ item('暗房守则','关于多出来的人','拍合影时，老陈会数一遍人数。可洗出来的照片，总比按下快门时多一个。<br><b>守则：不要去数照片里的人。数到最后，会数到你自己。</b>') ],
  '凝视':[ item('暗房守则','关于凝视','有些照片洗出来，照片里的人都看着镜头外面。无论你站在哪个位置，他们都看着你。') ],
  '眼睛':[ item('暗房守则','关于眼睛','底片最怕的不是曝光，是你盯着它看太久。') ],
  '数人头':[ item('旧记录','单位合影 · 1995','登记126人。冲洗出来，最后一排有127张脸。<br><span class="small muted">第127个，在看我。</span>') ],
  '它':[ item('暗房守则','关于它','不要给它起名字。一旦叫出名字，它就知道你看得见。<br><span class="small muted">守则的最后一句，被针尖扎得发白——</span><span class="prick" id="ch-手">手</span>') ],
  '它们':[ item('暗房守则','关于它们','它们不是鬼。是还没洗出来、也舍不得走的人。') ],
  '最后一排':[ item('旧记录','最后一排','大合影的最后一排，总站着一些看不清脸的人。老陈说，那是背景布的阴影。') ],
  /* ===== 暗房手记（恐怖结局前置旧档，搜到即解锁） ===== */
  '显影盘':[ item('暗房手记','手记 · 关于显影盘','老陈的徒弟阿成，1994年回南天的一个夜里独自显影。第二天，人不见了。<br>显影盘里只剩一张刚洗好的照片，照片里的人是阿成——他的手还保持着伸进药液的姿势。<br><b>守则：显影时若盘里浮现脸，别应它，也别伸手。它在等你确认——你看得见。</b>') ],
  '学徒':[ item('暗房手记','徒弟阿成','老陈的徒弟，1994年回南天在显影盘前失踪。详见"显影盘"。') ],
  '花名册':[ item('暗房手记','手记 · 关于合影','1995年机械厂的单位合影，花名册登记126人。照片洗出来，最后一排站着127张脸。<br>冲印的师傅数了三遍，最后一遍没敢数完。<br>后来有个年轻人说要补拍，主动站到最后一排那个空出来的位置。快门按下之后，他再没从照相馆走出来。<br><b>守则：合影若空着位置，不要站过去。</b>') ],
  '127':[ item('旧记录','127张脸','1995年单位合影，登记126人，洗出127张脸。详见"花名册"。') ],
  '第七张':[ item('暗房手记','手记 · 关于底片','柜上记梁思粤显影的底片是六张。可收拾底片册的人说，每次合上，最底下都还压着一张。<br>第一张没编号，第二张也没编号。<br>有人不信邪，一张一张往下翻。他翻到第七张时，里面浮现的是他自己；再往后，每一张都是他。<br><b>守则：没有最后一张底片。别翻。</b>') ],
  '下一张':[ item('暗房手记','下一张','"没有最后一张底片。"详见"第七张"。') ],
  '对视':[ item('暗房手记','手记 · 关于黑屏','店里有两张照片，谁洗谁做噩梦，最后只能锁进柜子。<br>它们最怕的不是你不看，是你看一眼就移开。<br>它们最想要的，是你在黑屏里一直看下去——然后，回头看一眼。<br><b>守则：黑屏里的字走完，离开，别回看。它在等你，和它对视。</b>') ],
  '回看':[ item('暗房手记','回看','"别回看。"详见"对视"。') ]
};
var FAKE=['数码相机','手机','自拍','美颜','滤镜','证件照','快照','立等可取','团购','写真','旅拍','模特','网红','跟拍','优惠','风景照',
  '修图','数码','像素','无人机','CCD','存储卡','读卡器','网盘','云相册','微信','二维码','电子相册','直播','短视频','数码单反','手机拍照','复古滤镜',
  '老板娘','冲洗券','干洗','老相册','相框','艺术照','免冠','定妆','摆拍','补光','测光表','快门声','柯达','富士','乐凯','暗袋','烘干','放大纸','冲印店','老照片修复'];

/* 搜索命中这些词时，解锁对应恐怖结局的前置门槛 */
var GATE_WORDS={
  '显影盘':'trap','学徒':'trap',
  '花名册':'member','127':'member',
  '第七张':'loop','下一张':'loop',
  '对视':'stare','回看':'stare',
  '重曝':'double'
};
function markGate(key){
  var g=GATE_WORDS[key];
  if(g && !State.data.gates[g]){
    State.data.gates[g]=true;
    State.save();
    return true;
  }
  return false;
}

/* ================= 工具函数 ================= */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function go(url){ window.location.href=url; }
/* 针尖字：几乎看不见，hover 微现，点击收集 */
function prick(opt){
  var el=document.getElementById(opt.id);
  if(!el) return;
  el.classList.add('prick');
  if(opt.ch) el.setAttribute('data-char',opt.ch);
  el.addEventListener('click',function(e){
    e.stopPropagation();
    if(opt.ch) collectChar(opt.ch);
  });
}
/* 凭证收集（真相之锁：照片袋编号 / 老陈工号 / 暗房手记印章） */
function collectToken(k){
  var s=State.data;
  if(!s.tokens[k]){ s.tokens[k]=true; State.save(); return true; }
  return false;
}
/* 全局低语：每隔一阵，页面角落浮现一句极淡的怪话，几秒后消散 */
var WHISPERS=[
  '……他还在里面。','别走。','你数到几个人？','灯，是谁点亮的。',
  '那张照片，多了一个人。','水声。一直有。','它知道你来了。','别回看。'
];
function scheduleWhisper(){
  setTimeout(function(){
    var body=document.body;
    if(body.querySelector('.whisper')) body.querySelector('.whisper').remove();
    var w=document.createElement('div');
    w.className='whisper';
    w.textContent=WHISPERS[Math.floor(Math.random()*WHISPERS.length)];
    w.style.left=(8+Math.random()*70)+'%';
    w.style.top=(20+Math.random()*60)+'%';
    body.appendChild(w);
    setTimeout(function(){ w.classList.add('show'); },50);
    setTimeout(function(){ w.classList.remove('show'); },2600);
    setTimeout(function(){ w.remove(); },3200);
    scheduleWhisper();
  },26000+Math.random()*30000);
}
if(document.body && !document.body.classList.contains('dark') && !document.getElementById('no-whisper')){
  scheduleWhisper();
}
/* 结局守卫：只有真正触发过（endings 已标记）的结局才允许查看，否则静默回首页 */
function guardEnding(key){
  if(State.data.endings.indexOf(key)<0){ go('index.html'); }
}
function ensureToast(){
  if(!document.getElementById('toast')){
    var t=document.createElement('div');
    t.id='toast'; t.className='toast';
    document.body.appendChild(t);
  }
}
function toast(msg){
  ensureToast();
  var t=$('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(function(){ t.classList.remove('show'); },2600);
}

/* ================= 顶部 chrome / 页脚 ================= */
var NAV_ITEMS=[
  ['home','index.html','首页'],
  ['gallery','gallery.html','样片墙'],
  ['prices','prices.html','价目表'],
  ['equipment','equipment.html','摄影器材'],
  ['pickup','pickup.html','取件查询'],
  ['guestbook','guestbook.html','顾客留言'],
  ['search','search.html','搜 索'],
  ['about','about.html','关于我们']
];
function renderChrome(){
  var c=document.getElementById('chrome');
  if(!c) return;
  var page=c.getAttribute('data-page');
  var nav=NAV_ITEMS.map(function(it){
    return '<a href="'+it[1]+'"'+(it[0]===page?' class="active"':'')+'>'+it[2]+'</a>';
  }).join('');
  c.innerHTML=
    '<div class="topbar"><div class="inner">'+
      '<span>1996年4月 星期二 · 回南天，潮湿，底片易发霉</span>'+
      '<span><a href="#" onclick="toast(\'1996年的浏览器，会问你是否设为首页。\');return false;">设为首页</a> ｜ '+
      '<a href="#" onclick="toast(\'请按 Ctrl+D 把永光照相馆加入收藏。\');return false;">加入收藏</a> ｜ '+
      '<a href="about.html">联系我们</a></span>'+
    '</div></div>'+
    '<div class="masthead"><div class="inner"><div class="brand">'+
      '<div class="logo">永</div>'+
      '<div><h1>永光照相馆</h1><div class="sub">光 影 流 转 · 永 世 不 忘</div></div>'+
    '</div></div></div>'+
    '<div class="navbar"><div class="inner">'+nav+'</div></div>'+
    '<div class="marquee"><div class="inner">'+
      '欢迎光临永光照相馆！　<b>回南天提示：请各位顾客尽早取件，底片久置易发霉</b>　｜　本店承接婚纱、合影、全家福　｜　冲洗一卷，留住一生'+
    '</div></div>';
}
function renderFooter(){
  var f=document.getElementById('site-footer');
  if(!f) return;
  f.className='footer';
  f.innerHTML='永光照相馆 © 1996　地址：骑楼老街 33 号　电话：0757-XXXX<br>'+
    '<span class="muted small">你看到了最底行。——有些照片，最好别翻到背面。</span>';
}

/* ================= 初始化 ================= */
State.load();
renderChrome();
renderFooter();
ensureToast();

/* ================= 给"翻到背面"的人（F12 彩蛋） ================= */
try{
  console.log('%c……你也在看。','color:#9a8a70;font-size:15px;letter-spacing:3px;');
  console.log('%c最清楚的，往往不是显影盘里的那一面。','color:#6a5a48;font-size:12px;letter-spacing:1px;');
  console.log('%c陈师傅把不敢说的话，都写进了暗房手记。','color:#7a6a50;font-size:12px;letter-spacing:1px;');
  console.log('%c底片有正有反，有被划掉的，也有没编号的。字，常常刻在针尖上。','color:#7a6a50;font-size:12px;letter-spacing:1px;');
  console.log('%c六枚针尖字，刻在店里六处不起眼的地方——有的在灯下，有的在你反色才看得见的背面。','color:#6a4a3a;font-size:12px;letter-spacing:1px;');
  console.log('%c若哪张照片让你忍不住多看一眼——那就多看一眼吧。','color:#8a7a60;font-size:12px;letter-spacing:1px;');
  console.log('%c暗房的门从不正对着来客。它喜欢把自己，藏进一张合影的背后。','color:#6a4a3a;font-size:12px;letter-spacing:1px;');
  console.log('%c注意：会主动跳出来告诉你"答案"的，多半不是答案。它只是不想你找到真的那一个。','color:#5a3a2a;font-size:12px;letter-spacing:1px;');
}catch(e){}

// 暗度 · 第一章 Ink 写稿入口（不接 inkjs）
// Inky：打开本文件。改对白后对账到 游戏/assets/story-*.js
// 用法见同目录 README.md

INCLUDE ch1/_vars.ink
INCLUDE ch1/early.ink
INCLUDE ch1/clinic.ink
INCLUDE ch1/late.ink

-> playMenu

=== playMenu ===
暗度　第一章　按关跳转
左边三个分卷仍是 early／clinic／late（别拆成十六个文件）。
右边按游戏关卡点进去改对白。L1 是网页关，没有 Ink。

* [第 2 关　荣汇街28号]
  -> menuL2
* [第 3 关　唐楼后座]
  -> menuL3
* [第 4 关　异样]
  -> menuL4
* [第 5 关　关怀]
  -> menuL5
* [第 6 关　澄心初诊]
  -> menuL6
* [第 7 关　两分钟]
  -> menuL7
* [第 8 关　纸上，心里]
  -> menuL8
* [第 9 关　无声]
  -> menuL9
* [第 10 关　是人？]
  -> menuL10
* [第 11 关　再等一周]
  -> menuL11
* [第 12 关　今夜的约定]
  -> menuL12
* [第 13 关　三秒钟]
  -> menuL13
* [第 14 关　他说整理好了]
  -> menuL14
* [第 15 关　夜里有人敲门]
  -> menuL15
* [第 16 关　天台]
  -> menuL16
* [测 endHurt 判定]
  -> test_endHurt

=== menuL2 ===
第 2 关　荣汇街28号　↔ early.ink
* [看房开场 · startViewing]
  -> startViewing
* [细看 · viewLook]
  -> viewLook
* [问周 · askZhouView]
  -> askZhouView
* [交定 · payDeposit]
  -> payDeposit
* [交定后 · afterTour]
  -> afterTour
* [« 回总菜单]
  -> playMenu

=== menuL3 ===
第 3 关　唐楼后座　↔ early.ink
* [两周过场 · twoWeekCalm]
  -> twoWeekCalm
* [日历日 · openCalDay]
  -> openCalDay
* [« 回总菜单]
  -> playMenu

=== menuL4 ===
第 4 关　异样　↔ early.ink
* [打给阿乐 · callLok]
  -> callLok
* [报警 · alarm]
  -> alarm
* [去表姐家 · leaveNightToMei]
  -> leaveNightToMei
* [过前座门口 · passFrontDoor]
  -> passFrontDoor
* [敲周门 · knockZhou]
  -> knockZhou
* [« 回总菜单]
  -> playMenu

=== menuL5 ===
第 5 关　关怀　↔ early.ink
* [过前座门口 · passFrontDoor]
  -> passFrontDoor
* [家豪来电 · howardCall]
  -> howardCall
* [电话收尾 · howardClose]
  -> howardClose
* [短讯地址 · howardSms]
  -> howardSms
* [« 回总菜单]
  -> playMenu

=== menuL6 ===
第 6 关　澄心初诊　↔ early.ink（出门收回＋并板）＋ clinic.ink
* [出门撞见周 · doorTalk]
  -> doorTalk
* [并板收红圈 · doorTalk_board]
  -> doorTalk_board
* [到场 · clinicArrival]
  -> clinicArrival
* [候诊／入室 · clinic1Intro]
  -> clinic1Intro
* [主诉 · clinicTalk]
  -> clinicTalk
* [交出搜集 · clinic1Present]
  -> clinic1Present
* [支持 · clinic1Support]
  -> clinic1Support
* [屋的事 · clinic1House]
  -> clinic1House
* [休息交待 · clinicRest]
  -> clinicRest
* [« 回总菜单]
  -> playMenu

=== menuL7 ===
第 7 关　两分钟　↔ clinic.ink
* [离诊 · leaveClinic]
  -> leaveClinic
* [回家 · homeAfterClinic]
  -> homeAfterClinic
* [盯两分钟 · tryWatch]
  -> tryWatch
* [离开两分钟 · tryBath]
  -> tryBath
* [二十号纸 · maybePaper20]
  -> maybePaper20
* [表姐电话 · meiPhone1]
  -> meiPhone1
* [« 回总菜单]
  -> playMenu

=== menuL8 ===
第 8 关　纸上，心里　↔ clinic.ink
* [第二次诊 · clinic2]
  -> clinic2
* [生活问 · clinic2Life]
  -> clinic2Life
* [楼下陈 · clinicDoorChen]
  -> clinicDoorChen
* [« 回总菜单]
  -> playMenu

=== menuL9 ===
第 9 关　无声　↔ clinic.ink
* [关录音夜 · nightNoRec]
  -> nightNoRec
* [美娟午饭 · sundayMeal]
  -> sundayMeal
* [表姐听水 · meiHearsWater]
  -> meiHearsWater
* [表姐水电话 · meiWaterCall]
  -> meiWaterCall
* [« 回总菜单]
  -> playMenu

=== menuL10 ===
第 10 关　是人？　↔ clinic.ink
* [第三次诊 · clinic3]
  -> clinic3
* [吵／破 · clinic3Break]
  -> clinic3Break
* [« 回总菜单]
  -> playMenu

=== menuL11 ===
第 11 关　再等一周　↔ clinic.ink
* [非办公时电话 · callMingOffHours]
  -> callMingOffHours
* [周二前夜 · nightBeforeTue]
  -> nightBeforeTue
* [周在楼梯口 · nightBeforeTueZhou]
  -> nightBeforeTueZhou
* [表姐周二 · meiTue]
  -> meiTue
* [« 回总菜单]
  -> playMenu

=== menuL12 ===
第 12 关　今夜的约定　↔ clinic.ink
* [第四次问他 · clinic4Talk]
  -> clinic4Talk
* [« 回总菜单]
  -> playMenu

=== menuL13 ===
第 13 关　三秒钟　↔ late.ink
* [上门 · visitHome]
  -> visitHome
* [望尽头 · gazeLead]
  -> gazeLead
* [走廊尽头 · leadCorridor]
  -> leadCorridor
* [水龙头 · leadTap]
  -> leadTap
* [全家福 · leadFamily]
  -> leadFamily
* [玩具车 · leadCar]
  -> leadCar
* [门口毛巾 · visitTowel]
  -> visitTowel
* [送别 · visitFarewell]
  -> visitFarewell
* [贴门听 · afterVisitListen]
  -> afterVisitListen
* [« 回总菜单]
  -> playMenu

=== menuL14 ===
第 14 关　他说整理好了　↔ late.ink
线索会改天台收束。改普通对白点上面几条；测三收束点下面。

* [取笔记 · missAppt]
  -> missAppt
* [走廊陈 · missChen]
  -> missChen
* [只邮件 → 罗轻伤]
  ~ has_chen_wallet = false
  ~ has_fish_tag = false
  ~ askedFishLuo = false
  ~ note_fish_cv = false
  -> missBranchMail
* [钱夹 → 陈轻伤]
  ~ has_chen_wallet = true
  ~ has_fish_tag = false
  ~ askedFishLuo = false
  ~ note_fish_cv = false
  -> missBranchWallet
* [鱼牌链 → 险坠]
  ~ has_chen_wallet = false
  ~ has_fish_tag = true
  ~ askedFishLuo = true
  ~ note_fish_cv = true
  -> missBranchFish
* [收起邮件 · missMailKeep]
  -> missMailKeep
* [给他看 · missShow]
  -> missShow
* [回家楼梯口 · missHome]
  -> missHome
* [« 回总菜单]
  -> playMenu

=== menuL15 ===
第 15 关　夜里有人敲门　↔ late.ink
* [夜里叫名 · nightName]
  -> nightName
* [打给阿明 · callMing]
  -> callMing
* [阿明回来 · mingReturn]
  -> mingReturn
* [回来后 · mingReturnRest]
  -> mingReturnRest
* [上楼前 · roofApproach]
  -> roofApproach
* [屋里等 · roofWait]
  -> roofWait
* [打给家豪 · roofCallChen]
  -> roofCallChen
* [« 回总菜单]
  -> playMenu

=== menuL16 ===
第 16 关　天台　↔ late.ink
* [天台主流程 · roofNight]
  -> roofNight
* [天台尾 · 罗伤]
  ~ has_chen_wallet = false
  ~ has_fish_tag = false
  -> roofNightTailMing
* [天台尾 · 陈伤]
  ~ has_chen_wallet = true
  -> roofNightTailChen
* [天台尾 · 险坠]
  ~ has_fish_tag = true
  -> roofNightTailZhang
* [结局卡 · ending_card]
  -> ending_card
* [« 回总菜单]
  -> playMenu

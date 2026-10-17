// 第一章试玩 · 与 08-对话分支／story-late.js 对账的 VAR
// 运行时仍写 S.flags／笔记／证物；此处只方便 Inky 预览分支。

VAR meiNoise = false
VAR askedWhyFast = false
VAR askedWorry = false
VAR askedMudslide = false
VAR clinicAvoid = false
VAR showedDirt = false
VAR keptMing = true
VAR calledChen = false
VAR calledMing2 = false
VAR calledName = false
VAR grabbed = false
VAR ranUp = false
VAR gaveRoofKey = false
VAR keptRoofKey = false
VAR called999 = false
VAR meiStay = false
VAR meiSofa = false
VAR hidDirt = false

// 证物／笔记代理（Ink 预览用；游戏里是 ev()／noted()）
VAR has_chen_wallet = false
VAR has_fish_tag = false
VAR askedFishLuo = false
VAR note_fish_cv = false

// 结算：ming 罗掉棚轻伤｜chen 陈掉棚轻伤（钱夹）｜zhang 女主险坠被救（鱼牌链，无伤）
// 由 resolveEndHurt 写入，天台不选手动三选一。meiNoise／askedWhyFast 不锁结局。
VAR endHurt = ""

=== function foundChenCrush ===
~ return has_chen_wallet

=== function dugLuoSecrets ===
~ return has_fish_tag && askedFishLuo && note_fish_cv

// ink-check.mjs 用：设好 VAR 后跳这里，断言 endHurt
=== test_endHurt ===
-> resolveEndHurt ->
EndHurt:{endHurt}
-> DONE

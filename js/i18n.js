window.AE = window.AE || {};

AE.I18N = {
  en: {
    tagline: 'Untangle the arrows. Sharpen your mind.',
    playLevel: n => `PLAY LEVEL ${n}`,
    levels: 'Levels', themes: 'Themes', shop: 'Boosters',
    selectLevel: 'Select Level',
    dailyReady: 'Daily Reward +60', dailyDone: 'Claimed Today ✓',
    hint: 'Hint', smash: 'Smash', blast: 'Blast', guide: 'Guide', fit: 'Fit',
    time: 'Time', reward: 'Reward', mindIq: 'IQ Score',
    settingsTitle: '⚙️ Settings', settingsSub: 'Customize audio, language & preferences',
    language: '🌐 Language', soundVol: '🔊 Volume', vibration: '📳 Vibration',
    browseThemes: '🎨 50 Themes Gallery', howToPlay: '❓ How to Play',
    privacyPolicy: '🛡️ Privacy Policy & Terms', resetProgress: '🗑️ Reset Game Progress',
    legalInfo: 'App & Legal', gotIt: 'Got It',
    themesTitle: '🎨 50 Stylish Themes', themesSub: 'Auto-unlocks every 10 levels, or unlock early with coins!',
    shopTitle: '⚡ Power-Up Shop', shopSub: 'Spend gold coins on super boosters!',
    lvlWin: n => `Level ${n} Complete!`, bossWin: n => `👑 Boss Level ${n} Cleared!`,
    gameOver: 'Level Failed', nextLvl: n => `Play Level ${n} ➡️`,
    replay: 'Replay Level 🔄', retry: 'Try Again 🔄',
    failHearts: 'Out of hearts! Watch the arrow paths carefully.',
    failBomb: '💥 Countdown Bomb exploded! Clear bomb arrows before 0.',
    needCoins: c => `Need ${c} coins!`,
    hammerPrompt: '🔨 Tap any arrow to smash it!',
    zoomTip: '👌 Pinch or scroll to zoom in/out',
    firstTip: '👆 Tap an arrow with a clear path ahead!',
    themeUnlocked: name => `🎉 New Theme Unlocked: ${name}!`,
    confirmReset: 'Reset all progress, coins, and unlocked themes?',
    unlockedAuto: 'Auto (Follows Level)',
    lvlUnlockTag: n => `Unlocks Lvl ${n}`,
    equipped: 'Equipped ✓', owned: 'Tap to Use',
    hintNormal: '💡 Follow the glowing green arrow!',
    hintBomb: '💣 BOMB ARROW: Release it before its counter reaches 0 or it explodes!',
    hintKiller: '⚡ LASER STRIKER: Tap it to slice straight through blocking arrows!',
    hintNova: '🌟 NOVA BURST: Releasing it clears all free arrows facing the same way!',
    hintGhost: '👻 GHOST PHASE: Passes right through 1 blocking arrow ahead!',
    hintElectric: '⚡ SHOCK CHAIN: Zaps an extra random arrow off the board!',
    hintFire: '🔥 FIREBALL: Melts a nearby blocker when released!',
    hintKey: '🔑 GOLDEN KEY: Release this first to unlock the chained Lock arrow!',
    hintBonus: '👑 JACKPOT ARROW: Release for bonus gold coins or +1 Heart!',
    hintBH: '🌀 BLACK HOLE: Arrows pointing into it vanish instantly!',
    howToHtml: `
      <b>How to Play:</b><br>
      • Tap any arrow whose straight path ahead is clear.<br>
      • Use <b>Pinch-to-Zoom</b> and drag to inspect small dense arrows.<br>
      • Avoid bumping into blocking arrows (3 Hearts per level).<br><br>
      <b>Special Powers:</b><br>
      • <b>💣 Bomb:</b> Clear before move count hits 0.<br>
      • <b>🌀 Black Hole:</b> Instant shortcut exit.<br>
      • <b>⚡ Laser Striker:</b> Cuts through blockers ahead.<br>
      • <b>👻 Ghost:</b> Phases through 1 blocker.<br>
      • <b>🌟 Nova Burst:</b> Clears matching free arrows.<br>
      • <b>❄️ Frost:</b> Melts as you clear other arrows.<br>
      • <b>🔑 Key & 🔒 Lock:</b> Clear Key to open Lock.
    `,
    privacyHtml: `
      <b>Privacy Policy (Google Play Compliant)</b><br>
      • <b>Data Collection:</b> Arrow Escape works offline and does <b>not</b> collect, sell, or share personal information, phone IMEI, contacts, or location.<br>
      • <b>Local Storage:</b> Your level progress, IQ score, coins, and themes are stored strictly on your own device.<br>
      • <b>Data Deletion:</b> You can erase all saved progress anytime via <i>Settings → Reset Game Progress</i>.<br>
      • <b>Terms of Use:</b> Virtual coins and boosters have no real-world monetary value.<br>
      • <b>Contact Support:</b> support@arrowescape.app
    `
  },
  hi: {
    tagline: 'तीरों का जाल सुलझाएं, अपना दिमाग तेज़ बनाएं।',
    playLevel: n => `लेवल ${n} खेलें`,
    levels: 'लेवल्स', themes: 'थीम्स', shop: 'पावर शॉप',
    selectLevel: 'लेवल चुनें',
    dailyReady: 'डेली इनाम +60', dailyDone: 'आज मिल गया ✓',
    hint: 'हिंट', smash: 'हथौड़ा', blast: 'ब्लास्ट', guide: 'गाइड', fit: 'फिट',
    time: 'समय', reward: 'इनाम', mindIq: 'IQ स्कोर',
    settingsTitle: '⚙️ सेटिंग्स', settingsSub: 'आवाज़, भाषा और ऐप सेटिंग्स बदलें',
    language: '🌐 भाषा', soundVol: '🔊 आवाज़', vibration: '📳 वाइब्रेशन',
    browseThemes: '🎨 50 स्टाइलिश थीम्स', howToPlay: '❓ कैसे खेलें',
    privacyPolicy: '🛡️ प्राइवेसी पॉलिसी व नियम', resetProgress: '🗑️ गेम डेटा रीसेट करें',
    legalInfo: 'ऐप व कानूनी जानकारी', gotIt: 'समझ गया',
    themesTitle: '🎨 50 स्टाइलिश थीम्स', themesSub: 'हर 10 लेवल पर नया थीम खुलेगा, या कॉइन्स से पहले अनलॉक करें!',
    shopTitle: '⚡ पावर-अप शॉप', shopSub: 'जीते हुए गोल्ड कॉइन्स से सुपर बूस्टर्स खरीदें!',
    lvlWin: n => `लेवल ${n} पूरा हुआ!`, bossWin: n => `👑 बॉस लेवल ${n} पार!`,
    gameOver: 'लेवल फेल', nextLvl: n => `लेवल ${n} खेलें ➡️`,
    replay: 'दोबारा खेलें 🔄', retry: 'फिर से कोशिश करें 🔄',
    failHearts: 'सारे दिल खत्म हो गए! सही रास्ता देखकर टैप करें।',
    failBomb: '💥 बम फट गया! गिनती 0 होने से पहले बम ऐरो निकालें।',
    needCoins: c => `${c} कॉइन्स चाहिए!`,
    hammerPrompt: '🔨 तोड़ने के लिए किसी भी ऐरो पर टैप करें!',
    zoomTip: '👌 ज़ूम करने के लिए दो उंगलियों से पिंच करें',
    firstTip: '👆 खाली रास्ते वाले तीर पर टैप करें!',
    themeUnlocked: name => `🎉 नया थीम खुला: ${name}!`,
    confirmReset: 'क्या आप सारा प्रोग्रेस, कॉइन्स और थीम्स रीसेट करना चाहते हैं?',
    unlockedAuto: 'ऑटो (लेवल के अनुसार)',
    lvlUnlockTag: n => `लेवल ${n} पर खुलेगा`,
    equipped: 'लगा हुआ है ✓', owned: 'चुनने के लिए टैप करें',
    hintNormal: '💡 चमकते हुए हरे तीर पर टैप करें!',
    hintBomb: '💣 बम ऐरो: गिनती 0 होने से पहले इसे बाहर निकालें वरना धमाका होगा!',
    hintKiller: '⚡ लेज़र स्ट्राइकर: सामने आने वाले सारे ब्लॉकिंग तीरों को काटकर निकल जाता है!',
    hintNova: '🌟 नोवा बर्स्ट: इसे निकालते ही उसी दिशा के बाकी खाली तीर भी उड़ जाते हैं!',
    hintGhost: '👻 घोस्ट तीर: सामने खड़े 1 ब्लॉकिंग तीर के आर-पार निकल जाता है!',
    hintElectric: '⚡ शॉक चेन: निकलते वक्त 1 एक्स्ट्रा तीर को बिजली से गायब कर देता है!',
    hintFire: '🔥 फायरबॉल: आस-पास के एक ब्लॉकर को जलाकर खत्म कर देता है!',
    hintKey: '🔑 गोल्डन चाबी: पहले इसे निकालें ताकि ताले वाला तीर खुल सके!',
    hintBonus: '👑 जैकपॉट तीर: इसे निकालने पर एक्स्ट्रा कॉइन्स या +1 दिल मिलता है!',
    hintBH: '🌀 ब्लैक होल: इसकी तरफ जाने वाले तीर सीधे इसमें समाकर निकल जाते हैं!',
    howToHtml: `
      <b>कैसे खेलें:</b><br>
      • जिस तीर के आगे का रास्ता खाली है उस पर टैप करें।<br>
      • छोटे और घने तीरों को देखने के लिए <b>Pinch-to-Zoom</b> करें।<br>
      • टकराने से बचें (हर लेवल में 3 दिल मिलते हैं)।<br><br>
      <b>सुपर पावर्स:</b><br>
      • <b>💣 बम:</b> गिनती 0 होने से पहले निकालें।<br>
      • <b>🌀 ब्लैक होल:</b> बीच से ही सीधा बाहर निकलने का रास्ता।<br>
      • <b>⚡ लेज़र:</b> रास्ते के ब्लॉकर काटकर निकलता है।<br>
      • <b>👻 घोस्ट:</b> 1 ब्लॉकर के आर-पार जा सकता है।<br>
      • <b>🌟 नोवा:</b> एक दिशा के खाली तीर साथ ले जाता है।<br>
      • <b>❄️ बर्फ:</b> बाकी तीर हटाने पर पिघलती है।<br>
      • <b>🔑 चाबी & 🔒 ताला:</b> चाबी निकालने पर ताला खुलेगा।
    `,
    privacyHtml: `
      <b>प्राइवेसी पॉलिसी (Google Play मानकों के अनुसार)</b><br>
      • <b>डेटा सुरक्षा:</b> यह गेम पूरी तरह ऑफलाइन चलता है और आपका कोई भी पर्सनल डेटा, फोन IMEI, कॉन्टैक्ट या लोकेशन कलेक्ट या शेयर नहीं करता।<br>
      • <b>लोकल सेव:</b> आपका लेवल, कॉइन्स, IQ स्कोर और थीम्स सिर्फ आपके अपने फोन में सुरक्षित रहते हैं।<br>
      • <b>डेटा डिलीट:</b> आप कभी भी <i>सेटिंग्स → गेम डेटा रीसेट करें</i> से अपना डेटा मिटा सकते हैं।<br>
      • <b>संपर्क:</b> support@arrowescape.app
    `
  }
};

AE.tr = function(key, arg) {
  const lang = (AE.Game && AE.Game.profile) ? AE.Game.profile.lang : 'en';
  const val = (AE.I18N[lang] && AE.I18N[lang][key]) || AE.I18N.en[key] || key;
  return typeof val === 'function' ? val(arg) : val;
};

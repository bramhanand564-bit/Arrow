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
    replay: '🔄 Replay', home: '🏠 Home', retry: 'Try Again 🔄',
    victory: 'VICTORY!', awesome: 'AWESOME!', levelIntro: n => `LEVEL ${n}`,
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
    hintBH: '🌀 BLACK HOLE: Arrows pointing into it vanish instantly!',
    howToHtml: `
      <b>How to Play:</b><br>
      • Tap any arrow whose straight path ahead is clear.<br>
      • Use <b>Pinch-to-Zoom</b> & drag on dense high levels.<br>
      • Avoid bumping into blocking arrows (3 Hearts per level).<br><br>
      <b>50+ Special Arrows & Powers:</b><br>
      • <b>💣 Bombs & Defusers:</b> Clear before 0 or extend moves.<br>
      • <b>⚡ Lasers, Katana & Railgun:</b> Slice straight through blockers.<br>
      • <b>👻 Ghost & Phantom:</b> Phase smoothly through obstacles.<br>
      • <b>🌈 Nova, Rockets & Magnet:</b> Trigger massive chain clears.<br>
      • <b>🌀 Black Hole:</b> Direct shortcut exit right inside the board.<br>
      • Tap <b>💡 Hint</b> anytime to inspect any special arrow!
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
    replay: '🔄 दोबारा', home: '🏠 होम', retry: 'फिर से कोशिश करें 🔄',
    victory: 'शानदार जीत!', awesome: 'जबरदस्त!', levelIntro: n => `लेवल ${n}`,
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
    hintBH: '🌀 ब्लैक होल: इसकी तरफ जाने वाले तीर सीधे इसमें समाकर निकल जाते हैं!',
    howToHtml: `
      <b>कैसे खेलें:</b><br>
      • जिस तीर के आगे का रास्ता खाली है उस पर टैप करें।<br>
      • बड़े व घने लेवल्स में <b>Pinch-to-Zoom</b> करके छोटे तीर ढूँढें।<br>
      • टकराने से बचें (हर लेवल में 3 दिल मिलते हैं)।<br><br>
      <b>50+ स्पेशल तीर और पावर्स:</b><br>
      • <b>💣 बम व डिफ्यूज़र:</b> गिनती 0 होने से पहले निकालें।<br>
      • <b>⚡ लेज़र, कटाना व रेलगन:</b> सामने के ब्लॉकर काटकर निकलें।<br>
      • <b>👻 घोस्ट व फैंटम:</b> ब्लॉकर के आर-पार निकल जाएं।<br>
      • <b>🌈 नोवा, रॉकेट व मैग्नेट:</b> कई तीर एक साथ साफ करें।<br>
      • <b>🌀 ब्लैक होल:</b> बीच से ही सीधा बाहर निकलने का रास्ता।<br>
      • किसी भी स्पेशल तीर की जानकारी के लिए <b>💡 हिंट</b> दबाएं!
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

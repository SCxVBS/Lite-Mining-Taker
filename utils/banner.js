// Colors for console output
const colors = [
    '\x1b[31m', // red
    '\x1b[32m', // green
    '\x1b[34m', // blue
    '\x1b[35m', // magenta
    '\x1b[33m', // yellow
    '\x1b[36m', // cyan
  ];
  
  // ASCII art frames for header animation
  const headerFrames = [
    [
      "███████╗ ██████╗██╗  ██╗██╗   ██╗██████╗ ███████╗",
      "██╔════╝██╔════╝╚██╗██╔╝██║   ██║██╔══██╗██╔════╝",
      "███████╗██║      ╚███╔╝ ╚██╗ ██╔╝██████╔╝███████╗",
      "╚════██║██║      ██╔██╗  ╚████╔╝ ██╔══██╗╚════██║",
      "███████║╚██████╗██╔╝ ██╗  ╚██╔╝  ██████╔╝███████║",
      "╚══════╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚══════╝"
    ],
    [
      "▓▓▓▓▓▓▓╗ ▓▓▓▓▓▓╗▓▓╗  ▓▓╗▓▓╗   ▓▓╗▓▓▓▓▓▓╗ ▓▓▓▓▓▓▓╗",
      "▓▓╔════╝▓▓╔════╝╚▓▓╗▓▓╔╝▓▓║   ▓▓║▓▓╔══▓▓╗▓▓╔════╝",
      "▓▓▓▓▓▓▓╗▓▓║      ╚▓▓▓╔╝ ╚▓▓╗ ▓▓╔╝▓▓▓▓▓▓╔╝▓▓▓▓▓▓▓╗",
      "╚════▓▓║▓▓║      ▓▓╔▓▓╗  ╚▓▓▓▓╔╝ ▓▓╔══▓▓╗╚════▓▓║",
      "▓▓▓▓▓▓▓║╚▓▓▓▓▓▓╗▓▓╔╝ ▓▓╗  ▚▓▓╔╝  ▓▓▓▓▓▓╔╝▓▓▓▓▓▓▓║",
      "╚══════╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚══════╝"
    ],
    [
      "░░░░░░░╗ ░░░░░░╗░░╗  ░░╗░░╗   ░░╗░░░░░░╗ ░░░░░░░╗",
      "░░╔════╝░░╔════╝╚░░╗░░╔╝░░║   ░░║░░╔══░░╗░░╔════╝",
      "░░░░░░░╝░░║      ╚░░░╔╝ ╚░░╗ ░░╔╝░░░░░░╔╝░░░░░░░╗",
      "╚════░░║░░║      ░░╔░░╗  ╚░░░░╔╝ ░░╔══░░╗╚════░░║",
      "░░░░░░░║╚░░░░░░╗░░╔╝ ░░╗  ╚░░╔╝  ░░░░░░╔╝░░░░░░░║",
      "╚══════╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚══════╝"
    ]
  ];
  
  const RESET = '\x1b[0m';
  let frameIndex = 0;
  
  function getBanner() {
    const frame = headerFrames[frameIndex];
    frameIndex = (frameIndex + 1) % headerFrames.length;
  
    const bannerLines = frame.map((line, index) => {
      const color = colors[index % colors.length];
      return `${color}${line}${RESET}`;
    });
  
    const description = `${colors[4]}✦ Lite Taker Auto Farming ✦${RESET}`;
    const telegram = `${colors[2]}Telegram: https://t.me/scxvbs${RESET}`;
    const whatsapp = `${colors[2]}WhatsApp: https://whatsapp.com/channel/0029VbAR1YL5EjxqhRhOzT3x${RESET}`;
    
    const centeredDescription = ' '.repeat(Math.floor((50 - description.length/2) / 2)) + description;
    const centeredTelegram = ' '.repeat(Math.floor((50 - telegram.length/2) / 2)) + telegram;
    const centeredWhatsApp = ' '.repeat(Math.floor((50 - whatsapp.length/2) / 2)) + whatsapp;
  
    return `\n${bannerLines.join('\n')}\n${centeredDescription}\n${centeredTelegram}\n${centeredWhatsApp}\n`;
  }
  
  export default getBanner;
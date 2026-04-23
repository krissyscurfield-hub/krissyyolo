// Daily Christian scripture rotation. One verse per day, deterministic
// per local date — same verse for the whole day, cycles through the list.
//
// Short, positive, motivational selections. 60 entries = ~2 months of
// unique verses before repeats.

export interface Verse {
  ref: string;
  text: string;
}

export const VERSES: Verse[] = [
  { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary." },
  { ref: "Romans 8:28", text: "In all things God works for the good of those who love him, who have been called according to his purpose." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing." },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
  { ref: "2 Timothy 1:7", text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind." },
  { ref: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
  { ref: "Ephesians 2:8-9", text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God." },
  { ref: "James 1:2-3", text: "Consider it pure joy, my brothers and sisters, whenever you face trials, because the testing of your faith produces perseverance." },
  { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { ref: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." },
  { ref: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you." },
  { ref: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
  { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God. And the peace of God will guard your hearts." },
  { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Proverbs 16:3", text: "Commit to the Lord whatever you do, and he will establish your plans." },
  { ref: "Psalm 37:4", text: "Take delight in the Lord, and he will give you the desires of your heart." },
  { ref: "2 Corinthians 12:9", text: "My grace is sufficient for you, for my power is made perfect in weakness." },
  { ref: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
  { ref: "Romans 8:37", text: "In all these things we are more than conquerors through him who loved us." },
  { ref: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you." },
  { ref: "Psalm 121:1-2", text: "I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth." },
  { ref: "Matthew 6:34", text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself." },
  { ref: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." },
  { ref: "Proverbs 18:10", text: "The name of the Lord is a fortified tower; the righteous run to it and are safe." },
  { ref: "Hebrews 12:1", text: "Let us run with perseverance the race marked out for us, fixing our eyes on Jesus." },
  { ref: "Psalm 27:1", text: "The Lord is my light and my salvation — whom shall I fear?" },
  { ref: "Lamentations 3:22-23", text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning." },
  { ref: "Isaiah 43:19", text: "See, I am doing a new thing! Now it springs up; do you not perceive it?" },
  { ref: "1 John 4:19", text: "We love because he first loved us." },
  { ref: "Romans 5:3-4", text: "We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope." },
  { ref: "1 Corinthians 10:13", text: "God is faithful; he will not let you be tempted beyond what you can bear." },
  { ref: "Ephesians 3:20", text: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us." },
  { ref: "Galatians 6:9", text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." },
  { ref: "Philippians 1:6", text: "He who began a good work in you will carry it on to completion until the day of Christ Jesus." },
  { ref: "2 Corinthians 5:17", text: "If anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
  { ref: "Matthew 19:26", text: "With God all things are possible." },
  { ref: "Psalm 34:4", text: "I sought the Lord, and he answered me; he delivered me from all my fears." },
  { ref: "Psalm 139:14", text: "I praise you because I am fearfully and wonderfully made." },
  { ref: "Isaiah 26:3", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you." },
  { ref: "Proverbs 31:25", text: "She is clothed with strength and dignity; she can laugh at the days to come." },
  { ref: "Psalm 51:10", text: "Create in me a pure heart, O God, and renew a steadfast spirit within me." },
  { ref: "1 Peter 4:10", text: "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace." },
  { ref: "Psalm 62:1-2", text: "Truly my soul finds rest in God; my salvation comes from him. Truly he is my rock and my salvation." },
  { ref: "Ecclesiastes 3:1", text: "There is a time for everything, and a season for every activity under the heavens." },
  { ref: "Zephaniah 3:17", text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you." },
  { ref: "Psalm 118:24", text: "This is the day the Lord has made; let us rejoice and be glad in it." },
  { ref: "Matthew 7:7", text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you." },
  { ref: "John 14:27", text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid." },
  { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope." },
  { ref: "Galatians 5:1", text: "It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery." },
  { ref: "Ephesians 6:10", text: "Be strong in the Lord and in his mighty power." },
  { ref: "Colossians 3:12", text: "Clothe yourselves with compassion, kindness, humility, gentleness and patience." },
  { ref: "2 Thessalonians 3:3", text: "The Lord is faithful, and he will strengthen you and protect you from the evil one." },
  { ref: "1 Corinthians 13:4", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud." },
  { ref: "Psalm 16:8", text: "I keep my eyes always on the Lord. With him at my right hand, I will not be shaken." },
  { ref: "Psalm 138:8", text: "The Lord will vindicate me; your love, Lord, endures forever — do not abandon the works of your hands." },
  { ref: "Micah 6:8", text: "Act justly and love mercy and walk humbly with your God." },
];

/** Deterministic pick by calendar date so the verse is stable for the whole day. */
export function verseForDate(d: Date = new Date()): Verse {
  // Days since Unix epoch, so it advances once per calendar day.
  const dayIndex = Math.floor(d.getTime() / 86_400_000);
  return VERSES[dayIndex % VERSES.length];
}

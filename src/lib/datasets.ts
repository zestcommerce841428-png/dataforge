/* Authoritative-ish reference datasets bundled offline so generators are "real". */

export interface Country {
  name: string;
  code: string;
  capital: string;
  currency: string;
  dial: string;
}

export const COUNTRIES: Country[] = [
  { name: "United States", code: "US", capital: "Washington, D.C.", currency: "USD", dial: "+1" },
  { name: "United Kingdom", code: "GB", capital: "London", currency: "GBP", dial: "+44" },
  { name: "Canada", code: "CA", capital: "Ottawa", currency: "CAD", dial: "+1" },
  { name: "Germany", code: "DE", capital: "Berlin", currency: "EUR", dial: "+49" },
  { name: "France", code: "FR", capital: "Paris", currency: "EUR", dial: "+33" },
  { name: "Spain", code: "ES", capital: "Madrid", currency: "EUR", dial: "+34" },
  { name: "Italy", code: "IT", capital: "Rome", currency: "EUR", dial: "+39" },
  { name: "Netherlands", code: "NL", capital: "Amsterdam", currency: "EUR", dial: "+31" },
  { name: "Japan", code: "JP", capital: "Tokyo", currency: "JPY", dial: "+81" },
  { name: "China", code: "CN", capital: "Beijing", currency: "CNY", dial: "+86" },
  { name: "India", code: "IN", capital: "New Delhi", currency: "INR", dial: "+91" },
  { name: "Brazil", code: "BR", capital: "Brasília", currency: "BRL", dial: "+55" },
  { name: "Australia", code: "AU", capital: "Canberra", currency: "AUD", dial: "+61" },
  { name: "Mexico", code: "MX", capital: "Mexico City", currency: "MXN", dial: "+52" },
  { name: "South Korea", code: "KR", capital: "Seoul", currency: "KRW", dial: "+82" },
  { name: "Sweden", code: "SE", capital: "Stockholm", currency: "SEK", dial: "+46" },
  { name: "Switzerland", code: "CH", capital: "Bern", currency: "CHF", dial: "+41" },
  { name: "Norway", code: "NO", capital: "Oslo", currency: "NOK", dial: "+47" },
  { name: "Poland", code: "PL", capital: "Warsaw", currency: "PLN", dial: "+48" },
  { name: "Turkey", code: "TR", capital: "Ankara", currency: "TRY", dial: "+90" },
  { name: "South Africa", code: "ZA", capital: "Pretoria", currency: "ZAR", dial: "+27" },
  { name: "Argentina", code: "AR", capital: "Buenos Aires", currency: "ARS", dial: "+54" },
  { name: "Egypt", code: "EG", capital: "Cairo", currency: "EGP", dial: "+20" },
  { name: "Nigeria", code: "NG", capital: "Abuja", currency: "NGN", dial: "+234" },
  { name: "Saudi Arabia", code: "SA", capital: "Riyadh", currency: "SAR", dial: "+966" },
  { name: "United Arab Emirates", code: "AE", capital: "Abu Dhabi", currency: "AED", dial: "+971" },
  { name: "Singapore", code: "SG", capital: "Singapore", currency: "SGD", dial: "+65" },
  { name: "New Zealand", code: "NZ", capital: "Wellington", currency: "NZD", dial: "+64" },
  { name: "Ireland", code: "IE", capital: "Dublin", currency: "EUR", dial: "+353" },
  { name: "Portugal", code: "PT", capital: "Lisbon", currency: "EUR", dial: "+351" },
];

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
];

/* Real public user-agent strings (representative of common browsers). */
export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
];

/* Real HTTP status codes. */
export const HTTP_STATUSES: [number, string][] = [
  [200, "OK"], [201, "Created"], [202, "Accepted"], [204, "No Content"],
  [301, "Moved Permanently"], [302, "Found"], [304, "Not Modified"],
  [400, "Bad Request"], [401, "Unauthorized"], [403, "Forbidden"],
  [404, "Not Found"], [405, "Method Not Allowed"], [409, "Conflict"],
  [418, "I'm a teapot"], [422, "Unprocessable Entity"], [429, "Too Many Requests"],
  [500, "Internal Server Error"], [502, "Bad Gateway"], [503, "Service Unavailable"], [504, "Gateway Timeout"],
];

/* Real MIME types. */
export const MIME_TYPES = [
  "application/json", "application/xml", "application/pdf", "application/zip",
  "application/octet-stream", "application/javascript", "text/html", "text/css",
  "text/plain", "text/csv", "image/png", "image/jpeg", "image/gif", "image/svg+xml",
  "image/webp", "audio/mpeg", "audio/ogg", "video/mp4", "video/webm", "font/woff2",
];

/* A subset of the real Tailwind CSS color palette (name → hex). */
export const TAILWIND_COLORS: [string, string][] = [
  ["slate-500", "#64748b"], ["gray-700", "#374151"], ["red-500", "#ef4444"],
  ["orange-500", "#f97316"], ["amber-400", "#fbbf24"], ["yellow-300", "#fde047"],
  ["lime-500", "#84cc16"], ["green-500", "#22c55e"], ["emerald-500", "#10b981"],
  ["teal-500", "#14b8a6"], ["cyan-500", "#06b6d4"], ["sky-500", "#0ea5e9"],
  ["blue-600", "#2563eb"], ["indigo-500", "#6366f1"], ["violet-500", "#8b5cf6"],
  ["purple-500", "#a855f7"], ["fuchsia-500", "#d946ef"], ["pink-500", "#ec4899"],
  ["rose-500", "#f43f5e"], ["stone-600", "#57534e"],
];

/* A real slice of the BIP39 English wordlist (the official list has 2048 words). */
export const BIP39_WORDS = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
  "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
  "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
  "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
  "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
  "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol",
  "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already",
  "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused",
  "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle",
  "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any",
  "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
  "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange",
  "arrest", "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask",
  "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "atom",
  "attack", "attend", "attitude", "attract", "auction", "audit", "august", "aunt",
  "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware",
  "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon",
  "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner",
  "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle",
  "beach", "bean", "beauty", "because", "become", "beef", "before", "begin",
  "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best",
];

export const FIRST_NAMES_M = ["James", "Liam", "Noah", "Lucas", "Henry", "Ethan", "Leo", "Mason", "Oliver", "Daniel"];
export const FIRST_NAMES_F = ["Olivia", "Emma", "Ava", "Sophia", "Isabella", "Mia", "Amelia", "Harper", "Ella", "Grace"];
export const LAST_NAMES2 = ["Smith", "Johnson", "Williams", "Brown", "Garcia", "Miller", "Davis", "Martinez", "Wilson", "Taylor", "Lee", "Walker"];

export const JOB_TITLES = [
  "Software Engineer", "Product Manager", "UX Designer", "Data Scientist",
  "DevOps Engineer", "Marketing Lead", "Sales Director", "Accountant",
  "Project Manager", "QA Analyst", "Content Strategist", "Solutions Architect",
  "Customer Success Manager", "Business Analyst", "Frontend Developer",
];

export const COMPANY_PREFIX = ["Nova", "Apex", "Quantum", "Bright", "Pioneer", "Vertex", "Stellar", "Cobalt", "Pulse", "Summit"];
export const COMPANY_SUFFIX = ["Labs", "Systems", "Technologies", "Solutions", "Dynamics", "Networks", "Group", "Digital", "Works", "Industries"];

export const LOREM = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud " +
  "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute " +
  "irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla"
).split(" ");

export const ADJECTIVES = ["swift", "brave", "calm", "clever", "bright", "bold", "lucky", "quiet", "wild", "noble", "fuzzy", "cosmic"];
export const NOUNS = ["tiger", "falcon", "river", "comet", "maple", "panda", "otter", "willow", "ember", "raven", "lotus", "pixel"];

export const TLDS2 = ["com", "net", "org", "io", "dev", "app", "co", "ai", "xyz"];

/* Emojis with Unicode codepoint and name. */
export const EMOJIS = [
  { emoji: "😀", name: "Grinning Face", code: "1F600" },
  { emoji: "😂", name: "Face with Tears of Joy", code: "1F602" },
  { emoji: "🚀", name: "Rocket", code: "1F680" },
  { emoji: "💡", name: "Light Bulb", code: "1F4A1" },
  { emoji: "🔥", name: "Fire", code: "1F525" },
  { emoji: "⭐", name: "Star", code: "2B50" },
  { emoji: "🌍", name: "Earth Globe", code: "1F30D" },
  { emoji: "🎯", name: "Direct Hit", code: "1F3AF" },
  { emoji: "💎", name: "Gem Stone", code: "1F48E" },
  { emoji: "🤖", name: "Robot", code: "1F916" },
  { emoji: "🦄", name: "Unicorn", code: "1F984" },
  { emoji: "🌊", name: "Water Wave", code: "1F30A" },
  { emoji: "⚡", name: "High Voltage", code: "26A1" },
  { emoji: "🧪", name: "Test Tube", code: "1F9EA" },
  { emoji: "🔐", name: "Locked with Key", code: "1F510" },
  { emoji: "📊", name: "Bar Chart", code: "1F4CA" },
  { emoji: "🎨", name: "Artist Palette", code: "1F3A8" },
  { emoji: "🏆", name: "Trophy", code: "1F3C6" },
  { emoji: "🌈", name: "Rainbow", code: "1F308" },
  { emoji: "🎲", name: "Game Die", code: "1F3B2" },
  { emoji: "🔮", name: "Crystal Ball", code: "1F52E" },
  { emoji: "🧬", name: "DNA", code: "1F9EC" },
  { emoji: "🛸", name: "Flying Saucer", code: "1F6F8" },
  { emoji: "🌙", name: "Crescent Moon", code: "1F319" },
  { emoji: "🦊", name: "Fox", code: "1F98A" },
];

/* CSS named colors. */
export const CSS_COLOR_NAMES = [
  { name: "coral", hex: "#FF7F50" }, { name: "tomato", hex: "#FF6347" },
  { name: "orchid", hex: "#DA70D6" }, { name: "teal", hex: "#008080" },
  { name: "turquoise", hex: "#40E0D0" }, { name: "lavender", hex: "#E6E6FA" },
  { name: "salmon", hex: "#FA8072" }, { name: "khaki", hex: "#F0E68C" },
  { name: "maroon", hex: "#800000" }, { name: "olive", hex: "#808000" },
  { name: "navy", hex: "#000080" }, { name: "indigo", hex: "#4B0082" },
  { name: "violet", hex: "#EE82EE" }, { name: "plum", hex: "#DDA0DD" },
  { name: "chartreuse", hex: "#7FFF00" }, { name: "aquamarine", hex: "#7FFFD4" },
  { name: "crimson", hex: "#DC143C" }, { name: "goldenrod", hex: "#DAA520" },
  { name: "sienna", hex: "#A0522D" }, { name: "peru", hex: "#CD853F" },
  { name: "steelblue", hex: "#4682B4" }, { name: "slategray", hex: "#708090" },
  { name: "hotpink", hex: "#FF69B4" }, { name: "deepskyblue", hex: "#00BFFF" },
  { name: "limegreen", hex: "#32CD32" }, { name: "darkorange", hex: "#FF8C00" },
];

/* VIN World Manufacturer Identifiers (real codes). */
export const VIN_WMI = ["1HD","1G1","2T1","3VW","JHM","WBA","WDB","SAL","JN1","YV1","KMH","1FT","2HG","3FA","VF3"];
export const VIN_YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789".split("");
/* Valid VIN characters (no I, O, Q). */
export const VIN_CHARS = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ";

/* UK postcode area codes. */
export const UK_AREAS = ["SW","NW","SE","EC","WC","W","E","N","B","M","LS","EH","G","CF","BS","OX","CB","NG","SO","RG"];

/* Canadian postal code FSA first letters (no D, F, I, O, Q, U, W, Z). */
export const CA_FSA_CHARS = "ABCEGHJKLMNPRSTVXY";

/* SWIFT bank code components. */
export const SWIFT_BANK_WORDS = ["CHAS","BOFA","CITI","WELL","BARC","DEUT","BNPA","HSBC","UBSW","CRED","SOCI","MUFG","SMBC","MIZU","RABO"];
export const SWIFT_COUNTRIES = ["US","GB","DE","FR","JP","CH","NL","AU","CA","SG","HK","AE","IE","IT","ES"];

/* Common cron patterns. */
export const CRON_PATTERNS = [
  ["0 * * * *",       "Every hour at minute 0"],
  ["*/15 * * * *",    "Every 15 minutes"],
  ["*/30 * * * *",    "Every 30 minutes"],
  ["0 9 * * MON-FRI","Weekdays at 9 AM"],
  ["0 0 * * *",       "Daily at midnight"],
  ["0 0 1 * *",       "First day of every month"],
  ["0 0 * * 0",       "Every Sunday at midnight"],
  ["0 12 * * *",      "Daily at noon"],
  ["5 4 * * SUN",     "Every Sunday at 4:05 AM"],
  ["0 22 * * 1-5",    "Weekdays at 10 PM"],
  ["23 0-20/2 * * *", "Every 2 hours from 0:23"],
  ["0 0,12 1 */2 *",  "At midnight and noon, on 1st, every 2 months"],
] as const;

/* SQL table/column names for realistic INSERT generation. */
export const SQL_TABLES = [
  { table: "users", cols: ["id","name","email","role","created_at"] },
  { table: "orders", cols: ["id","customer_id","total","status","placed_at"] },
  { table: "products", cols: ["id","name","sku","price","stock"] },
  { table: "transactions", cols: ["id","account_id","amount","type","timestamp"] },
  { table: "events", cols: ["id","name","payload","source","recorded_at"] },
];

/* Common HTTP headers for realistic generation. */
export const HTTP_HEADERS_LIST = [
  (uuid: string) => `X-Request-ID: ${uuid}`,
  (_: string, ts: number) => `X-Timestamp: ${ts}`,
  () => `Cache-Control: max-age=3600, must-revalidate`,
  () => `Strict-Transport-Security: max-age=31536000; includeSubDomains`,
  () => `X-Content-Type-Options: nosniff`,
  () => `X-Frame-Options: DENY`,
  () => `Access-Control-Allow-Origin: *`,
  (uuid: string) => `ETag: "${uuid.slice(0, 16)}"`,
  () => `Content-Encoding: gzip`,
  () => `X-RateLimit-Remaining: 42`,
];

/* Timezones. */
export const TIMEZONES = [
  "America/New_York","America/Los_Angeles","America/Chicago","America/Toronto",
  "America/Sao_Paulo","America/Buenos_Aires","Europe/London","Europe/Paris",
  "Europe/Berlin","Europe/Moscow","Asia/Tokyo","Asia/Shanghai","Asia/Kolkata",
  "Asia/Singapore","Asia/Dubai","Africa/Cairo","Africa/Lagos","Australia/Sydney",
  "Pacific/Auckland","Pacific/Honolulu",
];

/* Real proverbs from around the world. */
export const PROVERBS = [
  "The early bird catches the worm.",
  "Actions speak louder than words.",
  "Fortune favors the bold.",
  "A journey of a thousand miles begins with a single step.",
  "Don't count your chickens before they hatch.",
  "The pen is mightier than the sword.",
  "Where there is a will, there is a way.",
  "All that glitters is not gold.",
  "Necessity is the mother of invention.",
  "A picture is worth a thousand words.",
  "The road to hell is paved with good intentions.",
  "You reap what you sow.",
  "Strike while the iron is hot.",
  "Every cloud has a silver lining.",
  "Look before you leap.",
  "Time is money.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "When in Rome, do as the Romans do.",
  "Two wrongs don't make a right.",
  "Knowledge is power.",
  "Birds of a feather flock together.",
  "A fool and his money are soon parted.",
  "Practice makes perfect.",
  "Honesty is the best policy.",
  "You can't judge a book by its cover.",
];

/* ISO 639-1 language codes with English and native names. */
export const ISO_LANGUAGES: [string, string, string][] = [
  ["en", "English", "English"],
  ["es", "Spanish", "Español"],
  ["zh", "Chinese", "中文"],
  ["hi", "Hindi", "हिन्दी"],
  ["ar", "Arabic", "العربية"],
  ["fr", "French", "Français"],
  ["de", "German", "Deutsch"],
  ["pt", "Portuguese", "Português"],
  ["ru", "Russian", "Русский"],
  ["ja", "Japanese", "日本語"],
  ["ko", "Korean", "한국어"],
  ["it", "Italian", "Italiano"],
  ["nl", "Dutch", "Nederlands"],
  ["sv", "Swedish", "Svenska"],
  ["pl", "Polish", "Polski"],
  ["tr", "Turkish", "Türkçe"],
  ["vi", "Vietnamese", "Tiếng Việt"],
  ["th", "Thai", "ภาษาไทย"],
  ["id", "Indonesian", "Bahasa Indonesia"],
  ["ms", "Malay", "Bahasa Melayu"],
  ["da", "Danish", "Dansk"],
  ["fi", "Finnish", "Suomi"],
  ["no", "Norwegian", "Norsk"],
  ["he", "Hebrew", "עברית"],
  ["uk", "Ukrainian", "Українська"],
  ["ro", "Romanian", "Română"],
  ["cs", "Czech", "Čeština"],
  ["hu", "Hungarian", "Magyar"],
  ["el", "Greek", "Ελληνικά"],
  ["bn", "Bengali", "বাংলা"],
];

/* IATA airport codes — [code, name, city, country]. */
export const AIRPORTS: [string, string, string, string][] = [
  ["JFK","John F. Kennedy International","New York","US"],
  ["LAX","Los Angeles International","Los Angeles","US"],
  ["ORD","O'Hare International","Chicago","US"],
  ["ATL","Hartsfield-Jackson Atlanta International","Atlanta","US"],
  ["DFW","Dallas/Fort Worth International","Dallas","US"],
  ["LHR","Heathrow","London","GB"],
  ["CDG","Charles de Gaulle","Paris","FR"],
  ["FRA","Frankfurt Airport","Frankfurt","DE"],
  ["AMS","Amsterdam Airport Schiphol","Amsterdam","NL"],
  ["DXB","Dubai International","Dubai","AE"],
  ["SIN","Singapore Changi","Singapore","SG"],
  ["NRT","Narita International","Tokyo","JP"],
  ["HKG","Hong Kong International","Hong Kong","HK"],
  ["SYD","Kingsford Smith","Sydney","AU"],
  ["YYZ","Pearson International","Toronto","CA"],
  ["GRU","São Paulo–Guarulhos International","São Paulo","BR"],
  ["MAD","Adolfo Suárez Madrid–Barajas","Madrid","ES"],
  ["BCN","Josep Tarradellas Barcelona–El Prat","Barcelona","ES"],
  ["FCO","Leonardo da Vinci International","Rome","IT"],
  ["ZRH","Zurich Airport","Zurich","CH"],
  ["ICN","Incheon International","Seoul","KR"],
  ["PVG","Shanghai Pudong International","Shanghai","CN"],
  ["BOM","Chhatrapati Shivaji Maharaj International","Mumbai","IN"],
  ["MEX","Benito Juárez International","Mexico City","MX"],
  ["SVO","Sheremetyevo International","Moscow","RU"],
  ["JNB","O.R. Tambo International","Johannesburg","ZA"],
  ["CGK","Soekarno–Hatta International","Jakarta","ID"],
  ["MUC","Munich Airport","Munich","DE"],
  ["CPH","Copenhagen Airport","Copenhagen","DK"],
  ["ARN","Stockholm Arlanda","Stockholm","SE"],
];

/* Real stock tickers — [ticker, company, exchange]. */
export const STOCK_TICKERS: [string, string, string][] = [
  ["AAPL","Apple Inc.","NASDAQ"],
  ["MSFT","Microsoft Corporation","NASDAQ"],
  ["GOOGL","Alphabet Inc.","NASDAQ"],
  ["AMZN","Amazon.com Inc.","NASDAQ"],
  ["NVDA","NVIDIA Corporation","NASDAQ"],
  ["META","Meta Platforms Inc.","NASDAQ"],
  ["TSLA","Tesla Inc.","NASDAQ"],
  ["BRK.B","Berkshire Hathaway","NYSE"],
  ["JPM","JPMorgan Chase & Co.","NYSE"],
  ["V","Visa Inc.","NYSE"],
  ["JNJ","Johnson & Johnson","NYSE"],
  ["WMT","Walmart Inc.","NYSE"],
  ["XOM","Exxon Mobil Corp.","NYSE"],
  ["UNH","UnitedHealth Group","NYSE"],
  ["MA","Mastercard Inc.","NYSE"],
  ["BABA","Alibaba Group","NYSE"],
  ["TSM","Taiwan Semiconductor Mfg.","NYSE"],
  ["ASML","ASML Holding N.V.","NASDAQ"],
  ["LVMH","LVMH Moët Hennessy","EPA"],
  ["SAP","SAP SE","NYSE"],
  ["SONY","Sony Group Corp.","NYSE"],
  ["SHOP","Shopify Inc.","NYSE"],
  ["SPOT","Spotify Technology","NYSE"],
  ["COIN","Coinbase Global","NASDAQ"],
  ["SQ","Block Inc.","NYSE"],
];

/* Programming languages — [name, creator, year]. */
export const PROGRAMMING_LANGUAGES: [string, string, number][] = [
  ["Python","Guido van Rossum",1991],
  ["JavaScript","Brendan Eich",1995],
  ["TypeScript","Anders Hejlsberg",2012],
  ["Java","James Gosling",1995],
  ["C","Dennis Ritchie",1972],
  ["C++","Bjarne Stroustrup",1983],
  ["C#","Anders Hejlsberg",2000],
  ["Go","Rob Pike / Ken Thompson",2009],
  ["Rust","Graydon Hoare",2010],
  ["Kotlin","JetBrains",2011],
  ["Swift","Chris Lattner",2014],
  ["Ruby","Yukihiro Matsumoto",1995],
  ["PHP","Rasmus Lerdorf",1994],
  ["Scala","Martin Odersky",2004],
  ["R","Ross Ihaka / Robert Gentleman",1993],
  ["MATLAB","Cleve Moler",1984],
  ["Lua","PUC-Rio team",1993],
  ["Haskell","Committee",1990],
  ["Elixir","José Valim",2011],
  ["Dart","Lars Bak / Kasper Lund",2011],
];

/* Cloud regions — [provider, region, location]. */
export const CLOUD_REGIONS: [string, string, string][] = [
  ["AWS","us-east-1","N. Virginia"],
  ["AWS","us-west-2","Oregon"],
  ["AWS","eu-west-1","Ireland"],
  ["AWS","eu-central-1","Frankfurt"],
  ["AWS","ap-southeast-1","Singapore"],
  ["AWS","ap-northeast-1","Tokyo"],
  ["AWS","ap-south-1","Mumbai"],
  ["AWS","sa-east-1","São Paulo"],
  ["GCP","us-central1","Iowa"],
  ["GCP","europe-west1","Belgium"],
  ["GCP","asia-east1","Taiwan"],
  ["GCP","australia-southeast1","Sydney"],
  ["Azure","eastus","East US"],
  ["Azure","westeurope","West Europe"],
  ["Azure","southeastasia","Southeast Asia"],
];

/* Automotive brands — [make, country, founded]. */
export const CAR_BRANDS: [string, string, number][] = [
  ["Toyota","Japan",1937],["Honda","Japan",1948],["Ford","USA",1903],
  ["Chevrolet","USA",1911],["BMW","Germany",1916],["Mercedes-Benz","Germany",1926],
  ["Volkswagen","Germany",1937],["Audi","Germany",1909],["Porsche","Germany",1931],
  ["Ferrari","Italy",1939],["Lamborghini","Italy",1963],["Volvo","Sweden",1927],
  ["Hyundai","South Korea",1967],["Kia","South Korea",1944],["Mazda","Japan",1920],
  ["Subaru","Japan",1953],["Nissan","Japan",1933],["Tesla","USA",2003],
  ["Peugeot","France",1896],["Renault","France",1899],
];

/* Material Design color palette — [name, shade, hex]. */
export const MATERIAL_COLORS: [string, string, string][] = [
  ["Red","500","#f44336"],["Red","700","#d32f2f"],
  ["Pink","500","#e91e63"],["Purple","500","#9c27b0"],
  ["Deep Purple","500","#673ab7"],["Indigo","500","#3f51b5"],
  ["Blue","500","#2196f3"],["Light Blue","500","#03a9f4"],
  ["Cyan","500","#00bcd4"],["Teal","500","#009688"],
  ["Green","500","#4caf50"],["Light Green","500","#8bc34a"],
  ["Lime","500","#cddc39"],["Yellow","600","#fdd835"],
  ["Amber","500","#ffc107"],["Orange","500","#ff9800"],
  ["Deep Orange","500","#ff5722"],["Brown","500","#795548"],
  ["Blue Grey","500","#607d8b"],["Grey","600","#757575"],
];

/* Named regex patterns — [name, pattern, example match]. */
export const REGEX_PATTERNS: [string, string, string][] = [
  ["Email","[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}","user@example.com"],
  ["IPv4","(\\d{1,3}\\.){3}\\d{1,3}","192.168.1.1"],
  ["URL","https?://[^\\s/$.?#].[^\\s]*","https://example.com/path?q=1"],
  ["Phone (US)","\\(?\\d{3}\\)?[-.\\s]\\d{3}[-.\\s]\\d{4}","(555) 123-4567"],
  ["Date (ISO)","\\d{4}-\\d{2}-\\d{2}","2024-06-15"],
  ["UUID","[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}","550e8400-e29b-41d4-a716-446655440000"],
  ["Hex Color","#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})","#3a86ff"],
  ["Credit Card","\\d{4}[\\s-]\\d{4}[\\s-]\\d{4}[\\s-]\\d{4}","4111 1111 1111 1111"],
  ["Postal Code (US)","\\d{5}(-\\d{4})?","90210-3421"],
  ["Semantic Version","(\\d+)\\.(\\d+)\\.(\\d+)","2.14.0"],
];

/* Book title word pools. */
export const BOOK_TITLE_WORDS = {
  article: ["The","A"],
  adj: ["Last","Dark","Lost","Broken","Forgotten","Hidden","Silent","Final","Ancient","Crimson","Infinite","Sacred"],
  noun: ["Kingdom","Shadow","Storm","Legacy","Chronicle","Prophecy","Labyrinth","Throne","Cipher","Archive","Codex","Reckoning"],
  prep: ["of","in","beneath","beyond","through","across"],
  noun2: ["Time","Eternity","Stars","Embers","Ash","Fire","Ice","Dusk","Dawn","Fate","Memory","Silence"],
};

/* Movie genres with title word pools. */
export const MOVIE_GENRES = ["Action","Thriller","Drama","Comedy","Horror","Sci-Fi","Adventure","Mystery","Romance","Animated"];

/* Customer review phrases — [opener, body, closer]. */
export const REVIEW_PHRASES: { openers: string[]; bodies: string[]; closers: string[] } = {
  openers: [
    "Absolutely love this product!","Great purchase overall.","Very impressed with the quality.",
    "Exceeded my expectations.","Decent product for the price.","Not what I expected.",
    "Highly recommend to anyone looking for","Works exactly as described.","Been using this for months and",
    "Five stars for a reason —",
  ],
  bodies: [
    "The build quality is outstanding and it feels premium.",
    "Shipping was fast and packaging was secure.",
    "Easy to set up and use right out of the box.",
    "The customer service team was incredibly helpful.",
    "It does exactly what it says on the tin.",
    "The design is sleek and modern.",
    "Battery life is impressive — lasts all day.",
    "Performance is smooth with no noticeable lag.",
    "Great value compared to similar products on the market.",
    "It has become an essential part of my daily routine.",
  ],
  closers: [
    "Would definitely buy again.","Will be recommending to friends and family.",
    "100% worth the investment.","Happy with this purchase.","Can't imagine life without it now.",
    "A solid choice for anyone in need of this.","Only minor complaint is the packaging.",
    "Perfect gift idea too.","Will be a returning customer for sure.","10/10 would recommend.",
  ],
};

/* Brand taglines. */
export const TAGLINES = [
  "Just do it.","Think different.","Because you're worth it.","The ultimate driving machine.",
  "Connecting people.","Impossible is nothing.","Open happiness.","Have it your way.",
  "The world's local bank.","Don't be evil.","We bring good things to life.",
  "When it absolutely, positively has to be there overnight.",
  "Built for the journey.","Fly the friendly skies.","The happiest place on Earth.",
  "Finger-lickin' good.","The king of beers.","Every little helps.",
  "Quality never goes out of style.","Think outside the bun.",
];

/* Application name suffixes and prefixes. */
export const APP_PREFIXES = ["Snap","Forge","Dash","Flux","Spark","Wave","Nano","Hyper","Ultra","Zen","Arc","Bolt","Mint","Prism","Core"];
export const APP_SUFFIXES = ["Hub","Flow","Kit","Lab","Pro","AI","Cloud","Base","Link","Sync","Gate","Mind","Nest","Edge","Dock"];

/* Employee departments. */
export const DEPARTMENTS = [
  "Engineering","Product","Design","Marketing","Sales","Finance","HR","Operations",
  "Legal","Security","Data Science","Customer Success","Research","Procurement","Infrastructure",
];

/* Loyalty/membership card brand prefixes. */
export const LOYALTY_BRANDS = [
  "AirMiles","RewardPlus","GoldCard","PlatinumClub","PointsEdge","ValuePack",
  "MemberFirst","StarRewards","PrimePass","EliteClub","BonusCard","LoyaltyPro",
];

/* Webhook event types — [service, event]. */
export const WEBHOOK_EVENTS: [string, string][] = [
  ["stripe","payment_intent.succeeded"],
  ["stripe","invoice.payment_failed"],
  ["github","push"],
  ["github","pull_request.opened"],
  ["shopify","orders/create"],
  ["shopify","refunds/create"],
  ["slack","message"],
  ["twilio","message.received"],
  ["sendgrid","mail.send"],
  ["datadog","alert.triggered"],
];

/* GraphQL operation types and entity names. */
export const GRAPHQL_ENTITIES = ["User","Product","Order","Post","Comment","Category","Tag","Review","Invoice","Subscription"];

/* Common API path segments. */
export const API_RESOURCES = ["users","orders","products","customers","invoices","payments","subscriptions","reports","analytics","notifications","sessions","tokens","webhooks","settings","profiles"];

/* HTTP methods. */
export const HTTP_METHODS = ["GET","POST","PUT","PATCH","DELETE"];

/* K8s namespaces and label keys. */
export const K8S_NAMESPACES = ["default","production","staging","development","kube-system","monitoring","ingress-nginx","cert-manager","logging","data"];
export const K8S_LABEL_KEYS = ["app","env","tier","version","component","part-of","managed-by","team","region","release"];

/* Log levels with typical fields. */
export const LOG_LEVELS = ["DEBUG","INFO","WARN","ERROR","FATAL"] as const;

/* Common error codes with HTTP status and message. */
export const ERROR_CODES: [string, number, string][] = [
  ["ERR_VALIDATION_FAILED",422,"One or more fields failed validation"],
  ["ERR_UNAUTHORIZED",401,"Authentication token is missing or invalid"],
  ["ERR_FORBIDDEN",403,"You do not have permission to perform this action"],
  ["ERR_NOT_FOUND",404,"The requested resource could not be found"],
  ["ERR_RATE_LIMITED",429,"Too many requests, please try again later"],
  ["ERR_INTERNAL",500,"An unexpected error occurred on the server"],
  ["ERR_BAD_GATEWAY",502,"Upstream service returned an invalid response"],
  ["ERR_TIMEOUT",504,"The request timed out waiting for an upstream service"],
  ["ERR_CONFLICT",409,"The resource already exists or is in a conflicting state"],
  ["ERR_PAYLOAD_TOO_LARGE",413,"Request body exceeds the maximum allowed size"],
];

/* Common UK ISP / AS organisation names. */
export const ISP_NAMES = [
  "Cloudflare, Inc.","Amazon Web Services","Google LLC","Microsoft Azure","Fastly, Inc.",
  "DigitalOcean LLC","OVH SAS","Hetzner Online GmbH","Linode, LLC","Vultr Holdings LLC",
  "BT Group","Virgin Media","Sky Broadband","Vodafone Limited","EE Limited",
  "Comcast Cable","AT&T Services","Verizon Business","Charter Communications","Cox Communications",
];

/* CSP directive sources. */
export const CSP_DIRECTIVE_SOURCES = ["'self'","'unsafe-inline'","'nonce-{NONCE}'","https://cdn.example.com","https://fonts.googleapis.com","https://www.google-analytics.com","https://api.example.com"];

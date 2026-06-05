"use client";
import { useState, useMemo } from "react";

// Text tools
import { CaseConverter, TextCounter, TextDiff, LineTools, FindReplace, RegexTester, TextEncoder2, CipherTool, ReadabilityTool, PalindromeAnagram, TextRepeater, PigLatin } from "./tools/text";
// Encode tools
import { Base64Tool, UrlEncodeTool, HtmlEntityTool, JwtDecoder, HttpBasicAuth, UnicodeTool, StringEscaper, Base32Tool, DataUriTool } from "./tools/encode";
// Developer tools
import { JsonFormatter, JsonToTypescript, JsonToZod, CronParser, HttpStatusLookup, MimeLookup, SqlFormatter, MarkdownPreviewer, HtmlPreviewer, EnvParser, JsonPathTester, JsonToGoStruct } from "./tools/developer";
// Network tools
import { UrlShortener, UrlParser, UrlBuilder, IpLookup, DnsLookup, QueryStringParser, MetaTagGenerator, RobotsTxtGenerator, CorsGenerator } from "./tools/network";
// CSS tools
import { ColorConverter, ColorPalette, ContrastChecker, GradientGenerator, BoxShadowGenerator, BorderRadiusGenerator, CssTriangle, GlassmorphismGenerator, CssAnimationGenerator, MediaQueryBuilder } from "./tools/css";
// Security tools
import { HashGenerator, HmacGenerator, PasswordStrength, AesTool, CspGenerator, SecretScanner } from "./tools/security";
// Math tools
import { ScientificCalc, BaseConverter, UnitConverter, PercentageCalc, StatisticsCalc, LoanCalc, GcdLcm, CompoundInterest } from "./tools/math";
// Datetime tools
import { TimestampConverter, DateCalc, AgeCalc, TimezoneConverter, CountdownTimer, Stopwatch, WorldClock } from "./tools/datetime";
// Reference tools
import { AsciiTable, HttpHeadersRef, HtmlEntitiesRef, RegexRef, GitRef, LinuxRef, EmojiPicker, KeyboardRef, ColorNamesRef } from "./tools/reference";
// Image tools
import { ImageResizer, ImageFilters, ImageToBase64, Base64ToImage, ExifViewer, FaviconGenerator, ImageWatermark, ColorPickerFromImage, ImageCompressor } from "./tools/image";
// More text tools
import { LoremIpsum, SlugGenerator, WordFrequency, HashtagGenerator, MarkdownTableGen, CsvToHtmlTable, RemoveHtmlTags, NumberToWords, RomanNumeralConverter, GzipTool, TextToSpeech, WhitespaceVisualizer, DuplicateWordFinder } from "./tools/more-text";
// More developer tools
import { JsonDiff, YamlJsonConverter, XmlFormatter, CssMinifier, HtmlMinifier, GitignoreGenerator, LicenseGenerator, SemverBumper, UuidBatchGenerator, TotpGenerator, HttpRequestBuilder } from "./tools/more-developer";
// More network tools
import { CidrCalculator, EmailValidator, DomainExtractor, IpValidator, WebhookTester, OgTagsChecker, PunycodeConverter, SslInfo } from "./tools/more-network";
// More reference tools
import { SqlReference, CssReference, JsMethodsReference, DockerReference, NodeReference, TailwindReference } from "./tools/more-reference";
// More CSS tools
import { NeumorphismGenerator, CssButtonGenerator, CssVariablesGenerator, CssClipPath, TypographyScale } from "./tools/more-css";
// More math tools
import { PrimeFactorization, FibonacciSequence, MatrixCalculator, TipCalculator, BusinessDaysCalc, DiscountCalculator } from "./tools/more-math";
// Batch 2 — extra text tools
import { ReverseText, NatoPhonetic, UpsideDownText, FancyUnicodeText, ZalgoText, AcronymExtractor, AdvancedTextSorter, ColumnExtractor, TextCleaner } from "./tools/more2-text";
// Batch 2 — data/dev tools
import { CsvToJson, JsonToCsv, JsonToXml, SqlInsertGenerator, CurlConverter, MockDataGenerator, JsonFlatten, AsciiTreeGenerator, JwtBuilder } from "./tools/more2-data";
// Batch 2 — CSS tools
import { FlexboxPlayground, CssGridGenerator, TextShadowGenerator, CubicBezier, AspectRatioCalc, CssUnitConverter, ColorShadeScale, CssScrollbarGenerator, CssLoaderGenerator } from "./tools/more2-css";
// Batch 2 — math tools
import { QuadraticSolver, RightTriangleSolver, PermutationCombination, RatioSimplifier, ScientificNotation, PaceCalculator, SalaryConverter, FuelCostCalc, BitwiseCalculator } from "./tools/more2-math";
// Batch 2 — date/time tools
import { DurationCalculator, WeekNumber, DateFormatTokens, TimeUntil, LeapYearChecker, DayOfWeekFinder, CronNextRuns, EpochBatchConverter, WorkHoursCalculator } from "./tools/more2-datetime";
// Batch 2 — security tools
import { PasswordGenerator, PassphraseGenerator, RandomStringGenerator, CreditCardValidator, IbanValidator, Base58Tool, Rot47Tool, HashIdentifier, PinGenerator } from "./tools/more2-security";
// Batch 2 — network tools
import { UserAgentParser, HttpHeaderAnalyzer, PortReference, CookieParser, MacAddressTool, IpRangeExpander, HostnameValidator, AcceptLanguageParser, ConnectionStringParser } from "./tools/more2-network";
// Batch 2 — converter tools
import { NumberBaseMulti, TextBinaryConverter, FeelsLikeCalc, BmiCalculator, GeometryCalc, FractionConverter, RomanConverterLive, AngleConverter, ByteSizeHumanizer } from "./tools/more2-convert";
// Batch 3 — productivity
import { PomodoroTimer, TodoList, Scratchpad, CoinFlip, DiceRoller, DecisionMaker, RandomPicker, EventCountdown, TimerAlarm } from "./tools/more3-productivity";
// Batch 3 — finance
import { SimpleInterestCalc, SIPCalculator, EMICalculator, GSTCalculator, IncomeTaxIndia, ProfitMarginCalc, ROICalculator, SavingsGoalCalc, InflationCalc } from "./tools/more3-finance";
// Batch 3 — health
import { BMRCalorieCalc, BodyFatEstimator, WaterIntakeCalc, IdealWeightCalc, PregnancyDueDate, OvulationCalc, MacroCalculator, HeartRateZones, SleepCalculator } from "./tools/more3-health";
// Batch 3 — converters
import { CookingConverter, ShoeSizeConverter, RingSizeConverter, FuelEconomyConverter, PressureConverter, EnergyConverter, PowerConverter, OvenTempConverter, PaperSizeReference } from "./tools/more3-convert";
// Batch 3 — text
import { CharLimitCounter, RemoveLineBreaks, ListCommaConverter, EmailExtractor, BionicReading, RandomWordGenerator, UsernameGenerator, ListDeduplicator, CaseSentence } from "./tools/more3-text2";
// Batch 3 — fun
import { Magic8Ball, RandomQuote, WouldYouRather, TruthOrDare, RandomColorGenerator, FantasyNameGenerator, RockPaperScissors, NumberGuessGame, RandomEmoji } from "./tools/more3-fun";
// Batch 3 — web
import { UTMLinkBuilder, ImagePlaceholderURL, HtmlToMarkdown, SrcsetGenerator, EmailSignatureGenerator, SocialShareLinks, JsonQueryString, MetaRobotsBuilder, ScreenInfo } from "./tools/more3-web";
// Batch 3 — datetime
import { ZodiacSign, ChineseZodiac, MoonPhase, DaysAlive, BirthdayCountdown, HolidayCountdown, NextWeekdayFinder, WeeklyTimecard, SeasonFinder } from "./tools/more3-datetime2";

type ToolEntry = {
  id: string;
  name: string;
  icon: string;
  category: string;
  short: string;
  component: React.ComponentType<Record<string, never>>;
};

const TOOLS: ToolEntry[] = [
  // ── Text ──────────────────────────────────────────────────────
  { id:"case-converter", name:"Case Converter", icon:"Aa", category:"text", short:"Convert text between 11 case formats instantly", component:CaseConverter },
  { id:"word-counter", name:"Word & Character Counter", icon:"123", category:"text", short:"Count words, chars, lines, sentences and reading time", component:TextCounter },
  { id:"text-diff", name:"Text Diff", icon:"↔", category:"text", short:"Compare two texts line by line", component:TextDiff },
  { id:"line-tools", name:"Line Tools", icon:"≡", category:"text", short:"Sort, dedup, reverse, shuffle, number and trim lines", component:LineTools },
  { id:"find-replace", name:"Find & Replace", icon:"⌕", category:"text", short:"Regex-powered find and replace in text", component:FindReplace },
  { id:"regex-tester", name:"Regex Tester", icon:"(.*)", category:"text", short:"Test regular expressions with live highlighting", component:RegexTester },
  { id:"text-encoder", name:"Text Encoder / Decoder", icon:"01", category:"text", short:"Encode text to binary, hex, octal, decimal or Morse", component:TextEncoder2 },
  { id:"cipher-tool", name:"Cipher Tool", icon:"🔤", category:"text", short:"ROT13, Caesar, Atbash, and Vigenère ciphers", component:CipherTool },
  { id:"readability", name:"Readability Analyser", icon:"📖", category:"text", short:"Flesch-Kincaid readability score and grade level", component:ReadabilityTool },
  { id:"palindrome-anagram", name:"Palindrome & Anagram", icon:"↩", category:"text", short:"Check if text is a palindrome or anagram", component:PalindromeAnagram },
  { id:"text-repeater", name:"Text Repeater", icon:"∞", category:"text", short:"Repeat any text N times with custom separator", component:TextRepeater },
  { id:"pig-latin", name:"Pig Latin", icon:"🐷", category:"text", short:"Convert English text to Pig Latin", component:PigLatin },

  // ── Encode ────────────────────────────────────────────────────
  { id:"base64", name:"Base64 Encode / Decode", icon:"64", category:"encode", short:"Encode and decode Base64 and Base64URL strings", component:Base64Tool },
  { id:"url-encode", name:"URL Encode / Decode", icon:"🔗", category:"encode", short:"Encode and decode URLs with encodeURIComponent", component:UrlEncodeTool },
  { id:"html-entity", name:"HTML Entity Encode / Decode", icon:"&amp;", category:"encode", short:"Convert special chars to HTML entities and back", component:HtmlEntityTool },
  { id:"jwt-decoder", name:"JWT Decoder", icon:"🎫", category:"encode", short:"Decode JWT header, payload and view expiry status", component:JwtDecoder },
  { id:"http-basic", name:"HTTP Basic Auth", icon:"🔐", category:"encode", short:"Generate and decode HTTP Basic Authorization headers", component:HttpBasicAuth },
  { id:"unicode-tool", name:"Unicode Escape / Unescape", icon:"U+", category:"encode", short:"Escape Unicode chars to \\uXXXX sequences and back", component:UnicodeTool },
  { id:"string-escaper", name:"String Escaper", icon:"\\", category:"encode", short:"Escape strings for JSON, JS, SQL, CSV, HTML or Regex", component:StringEscaper },
  { id:"base32", name:"Base32 Encode / Decode", icon:"32", category:"encode", short:"Encode and decode Base32 (RFC 4648) strings", component:Base32Tool },
  { id:"data-uri", name:"Data URI Generator", icon:"📎", category:"encode", short:"Convert any content to a base64 data: URI", component:DataUriTool },

  // ── Developer ─────────────────────────────────────────────────
  { id:"json-formatter", name:"JSON Formatter & Validator", icon:"{}", category:"developer", short:"Format, minify, sort and validate JSON", component:JsonFormatter },
  { id:"json-typescript", name:"JSON → TypeScript Interface", icon:"TS", category:"developer", short:"Auto-generate TypeScript interfaces from JSON objects", component:JsonToTypescript },
  { id:"json-zod", name:"JSON → Zod Schema", icon:"Z", category:"developer", short:"Generate Zod validation schemas from JSON", component:JsonToZod },
  { id:"json-go", name:"JSON → Go Struct", icon:"Go", category:"developer", short:"Convert JSON to Go struct with json tags", component:JsonToGoStruct },
  { id:"cron-parser", name:"Cron Expression Parser", icon:"⏰", category:"developer", short:"Parse and explain cron expressions in plain English", component:CronParser },
  { id:"http-status", name:"HTTP Status Codes", icon:"200", category:"developer", short:"Look up any HTTP status code with description", component:HttpStatusLookup },
  { id:"mime-lookup", name:"MIME Type Lookup", icon:"📄", category:"developer", short:"Find MIME types by file extension or type string", component:MimeLookup },
  { id:"sql-formatter", name:"SQL Formatter", icon:"SQL", category:"developer", short:"Format and beautify SQL queries", component:SqlFormatter },
  { id:"markdown-preview", name:"Markdown Previewer", icon:"MD", category:"developer", short:"Live preview Markdown as rendered HTML", component:MarkdownPreviewer },
  { id:"html-preview", name:"HTML Previewer (Sandboxed)", icon:"</> ", category:"developer", short:"Live preview HTML in a sandboxed iframe", component:HtmlPreviewer },
  { id:"env-parser", name:".env File Parser", icon:"⚙", category:"developer", short:"Parse .env files and view key-value pairs", component:EnvParser },
  { id:"json-path", name:"JSON Path Tester", icon:"$.x", category:"developer", short:"Query JSON with JSONPath expressions", component:JsonPathTester },

  // ── Network ───────────────────────────────────────────────────
  { id:"url-shortener", name:"URL Shortener", icon:"🔗", category:"network", short:"Shorten URLs via TinyURL, is.gd and v.gd", component:UrlShortener },
  { id:"url-parser", name:"URL Parser", icon:"🔍", category:"network", short:"Break a URL into protocol, host, path, params and hash", component:UrlParser },
  { id:"url-builder", name:"URL Builder", icon:"🏗", category:"network", short:"Build URLs with a visual query param editor", component:UrlBuilder },
  { id:"ip-lookup", name:"IP Lookup & Geolocation", icon:"🌍", category:"network", short:"Lookup IP geolocation, ISP and timezone", component:IpLookup },
  { id:"dns-lookup", name:"DNS Lookup", icon:"🌐", category:"network", short:"Query DNS records via Cloudflare DoH", component:DnsLookup },
  { id:"query-string", name:"Query String Parser", icon:"?=", category:"network", short:"Parse URL query strings to key-value pairs", component:QueryStringParser },
  { id:"meta-tags", name:"Meta Tag Generator", icon:"<meta>", category:"network", short:"Generate OG, Twitter Card and SEO meta tags", component:MetaTagGenerator },
  { id:"robots-txt", name:"robots.txt Generator", icon:"🤖", category:"network", short:"Generate robots.txt for your website", component:RobotsTxtGenerator },
  { id:"cors-generator", name:"CORS Header Generator", icon:"🛡", category:"network", short:"Generate Access-Control-Allow-* response headers", component:CorsGenerator },

  // ── CSS & Design ──────────────────────────────────────────────
  { id:"color-converter", name:"Color Converter", icon:"🎨", category:"css", short:"Convert between HEX, RGB, HSL and CMYK", component:ColorConverter },
  { id:"color-palette", name:"Color Palette Generator", icon:"🎭", category:"css", short:"Generate shades, tints and color harmonies", component:ColorPalette },
  { id:"contrast-checker", name:"Contrast Checker (WCAG)", icon:"◑", category:"css", short:"Check WCAG AA/AAA color contrast ratios", component:ContrastChecker },
  { id:"gradient-gen", name:"CSS Gradient Generator", icon:"⬡", category:"css", short:"Visual linear, radial and conic gradient builder", component:GradientGenerator },
  { id:"box-shadow", name:"Box Shadow Generator", icon:"▱", category:"css", short:"Visual multi-layer CSS box shadow builder", component:BoxShadowGenerator },
  { id:"border-radius", name:"Border Radius Generator", icon:"⬜", category:"css", short:"Visual per-corner border radius builder", component:BorderRadiusGenerator },
  { id:"css-triangle", name:"CSS Triangle Generator", icon:"△", category:"css", short:"Generate pure CSS triangles in any direction", component:CssTriangle },
  { id:"glassmorphism", name:"Glassmorphism Generator", icon:"🔮", category:"css", short:"Generate backdrop-filter glass effect CSS", component:GlassmorphismGenerator },
  { id:"animation-gen", name:"CSS Animation Generator", icon:"▶", category:"css", short:"Generate @keyframes animations with presets", component:CssAnimationGenerator },
  { id:"media-query", name:"Media Query Builder", icon:"📐", category:"css", short:"Build responsive CSS media queries with breakpoints", component:MediaQueryBuilder },

  // ── Security ──────────────────────────────────────────────────
  { id:"hash-generator", name:"Hash Generator", icon:"#", category:"security", short:"Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes", component:HashGenerator },
  { id:"hmac-generator", name:"HMAC Generator", icon:"🔑", category:"security", short:"Generate HMAC-SHA-256/384/512 signatures", component:HmacGenerator },
  { id:"password-strength", name:"Password Strength Checker", icon:"🔒", category:"security", short:"Analyse password entropy, strength and crack time", component:PasswordStrength },
  { id:"aes-tool", name:"AES Encrypt / Decrypt", icon:"🛡", category:"security", short:"AES-256-GCM browser-side encryption and decryption", component:AesTool },
  { id:"csp-generator", name:"CSP Header Generator", icon:"🛡", category:"security", short:"Build Content-Security-Policy header directives", component:CspGenerator },
  { id:"secret-scanner", name:"Secret Scanner", icon:"🔎", category:"security", short:"Detect exposed secrets, API keys and tokens in code", component:SecretScanner },

  // ── Math & Numbers ─────────────────────────────────────────────
  { id:"scientific-calc", name:"Scientific Calculator", icon:"∑", category:"math", short:"Full scientific calculator with history and trig functions", component:ScientificCalc },
  { id:"base-converter", name:"Number Base Converter", icon:"02", category:"math", short:"Convert numbers between binary, octal, decimal, hex and more", component:BaseConverter },
  { id:"unit-length", name:"Length Converter", icon:"📏", category:"math", short:"Convert between meters, feet, inches, miles and more", component:()=><UnitConverter type="length" /> },
  { id:"unit-weight", name:"Weight Converter", icon:"⚖", category:"math", short:"Convert between kg, lbs, ounces, stones and more", component:()=><UnitConverter type="weight" /> },
  { id:"unit-temp", name:"Temperature Converter", icon:"🌡", category:"math", short:"Convert between Celsius, Fahrenheit, Kelvin and Rankine", component:()=><UnitConverter type="temperature" /> },
  { id:"unit-data", name:"Data Storage Converter", icon:"💾", category:"math", short:"Convert between bytes, KB, MB, GB, TB, PB", component:()=><UnitConverter type="data" /> },
  { id:"unit-speed", name:"Speed Converter", icon:"⚡", category:"math", short:"Convert between m/s, km/h, mph, knots and Mach", component:()=><UnitConverter type="speed" /> },
  { id:"percentage-calc", name:"Percentage Calculator", icon:"%", category:"math", short:"5 percentage calculation formulas in one tool", component:PercentageCalc },
  { id:"statistics-calc", name:"Statistics Calculator", icon:"📊", category:"math", short:"Mean, median, mode, std dev, variance, quartiles", component:StatisticsCalc },
  { id:"loan-calc", name:"Loan / Mortgage Calculator", icon:"🏦", category:"math", short:"Monthly payment, total cost and interest for any loan", component:LoanCalc },
  { id:"gcd-lcm", name:"GCD & LCM Calculator", icon:"÷", category:"math", short:"Greatest common divisor and least common multiple", component:GcdLcm },
  { id:"compound-interest", name:"Compound Interest Calculator", icon:"📈", category:"math", short:"Final amount and gains with compound interest", component:CompoundInterest },

  // ── Date & Time ────────────────────────────────────────────────
  { id:"timestamp", name:"Unix Timestamp Converter", icon:"⏱", category:"datetime", short:"Convert Unix timestamps to human dates and vice versa", component:TimestampConverter },
  { id:"date-calc", name:"Date Calculator", icon:"📅", category:"datetime", short:"Difference between dates and add/subtract days", component:DateCalc },
  { id:"age-calc", name:"Age Calculator", icon:"🎂", category:"datetime", short:"Calculate exact age in years, days and hours", component:AgeCalc },
  { id:"timezone", name:"Timezone Converter", icon:"🌏", category:"datetime", short:"Convert a datetime across 20+ global timezones", component:TimezoneConverter },
  { id:"countdown", name:"Countdown Timer", icon:"⏳", category:"datetime", short:"Countdown to any future date and time", component:CountdownTimer },
  { id:"stopwatch", name:"Stopwatch", icon:"⏱", category:"datetime", short:"Stopwatch with lap times", component:Stopwatch },
  { id:"world-clock", name:"World Clock", icon:"🕐", category:"datetime", short:"Live time in 12 major world cities", component:WorldClock },

  // ── Reference ──────────────────────────────────────────────────
  { id:"ascii-table", name:"ASCII Table", icon:"ABC", category:"reference", short:"Full ASCII character table with decimal, hex and octal", component:AsciiTable },
  { id:"http-headers-ref", name:"HTTP Headers Reference", icon:"📋", category:"reference", short:"Request and response HTTP header reference", component:HttpHeadersRef },
  { id:"html-entities-ref", name:"HTML Entities Reference", icon:"&", category:"reference", short:"Common HTML entity codes with symbols", component:HtmlEntitiesRef },
  { id:"regex-ref", name:"Regex Quick Reference", icon:"(.*)", category:"reference", short:"Regular expression syntax and flags reference", component:RegexRef },
  { id:"git-ref", name:"Git Commands Reference", icon:"⑂", category:"reference", short:"Most-used Git commands with explanations", component:GitRef },
  { id:"linux-ref", name:"Linux Commands Reference", icon:"$_", category:"reference", short:"Essential Linux/Unix shell commands", component:LinuxRef },
  { id:"emoji-picker", name:"Emoji Picker", icon:"😀", category:"reference", short:"Search and copy emojis to clipboard", component:EmojiPicker },
  { id:"keyboard-ref", name:"Keyboard Shortcuts", icon:"⌨", category:"reference", short:"macOS and Windows keyboard shortcuts reference", component:KeyboardRef },
  { id:"color-names", name:"Color Names Reference", icon:"🎨", category:"reference", short:"Named colors with hex codes and Tailwind colors", component:ColorNamesRef },
  { id:"sql-reference", name:"SQL Quick Reference", icon:"SQL", category:"reference", short:"25 essential SQL statements with syntax examples", component:SqlReference },
  { id:"css-reference", name:"CSS Properties Reference", icon:"CSS", category:"reference", short:"30 essential CSS properties with values and descriptions", component:CssReference },
  { id:"js-methods", name:"JavaScript Methods Reference", icon:"JS", category:"reference", short:"30 most-used JS Array, Object and String methods", component:JsMethodsReference },
  { id:"docker-ref", name:"Docker Commands Reference", icon:"🐳", category:"reference", short:"30 essential Docker and docker-compose commands", component:DockerReference },
  { id:"node-ref", name:"Node.js / npm Reference", icon:"⬡", category:"reference", short:"Essential Node.js and npm commands reference", component:NodeReference },
  { id:"tailwind-ref", name:"Tailwind CSS Reference", icon:"🌊", category:"reference", short:"Most-used Tailwind CSS utility classes with CSS equivalents", component:TailwindReference },

  // ── Image Tools ────────────────────────────────────────────────
  { id:"image-resizer", name:"Image Resizer", icon:"⤡", category:"image", short:"Resize images to exact dimensions in the browser", component:ImageResizer },
  { id:"image-filters", name:"Image Filter & Effects", icon:"✨", category:"image", short:"Apply grayscale, sepia, blur, brightness and more", component:ImageFilters },
  { id:"image-to-base64", name:"Image to Base64", icon:"📷", category:"image", short:"Convert any image to base64 data URI, CSS, HTML", component:ImageToBase64 },
  { id:"base64-to-image", name:"Base64 to Image", icon:"🖼", category:"image", short:"Decode base64 or data URI back to a viewable image", component:Base64ToImage },
  { id:"exif-viewer", name:"Image Metadata Viewer", icon:"📊", category:"image", short:"View file size, dimensions and metadata of any image", component:ExifViewer },
  { id:"favicon-generator", name:"Favicon Generator", icon:"⭐", category:"image", short:"Generate favicon PNG files in all standard sizes", component:FaviconGenerator },
  { id:"image-watermark", name:"Image Watermark", icon:"©", category:"image", short:"Add text watermarks to images with position and opacity control", component:ImageWatermark },
  { id:"color-picker-img", name:"Color Picker from Image", icon:"🎨", category:"image", short:"Click any pixel on an image to pick its hex, RGB and HSL color", component:ColorPickerFromImage },
  { id:"image-compressor", name:"Image Compressor", icon:"📦", category:"image", short:"Compress images to WebP or JPEG with quality slider", component:ImageCompressor },

  // ── More Text ──────────────────────────────────────────────────
  { id:"lorem-ipsum", name:"Lorem Ipsum Generator", icon:"Aa", category:"text", short:"Generate placeholder text in words, sentences or paragraphs", component:LoremIpsum },
  { id:"slug-generator", name:"Slug Generator", icon:"🔗", category:"text", short:"Convert any title to a URL-safe slug", component:SlugGenerator },
  { id:"word-frequency", name:"Word Frequency Counter", icon:"📊", category:"text", short:"Count word frequency with bar chart — filter stop words", component:WordFrequency },
  { id:"hashtag-generator", name:"Hashtag Generator", icon:"#", category:"text", short:"Generate relevant hashtags from topic keywords", component:HashtagGenerator },
  { id:"markdown-table-gen", name:"Markdown Table Generator", icon:"⊞", category:"text", short:"Visual spreadsheet editor that outputs Markdown table syntax", component:MarkdownTableGen },
  { id:"csv-to-html", name:"CSV to HTML Table", icon:"⊡", category:"text", short:"Convert CSV data to styled HTML table markup", component:CsvToHtmlTable },
  { id:"remove-html-tags", name:"Remove HTML Tags", icon:"</x>", category:"text", short:"Strip HTML tags and decode entities to plain text", component:RemoveHtmlTags },
  { id:"number-to-words", name:"Number to Words", icon:"123", category:"text", short:"Convert any number to its English word form", component:NumberToWords },
  { id:"roman-numerals", name:"Roman Numeral Converter", icon:"XIV", category:"text", short:"Convert between Arabic and Roman numerals (1–3999)", component:RomanNumeralConverter },
  { id:"gzip-tool", name:"GZIP Compress / Decompress", icon:"⚡", category:"encode", short:"Compress text to gzip base64 and decompress back using CompressionStream API", component:GzipTool },
  { id:"text-to-speech", name:"Text to Speech", icon:"🔊", category:"text", short:"Convert text to speech in 20+ voices using Web Speech API", component:TextToSpeech },
  { id:"whitespace-visualizer", name:"Whitespace Visualizer", icon:"⎵", category:"text", short:"Show all spaces, tabs and newlines as visible symbols", component:WhitespaceVisualizer },
  { id:"duplicate-finder", name:"Duplicate Word Finder", icon:"⊕", category:"text", short:"Find and highlight all repeated words in text", component:DuplicateWordFinder },

  // ── More Developer ─────────────────────────────────────────────
  { id:"json-diff", name:"JSON Diff", icon:"Δ", category:"developer", short:"Compare two JSON objects and highlight added, removed and changed keys", component:JsonDiff },
  { id:"yaml-json", name:"YAML ↔ JSON Converter", icon:"⇄", category:"developer", short:"Convert between YAML and JSON formats with full fidelity", component:YamlJsonConverter },
  { id:"xml-formatter", name:"XML Formatter", icon:"</>", category:"developer", short:"Parse and pretty-print any XML document", component:XmlFormatter },
  { id:"css-minifier", name:"CSS Minifier", icon:"CSS", category:"developer", short:"Remove whitespace and comments from CSS to reduce file size", component:CssMinifier },
  { id:"html-minifier", name:"HTML Minifier", icon:"<!>", category:"developer", short:"Minify HTML by removing whitespace and comments", component:HtmlMinifier },
  { id:"gitignore-gen", name:".gitignore Generator", icon:"⑂", category:"developer", short:"Generate .gitignore for Node, Python, Go, Java, macOS, Windows and more", component:GitignoreGenerator },
  { id:"license-gen", name:"Open Source License Generator", icon:"📜", category:"developer", short:"Generate MIT, Apache 2, GPL 3, BSD 2, ISC or Unlicense text", component:LicenseGenerator },
  { id:"semver-bumper", name:"Semver Version Bumper", icon:"🔖", category:"developer", short:"Calculate patch, minor, major and pre-release version bumps", component:SemverBumper },
  { id:"uuid-batch", name:"UUID Batch Generator", icon:"🔑", category:"developer", short:"Generate up to 100 UUIDs at once (v4, v7, or short format)", component:UuidBatchGenerator },
  { id:"totp-gen", name:"TOTP Code Generator", icon:"🔐", category:"security", short:"Generate TOTP one-time passwords from a Base32 secret key (RFC 6238)", component:TotpGenerator },
  { id:"http-request-builder", name:"HTTP Request Builder", icon:"→", category:"developer", short:"Build and send HTTP requests with custom headers and body — mini Postman", component:HttpRequestBuilder },

  // ── More Network ───────────────────────────────────────────────
  { id:"cidr-calculator", name:"CIDR Calculator", icon:"🌐", category:"network", short:"Calculate network address, broadcast, mask and usable hosts from CIDR notation", component:CidrCalculator },
  { id:"email-validator", name:"Email Validator", icon:"✉", category:"network", short:"Validate multiple email addresses at once — one per line", component:EmailValidator },
  { id:"domain-extractor", name:"Domain Extractor", icon:"🔗", category:"network", short:"Extract all domains and URLs from any block of text", component:DomainExtractor },
  { id:"ip-validator", name:"IPv4 / IPv6 Validator", icon:"#", category:"network", short:"Check if an IP address is valid IPv4 or IPv6 and whether it is private", component:IpValidator },
  { id:"webhook-tester", name:"Webhook Tester", icon:"📡", category:"network", short:"Send a test POST request to any webhook URL with custom JSON payload", component:WebhookTester },
  { id:"og-checker", name:"OG Tags Checker", icon:"🖼", category:"network", short:"Inspect Open Graph and Twitter Card meta tags of any URL", component:OgTagsChecker },
  { id:"punycode", name:"Punycode Converter", icon:"🌍", category:"network", short:"Convert international domain names to Punycode ASCII and back", component:PunycodeConverter },
  { id:"ssl-info", name:"SSL Certificate Info", icon:"🔒", category:"network", short:"Check SSL/TLS certificate status and get inspection commands", component:SslInfo },

  // ── More CSS ───────────────────────────────────────────────────
  { id:"neumorphism", name:"Neumorphism Generator", icon:"◉", category:"css", short:"Generate soft UI neumorphic box-shadow effects with live preview", component:NeumorphismGenerator },
  { id:"css-button", name:"CSS Button Generator", icon:"◻", category:"css", short:"Visual builder for CSS buttons with solid, outline, ghost and soft styles", component:CssButtonGenerator },
  { id:"css-variables", name:"CSS Variables Generator", icon:"--", category:"css", short:"Build a :root CSS custom properties (variables) block", component:CssVariablesGenerator },
  { id:"clip-path", name:"CSS Clip Path Generator", icon:"✂", category:"css", short:"Generate CSS clip-path shapes: polygon, circle, ellipse and inset", component:CssClipPath },
  { id:"type-scale", name:"Typography Scale Generator", icon:"Ag", category:"css", short:"Generate a modular type scale with CSS custom properties", component:TypographyScale },

  // ── More Math ──────────────────────────────────────────────────
  { id:"prime-factorization", name:"Prime Factorization", icon:"🔢", category:"math", short:"Find all prime factors and their exponents for any number", component:PrimeFactorization },
  { id:"fibonacci", name:"Fibonacci Sequence", icon:"∞", category:"math", short:"Generate Fibonacci numbers up to F(78) with exact bigint precision", component:FibonacciSequence },
  { id:"matrix-calc", name:"Matrix Calculator", icon:"⊞", category:"math", short:"2×2 and 3×3 matrix addition, subtraction, multiplication, transpose and determinant", component:MatrixCalculator },
  { id:"tip-calculator", name:"Tip Calculator", icon:"💰", category:"math", short:"Calculate tip amount, total and per-person split for restaurant bills", component:TipCalculator },
  { id:"business-days", name:"Business Days Calculator", icon:"📅", category:"datetime", short:"Add business days to a date or count working days between two dates", component:BusinessDaysCalc },
  { id:"discount-calc", name:"Discount & Markup Calculator", icon:"%", category:"math", short:"Calculate final price, savings and markup for any discount or markup percentage", component:DiscountCalculator },

  // ── Batch 2: Text ──────────────────────────────────────────────
  { id:"reverse-text", name:"Reverse Text", icon:"↩", category:"text", short:"Reverse text by characters, words or lines", component:ReverseText },
  { id:"nato-phonetic", name:"NATO Phonetic Alphabet", icon:"📻", category:"text", short:"Spell out text using the NATO phonetic alphabet", component:NatoPhonetic },
  { id:"upside-down", name:"Upside Down Text", icon:"🙃", category:"text", short:"Flip text upside down with Unicode characters", component:UpsideDownText },
  { id:"fancy-text", name:"Fancy Unicode Text", icon:"𝓕", category:"text", short:"Bold, italic, script and 8 other Unicode text styles for social bios", component:FancyUnicodeText },
  { id:"zalgo-text", name:"Zalgo Glitch Text", icon:"🗯", category:"text", short:"Add chaotic combining marks to create glitch text", component:ZalgoText },
  { id:"acronym-extractor", name:"Acronym Extractor", icon:"🔠", category:"text", short:"Build an acronym from the first letter of each word", component:AcronymExtractor },
  { id:"advanced-text-sorter", name:"Advanced Text Sorter", icon:"↕", category:"text", short:"Sort lines alphabetically, numerically, by length, naturally or shuffle", component:AdvancedTextSorter },
  { id:"column-extractor", name:"Column Extractor", icon:"▤", category:"text", short:"Extract a single column from delimited text", component:ColumnExtractor },
  { id:"text-cleaner", name:"Text Cleaner", icon:"🧹", category:"text", short:"Trim, collapse spaces, remove blank lines and clean up messy text", component:TextCleaner },

  // ── Batch 2: Developer / Data ──────────────────────────────────
  { id:"csv-to-json", name:"CSV → JSON", icon:"⇄", category:"developer", short:"Convert CSV (quote-aware) to a JSON array of objects", component:CsvToJson },
  { id:"json-to-csv", name:"JSON → CSV", icon:"⇄", category:"developer", short:"Flatten a JSON array of objects into CSV", component:JsonToCsv },
  { id:"json-to-xml", name:"JSON → XML", icon:"</>", category:"developer", short:"Convert any JSON object or array into pretty XML", component:JsonToXml },
  { id:"sql-insert-gen", name:"SQL INSERT Generator", icon:"SQL", category:"developer", short:"Turn a JSON array into INSERT statements for any table", component:SqlInsertGenerator },
  { id:"curl-to-fetch", name:"cURL → fetch()", icon:"→", category:"developer", short:"Convert a curl command into a JavaScript fetch() call", component:CurlConverter },
  { id:"mock-data", name:"Mock Data Generator", icon:"🎲", category:"developer", short:"Generate realistic fake user records as JSON", component:MockDataGenerator },
  { id:"json-flatten", name:"JSON Flatten", icon:"⊟", category:"developer", short:"Flatten nested JSON into dot/bracket notation keys", component:JsonFlatten },
  { id:"ascii-tree", name:"ASCII Tree Generator", icon:"🌳", category:"developer", short:"Turn an indented list into an ASCII folder tree", component:AsciiTreeGenerator },
  { id:"jwt-builder", name:"JWT Builder (HS256)", icon:"🎫", category:"security", short:"Build and sign a JWT with HMAC-SHA256 in the browser", component:JwtBuilder },

  // ── Batch 2: CSS & Design ──────────────────────────────────────
  { id:"flexbox-playground", name:"Flexbox Playground", icon:"⬓", category:"css", short:"Interactive flexbox builder with live preview and CSS output", component:FlexboxPlayground },
  { id:"css-grid-gen", name:"CSS Grid Generator", icon:"⊞", category:"css", short:"Visual CSS grid builder with columns, rows and gap", component:CssGridGenerator },
  { id:"text-shadow-gen", name:"Text Shadow Generator", icon:"🅣", category:"css", short:"Visual text-shadow builder with live preview", component:TextShadowGenerator },
  { id:"cubic-bezier", name:"Cubic Bezier Editor", icon:"∿", category:"css", short:"Visual easing curve editor with presets", component:CubicBezier },
  { id:"aspect-ratio", name:"Aspect Ratio Calculator", icon:"▭", category:"css", short:"Find aspect ratios and scale dimensions proportionally", component:AspectRatioCalc },
  { id:"css-unit-converter", name:"CSS Unit Converter", icon:"px", category:"css", short:"Convert between px, rem, em, pt, % and vw", component:CssUnitConverter },
  { id:"color-shades", name:"Color Shade Scale", icon:"🎚", category:"css", short:"Generate a 50–950 tint/shade scale from one color", component:ColorShadeScale },
  { id:"scrollbar-gen", name:"CSS Scrollbar Generator", icon:"▮", category:"css", short:"Style custom scrollbars for WebKit and Firefox", component:CssScrollbarGenerator },
  { id:"css-loader", name:"CSS Loader Generator", icon:"◌", category:"css", short:"Generate animated CSS spinners with live preview", component:CssLoaderGenerator },

  // ── Batch 2: Math & Numbers ────────────────────────────────────
  { id:"quadratic-solver", name:"Quadratic Equation Solver", icon:"x²", category:"math", short:"Solve ax²+bx+c=0 with real and complex roots", component:QuadraticSolver },
  { id:"right-triangle", name:"Right Triangle Solver", icon:"📐", category:"math", short:"Find hypotenuse, area, perimeter and angles from two legs", component:RightTriangleSolver },
  { id:"permutation-combination", name:"Permutations & Combinations", icon:"nCr", category:"math", short:"Calculate nPr, nCr and factorials", component:PermutationCombination },
  { id:"ratio-simplifier", name:"Ratio Simplifier", icon:":", category:"math", short:"Simplify a ratio to lowest terms with GCD", component:RatioSimplifier },
  { id:"scientific-notation", name:"Scientific Notation Converter", icon:"×10", category:"math", short:"Convert between standard, scientific and engineering notation", component:ScientificNotation },
  { id:"pace-calculator", name:"Running Pace Calculator", icon:"🏃", category:"math", short:"Calculate pace and speed from distance and time", component:PaceCalculator },
  { id:"salary-converter", name:"Salary Converter", icon:"💵", category:"math", short:"Convert annual salary to hourly, daily, weekly and monthly", component:SalaryConverter },
  { id:"fuel-cost", name:"Fuel Cost Calculator", icon:"⛽", category:"math", short:"Estimate fuel needed and trip cost from distance and consumption", component:FuelCostCalc },
  { id:"bitwise-calc", name:"Bitwise Calculator", icon:"&", category:"math", short:"AND, OR, XOR, NOT and bit shifts with binary view", component:BitwiseCalculator },

  // ── Batch 2: Date & Time ───────────────────────────────────────
  { id:"duration-calc", name:"Duration Calculator", icon:"⏲", category:"datetime", short:"Convert days/hours/minutes/seconds into every total unit", component:DurationCalculator },
  { id:"week-number", name:"Week Number Calculator", icon:"📆", category:"datetime", short:"Find the ISO week number and day of year for any date", component:WeekNumber },
  { id:"date-format-tokens", name:"Date Format Converter", icon:"📅", category:"datetime", short:"Show a date in ISO, RFC, Unix, long and other formats", component:DateFormatTokens },
  { id:"time-until", name:"Time Until / Countdown", icon:"⌛", category:"datetime", short:"Live countdown to any future date and time", component:TimeUntil },
  { id:"leap-year", name:"Leap Year Checker", icon:"🗓", category:"datetime", short:"Check if a year is a leap year and find the next one", component:LeapYearChecker },
  { id:"day-of-week", name:"Day of Week Finder", icon:"📌", category:"datetime", short:"Find which weekday any date falls on", component:DayOfWeekFinder },
  { id:"cron-next-runs", name:"Cron Next Runs", icon:"⏰", category:"datetime", short:"Compute the next 8 run times for a cron expression", component:CronNextRuns },
  { id:"epoch-batch", name:"Epoch Batch Converter", icon:"⏱", category:"datetime", short:"Convert many Unix timestamps to ISO dates at once", component:EpochBatchConverter },
  { id:"work-hours", name:"Work Hours Calculator", icon:"🕗", category:"datetime", short:"Calculate hours worked from clock-in, clock-out and break", component:WorkHoursCalculator },

  // ── Batch 2: Security ──────────────────────────────────────────
  { id:"password-generator", name:"Password Generator", icon:"🔑", category:"security", short:"Generate strong random passwords with crypto randomness", component:PasswordGenerator },
  { id:"passphrase-generator", name:"Passphrase Generator", icon:"🎲", category:"security", short:"Generate memorable diceware-style word passphrases", component:PassphraseGenerator },
  { id:"random-string", name:"Random String Generator", icon:"#", category:"security", short:"Generate random hex, alphanumeric or base64 strings", component:RandomStringGenerator },
  { id:"credit-card-validator", name:"Credit Card Validator", icon:"💳", category:"security", short:"Validate card numbers with the Luhn algorithm and detect type", component:CreditCardValidator },
  { id:"iban-validator", name:"IBAN Validator", icon:"🏦", category:"security", short:"Validate international bank account numbers (mod-97)", component:IbanValidator },
  { id:"base58", name:"Base58 Encode / Decode", icon:"58", category:"security", short:"Bitcoin-style Base58 encoding and decoding", component:Base58Tool },
  { id:"rot47", name:"ROT47 Cipher", icon:"🔁", category:"security", short:"Apply the ROT47 substitution cipher", component:Rot47Tool },
  { id:"hash-identifier", name:"Hash Identifier", icon:"🔎", category:"security", short:"Identify likely hash type from length and format", component:HashIdentifier },
  { id:"pin-generator", name:"PIN Code Generator", icon:"🔢", category:"security", short:"Generate random numeric PIN codes securely", component:PinGenerator },

  // ── Batch 2: Network ───────────────────────────────────────────
  { id:"user-agent-parser", name:"User Agent Parser", icon:"🧭", category:"network", short:"Parse browser, OS, device and engine from a User-Agent string", component:UserAgentParser },
  { id:"header-analyzer", name:"HTTP Header Analyzer", icon:"📋", category:"network", short:"Explain each HTTP header from a raw response", component:HttpHeaderAnalyzer },
  { id:"port-reference", name:"Common Ports Reference", icon:"🔌", category:"network", short:"Searchable reference of common TCP/UDP ports", component:PortReference },
  { id:"cookie-parser", name:"Cookie Parser", icon:"🍪", category:"network", short:"Break a Set-Cookie value into name, value and attributes", component:CookieParser },
  { id:"mac-address", name:"MAC Address Formatter", icon:"🖧", category:"network", short:"Reformat MAC addresses and inspect the vendor prefix", component:MacAddressTool },
  { id:"ip-range-expander", name:"CIDR IP Range Expander", icon:"🌐", category:"network", short:"Expand a CIDR block into network, broadcast and host list", component:IpRangeExpander },
  { id:"hostname-validator", name:"Hostname Validator", icon:"✓", category:"network", short:"Check a hostname against RFC label and length rules", component:HostnameValidator },
  { id:"accept-language", name:"Accept-Language Parser", icon:"🌍", category:"network", short:"Parse and rank an Accept-Language header by q-weight", component:AcceptLanguageParser },
  { id:"connection-string", name:"Connection String Parser", icon:"🔗", category:"network", short:"Break a database URI into its component parts", component:ConnectionStringParser },

  // ── Batch 2: Converters ────────────────────────────────────────
  { id:"number-base-multi", name:"Number Base Multi-Converter", icon:"02", category:"math", short:"Convert a number to binary, octal, decimal, hex and base36 at once", component:NumberBaseMulti },
  { id:"text-binary", name:"Text ↔ Binary", icon:"01", category:"encode", short:"Convert text to binary and back", component:TextBinaryConverter },
  { id:"feels-like", name:"Feels-Like Temperature", icon:"🌡", category:"math", short:"Heat index and wind chill from temp, humidity and wind", component:FeelsLikeCalc },
  { id:"bmi-calc", name:"BMI Calculator", icon:"⚖", category:"math", short:"Calculate Body Mass Index and category", component:BmiCalculator },
  { id:"geometry-calc", name:"Geometry Calculator", icon:"△", category:"math", short:"Area, volume and perimeter for circles, triangles, spheres and more", component:GeometryCalc },
  { id:"fraction-converter", name:"Fraction ↔ Decimal", icon:"½", category:"math", short:"Convert decimals to simplified fractions and back", component:FractionConverter },
  { id:"roman-live", name:"Roman Numeral Converter", icon:"Ⅻ", category:"math", short:"Convert between numbers and Roman numerals either way", component:RomanConverterLive },
  { id:"angle-converter", name:"Angle Converter", icon:"∠", category:"math", short:"Convert between degrees, radians, gradians and turns", component:AngleConverter },
  { id:"byte-humanizer", name:"Byte Size Humanizer", icon:"💾", category:"math", short:"Convert raw bytes to human-readable KB/MB/GB (binary and decimal)", component:ByteSizeHumanizer },

  // ── Batch 3: Productivity ──────────────────────────────────────
  { id:"pomodoro", name:"Pomodoro Timer", icon:"🍅", category:"productivity", short:"25/5 focus timer to boost your productivity", component:PomodoroTimer },
  { id:"todo-list", name:"To-Do List", icon:"✅", category:"productivity", short:"Simple task list saved to your device", component:TodoList },
  { id:"scratchpad", name:"Scratchpad / Notes", icon:"📝", category:"productivity", short:"Quick notes with auto-save and word count", component:Scratchpad },
  { id:"coin-flip", name:"Coin Flip", icon:"🪙", category:"productivity", short:"Flip a virtual coin with running stats", component:CoinFlip },
  { id:"dice-roller", name:"Dice Roller", icon:"🎲", category:"productivity", short:"Roll any number of dice with any sides", component:DiceRoller },
  { id:"decision-maker", name:"Decision Maker", icon:"🤷", category:"productivity", short:"Can't decide? Let it pick from your options", component:DecisionMaker },
  { id:"random-picker", name:"Random Name Picker", icon:"🎯", category:"productivity", short:"Draw random winners from a list (raffle)", component:RandomPicker },
  { id:"event-countdown", name:"Event Countdown", icon:"⏳", category:"productivity", short:"Live countdown to any event", component:EventCountdown },
  { id:"timer-alarm", name:"Timer with Alarm", icon:"⏰", category:"productivity", short:"Countdown timer that beeps when done", component:TimerAlarm },

  // ── Batch 3: Finance ───────────────────────────────────────────
  { id:"simple-interest", name:"Simple Interest Calculator", icon:"💵", category:"finance", short:"Calculate simple interest and total amount", component:SimpleInterestCalc },
  { id:"sip-calculator", name:"SIP / Investment Calculator", icon:"📈", category:"finance", short:"Future value of monthly investments with compounding", component:SIPCalculator },
  { id:"emi-calculator", name:"EMI Calculator", icon:"🏦", category:"finance", short:"Monthly loan EMI, total interest and payable", component:EMICalculator },
  { id:"gst-calculator", name:"GST Calculator", icon:"🧾", category:"finance", short:"Add or remove GST with CGST/SGST split", component:GSTCalculator },
  { id:"income-tax-india", name:"Income Tax Calculator (India)", icon:"🇮🇳", category:"finance", short:"Estimate tax under the new regime (FY 2024-25)", component:IncomeTaxIndia },
  { id:"profit-margin", name:"Profit Margin Calculator", icon:"📊", category:"finance", short:"Profit, margin and markup from cost and price", component:ProfitMarginCalc },
  { id:"roi-calculator", name:"ROI Calculator", icon:"💹", category:"finance", short:"Return on investment, total and annualized", component:ROICalculator },
  { id:"savings-goal", name:"Savings Goal Calculator", icon:"🎯", category:"finance", short:"How much to save monthly to hit a goal", component:SavingsGoalCalc },
  { id:"inflation-calc", name:"Inflation Calculator", icon:"📉", category:"finance", short:"Future cost and today's value with inflation", component:InflationCalc },

  // ── Batch 3: Health ────────────────────────────────────────────
  { id:"bmr-calories", name:"BMR & Calorie Calculator", icon:"🔥", category:"health", short:"Daily calorie needs from BMR and activity", component:BMRCalorieCalc },
  { id:"body-fat", name:"Body Fat Estimator", icon:"📏", category:"health", short:"Estimate body fat % with the US Navy method", component:BodyFatEstimator },
  { id:"water-intake", name:"Water Intake Calculator", icon:"💧", category:"health", short:"Recommended daily water based on weight & activity", component:WaterIntakeCalc },
  { id:"ideal-weight", name:"Ideal Weight Calculator", icon:"⚖", category:"health", short:"Ideal body weight by Devine, Robinson and BMI", component:IdealWeightCalc },
  { id:"pregnancy-due", name:"Pregnancy Due Date", icon:"🤰", category:"health", short:"Estimate due date and current week", component:PregnancyDueDate },
  { id:"ovulation-calc", name:"Ovulation Calculator", icon:"📅", category:"health", short:"Estimate ovulation day and fertile window", component:OvulationCalc },
  { id:"macro-calculator", name:"Macro Calculator", icon:"🍗", category:"health", short:"Daily carbs, protein and fat from calories", component:MacroCalculator },
  { id:"heart-rate-zones", name:"Heart Rate Zones", icon:"❤️", category:"health", short:"Target heart-rate training zones by age", component:HeartRateZones },
  { id:"sleep-calculator", name:"Sleep Calculator", icon:"😴", category:"health", short:"Best bedtimes based on 90-minute sleep cycles", component:SleepCalculator },

  // ── Batch 3: Converters ────────────────────────────────────────
  { id:"cooking-converter", name:"Cooking Measurement Converter", icon:"🥄", category:"math", short:"Convert cups, tbsp, tsp, ml, fl oz and pints", component:CookingConverter },
  { id:"shoe-size", name:"Shoe Size Converter", icon:"👟", category:"math", short:"Convert shoe sizes between US, UK, EU and cm", component:ShoeSizeConverter },
  { id:"ring-size", name:"Ring Size Converter", icon:"💍", category:"math", short:"Convert ring sizes between US, UK and EU", component:RingSizeConverter },
  { id:"fuel-economy", name:"Fuel Economy Converter", icon:"⛽", category:"math", short:"Convert km/L, L/100km and MPG (US/UK)", component:FuelEconomyConverter },
  { id:"pressure-converter", name:"Pressure Converter", icon:"🌡", category:"math", short:"Convert bar, psi, atm, kPa and mmHg", component:PressureConverter },
  { id:"energy-converter", name:"Energy Converter", icon:"⚡", category:"math", short:"Convert joules, kcal, kWh and BTU", component:EnergyConverter },
  { id:"power-converter", name:"Power Converter", icon:"🔌", category:"math", short:"Convert watts, kW, HP and PS", component:PowerConverter },
  { id:"oven-temp", name:"Oven Temperature Converter", icon:"🍞", category:"math", short:"Convert °C, °F and gas mark", component:OvenTempConverter },
  { id:"paper-sizes", name:"Paper Size Reference", icon:"📄", category:"reference", short:"A0–A6, Letter and Legal dimensions in mm/inches", component:PaperSizeReference },

  // ── Batch 3: Text ──────────────────────────────────────────────
  { id:"char-limit", name:"Character Limit Counter", icon:"🔢", category:"text", short:"Count characters against Tweet, SMS and SEO limits", component:CharLimitCounter },
  { id:"remove-line-breaks", name:"Remove Line Breaks", icon:"↵", category:"text", short:"Strip or replace line breaks in text", component:RemoveLineBreaks },
  { id:"list-comma", name:"List ↔ Comma Converter", icon:"，", category:"text", short:"Convert between line lists and comma-separated", component:ListCommaConverter },
  { id:"email-extractor", name:"Email Extractor", icon:"✉", category:"text", short:"Pull all email addresses out of any text", component:EmailExtractor },
  { id:"bionic-reading", name:"Bionic Reading Converter", icon:"👁", category:"text", short:"Bold word beginnings to read faster", component:BionicReading },
  { id:"random-word", name:"Random Word Generator", icon:"🎲", category:"text", short:"Generate random words for ideas and games", component:RandomWordGenerator },
  { id:"username-gen", name:"Username Generator", icon:"@", category:"text", short:"Generate catchy available-style usernames", component:UsernameGenerator },
  { id:"list-dedupe", name:"List Deduplicator", icon:"⊟", category:"text", short:"Remove duplicate lines, optionally sort", component:ListDeduplicator },
  { id:"sentence-case", name:"Sentence Case Converter", icon:"Aa", category:"text", short:"Capitalize the first letter of each sentence", component:CaseSentence },

  // ── Batch 3: Fun & Random ──────────────────────────────────────
  { id:"magic-8-ball", name:"Magic 8 Ball", icon:"🎱", category:"fun", short:"Ask a yes/no question and shake for an answer", component:Magic8Ball },
  { id:"random-quote", name:"Random Quote", icon:"💬", category:"fun", short:"Get an inspiring quote to copy and share", component:RandomQuote },
  { id:"would-you-rather", name:"Would You Rather", icon:"🤔", category:"fun", short:"Random would-you-rather questions", component:WouldYouRather },
  { id:"truth-or-dare", name:"Truth or Dare", icon:"😈", category:"fun", short:"Random truths and dares for parties", component:TruthOrDare },
  { id:"random-color-fun", name:"Random Color Generator", icon:"🎨", category:"fun", short:"Generate a random color with hex code", component:RandomColorGenerator },
  { id:"fantasy-name", name:"Fantasy Name Generator", icon:"🧝", category:"fun", short:"Generate fantasy character names", component:FantasyNameGenerator },
  { id:"rock-paper-scissors", name:"Rock Paper Scissors", icon:"✊", category:"fun", short:"Play rock-paper-scissors vs the computer", component:RockPaperScissors },
  { id:"number-guess", name:"Number Guessing Game", icon:"🔮", category:"fun", short:"Guess the secret number 1–100", component:NumberGuessGame },
  { id:"random-emoji", name:"Random Emoji Generator", icon:"😀", category:"fun", short:"Generate a random set of emojis", component:RandomEmoji },

  // ── Batch 3: Web ───────────────────────────────────────────────
  { id:"utm-builder", name:"UTM Link Builder", icon:"🔗", category:"network", short:"Build campaign tracking URLs with UTM parameters", component:UTMLinkBuilder },
  { id:"image-placeholder", name:"Image Placeholder URL", icon:"🖼", category:"developer", short:"Generate Lorem Picsum / placehold.co image URLs", component:ImagePlaceholderURL },
  { id:"html-to-markdown", name:"HTML → Markdown", icon:"⇄", category:"developer", short:"Convert HTML into clean Markdown", component:HtmlToMarkdown },
  { id:"srcset-gen", name:"Srcset Generator", icon:"🖼", category:"developer", short:"Build responsive <img srcset> markup", component:SrcsetGenerator },
  { id:"email-signature", name:"Email Signature Generator", icon:"✍", category:"developer", short:"Create an HTML email signature", component:EmailSignatureGenerator },
  { id:"social-share", name:"Social Share Link Generator", icon:"📣", category:"network", short:"Generate share links for WhatsApp, X, FB and more", component:SocialShareLinks },
  { id:"json-querystring", name:"JSON ↔ Query String", icon:"?=", category:"developer", short:"Convert between JSON and URL query strings", component:JsonQueryString },
  { id:"meta-robots", name:"Meta Robots Generator", icon:"🤖", category:"network", short:"Build the robots meta tag for SEO", component:MetaRobotsBuilder },
  { id:"screen-info", name:"Screen & Viewport Info", icon:"🖥", category:"developer", short:"Your screen size, DPR, color depth and more", component:ScreenInfo },

  // ── Batch 3: Date & Time ───────────────────────────────────────
  { id:"zodiac-sign", name:"Zodiac Sign Finder", icon:"♌", category:"datetime", short:"Find your Western zodiac sign from your birthday", component:ZodiacSign },
  { id:"chinese-zodiac", name:"Chinese Zodiac", icon:"🐉", category:"datetime", short:"Find your Chinese zodiac animal and element", component:ChineseZodiac },
  { id:"moon-phase", name:"Moon Phase Calculator", icon:"🌙", category:"datetime", short:"Moon phase and illumination for any date", component:MoonPhase },
  { id:"days-alive", name:"Days Alive Counter", icon:"🎂", category:"datetime", short:"How many days, hours and seconds you've lived", component:DaysAlive },
  { id:"birthday-countdown", name:"Birthday Countdown", icon:"🎈", category:"datetime", short:"Days until your next birthday", component:BirthdayCountdown },
  { id:"holiday-countdown", name:"Holiday Countdown", icon:"🎄", category:"datetime", short:"Days until New Year, Christmas and more", component:HolidayCountdown },
  { id:"next-weekday", name:"Next Weekday Finder", icon:"📆", category:"datetime", short:"Find the date of the next Monday, Friday, etc.", component:NextWeekdayFinder },
  { id:"weekly-timecard", name:"Weekly Timecard", icon:"🕗", category:"datetime", short:"Add up weekly work hours and overtime", component:WeeklyTimecard },
  { id:"season-finder", name:"Season Finder", icon:"🍂", category:"datetime", short:"Find the season for any date and hemisphere", component:SeasonFinder },
];

const CATEGORIES = [
  { id:"all", label:"All Tools", icon:"⚡" },
  { id:"text", label:"Text", icon:"Aa" },
  { id:"encode", label:"Encode / Decode", icon:"64" },
  { id:"developer", label:"Developer", icon:"{}" },
  { id:"network", label:"Network & URL", icon:"🌐" },
  { id:"css", label:"CSS & Design", icon:"🎨" },
  { id:"security", label:"Security", icon:"🔐" },
  { id:"math", label:"Math & Units", icon:"∑" },
  { id:"finance", label:"Finance", icon:"💰" },
  { id:"health", label:"Health", icon:"❤️" },
  { id:"datetime", label:"Date & Time", icon:"⏱" },
  { id:"productivity", label:"Productivity", icon:"✅" },
  { id:"image", label:"Image Tools", icon:"🖼" },
  { id:"reference", label:"Reference", icon:"📚" },
  { id:"fun", label:"Fun & Random", icon:"🎲" },
];

export function DevToolsClient() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return TOOLS.filter(t =>
      (cat === "all" || t.category === cat) &&
      (!q || t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.id.includes(q))
    );
  }, [query, cat]);

  const open = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div>
      {/* Search + category */}
      <div className="mb-6 space-y-4">
        <input
          className="input-field w-full text-base py-3"
          placeholder={`Search ${TOOLS.length} developer tools…`}
          value={query}
          onChange={e => { setQuery(e.target.value); setCat("all"); }}
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); setQuery(""); }}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${cat === c.id ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400" : "surface hover:border-brand-400"}`}
            >
              <span aria-hidden className="mr-1">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted mb-4">
        Showing {filtered.length} of {TOOLS.length} tools
        {cat !== "all" && ` in ${CATEGORIES.find(c => c.id === cat)?.label}`}
        {query && ` matching "${query}"`}
      </p>

      {/* Tools grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tool => {
          const isOpen = openId === tool.id;
          const Comp = tool.component;
          return (
            <div
              key={tool.id}
              className={`surface rounded-2xl border transition-all ${isOpen ? "sm:col-span-2 lg:col-span-3 border-brand-400" : ""}`}
            >
              {/* Header */}
              <button
                onClick={() => open(tool.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                  {tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{tool.name}</div>
                  <div className="text-xs text-muted truncate">{tool.short}</div>
                </div>
                <span className={`text-muted text-lg transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  ↓
                </span>
              </button>

              {/* Tool UI */}
              {isOpen && (
                <div className="border-t border-[var(--border)] p-4">
                  <Comp />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-semibold">No tools found for &ldquo;{query || cat}&rdquo;</p>
          <button className="mt-3 text-sm text-brand-600 hover:underline" onClick={() => { setQuery(""); setCat("all"); }}>
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}

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
  { id:"datetime", label:"Date & Time", icon:"⏱" },
  { id:"image", label:"Image Tools", icon:"🖼" },
  { id:"reference", label:"Reference", icon:"📚" },
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

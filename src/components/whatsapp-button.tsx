import Link from "next/link";

const PHONE = "917492068998";
const MESSAGE = "Hi! I have a question about DataForge.";

export function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden>
        <path d="M16.003 3C9.38 3 4 8.38 4 15.003c0 2.115.553 4.18 1.605 6.002L4 29l8.18-1.57a11.95 11.95 0 0 0 3.823.63h.001C22.626 28.06 28 22.68 28 16.057 28 9.434 22.626 3 16.003 3zm0 21.86h-.001a9.9 9.9 0 0 1-3.51-.64l-.25-.1-4.855.932.93-4.73-.164-.243a9.86 9.86 0 0 1-1.51-5.236c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.034 7.01 2.91a9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.92 9.92zm5.44-7.42c-.298-.15-1.76-.868-2.034-.967-.273-.1-.472-.15-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.298-.15-1.256-.463-2.392-1.475-.884-.788-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.15-.67-1.612-.918-2.207-.242-.58-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.478 1.065 2.875 1.213 3.073c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </Link>
  );
}

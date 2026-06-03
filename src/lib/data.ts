/** Static sample data used by the address / locale generators. */

export const STREETS = [
  "Maple Avenue", "Oak Street", "Cedar Lane", "Pine Road", "Elm Street",
  "Washington Boulevard", "Lincoln Avenue", "Park Place", "Sunset Drive",
  "Highland Avenue", "River Road", "Lake View Drive", "Meadow Lane",
  "Hillcrest Drive", "Birch Street", "Willow Way", "Spring Street",
  "Church Street", "Market Street", "Broadway",
];

export const CITIES = [
  "Springfield", "Riverside", "Franklin", "Greenville", "Bristol",
  "Clinton", "Fairview", "Salem", "Madison", "Georgetown",
  "Arlington", "Ashland", "Burlington", "Manchester", "Oxford",
  "Dover", "Hudson", "Kingston", "Newport", "Marion",
];

export const STATES = [
  ["California", "CA"], ["Texas", "TX"], ["New York", "NY"], ["Florida", "FL"],
  ["Illinois", "IL"], ["Pennsylvania", "PA"], ["Ohio", "OH"], ["Georgia", "GA"],
  ["Washington", "WA"], ["Arizona", "AZ"], ["Massachusetts", "MA"], ["Colorado", "CO"],
] as const;

export const FIRST_NAMES = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Lucas", "Mia", "Henry", "Amelia", "James", "Harper", "Leo",
];

export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson",
];

/** A small slice of real IEEE OUI prefixes mapped to vendors. */
export const MAC_VENDORS: [string, string][] = [
  ["00:1A:11", "Google, Inc."],
  ["00:1B:63", "Apple, Inc."],
  ["00:50:56", "VMware, Inc."],
  ["00:1C:42", "Parallels, Inc."],
  ["B8:27:EB", "Raspberry Pi Foundation"],
  ["DC:A6:32", "Raspberry Pi Trading Ltd"],
  ["00:0C:29", "VMware, Inc."],
  ["00:16:3E", "Xensource, Inc."],
  ["FC:FB:FB", "Cisco Systems, Inc."],
  ["00:25:9C", "Cisco-Linksys, LLC"],
  ["F0:9F:C2", "Ubiquiti Networks Inc."],
  ["00:1D:0F", "TP-LINK Technologies Co., Ltd."],
];

/** Crypto address human-readable prefixes / formats. */
export const TLDS = ["com", "net", "org", "io", "dev", "app", "co"];

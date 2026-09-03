import type { EventItem, TimelineEvent } from "@/types/event";

export const featuredEvents: EventItem[] = [
  {
    id: "future-of-tech-summit",
    title: "Future of Tech Summit 2026",
    date: "October 16, 2026",
    time: "9:00 AM",
    location: "Kampala Serena Hotel",
    organizer: "Innovation East Africa",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Audience listening to a speaker at a technology conference",
    status: "Selling fast",
    featured: true,
  },
  {
    id: "makers-design-workshop",
    title: "Makers & Design Workshop",
    date: "October 24, 2026",
    time: "10:30 AM",
    location: "Motiv, Kampala",
    organizer: "Creative Uganda",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Creative team collaborating around a table",
    status: "Open",
    featured: true,
  },
  {
    id: "founders-networking-night",
    title: "Founders Networking Night",
    date: "November 6, 2026",
    time: "6:00 PM",
    location: "Skyz Hotel, Naguru",
    organizer: "Founders Circle",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Professionals talking at a networking event",
    status: "Open",
    featured: true,
  },
  {
    id: "live-under-the-stars",
    title: "Live Under the Stars",
    date: "November 14, 2026",
    time: "5:30 PM",
    location: "Lugogo Cricket Oval",
    organizer: "Pulse Live",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Crowd enjoying a live outdoor performance",
    status: "Selling fast",
    featured: true,
  },
  {
    id: "leadership-forum",
    title: "East Africa Leadership Forum",
    date: "November 28, 2026",
    time: "8:30 AM",
    location: "Speke Resort, Munyonyo",
    organizer: "Lead Africa Network",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Speaker presenting on a conference stage",
    status: "Open",
    featured: true,
  },
];

export const upcomingEvents: EventItem[] = [
  {
    id: "product-community-meetup",
    title: "Product Community Meetup",
    date: "September 18, 2026",
    time: "5:30 PM",
    location: "Design Hub, Kampala",
    organizer: "Product People UG",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Guests gathering at a community event",
    status: "Open",
  },
  {
    id: "digital-marketing-masterclass",
    title: "Digital Marketing Masterclass",
    date: "September 22, 2026",
    time: "9:00 AM",
    location: "Innovation Village",
    organizer: "Growth Lab Africa",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Attendees taking part in a learning session",
    status: "Selling fast",
  },
  {
    id: "wellness-weekend",
    title: "Wellness Weekend Retreat",
    date: "September 26, 2026",
    time: "7:00 AM",
    location: "Entebbe Botanical Gardens",
    organizer: "Wellness Collective",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Friends enjoying an outdoor gathering",
    status: "Open",
  },
  {
    id: "creative-economy-talks",
    title: "Creative Economy Talks",
    date: "October 3, 2026",
    time: "2:00 PM",
    location: "National Theatre, Kampala",
    organizer: "Create Africa",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Modern venue prepared for a creative gathering",
    status: "Open",
  },
  {
    id: "jazz-by-the-lake",
    title: "Jazz by the Lake",
    date: "October 10, 2026",
    time: "4:00 PM",
    location: "Munyonyo Lakeside",
    organizer: "Kampala Sessions",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Stage lights at a live music event",
    status: "Selling fast",
  },
  {
    id: "social-impact-forum",
    title: "Social Impact Forum",
    date: "October 13, 2026",
    time: "8:00 AM",
    location: "Fairway Hotel, Kampala",
    organizer: "Impact Network Uganda",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Team meeting focused on collaboration and impact",
    status: "Registration closed",
  },
];

export const happeningSoonEvents: TimelineEvent[] = [
  {
    id: "startup-coffee",
    day: "FRI",
    date: "04 SEP",
    title: "Startup Coffee Morning",
    time: "8:00 AM",
    location: "The Patio, Naguru",
  },
  {
    id: "photography-walk",
    day: "SAT",
    date: "05 SEP",
    title: "Kampala Photography Walk",
    time: "9:30 AM",
    location: "Uganda Museum",
  },
  {
    id: "community-run",
    day: "SUN",
    date: "06 SEP",
    title: "Sunday Community Run",
    time: "6:30 AM",
    location: "Kololo Airstrip",
  },
  {
    id: "design-roundtable",
    day: "MON",
    date: "07 SEP",
    title: "Design Leaders Roundtable",
    time: "5:00 PM",
    location: "Hive Colab, Kanjokya",
  },
];

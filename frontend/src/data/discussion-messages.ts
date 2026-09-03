import type { DiscussionMessage } from "@/types/discussion";

export const discussionMessages: DiscussionMessage[] = [
  { id: "m-01", discussionId: "transport-innovation-summit", author: "Sarah Namuli", initials: "SN", body: "Hello everyone. Will transport be available from the main campus to the conference centre on the morning of the summit?", sentAt: "9:06 AM" },
  { id: "m-02", discussionId: "transport-innovation-summit", author: "Daniel Okello", initials: "DO", body: "I was wondering about this too. A pickup point near the main gate would be helpful for visiting participants.", sentAt: "9:11 AM" },
  { id: "m-03", discussionId: "transport-innovation-summit", author: "Administrator", initials: "AD", body: "Thanks for raising this. The organizing team has arranged two shuttle buses from the main campus.", sentAt: "9:18 AM", own: true },
  { id: "m-04", discussionId: "transport-innovation-summit", author: "Administrator", initials: "AD", body: "The first shuttle leaves at 7:30 AM and the second at 8:15 AM. Both will depart from the eastern gate.", sentAt: "9:19 AM", own: true },
  { id: "m-05", discussionId: "transport-innovation-summit", author: "Grace Nakato", initials: "GN", body: "That works perfectly. Will return transport also be available after the closing session?", sentAt: "10:02 AM" },
  { id: "m-06", discussionId: "transport-innovation-summit", author: "Administrator", initials: "AD", body: "Yes. Return shuttles will leave the conference centre at 5:30 PM and 6:15 PM.", sentAt: "10:10 AM", own: true },
  { id: "m-07", discussionId: "programme-changes-tech-expo", author: "Peter Kato", initials: "PK", body: "The afternoon keynote has moved from the main auditorium to Hall B.", sentAt: "8:42 AM" },
  { id: "m-08", discussionId: "programme-changes-tech-expo", author: "Administrator", initials: "AD", body: "The programme page has been updated. Please ask attendees to refresh their schedule.", sentAt: "8:51 AM", own: true },
  { id: "m-09", discussionId: "accommodation-visiting-participants", author: "Dr. Agnes Nakitto", initials: "AN", body: "We have negotiated conference rates with three hotels within ten minutes of the venue.", sentAt: "Yesterday" },
  { id: "m-10", discussionId: "career-expo-registration-questions", author: "Martha Achieng", initials: "MA", body: "Can recent graduates attend if they completed their studies last year?", sentAt: "Yesterday" },
  { id: "m-11", discussionId: "career-expo-registration-questions", author: "Administrator", initials: "AD", body: "Yes, graduates from the past three years are welcome to register.", sentAt: "Yesterday", own: true },
];

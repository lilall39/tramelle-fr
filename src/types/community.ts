import type { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";

export type UserStatus = "active" | "disabled";

export type SubmissionCategory = "annonce" | "service" | "vente" | "don" | "article";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "deleted";

export type ContactMessageStatus = "new" | "read" | "archived";

export type CommunityUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
  status: UserStatus;
};

/** Document Firestore `submissions` — champs dynamiques selon category. */
export type Submission = {
  userId: string;
  category: SubmissionCategory;
  status: SubmissionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  privateName: string;
  privateEmail: string;
  privatePhone: string;
  displayName: string;
  title: string;
  description: string;
  city: string;
  imageUrl: string | null;
  /** vente */
  price?: number;
  condition?: string;
  deliveryMode?: string;
  /** don */
  availability?: string;
  pickupInfo?: string;
  /** service */
  rate?: string;
  serviceArea?: string;
  serviceMode?: string;
  /** article */
  content?: string;
  subtitle?: string;
  coverImage?: string | null;
};

export type ContactMessage = {
  submissionId: string | null;
  recipientUserId: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  createdAt: Timestamp;
  status: ContactMessageStatus;
};

/** Vue publique (sans champs privés). */
export type PublicSubmission = Omit<Submission, "privateName" | "privateEmail" | "privatePhone"> & {
  id: string;
};

export type ResponseParentType = "submission";

/** Réponse modérée liée à une publication (`Submission`). */
export type Response = {
  id: string;
  parentId: string;
  parentType: ResponseParentType;
  content: string;
  authorId: string;
  status: SubmissionStatus;
  createdAt: number;
  /** Extension future : fil de discussion. */
  parentResponseId?: string | null;
};

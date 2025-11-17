import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/src/lib/firebase/client";

export interface AccountData {
  id: string; // Firestore document ID
  name?: string;
  specialty?: string;
  medicalLicenseNumber?: string;
  yearsOfExperience?: string | number;
  bio?: string;
  clinicName?: string;
  mobileNo?: string;
  email?: string;
  location?: string;
  photo?: string;
  // add other fields if needed
}

/**
 * Updates an account document in Firestore.
 * @param accountId - The Firestore document ID of the account
 * @param data - The fields to update
 */
export async function updateAccount(accountId: string, data: Partial<AccountData>) {
  if (!accountId) throw new Error("Account ID is required");

  const accountRef = doc(db, "accounts", accountId);
  await updateDoc(accountRef, data);
}

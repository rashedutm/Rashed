"use server";

import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validation";
import {
  type ActionState,
  failure,
  invalid,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function updateAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();

    const parsed = accountSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const { username, currentPassword, newPassword } = parsed.data;

    const user = await prisma.adminUser.findUnique({ where: { id: Number(admin.id) } });
    if (!user) return failure("Your account no longer exists.");

    // Changing either the username or the password requires proving the current one.
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return failure("Current password is incorrect.", {
        currentPassword: "Current password is incorrect",
      });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        username,
        ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 12) } : {}),
      },
    });

    return success(
      newPassword
        ? "Account updated. Your new password is active — sign in again if prompted."
        : "Account updated.",
    );
  } catch (error) {
    return toActionError(error, "Could not update your account.");
  }
}

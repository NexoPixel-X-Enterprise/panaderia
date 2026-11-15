"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

type LoginState = {
  message: string;
} | null;

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return { message: "Ingresa tu correo y contraseña." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) {
      return { message: "No se pudo iniciar sesión. Inténtalo de nuevo." };
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { message: "Correo o contraseña incorrectos. Verifica tus datos." };
  }

  redirect("/dashboard");
}
